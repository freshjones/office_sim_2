(function() {
  
  'use strict';

  var moduleDir = '/src/app/simulation/modules/ProfitLossChart';

  var app = angular.module("OfficeSimApp", [
  	'ui.router',
  	'templates',
  	'common.controllers.bootstrap',
  	'app.directives.simulation'
  ])
  .config(function($stateProvider, $urlRouterProvider) {

  	$urlRouterProvider.otherwise("/");

  	$stateProvider
    .state('root', {
      url: "/",
      template: "<simulation></simulation>",
      controller: 'BootstrapCtrl',
      resolve: {

      	data:  function($q,$http) {
            var promises = {};
            promises.defaults = $http({method: 'GET', url: '/data/defaults.json'});
            promises.expenses = $http({method: 'GET', url: '/data/expenses.json'});
            promises.resources = $http({method: 'GET', url: '/data/resources.json'});
            promises.accounts = $http({method: 'GET', url: '/data/accounts.json'});
            promises.sales = $http({method: 'GET', url: '/data/sales.json'});
            promises.jobs = $http({method: 'GET', url: '/data/jobs.json'});

            return $q.all(promises).then(function(response){

            	var data = {};

		        Object.keys(response).forEach(function(key,index) 
		        {
		        	data[key] = response[key].data;
		        });

		        return data;

            });
        },

      }
    });

  });

})();
(function() {

  'use strict';

  function SimulationCtrl($scope,AccountsService,VariablesService,SimulationService,StatisticsService,ProcessService)
  {

    $scope.accounts = AccountsService.getAccounts();
    
    var ctrl = {};

    ctrl.initSimulation = function()
    {
      SimulationService.initSimulation();
    };
         
    ctrl.startSimulation = function()
    {
      
      //initialize
      ctrl.initSimulation();

      var simulationStats = SimulationService.runSimulation();
      
      
      //console.log(simulationStats);
    };

    return ctrl;	

  }

  angular.module('app.controllers.simulation', [])
    .controller('SimulationCtrl', SimulationCtrl);
  
})();

(function() {

  'use strict';

  function SimulationDirective($timeout)
  {
    
    return {

      restrict: 'E',
      require: 'simulation',
      templateUrl:'/src/app/simulation/simulation.tpl.html',
      replace:true,
      link: function(scope, element, attrs, ctrl) 
      {
          
          $timeout(function(){
            ctrl.startSimulation();
          });
          
          scope.runSimulation = function()
          {
            ctrl.startSimulation();
          };

      },
      controller: 'SimulationCtrl'

    };

  }

  angular.module('app.directives.simulation',[
      'app.controllers.simulation',
      'app.services.simulation',
      'modules.profitlosschart',
      'modules.leadsreport'
    ])
    .directive('simulation', SimulationDirective);
  
})();

