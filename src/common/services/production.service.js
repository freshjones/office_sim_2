(function() {

  'use strict';

  function ProductionService(JobService,TimerService)
  {

    var service = {};

    /*
      
    */
    service.runProductionCycle = function()
    { 
      
      var timer   = TimerService.getIteration();
      var jobs = JobService.getAllJobs();

      if(jobs)
      {  
      
     

      }
      
    };

    return service;

  }

  angular.module('common.services.production', [])
    .factory('ProductionService', ProductionService);
  
})();
