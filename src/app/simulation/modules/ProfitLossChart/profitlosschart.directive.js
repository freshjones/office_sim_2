(function() {

  'use strict';

  function ProfitLossChartDirective($timeout)
  {
    
    return {

      restrict: 'E',
      require: 'profitLossChart',
      templateUrl:'/src/app/simulation/modules/ProfitLossChart/profitlosschart.tpl.html',
      replace:true,
      link: function(scope, element, attrs, ctrl) 
      {

         $timeout(function(){
          ctrl.initChart();
          scope.chart = ctrl.getChartData();
         },0);

      },
      controller: 'ProfitLossChartCtrl'

    };

  }

  angular.module('modules.profitlosschart',[
  	'sim.module.ctrl.profitlosschart'
  	])
    .directive('profitLossChart', ProfitLossChartDirective);
  
})();
