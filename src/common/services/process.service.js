(function() {

  'use strict';

  function ProcessService($filter,TimerService)
  {

    var processes = [];

    var service = {};

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