(function() {

  'use strict';

  function SimulationService
    (
        VariablesService,
        ChartService,
        StatisticsService,
        AccountsService,
        IncomeService,
        ExpenseService,
        TimerService,
        SalesService,
        JobService,
        ProcessService,
        ScheduleService,
        ProductionService
    )
  {

  	var iterations,daysPerYear,hoursPerIteration;

    var service = {};

    service.setIterations = function(val)
    {
    	iterations = val;
    };

    service.setDaysPerYear = function(val)
    {
    	daysPerYear = val;
    };

    service.setHoursPerIteration = function(val)
    {
    	hoursPerIteration = daysPerYear * 24;
    };

    service.setTimeFrame = function()
	{	
		var defaults = VariablesService.getVariableGroup('defaults');
		service.setIterations(defaults.iterations);
		service.setDaysPerYear(defaults.daysPerYear);
		service.setHoursPerIteration();
	};

	service.initSimulation = function()
	{	
        //reset all timers first time out
        TimerService.initTimers();

        //init the statistics
        StatisticsService.initStats();

        //reinitialize
        AccountsService.zeroAccountBalances();

        //initialize processes
        ProcessService.resetProcesses();

        //initialize leads
        SalesService.resetSales();

        //initialize jobs
        JobService.resetJobs();

	};

    service.runSimulation = function()
    {   
       

        //increment the iteration
        for(var i=0; i < iterations; i++)
        { 

            //reset the timer for each iteration
            TimerService.resetIterationTimers();

            //increment the iteration
            TimerService.incrementByOne('iteration');

            //run each iteration
            service.runIteration();

            //update the data chart
            //service.updateProfitLossChart();

        }

        return service.getSimulationStatistics();
 
    };

    service.runIteration = function()
    {

        var iteration = TimerService.getIterationValue('iteration'); 

        SalesService.resetCurrentStates();

        /* TESTING */

        //create one single job
        //JobService.createJob({"state":"job"});

        //run it through the production cycle
        //ScheduleService.scheduleJobs();

        for(var i=1; i <= 12; i++)
        {
            var month       = i;
            var hour        = month * 720;

            TimerService.incrementByMonth(hour);
            
            //run the sales department cycle feeders
            SalesService.runSalesCycle();

            //run the production department cycle feeders
            ProductionService.runProductionCycle();

            //run the process cycle after all feeders
            ProcessService.runProcessorCycle();

            //update the sales statistics after all processors have run
            SalesService.updateSalesStatistics(iteration,month);

            //SalesService.runSalesCycle();
            //console.log('we receive bills monthly');
            //enter this months bills that are due next month
            //ExpenseService.recordExpenses();

            //console.log('we pay bills monthly');
            //pay last months bills that are due this month
            //ExpenseService.payExpenses();

            //console.log('we generate revenue monthly');
            //IncomeService.recordRevenue();
         
            //console.log('we send out invoices monthly');
            //IncomeService.createInvoices();

            //console.log('we get paid monthly');
            //IncomeService.depositFunds();

            //console.log('we run the sales cycles every month');
            //SalesService.runSalesCycle();

            //ProcessService.runCycle();

        }
      
        SalesService.updateSalesFailureStatistics(iteration);

    };

    /*
	service.runIteration = function()
	{

		var hours = [];

        //run each hour of the timeframe
    	for(var i=1; i <= hoursPerIteration; i++)
    	{

    		//increment
            TimerService.increment();

            var thisHour        = TimerService.getIterationValue('hour');   

            if( (thisHour % 720) === 0 )
            {

                //console.log('we receive bills monthly');
                //enter this months bills that are due next month
                ExpenseService.recordExpenses();

                //console.log('we pay bills monthly');
                //pay last months bills that are due this month
                ExpenseService.payExpenses();

                //console.log('we generate revenue monthly');
                IncomeService.recordRevenue();
             
                //console.log('we send out invoices monthly');
                IncomeService.createInvoices();

                //console.log('we get paid monthly');
                IncomeService.depositFunds();

                //console.log('we run the sales cycles every month');
                SalesService.runSalesCycle();
                
                //run the process iterator
                this.runProcessIterator(thisHour);

            }

    	}

	};
    */
	

    service.updateProfitLossChart = function()
    {

        //current stats
        var currentStats = StatisticsService.getStats();

        /* income data */
        var income = currentStats.accounting.monthlyincome.average;
        var incomeData = [];

        angular.forEach(income, function(value, key) {
          this.push(value);
        },incomeData);

        /* expense data */
        var expenses = currentStats.accounting.monthlyexpenses.average;
        var expenseData = [];

        angular.forEach(expenses, function(value, key) {
          this.push(value);
        },expenseData);

        //set the chart after each iteration
        ChartService.setChartValue('pl',{'data':[incomeData,expenseData]});

    };

	service.getSimulationStatistics = function()
	{
        var simstats = {};

		simstats.statistics = StatisticsService.getStats();

		simstats.timer = {};
		simstats.timer.totals = TimerService.getTotals();
		simstats.timer.iteration = TimerService.getIteration();
      
		return simstats;
		
	};

    return service;

  }

  angular.module('app.services.simulation', [])
    .factory('SimulationService', SimulationService);
  
})();

(function() {

  'use strict';

  function BaseCtrl()
  {
    
    var ctrl = {};

    return ctrl;	

  }

  angular.module('common.controllers.base', [])
    .controller('BaseCtrl', BaseCtrl);
  
})();

(function() {

  'use strict';

  function BootstrapCtrl($scope,data,JobFactory,SimulationService,AccountsService,VariablesService,SalesService,ExpenseService)
  {

    //set variables
    VariablesService.setVariables(data);

    //set timeframe
    SimulationService.setTimeFrame();

    //setup the chart of accounts
    AccountsService.setAccounts(data.accounts);

    //set the expense accounts
    ExpenseService.setExpenseAccounts(data.expenses);
      	
  	//set the total cost per month value
  	ExpenseService.setExpenseTotalPerMonth();

    //initialize the sales process
    SalesService.initSales(data);

    JobFactory.initJobTypes(data.jobs);

  }

  angular.module('common.controllers.bootstrap', 
    [
      'common.services.helpers',
      'common.services.variables',
      'common.services.statistics',
      'common.services.accounts',
      'common.services.expense',
      'common.services.income',
      'common.services.chart',
      'common.services.timer',
      'common.services.sales',
      'common.services.jobs',
      'common.services.process',
      'common.services.production',
      'common.services.scheduling'
    ])
    .controller('BootstrapCtrl', BootstrapCtrl);
  
})();

