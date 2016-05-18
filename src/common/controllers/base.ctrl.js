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
