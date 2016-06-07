(function() {

  'use strict';

  function ProfitLossChartCtrl($scope,ChartService)
  {

    var ctrl = {};

    ctrl.initChart = function()
    {

        var params = {};
        params.labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        params.series = ['Income', 'Expenses'];
        params.data = [[],[]];
        
        ChartService.initChart('pl',params);

    };

    ctrl.getChartData = function()
    {
      return ChartService.getChart('pl');
    };

    return ctrl;


  }

  angular.module('sim.module.ctrl.profitlosschart', ['chart.js'])
    .controller('ProfitLossChartCtrl', ProfitLossChartCtrl);
  
})();
