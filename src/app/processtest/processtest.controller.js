(function() {

  'use strict';

  function ProcessTestCtrl($scope,ProcessTestService)
  {
      
      var ctrl = {};

      ctrl.initProcessor = function()
      {
        
        ProcessTestService.initProcessor();
      
      };

      ctrl.getProcessor = function()
      {
        return ProcessTestService.getProcessor();
      };

      ctrl.hasWork = function()
      {
        return ProcessTestService.hasWork();
      };

      ctrl.runTimer = function(time)
      {
        ProcessTestService.runTimer(time);
      };

      return ctrl;

  }

  angular.module('app.controllers.processtest', ['app.services.processtest'])
    .controller('ProcessTestCtrl', ProcessTestCtrl);
  
})();
