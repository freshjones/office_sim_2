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
