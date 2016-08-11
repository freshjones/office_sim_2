(function() {

  'use strict';

  function JobFactory(VariablesService,HelperService,TimerService)
  {

    var jobs,jobTypes,service;

    var components = function(data)
    {
    	this.components = this.setComponentHours(data);
    };

    components.prototype.getComponents = function()
    {
    	return this.components;
    };

	components.prototype.setComponentHours = function(components)
    {	
    	var returnData= {}; 
    	var _this = this;

        var defaults = VariablesService.getVariable('defaults','services');

        if(angular.isArray(components))
        {
            var defaultComponents = {};

            angular.forEach(components,function(key) 
            {
                defaultComponents[key] = defaults[key];
            });

            components = defaultComponents;
        
        }

    	angular.forEach(components,function(obj,key) 
    	{	
    		
    		if(obj.components !== undefined && typeof obj.components === 'object')
    		{
    			
    			returnData[key] = {'components' : _this.setComponentHours(obj.components) };

    		} else {

                var component = angular.copy(defaults[key]);

                angular.extend(component,obj);

                component.experience = component.experience.value;
                component.rate = HelperService.getValueByRangeOption(component.experience, component.rates.value);
				component.hours = HelperService.getRandomMinMaxValue(component.hours.value.options,component.hours.value.weights);
				component.iterations = HelperService.getRandomMinMaxValue(component.iterations.value.options,component.iterations.value.weights);
				//obj.susceptibility = HelperService.getRandomMinMaxValue(obj.susceptibility.values,obj.susceptibility.weights);
				component.estimate = component.hours * component.rate;
				
                delete(component.rates);

    			returnData[key] = component; 

    		}

    	});

    	return returnData;

    };


    var job = function(params)
    {
    	this.params = params;
    	this.setJobRanges();
    };

    job.prototype.setJobRanges = function()
    {
    	var jobData = {};
    	jobData.values = [];
    	jobData.weights = [];
    	angular.forEach(jobTypes,function(obj,key){
    		jobData.values.push(key);
    		jobData.weights.push(obj.weight.value/100);
    	});

    	this.jobData = jobData;

    };

	job.prototype.setComponents = function()
    {	
    	var componentObj = new components(this.job.components);
    	this.job.components = componentObj.getComponents();
    };
  
	job.prototype.setJobEstimate = function(components,data)
    {	
    	var _this = this;
    	angular.forEach(components,function(obj,key) 
    	{	
    		if(obj.components !== undefined && typeof obj.components === 'object')
    		{
    			_this.setJobEstimate(obj.components,data);
    		} else {

    			data.hours += obj.hours;
    			data.cost += obj.estimate;
    		}

    	});

    };

    job.prototype.setJobState = function()
    {
        if(this.job.state === undefined) this.job.state = 'estimate';
        if(this.params.state !== undefined) this.job.state = this.params.state;

        this.setTime(this.job.state);
    };

    job.prototype.setEstimate = function()
    {	
    	var estimateData = {'hours':0,'cost':0};
    	this.setJobEstimate(this.job.components,estimateData);

    	this.job.hours = estimateData.hours;
    	this.job.estimate = estimateData.cost;
    };

    job.prototype.setExpedite = function()
    {   
        var expedite = HelperService.getRandomProbability(this.job.expedite.value);
        this.job.expedite = expedite;
    };

    job.prototype.setJobID = function()
    {   
        this.job.id = HelperService.uuid();
    };

    job.prototype.setDueDate = function()
    {
        
        var duedate = 'Not Specified';   
        
        if(angular.isObject(this.job.duedate))
        {
            var ddObj = this.job.duedate.value;
            var days = HelperService.getRandomMinMaxValue(ddObj.options,ddObj.weights); 

            if(days > 0)
            {
                duedate = days * 24;
            }

        }

        this.job.duedate = duedate;
    
    };
    
    job.prototype.setWeight = function()
    {   
        this.job.weight = this.job.weight.value;
    };

    job.prototype.initTimes = function()
    {   
        this.job.times = {};
    };

    job.prototype.setTime = function(param)
    {   
        var thisMonth = TimerService.getIterationValue('month'); 

        var today = new Date();
        var now = today.getTime();
        this.job.times[param] = thisMonth;
    };

	job.prototype.setJob = function()
    {	
    	
    	var jobKey = HelperService.getRandomValue(this.jobData.values,this.jobData.weights);
    	this.job = angular.copy(jobTypes[jobKey]); 

        this.job.title = jobKey;
        
        //set the state of the job
        this.setJobID();

        //set the job estimate
        this.initTimes();

    	//set job components
    	this.setComponents();

    	//set the job estimate
    	this.setEstimate();

        //set the job estimate
        this.setExpedite();

        //set the job estimate
        this.setDueDate();

        //set the job estimate
        this.setWeight();

        //set the state of the job
        this.setJobState();

    };

    job.prototype.getJob = function()
    {
    	return this.job;
    };

    service = {};

    service.initJobTypes = function(data)
    {
    	if(jobTypes === undefined) jobTypes = {};
    	angular.extend(jobTypes,data.jobtypes);
    };

    service.getJobInstance = function(params)
    {
    	return new job(params);
    };

    service.createJob = function(params)
    {
        var state;
        if(typeof params.state === "string") state = params.state;
        var jobs = service.generateJobs(1,state);
        return jobs[0];
    };

    service.generateJobs = function(count,state)
    {	
    	
    	var params = 
    	{
    		"startTime": TimerService.getIterationValue('hour')
    	};

        if(state !== undefined)
        {
            params.state = state;
        }

    	if(jobs === undefined) jobs = {};

    	var i,jobs = [];

    	for(i=0;i<count;i++)
    	{
    		var jobInstance = new job(params);
    		jobInstance.setJob();

    		var thisJob = jobInstance.getJob();
    		jobs.push(thisJob);
    	}

    	return jobs;
    
    };

    return service;

  }

  angular.module('common.factory.jobs', [])
    .factory('JobFactory', JobFactory);
  
})();
