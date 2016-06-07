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
