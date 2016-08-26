(function() {
  
  'use strict';

  var moduleDir = '/src/app/simulation/modules/ProfitLossChart';

  var app = angular.module("OfficeSimApp", [
  	'ui.router',
  	'templates',
  	'common.controllers.bootstrap',
  	'app.directives.simulation',
    'app.directives.processtest',
  ])
  .config(function($stateProvider, $urlRouterProvider) {

  	$urlRouterProvider.otherwise("/");

  	$stateProvider
    .state('root', {
      url: "/",
      template: "<processtest></processtest>",
      controller: 'BootstrapCtrl',
      resolve: {

      	data:  function($q,$http) {
            var promises = {};
            promises.defaults = $http({method: 'GET', url: '/data/defaults.json'});
            promises.expenses = $http({method: 'GET', url: '/data/expenses.json'});
            promises.resources = $http({method: 'GET', url: '/data/resources.json'});
            promises.accounts = $http({method: 'GET', url: '/data/accounts.json'});
            promises.sales = $http({method: 'GET', url: '/data/sales.json'});
            promises.jobs = $http({method: 'GET', url: '/data/jobs.json'});

            promises.processes = $http({method: 'GET', url: '/data/test_processes.json'});

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