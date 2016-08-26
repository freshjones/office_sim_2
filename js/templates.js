(function(module) {
try {
  module = angular.module('templates');
} catch (e) {
  module = angular.module('templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/src/app/processtest/processtest.tpl.html',
    '<div>\n' +
    '	<h1>{{processor.time}}</h1>\n' +
    '	<ul>\n' +
    '		<li ng-repeat="(key,count) in processor.counts">{{key}}:{{count}}</li> \n' +
    '	</ul>\n' +
    '	<p><button ng-click="next(processor.time)" ng-disabled="!hasWork()">next</button><button ng-click="reset()">reset</button></p>\n' +
    '	<table border="1" cellpadding="3" cellspacing="0" style="box-sizing: border-box;  border-collapse: collapse; ">\n' +
    '	<thead>\n' +
    '		<th>Depth</th>\n' +
    '		<th>Process ID</th>\n' +
    '		<th>Type</th>\n' +
    '		<th>Requires</th>\n' +
    '		<th>Estimated</th>\n' +
    '		<th>Worked</th>\n' +
    '		<th>Queued</th>\n' +
    '		<th>In Progress</th>\n' +
    '		<th>Completed</th>\n' +
    '	</thead>\n' +
    '	<tbody>\n' +
    '		<tr ng-repeat="(key,process) in processor.flatprocesses">\n' +
    '			<td>{{process.depth}}</td>\n' +
    '			<td>{{process.key}}</td>\n' +
    '			<td>{{process.type}}</td>\n' +
    '			<td>{{process.requirements.processes.join(\', \')}}</td>\n' +
    '			<td>{{process.units * process.estimate}}</td>\n' +
    '			<td>{{process.worked}}</td>\n' +
    '			<td><span ng-if="process.status === \'waiting\'">*</span></td>\n' +
    '			<td><span ng-if="process.status === \'inprogress\'">*</span></td>\n' +
    '			<td><span ng-if="process.status === \'complete\'">*</span></td>\n' +
    '		</tr>\n' +
    '	</tbody>\n' +
    '	</table>\n' +
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
