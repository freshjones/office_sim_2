(function() {

  'use strict';

  function ProcesstestDirective($timeout)
  {

    return {
      restrict:'E',
      templateUrl:'/src/app/processtest/processtest.tpl.html',
      replace:true,
      require:'processtest',
      link:function(scope, element, attrs, ctrl) 
      {
        
        ctrl.initProcessor();
        scope.processor =  ctrl.getProcessor();
        ctrl.runTimer(0);

        scope.stop = function(){
          $timeout.cancel(timer);
        };
        
        scope.hasWork = function()
        {
          return ctrl.hasWork();
        };

        scope.start = function(time)
        {
          ctrl.runTimer(time);
        };
        
        scope.next = function(time)
        {
          ctrl.runTimer(time+1);
        };

        scope.reset = function(time){
          ctrl.initProcessor();
          ctrl.runTimer(0);
        };

      },
      controller:'ProcessTestCtrl'
    };

  }

  angular.module('app.directives.processtest',['app.controllers.processtest'])
    .directive('processtest', ProcesstestDirective);
  
})();