(function() {

  'use strict';

  function MainCtrl()
  {
    var ctrl = {};
    return ctrl;	
  }

  angular.module('common.controllers.main', [])
    .controller('MainCtrl', MainCtrl);
  
})();

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

(function() {

  'use strict';
  //,ExpenseService
  function AccountsService(VariablesService)
  {

    var accounts;

    var service = {};

    service.initAccounts = function()
    {
      accounts = {};
    };

    service.setAccounts = function(data)
    {
      if(accounts === undefined) service.initAccounts();
      angular.extend(accounts,data);
    };

    service.updateAccountBalance = function(account,value)
    {
      angular.extend(accounts[account],{'balance':value});
    };

    service.zeroAccountBalances = function()
    {
      angular.forEach(service.getAccounts(), function(obj,key){
        service.updateAccountBalance(key,0);
      });
    };

    service.getAccounts = function()
    {
      return accounts;
    };

    service.updateBalance = function(act,type,value)
    {
      switch(type)
      {
        case 'credit':
          accounts[act].balance += value;
        break;

        case 'debit':
          accounts[act].balance -= value;
        break;

      }
    };

    return service;

  }

  angular.module('common.services.accounts', [])
    .factory('AccountsService', AccountsService);
  
})();

(function() {

  'use strict';

  function ChartService()
  {

    var charts;

    charts = {};

    var service = {};

    service.initChart = function(chart,params)
    {
      
      if(charts[chart] === undefined) charts[chart] = {};
        
      Object.keys(params).forEach(function(key) {
        var chartParam = {};
        chartParam[key] = params[key];
        service.setChartValue(chart,chartParam);
      });
      
    };

    service.getChart = function(chart)
    {
      return charts[chart];
    };

    service.setChartValue = function(chart,data)
    {
      angular.extend(charts[chart],data);
    };


    return service;

  }

  angular.module('common.services.chart', [])
    .factory('ChartService', ChartService);
  
})();

(function() {

  'use strict';

  function ExpenseService(TimerService,StatisticsService,AccountsService)
  {

  	var expenses,totalpermonth;

    var service = {};

    service.setExpenseAccounts = function(data)
    {
    	expenses = data.Accounts;
    };

    service.setExpenseTotalPerMonth = function()
    {
    	if(totalpermonth === undefined) totalpermonth = 0;
    	  expenses.forEach(function(obj,idx){
    		totalpermonth += obj.costpermonth;
    	});
    };

    service.recordExpenses = function()
    {
      
      var monthlyBills = service.getExpenseTotalPerMonth();
      
      AccountsService.updateBalance("Accounts Payable",'credit',monthlyBills);

      var thisIteration   = TimerService.getIterationValue('iteration');
      var thisMonth       = TimerService.getIterationValue('month'); 

      StatisticsService.addStat('accounting','monthlyexpenses', thisIteration, thisMonth, service.getExpenseTotalPerMonth());

    };

    service.payExpenses = function()
    {
      var monthlyBills = service.getExpenseTotalPerMonth();
      AccountsService.updateBalance('Accounts Payable','debit',monthlyBills);
      AccountsService.updateBalance('Cash','debit',monthlyBills);
      AccountsService.updateBalance('Expenses','credit',monthlyBills);
    };

    service.getExpenseTotalPerMonth = function()
    {
    	return totalpermonth;
    };

    return service;

  }

  angular.module('common.services.expense', [])
    .factory('ExpenseService', ExpenseService);
  
})();

(function() {

  'use strict';

  function FinancialService()
  {

  	var accounts = {};

    var service = {};

    service.createAccount = function(account,type,balance)
    {
      if(balance === undefined || !service.isPositiveInteger(balance)) balance = 0;
      accounts[account] = balance;
    };
    
    service.isPositiveInteger = function(s) 
    {
      return /^\+?[1-9][\d]*$/.test(s);
    };

    return service;

  }

  angular.module('common.services.financial', [])
    .factory('FinancialService', FinancialService);
  
})();

