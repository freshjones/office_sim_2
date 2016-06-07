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
      'common.services.process'
    ])
    .controller('BootstrapCtrl', BootstrapCtrl);
  
})();
