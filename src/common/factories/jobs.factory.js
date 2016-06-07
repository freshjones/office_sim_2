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
    	angular.forEach(components,function(obj,key) 
    	{	
    		
    		if(obj.components !== undefined && typeof obj.components === 'object')
    		{
    			
    			returnData[key] = {'components' : _this.setComponentHours(obj.components) };

    		} else {

				obj.hours = HelperService.getRandomMinMaxValue(obj.hours.values,obj.hours.weights);
				obj.iterations = HelperService.getRandomMinMaxValue(obj.iterations.values,obj.iterations.weights);
				obj.susceptibility = HelperService.getRandomMinMaxValue(obj.susceptibility.values,obj.susceptibility.weights);
				obj.estimate = obj.hours * obj.rate;
				
    			returnData[key] = obj; 

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
    		jobData.weights.push(obj.weight/100);
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
    };

    job.prototype.setEstimate = function()
    {	
    	var estimateData = {'hours':0,'cost':0};
    	this.setJobEstimate(this.job.components,estimateData);

    	this.job.hours = estimateData.hours;
    	this.job.estimate = estimateData.cost;
    };

    job.prototype.setJobID = function()
    {   
        this.job.id = HelperService.uuid();
    };

	job.prototype.setJob = function()
    {	
    	
    	var jobKey = HelperService.getRandomValue(this.jobData.values,this.jobData.weights);
    	this.job = angular.copy(jobTypes[jobKey]); 

        //set the state of the job
        this.setJobID();

        //set the state of the job
        this.setJobState();

    	//set job components
    	this.setComponents();

    	//set the job estimate
    	this.setEstimate();

    };

    job.prototype.getJob = function()
    {
    	return this.job;
    };

    service = {};

    service.initJobTypes = function(data)
    {
    	if(jobTypes === undefined) jobTypes = {};
    	angular.extend(jobTypes,data);
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