(function() {

  'use strict';

  function HelperService()
  {

    var service = {};

    service.getRandomProbability = function(val)
    { 
      var r = Math.floor( (Math.random() * 100) + 1 );
      return r <= val;
    };

    service.random = function(min,max,floor)
    {
        var val = Math.random()*(max-min)+min;
        if(floor === true) val = Math.floor(val);
        return val;
    };

    service.getRandomMinMaxValue = function(ranges, weights) 
    {
        if(typeof ranges !== 'object' || typeof weights !== 'object') return 0;

        var range = service.getRandomValue(ranges,weights);

        var value = service.random(range[0],range[1],true);

        return value;
    };

    service.getValueByRangeOption = function(val, obj) 
    {
        for (var i = 0; i < obj.options.length; i++) {
            if(val >= obj.options[i][0] && val <= obj.options[i][1])
            {
                return obj.values[i];
            }
        }
    };

    service.getRandomValue = function(values, weight) 
    {
        var total_weight = weight.reduce(function (prev, cur, i, arr) {
            return prev + cur;
        });
        var random_num = service.random(0, total_weight);
        var weight_sum = 0;
        for (var i = 0; i < values.length; i++) {
            weight_sum += weight[i];
            weight_sum = +weight_sum.toFixed(2);
            if (random_num <= weight_sum) {
                return values[i];
            }
        }
         
    };

    service.capitalize = function(s)
    {
        return s[0].toUpperCase() + s.slice(1);
    };

    service.uuid = function()
    {
        var d = new Date().getTime();
        if(window.performance && typeof window.performance.now === "function"){
            d += performance.now();
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    return service;

  }

  angular.module('common.services.helpers', [])
    .factory('HelperService', HelperService);
  
})();

(function() {

  'use strict';

  function IncomeService(TimerService,StatisticsService,AccountsService)
  {

    var dummyAmt = 13886;

    var service = {};

    service.recordRevenue = function()
    {

      //AccountsService.updateBalance('Cash','debit',monthlyBills);
      AccountsService.updateBalance('Revenues','credit',dummyAmt);

      var thisIteration   = TimerService.getIterationValue('iteration');
      var thisMonth       = TimerService.getIterationValue('month'); 

      StatisticsService.addStat('accounting','monthlyincome', thisIteration, thisMonth, dummyAmt);

    };

    service.createInvoices = function()
    {

      AccountsService.updateBalance('Accounts Receivable','credit',dummyAmt);

    };

    service.depositFunds = function()
    {
      
      AccountsService.updateBalance('Accounts Receivable','debit',dummyAmt);
      AccountsService.updateBalance('Cash','credit',dummyAmt);

    };

    return service;

  }

  angular.module('common.services.income', [])
    .factory('IncomeService', IncomeService);
  
})();

(function() {

  'use strict';

  function JobService($filter,JobFactory,TimerService)
  {

    var jobs = {};

    var service = {};

    
    service.resetJobs = function()
    {
      jobs = {};
    };

    service.createEstimate = function()
    {
      return service.createJob({"state":"estimate"});
    };

    service.createJob = function(params)
    {
      var job = JobFactory.createJob(params);
      jobs[job.id] = job;
      return job.id;
    };

    service.setJobState = function(id,state)
    {
      if(jobs[id] === undefined) return false;
      angular.extend(jobs[id],{"state":state});
      service.LogStateChange(id,state);
      return true;
    };

    service.LogStateChange = function(id,state)
    {
      if(jobs[id] === undefined) return false;

      var thisMonth           = TimerService.getIterationValue('month'); 

      var today = new Date();
      var now = today.getTime();
      var obj = {};
      obj[state] = thisMonth;
      angular.extend(jobs[id].times,obj);
    };

    service.getJob = function(id)
    {
      return jobs[id] !== undefined ? jobs[id] : false;
    };

    service.getAllJobs = function(id)
    {
      return Object.keys(jobs).length > 0 ? jobs : false;
    };

    service.getJobsByParam = function(params)
    {

      var items = {};

      angular.forEach(jobs,function(job,key)
      {
        if(params === undefined)
        {
          
          items[key] = job;

        } else {

          if(job[params.param] == params.value)
          {
            items[key] = job;
          }

        }

      });
      
      return items;

    };

    return service;

  }

  angular.module('common.services.jobs', ['common.factory.jobs'])
    .factory('JobService', JobService);
  
})();

(function() {

  'use strict';

  function ProcessService($filter,TimerService)
  {

    var processes;

    var service = {};

    service.resetProcesses = function()
    {
      processes = [];
    };

    service.addProcess = function(obj)
    {
      //var processObj = angular.copy(obj);
      //var currentHour = TimerService.getIterationValue('hour');
      var currentMonth = TimerService.getIterationValue('month');
      //processObj.orgtime = obj.time;
      var time = obj.time < 720 ? currentMonth : currentMonth + Math.floor(obj.time / 720);

      if(time > 12) time = 1;

      obj.time = time;

      processes.push(obj);

    };

    service.cycleCheck = function(value)
    { 

      return $filter('filter')(processes, function(item)
      {

        if(value == item.time)
        {
          return true;
        }

        return false;

      });

    };

    service.runQueuedProcess = function(qProcess)
    {
      qProcess.callback(qProcess.params);
    };

    service.runProcessorCycle = function()
    {
      var currentMonth = TimerService.getIterationValue('month');

      /* we now must process all elements in the current month */
      var items = service.cycleCheck(currentMonth);

      if(items.length)
      {
        
        angular.forEach(items,function(obj,key){
          obj.time = 'PROCESSED';
          service.runQueuedProcess(obj.params);
        });

        //run again
        service.runProcessorCycle();
      }

      return true;

    };

    service.getProcess = function()
    {
      
    };

    service.showAllProcesses = function()
    {
      
      return $filter('filter')(processes, function(item)
      {
      
        if(item.time !== 'PROCESSED')
        {
          return true;
        }
      
        return false;

      });

    };

    service.getProcessesByValue = function(value)
    {

    };

    return service;

  }

  angular.module('common.services.process', [])
    .factory('ProcessService', ProcessService);
  
})();

(function() {

  'use strict';

  function ProductionService(JobService,TimerService)
  {

    var service = {};

    /*
      
    */
    service.runProductionCycle = function()
    { 
      
      var timer   = TimerService.getIteration();
      var jobs = JobService.getAllJobs();

      if(jobs)
      {  
      
     

      }
      
    };

    return service;

  }

  angular.module('common.services.production', [])
    .factory('ProductionService', ProductionService);
  
})();

(function() {

  'use strict';

  function SalesService(VariablesService,HelperService,TimerService,StatisticsService,ProcessService,JobService)
  {

    var defaults,states,failures,estimates = {};

    var service = {};

    service.initSales = function(data)
    {
      if(defaults === undefined) defaults = {};
      angular.extend(defaults,data.sales);
      service.resetSales();
    };

    service.resetSales = function()
    {
      service.resetStates();
      service.resetFailures();
    };

    service.resetStates = function()
    {
      if(states === undefined) states = {};
      
      angular.forEach(defaults,function(obj,key) 
      {
        states[key] = {"current":{},"cumulative":{},"total":0};
      });

      /*
      if(Object.keys(states).length)
      { 
        angular.forEach(states,function(obj,key) 
        {
          states[key] = {"current":{},"cumulative":{}};
        });
      }
      */

    };

    service.resetFailures = function()
    {

      if(failures === undefined) failures = {};
    
      if(Object.keys(failures).length)
      {
        angular.forEach(failures,function(obj,key) 
        {
          failures[key] = {};
        });
      }

    };

    service.getStates = function()
    {
      return states;
    };

    service.resetCurrentStates = function()
    {
      
      angular.forEach(states,function(obj,key) 
      {
        angular.forEach(obj.current,function(val,month) 
        {
          obj.current[month] = 0;
        });
      });

    };

    service.updateStateValue = function(state)
    {
      
      var thisIteration       = TimerService.getIterationValue('iteration');
      var thisMonth           = TimerService.getIterationValue('month'); 

      if(states[state] === undefined) states[state] = {"current":{},"cumulative":{},"total":0};

      //if(states[state].total === undefined) states[state].total = 0;

      if(states[state].current[thisMonth] === undefined) states[state].current[thisMonth] = 0;
      if(states[state].cumulative[thisMonth] === undefined) states[state].cumulative[thisMonth] = 0;

      states[state].total += 1;
      states[state].current[thisMonth] += 1;
      states[state].cumulative[thisMonth] += 1;

    };

    service.updateFailures = function(params)
    {
   
      var thisIteration       = TimerService.getIterationValue('iteration');
      var thisMonth           = TimerService.getIterationValue('month'); 

      if(failures === undefined) failures = {};

      if(failures[params.state] === undefined) failures[params.state] = {};

      if(failures[params.state][params.type] === undefined) failures[params.state][params.type] = 0;
      
      failures[params.state][params.type] += 1;

    };

    service.updateSalesStatistics = function(iteration,month)
    {

      var salesData = angular.copy(states);

      angular.forEach(salesData,function(stateData,stateKey) 
      {
        var typeName = 'monthly' + HelperService.capitalize(stateKey);

        var value = stateData.current[month] !== undefined ? stateData.current[month] : 0;

        StatisticsService.addStat('sales',typeName,iteration,month,value);
      
      });
     
    };

    service.updateSalesFailureStatistics = function(iteration)
    {

      var failureData = angular.copy(failures);

      angular.forEach(failureData,function(stateData,stateKey) 
      {
        
        var typeName = stateKey + 'Failures';

        angular.forEach(stateData,function(value,failure) 
        {
        
          StatisticsService.addStat('salesFailures',typeName,iteration,failure,value);
        
        });

      });

    };
   
    /* i create and add to the process queue monthly leads */
    service.runSalesCycle = function()
    { 
      
      var timer   = TimerService.getIteration();

      angular.forEach(defaults,function(stateData,stateKey){

        //var singularName = HelperService.capitalize(stateKey.slice(0, -1));
        //var fctName = 'is' + singularName;

        angular.forEach(stateData.types,function(typeData,typeKey){

          var potentialObj = HelperService.getRandomMinMaxValue(typeData.qtypermonth.values, typeData.qtypermonth.weights);

          if(potentialObj)
          {
            /* with the probability setting we will rule out some potential leads to get our actual leads per month */
            //var probability = typeData.probability.value;

            for(var i = 0; i<potentialObj; i++)
            {
              service.runProbabilityFilter({"state":stateKey,"type":typeKey,"data":{},"cycles":0});
            }

          }

        });

      });

    };

    service.probabiltyCheck = function(params)
    { 
      
      var settings = defaults[params.state].types[params.type];
      var probability = settings.probability.value;

      /* with the probability setting we will rule out some potential opportunities */
      if(HelperService.getRandomProbability(probability))
      {
        return true;
      }

      return false;

    };

    service.runProbabilityFilter = function(params)
    { 

      if(params.state === undefined ) return;

      //bump the cycle increment;
      params.cycles += 1;

      var settings = defaults[params.state].types[params.type];

      if(service.probabiltyCheck(params))
      {
      
        if(params.state === 'estimates')
        {
          params.data = {"jobID":JobService.createEstimate()};
        }
        
        params.data.delays = service.runDelayFilter(params);

        //moving on
        service.createSalesProcess(params);


      } else {

        var failure =  HelperService.getRandomValue(settings.failurereasons.values, settings.failurereasons.weights);

        service.updateFailures({"state":params.state,"type":failure});
        
      }
     
    };

    service.delayProbabiltyCheck = function(params)
    { 
      
      var settings = defaults[params.state].types[params.type];
      var probability = settings.delayprobability.value;

      /* with the probability setting we will rule out some potential opportunities */
      if(HelperService.getRandomProbability(probability))
      {
        return true;
      }

      return false;

    };

    service.runDelayFilter = function(params)
    { 

      /* we loop this until there are no more delays */
      var settings = defaults[params.state].types[params.type];

      var delayTime = 0;

      var delays = HelperService.getRandomMinMaxValue(settings.delays.values, settings.delays.weights);
      
      if(delays)
      {
          
        for(var i=0;i<delays;i++)
        {

          if(service.delayProbabiltyCheck(params))
          {
              var thisDelay = HelperService.getRandomValue(settings.delayreasons.values, settings.delayreasons.weights);
              delayTime += HelperService.getRandomMinMaxValue(thisDelay.cost.values, thisDelay.cost.weights);
          }

        }

      } 

      return delayTime;

    };

    service.getCallbackParams = function(params)
    {

      var stateKeys = Object.keys(defaults);
      var returnObj;
      var curIndex = stateKeys.indexOf(params.state);
      var nextIndex = curIndex + 1;

      returnObj = {
            "callback":service.runProbabilityFilter,
            "params":{
              "state":stateKeys[nextIndex],
              "type":params.type,
              "data":params.data,
              "cycles":params.cycles
            }
          };

      if(nextIndex >= stateKeys.length)
      {
        returnObj = {
            "callback":service.createJob,
            "params": params.data
        };
      }

      return returnObj;

    };

    service.createSalesProcess = function(params)
    {

      var timer   = TimerService.getIteration();
      var settings = defaults[params.state].types[params.type];
      var delays = params.data.delays !== undefined ? params.data.delays : 0;
      var time = HelperService.getRandomMinMaxValue(settings.processtime.values, settings.processtime.weights);

      var processObj = {
        "name" : "Create a sales process ",
        "time" : time + delays,
        "params" : service.getCallbackParams(params)
      };

      ProcessService.addProcess(processObj);

      service.updateStateValue(params.state);
     
    };

    
    service.createJob = function(params)
    {
        JobService.setJobState(params.jobID,'job');
    };

    return service;

  }

  angular.module('common.services.sales', [])
    .factory('SalesService', SalesService);
  
})();

(function() {

  'use strict';

  function ScheduleService(JobService,TimerService)
  {

    var schedule = {};
    var service = {};

    /* */
    service.scheduleJobs = function()
    { 
      
      var timer   = TimerService.getIteration();
      var jobs = JobService.getJobsByParam({'state':'job'});

      if(jobs)
      {  
        
        angular.forEach(jobs,function(job,key)
        {
          
          console.log(job.components);
          /* 
            1) Break job down into its various components
            2) 
          */  


        });

      }
      
    };

    return service;

  }

  angular.module('common.services.scheduling', [])
    .factory('ScheduleService', ScheduleService);
  
})();

(function() {

  'use strict';

  function StatisticsService()
  {

  	var stats;

    var service = {};

    service.initStats = function()
    {
      stats = {};
    };

    service.getStats = function()
    {
      if(stats === undefined) service.initStats();
      return stats;
    };

    service.initStatType = function(type)
    {
      stats[type] = {};
    };

    service.initStat = function(type,statistic)
    {
      stats[type][statistic] = {'current':{},'cumulative':{},'average':{},'count':0};
    };

    service.setCounter = function(type, statistic, value)
    {
      stats[type][statistic].count = value;
    };

    service.setStat = function(type, statistic, param, value)
    {
      if(stats[type][statistic].current[param] === undefined) 
      {
        stats[type][statistic].current[param] = 0;
      }
      stats[type][statistic].current[param] = value;

      if(stats[type][statistic].cumulative[param] === undefined) 
      {
        stats[type][statistic].cumulative[param] = 0;
      }
      stats[type][statistic].cumulative[param] += value;

      if(stats[type][statistic].average[param] === undefined) 
      {
          stats[type][statistic].average[param] = 0;
      }
      stats[type][statistic].average[param] = stats[type][statistic].cumulative[param] / stats[type][statistic].count;
    };

    service.addStat = function(type, statistic, iteration, param, value)
    {

      if(stats === undefined) service.initStats();

      if(stats[type] === undefined) service.initStatType(type);

      if(stats[type][statistic] === undefined) service.initStat(type,statistic);

      service.setCounter(type, statistic, iteration);

      service.setStat(type, statistic, param, value);

    };

    service.getStatType = function(type)
    {
      if(stats === undefined) service.initStats();

      if(stats[type] === undefined) service.initStatType(type);
      
      return stats[type];
    };

    return service;

  }

  angular.module('common.services.statistics', [])
    .factory('StatisticsService', StatisticsService);
  
})();

(function() {

  'use strict';

  function TimerService()
  {

    var iteration,totals;

    var service = {};

    service.setIteration = function(iteration)
    {
      if(iteration===true)
      {
        service.setIterationValue('iteration', 0);
        service.setIterationValue('year', 0);
      }
      service.setIterationValue('month', 0);
      service.setIterationValue('day', 0);
      service.setIterationValue('hour', 0);
    };

    service.getIteration = function()
    {
      return iteration;
    };

    service.setTotals = function()
    {
      service.setTotalValue('iterations', 0);
      service.setTotalValue('years', 0);
      service.setTotalValue('months', 0);
      service.setTotalValue('days', 0);
      service.setTotalValue('hours', 0);
    };

    service.getTotals = function()
    {
      return totals;
    };

    /* VALUES */

    service.setIterationValue = function(param,value)
    {
      if(iteration === undefined) iteration = {};
      iteration[param] = value;
    };

    service.getIterationValue = function(param)
    {
      return iteration[param];
    };

    service.setTotalValue = function(param,value)
    {
      if(totals === undefined) totals = {};
      totals[param] = value;
    };

    service.getTotalValue = function(param)
    {
      return totals[param];
    };

    /* HELPERS */

    service.initTimers = function(timers)
    {
       this.setIteration(true);
       this.setTotals();
    };

    service.resetIterationTimers = function()
    {
      
      this.setIteration();
     
    };

    service.incrementByOne = function(param)
    {  
      var curVal = service.getIterationValue(param);
      service.setIterationValue(param,curVal+1);

      var totalHour = service.getTotalValue(param + 's');
      service.setTotalValue(param + 's',totalHour+1);

    };

    service.incrementByValue = function(param,value)
    {  

      var thisIteration = service.getIterationValue('iteration');  

      service.setIterationValue(param,value);

      var paramTotal = service.getTotalValue(param + 's');
      service.setTotalValue(param + 's',value * thisIteration);

    };

    service.incrementByMonth = function(hour)
    { 

      service.incrementByValue('hour',hour);
      
      service.incrementByValue('day',Math.floor(hour / 24));

      service.incrementByValue('month',Math.floor(hour / 720));

      if( (hour % 8640) === 0 )
      {
        service.incrementByOne('year');
      }
      
    };

    service.increment = function()
    { 
      service.incrementByOne('hour');

      var curHour = service.getIterationValue('hour');

      if( (curHour % 24) === 0 )
      {
        service.incrementByOne('day');
      }

      if( (curHour % 720) === 0 )
      {
        service.incrementByOne('month');
      }
      
      if( (curHour % 8640) === 0 )
      {
        service.incrementByOne('year');
      }
      
    };

    return service;

  }

  angular.module('common.services.timer', [])
    .factory('TimerService', TimerService);
  
})();

(function() {

  'use strict';

  function VariablesService()
  {

  	var variables;

    var service = {};

    service.setVariables = function(data)
    {
    	variables = data;
    };

    service.getVariables = function()
    {
    	return variables;
    };

    service.getVariableGroup = function(group)
    {
    	return variables[group];
    };

    service.getVariable = function(group,param)
    {
      return variables[group][param];
    };

    return service;

  }

  angular.module('common.services.variables', [])
    .factory('VariablesService', VariablesService);
  
})();

(function() {

  'use strict';

  function ProfitLossChartCtrl($scope,ChartService)
  {

    var ctrl = {};

    ctrl.initChart = function()
    {

        var params = {};
        params.labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        params.series = ['Income', 'Expenses'];
        params.data = [[],[]];
        
        ChartService.initChart('pl',params);

    };

    ctrl.getChartData = function()
    {
      return ChartService.getChart('pl');
    };

    return ctrl;


  }

  angular.module('sim.module.ctrl.profitlosschart', ['chart.js'])
    .controller('ProfitLossChartCtrl', ProfitLossChartCtrl);
  
})();

(function() {

  'use strict';

  function ProfitLossChartDirective($timeout)
  {
    
    return {

      restrict: 'E',
      require: 'profitLossChart',
      templateUrl:'/src/app/simulation/modules/ProfitLossChart/profitlosschart.tpl.html',
      replace:true,
      link: function(scope, element, attrs, ctrl) 
      {

         $timeout(function(){
          ctrl.initChart();
          scope.chart = ctrl.getChartData();
         },0);

      },
      controller: 'ProfitLossChartCtrl'

    };

  }

  angular.module('modules.profitlosschart',[
  	'sim.module.ctrl.profitlosschart'
  	])
    .directive('profitLossChart', ProfitLossChartDirective);
  
})();

(function() {

  'use strict';

  function SalesReportCtrl($scope)
  {

    var ctrl = {};

    return ctrl;

  }

  angular.module('sim.module.ctrl.salesreport', [])
    .controller('SalesReportCtrl', SalesReportCtrl);
  
})();

(function() {

  'use strict';

  function SalesReportDirective($timeout,SalesService)
  {
    
    return {

      restrict: 'E',
      require: 'salesReporting',
      scope: {},
      templateUrl: '/src/app/simulation/modules/SalesReport/salesreport.tpl.html',
      replace: true,
      link: function(scope, element, attrs, ctrl) 
      {
        scope.states = SalesService.getStates();
      },
      controller: 'SalesReportCtrl'

    };

  }

  angular.module('modules.leadsreport',[
  	'sim.module.ctrl.salesreport'
  	])
    .directive('salesReporting', SalesReportDirective);
  
})();
