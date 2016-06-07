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
