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
