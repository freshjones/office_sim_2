(function() {

  'use strict';

  function ScheduleService(JobService,TimerService)
  {

    var schedule = {};
    var service = {};

    /* */
    service.scheduleJobs = function()
    { 
      
      var timer   = TimerService.getIteration();
      var jobs = JobService.getJobsByParam({'state':'job'});

      if(jobs)
      {  
        
        angular.forEach(jobs,function(job,key)
        {
          
          console.log(job.components);
          /* 
            1) Break job down into its various components
            2) 
          */  


        });

      }
      
    };

    return service;

  }

  angular.module('common.services.scheduling', [])
    .factory('ScheduleService', ScheduleService);
  
})();
