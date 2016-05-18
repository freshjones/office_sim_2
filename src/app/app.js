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