(function() {

  'use strict';

  function SalesReportDirective($timeout,SalesService)
  {
    
    return {

      restrict: 'E',
      require: 'salesReporting',
      scope: {},
      templateUrl: '/src/app/simulation/modules/SalesReport/salesreport.tpl.html',
      replace: true,
      link: function(scope, element, attrs, ctrl) 
      {
        scope.states = SalesService.getStates();
      },
      controller: 'SalesReportCtrl'

    };

  }

  angular.module('modules.leadsreport',[
  	'sim.module.ctrl.salesreport'
  	])
    .directive('salesReporting', SalesReportDirective);
  
})();
