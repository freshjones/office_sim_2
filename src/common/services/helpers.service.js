(function() {

  'use strict';

  function HelperService()
  {

    var service = {};

    service.getRandomProbability = function(val)
    { 
      var r = Math.floor( (Math.random() * 100) + 1 );
      return r <= val;
    };

    service.random = function(min,max,floor)
    {
        var val = Math.random()*(max-min)+min;
        if(floor === true) val = Math.floor(val);
        return val;
    };

    service.getRandomMinMaxValue = function(ranges, weights) 
    {
        if(typeof ranges !== 'object' || typeof weights !== 'object') return 0;

        var range = service.getRandomValue(ranges,weights);

        var value = service.random(range[0],range[1],true);

        return value;
    };

    service.getRandomValue = function(values, weight) 
    {
        var total_weight = weight.reduce(function (prev, cur, i, arr) {
            return prev + cur;
        });
        var random_num = service.random(0, total_weight);
        var weight_sum = 0;
        for (var i = 0; i < values.length; i++) {
            weight_sum += weight[i];
            weight_sum = +weight_sum.toFixed(2);
            if (random_num <= weight_sum) {
                return values[i];
            }
        }
         
    };

    service.capitalize = function(s)
    {
        return s[0].toUpperCase() + s.slice(1);
    };

    service.uuid = function()
    {
        var d = new Date().getTime();
        if(window.performance && typeof window.performance.now === "function"){
            d += performance.now();
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    return service;

  }

  angular.module('common.services.helpers', [])
    .factory('HelperService', HelperService);
  
})();
