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
