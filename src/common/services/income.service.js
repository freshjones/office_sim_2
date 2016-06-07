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
