(function() {

  'use strict';

  function StatisticsService()
  {

  	var stats;

    var service = {};

    service.initStats = function()
    {
      stats = {};
    };

    service.getStats = function()
    {
      if(stats === undefined) service.initStats();
      return stats;
    };

    service.initStatType = function(type)
    {
      stats[type] = {};
    };

    service.initStat = function(type,statistic)
    {
      stats[type][statistic] = {'current':{},'cumulative':{},'average':{},'count':0};
    };

    service.setCounter = function(type, statistic, value)
    {
      stats[type][statistic].count = value;
    };

    service.setStat = function(type, statistic, param, value)
    {
      if(stats[type][statistic].current[param] === undefined) 
      {
        stats[type][statistic].current[param] = 0;
      }
      stats[type][statistic].current[param] = value;

      if(stats[type][statistic].cumulative[param] === undefined) 
      {
        stats[type][statistic].cumulative[param] = 0;
      }
      stats[type][statistic].cumulative[param] += value;

      if(stats[type][statistic].average[param] === undefined) 
      {
          stats[type][statistic].average[param] = 0;
      }
      stats[type][statistic].average[param] = stats[type][statistic].cumulative[param] / stats[type][statistic].count;
    };

    service.addStat = function(type, statistic, iteration, param, value)
    {

      if(stats === undefined) service.initStats();

      if(stats[type] === undefined) service.initStatType(type);

      if(stats[type][statistic] === undefined) service.initStat(type,statistic);

      service.setCounter(type, statistic, iteration);

      service.setStat(type, statistic, param, value);

    };

    service.getStatType = function(type)
    {
      if(stats === undefined) service.initStats();

      if(stats[type] === undefined) service.initStatType(type);
      
      return stats[type];
    };

    return service;

  }

  angular.module('common.services.statistics', [])
    .factory('StatisticsService', StatisticsService);
  
})();
