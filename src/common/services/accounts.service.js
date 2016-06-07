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
