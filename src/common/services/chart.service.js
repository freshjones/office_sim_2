(function() {

  'use strict';

  function ChartService()
  {

    var charts;

    charts = {};

    var service = {};

    service.initChart = function(chart,params)
    {
      
      if(charts[chart] === undefined) charts[chart] = {};
        
      Object.keys(params).forEach(function(key) {
        var chartParam = {};
        chartParam[key] = params[key];
        service.setChartValue(chart,chartParam);
      });
      
    };

    service.getChart = function(chart)
    {
      return charts[chart];
    };

    service.setChartValue = function(chart,data)
    {
      angular.extend(charts[chart],data);
    };


    return service;

  }

  angular.module('common.services.chart', [])
    .factory('ChartService', ChartService);
  
})();
