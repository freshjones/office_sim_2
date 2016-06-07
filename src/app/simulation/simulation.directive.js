(function() {

  'use strict';

  function SimulationDirective($timeout)
  {
    
    return {

      restrict: 'E',
      require: 'simulation',
      templateUrl:'/src/app/simulation/simulation.tpl.html',
      replace:true,
      link: function(scope, element, attrs, ctrl) 
      {
       
          scope.runSimulation = function()
          {
            ctrl.startSimulation();
          };

      },
      controller: 'SimulationCtrl'

    };

  }

  angular.module('app.directives.simulation',[
      'app.controllers.simulation',
      'app.services.simulation',
      'modules.profitlosschart',
      'modules.leadsreport'
    ])
    .directive('simulation', SimulationDirective);
  
})();
