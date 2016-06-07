(function(module) {
try {
  module = angular.module('templates');
} catch (e) {
  module = angular.module('templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/src/app/simulation/simulation.tpl.html',
    '<div>\n' +
    '	<div>\n' +
    '	<ul>\n' +
    '	<li ng-repeat="(key,account) in accounts">{{key}}: ${{account.balance}}</li>\n' +
    '	</ul>\n' +
    '	</div>\n' +
    '	<sales-reporting></sales-reporting>\n' +
    '	<button ng-click="runSimulation()">Start Simulation</button>\n' +
    '	<profit-loss-chart></profit-loss-chart>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('templates');
} catch (e) {
  module = angular.module('templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/src/app/simulation/modules/ProfitLossChart/profitlosschart.tpl.html',
    '<div style="width:400px; height:500px;">\n' +
    '<canvas id="bar" class="chart chart-bar" chart-data="chart.data" chart-labels="chart.labels" chart-legend="true" chart-series="chart.series" chart-options="chart.options"></canvas>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('templates');
} catch (e) {
  module = angular.module('templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/src/app/simulation/modules/SalesReport/salesreport.tpl.html',
    '<div>\n' +
    '	<ul>\n' +
    '		<li ng-repeat="(key,state) in states">{{key}}: {{state.total}}</li>\n' +
    '	</ul>\n' +
    '</div>');
}]);
})();
