(function() {

  'use strict';

  function JobService($filter,JobFactory,TimerService)
  {

    var jobs = {};

    var service = {};

    
    service.resetJobs = function()
    {
      jobs = {};
    };

    service.createEstimate = function()
    {
      return service.createJob({"state":"estimate"});
    };

    service.createJob = function(params)
    {
      var job = JobFactory.createJob(params);
      jobs[job.id] = job;
      return job.id;
    };

    service.setJobState = function(id,state)
    {
      if(jobs[id] === undefined) return false;
      angular.extend(jobs[id],{"state":state});
      service.LogStateChange(id,state);
      return true;
    };

    service.LogStateChange = function(id,state)
    {
      if(jobs[id] === undefined) return false;

      var thisMonth           = TimerService.getIterationValue('month'); 

      var today = new Date();
      var now = today.getTime();
      var obj = {};
      obj[state] = thisMonth;
      angular.extend(jobs[id].times,obj);
    };

    service.getJob = function(id)
    {
      return jobs[id] !== undefined ? jobs[id] : false;
    };

    service.getAllJobs = function(id)
    {
      return Object.keys(jobs).length > 0 ? jobs : false;
    };

    service.getJobsByParam = function(params)
    {

      var items = {};

      angular.forEach(jobs,function(job,key)
      {
        if(params === undefined)
        {
          
          items[key] = job;

        } else {

          if(job[params.param] == params.value)
          {
            items[key] = job;
          }

        }

      });
      
      return items;

    };

    return service;

  }

  angular.module('common.services.jobs', ['common.factory.jobs'])
    .factory('JobService', JobService);
  
})();
