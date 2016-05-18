(function() {
  
  'use strict';

  var app = angular.module("OfficeSimApp", [
  	'ui.router',
  	'templates',
  	'common.controllers.main',
  	'app.controllers.simulation',
  	'app.directives.simulation',
  	'app.services.simulation'
  ])
  .config(function($stateProvider, $urlRouterProvider) {

  	$urlRouterProvider.otherwise("/");

  	$stateProvider
    .state('root', {
      url: "/",
      template: "<simulation></simulation>",
      controller: function($scope,data)
      {
      	console.log(data);
      },
      resolve: {

      	data:  function($q,$http) {
            var promises = {};
            promises.defaults = $http({method: 'GET', url: '/data/defaults.json'});
            promises.expenses = $http({method: 'GET', url: '/data/expenses.json'});
            promises.resources = $http({method: 'GET', url: '/data/resources.json'});

            return $q.all(promises).then(function(response){

            	var data = {};

		        Object.keys(response).forEach(function(key,index) 
		        {
		        	data[key] = response[key].data;
		        });

		        return data;

            });
        },

      }
    });

  });

})();
(function() {

  'use strict';

  function SimulationCtrl(SimulationService)
  {
    
    var ctrl = {};

    ctrl.startSimulation = function()
    {
    	
    };

    return ctrl;	

  }

  angular.module('app.controllers.simulation', [])
    .controller('SimulationCtrl', SimulationCtrl);
  
})();

(function() {

  'use strict';

  function SimulationDirective()
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

  angular.module('app.directives.simulation',[])
    .directive('simulation', SimulationDirective);
  
})();

(function() {

  'use strict';

  function SimulationService()
  {
      var service = {};


      return service;

  }

  angular.module('app.services.simulation', [])
    .factory('SimulationService', SimulationService);
  
})();

(function() {

  'use strict';

  function BaseCtrl()
  {
    
    var ctrl = {};

    return ctrl;	

  }

  angular.module('common.controllers.base', [])
    .controller('BaseCtrl', BaseCtrl);
  
})();

(function() {

  'use strict';

  function MainCtrl()
  {
    var ctrl = {};
    return ctrl;	
  }

  angular.module('common.controllers.main', [])
    .controller('MainCtrl', MainCtrl);
  
})();
