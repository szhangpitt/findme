var appModule = angular.module('findmeapp', []);


appModule.controller('appController', ['$scope', 'peopleService', '$rootScope', function ($scope, peopleService, $rootScope) {
	$scope.mapZoomLevel = 12;
	$scope.offsetLeft = 0;
	$scope.offsetTop = 0;
	$scope.grids = generateGrids(); 
	$scope.turnOnSmoothTransition = false;
	peopleService.take();

	var zoomedOnGrid = null;

	var VIEWPORT_ZOOM_OFFSET = 200, 
		ZOOMED_IN_LEVEL = 60

	$rootScope.$on('image-loaded', function(event, data) {
		console.log(data); 
		//$scope.grids = generateGrids(); 
		$scope.$apply(); 
	});

	$rootScope.$on('allpersons-data-ready', function(event, data) {
		console.log(data); 
		$scope.allpersons = data;
		
	});

	$rootScope.$on('image-overlay-drag', function(event, data){
		console.log('image-overlay-drag', data); 
		$scope.turnOnSmoothTransition = false;
		$scope.offsetLeft += data.diffX;
		$scope.offsetTop += data.diffY;
		$scope.$apply(); 
	});

	$scope.zoomImage = function(){
		var width = 6300 * $scope.mapZoomLevel / 100;
		var height = 4500 * $scope.mapZoomLevel /100;

		return {
			width: width, 
			height: height, 
			scale: $scope.mapZoomLevel / 100
		};
	};

	$scope.clickToZoom = function(gridObject) {
		$scope.turnOnSmoothTransition = true;

		if(gridObject !== zoomedOnGrid || $scope.mapZoomLevel !== ZOOMED_IN_LEVEL) {
			console.log(gridObject);
			$scope.mapZoomLevel = ZOOMED_IN_LEVEL;
			$scope.offsetLeft = (0 - gridObject.col * gridObject.width) / 100 * $scope.zoomImage().width + VIEWPORT_ZOOM_OFFSET;
			$scope.offsetTop = (0 - gridObject.row * gridObject.height) / 100 * $scope.zoomImage().height + VIEWPORT_ZOOM_OFFSET;
			zoomedOnGrid = gridObject;	
		}
		else {
			$scope.resetMap();
		}
		
	}

	$scope.mapFilteredResults = function() {
		//highlight all filtered persons in the list...
	}

	$scope.locatePerson = function(personObject) {
		if(personObject.col && personObject.row) {
			$scope.targetGrid = {col: personObject.col, row: personObject.row};
		}
	}

	$scope.resetMap = function() {
		// $scope.search = '';
		$scope.mapZoomLevel = 12;
		$scope.offsetLeft = 0;
		$scope.offsetTop = 0;
	}

	function generateGrids(cols, rows) {
		cols = cols || 28//(63 / 9);
		rows = rows || 20//(45 / 9);

		var colWidth = 6300 / cols;
		var rowHeight = 4500 / rows;

		var colWidthPercent = 1.0 / cols;
		var rowHeightPercent = 1.0 / rows;

		var grids = [];

		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < cols; j++) {
				var grid = {
					id: 'grid-' + j + '-' + i, 
					col: j, 
					row: i,
					width: colWidthPercent * 100,
					height: rowHeightPercent * 100
				};

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

appModule.directive('clickToZoom', [function () {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			
		}
	};
}])

appModule.directive('draggableOverlayMap', ['$rootScope', function ($rootScope) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var startX = 0, startY = 0, lastX = 0, lastY = 0;
			var dragging = false;

			element.on('mousedown', function(e) {
				lastX = e.pageX;
				lastY = e.pageY;
				dragging = true;
				console.log('draggable mousedown');
			});

			element.on('mousemove', function(e) {
				if(dragging) {
					var mouseDrag = {
						diffX: e.pageX - lastX,
						diffY: e.pageY - lastY
					}

					$rootScope.$broadcast('image-overlay-drag', mouseDrag);
					lastX = e.pageX;
					lastY = e.pageY;
					console.log('draggable mousemove', mouseDrag.diffX, mouseDrag.diffY);	

					element.addClass('mousedown');
				}
				
			});

			element.on('mouseup', function(e) {
				dragging = false;
				element.removeClass('mousedown');
				console.log('draggable mouseup');
			});

				
		}
	};
}]);

appModule.factory('jsonDataSrv', ['$http', function ($http) {
	var srv = {
		async: function(url){
			var promise = $http.get(url).then(function(response){
				//console.log(response);
				return response.data;
			});
			return promise;
		}
	}
	return srv;
}]);

appModule.service('peopleService', ['jsonDataSrv', '$rootScope', function (jsonDataSrv, $rootScope) {
	var that = this;


	this.take = function() {
		if (that.allPersons) {
			
		}
		else {
			jsonDataSrv.async('data/allpeople.json')
					   .then(function(data){
							$rootScope.$broadcast('allpersons-data-ready', data);
					   });
		}
	};

}]);