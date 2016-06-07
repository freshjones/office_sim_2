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
        ProcessService
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

        //initialize leads
        SalesService.resetStates();

	};


    service.runIteration = function()
    {

        var iteration = TimerService.getIterationValue('iteration'); 

        SalesService.resetCurrentStates();

        for(var i=1; i <= 12; i++)
        {
            var month       = i;
            var hour        = month * 720;

            TimerService.incrementByMonth(hour);
            
            SalesService.runSalesCycle();

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

        //console.log(SalesService.getStates());
        //console.log(JobService.getJobsByParam({"param":"state","value":"estimate"}));
   
        return service.getSimulationStatistics();
 
	};

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
