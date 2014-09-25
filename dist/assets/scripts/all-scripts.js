var appModule = angular.module('findmeapp', []);


appModule.controller('appController', ['$scope', '$rootScope', function ($scope, $rootScope) {
	$scope.mapZoomLevel = 12;
	

	$rootScope.$on('image-loaded', function(event, data) {
		console.log(data); 
		$scope.grids = generateGrids(); 
		$scope.$apply();
	});

	$scope.zoomImage = function(){
		var width = 6300 * $scope.mapZoomLevel / 100;
		var height = 4500 * $scope.mapZoomLevel /100;
		
		return {
			width: width, 
			height: height
		};
	};

	function generateGrids(cols, rows) {
		cols = cols || 14//(63 / 9);
		rows = rows || 10//(45 / 9);

		var colWidth = 6300 / cols;
		var rowHeight = 4500 / rows;

		var colWidthPercent = 1.0 / cols;
		var rowHeightPercent = 1.0 / rows;

		var grids = [];

		for (var i = 0; i < cols; i++) {
			for (var j = 0; j < rows; j++) {
				var grid = {
					id: 'grid-' + j + '-' + i, 
					width: colWidthPercent * 100,
					height: rowHeightPercent * 100
				}

				grids.push(grid);
			}
		}

		return grids;
	}

}]);


appModule.directive('imageOnLoad', ['$rootScope', function ($rootScope) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			element.bind('load', function() {
				console.log('image loaded');
				$rootScope.$broadcast('image-loaded', {'args': 1});
			});
		}
	};
}]);
