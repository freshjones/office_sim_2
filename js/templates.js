(function(module) {
try {
  module = angular.module('templates');
} catch (e) {
  module = angular.module('templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/src/app/simulation/simulation.tpl.html',
    '<div>\n' +
    '	<button ng-click="runSimulation()">Start Simulation</button>\n' +
    '</div>');
}]);
})();
