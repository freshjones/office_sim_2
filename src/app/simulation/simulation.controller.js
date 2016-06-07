(function() {

  'use strict';

  function SimulationCtrl($scope,AccountsService,VariablesService,SimulationService,StatisticsService,ProcessService)
  {

    $scope.accounts = AccountsService.getAccounts();
    
    var ctrl = {};

    ctrl.initSimulation = function()
    {
      SimulationService.initSimulation();
    };
         
    ctrl.startSimulation = function()
    {
      
      //initialize
      ctrl.initSimulation();

      var simulationStats = SimulationService.runSimulation();
      
      
      console.log(simulationStats);
    };

    return ctrl;	

  }

  angular.module('app.controllers.simulation', [])
    .controller('SimulationCtrl', SimulationCtrl);
  
})();
