var appModule = angular.module('findmeapp', ['ngRoute']);

appModule.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/', {
		templateUrl: '/main.html'
	})
	.when('/person/:personName', {
		templateUrl: '/main.html'
	})
	.otherwise({ redirectTo: '/' });

	//$locationProvider.html5Mode(true);
}]);

appModule.controller('appController', ['$scope', 'peopleService', 'wayPointsService', '$rootScope', '$routeParams', '$location', 
	function ($scope, peopleService, wayPointsService, $rootScope, $routeParams, $location) {
		
		$scope.mapZoomLevel = 12;
		$scope.offsetLeft = 0;
		$scope.offsetTop = 0;

		$scope.turnOnSmoothTransition = false;



		wayPointsService.take();
		

		var zoomedOnGrid = null;

		var VIEWPORT_ZOOM_OFFSET = 200, 
		ZOOMED_IN_LEVEL = 60;

		$scope.IMG_WIDTH = 6300;
		$scope.IMG_HEIGHT = 4500;



		$rootScope.$on('image-loaded', function(event, data) {
			console.log(data); 
			
			$scope.$apply(); 
		});

		$rootScope.$on('allpersons-data-ready', function(event, data) {
			console.log(data); 
			$scope.allpersons = data;
			$scope.grids = generateGrids(data, $scope.wayPoints); 
			
			if(supports_html5_storage()) {
				$scope.locateMe(angular.fromJson(localStorage.getItem('me')));
			}
			
			if($routeParams.personName) {
				if($routeParams.personName.indexOf('__') !== -1) {
					$routeParams.personName = $routeParams.personName.replace(/__/g, ' ');
				}

				$scope.search = $routeParams.personName;
				
				var person = _.find(data, function(p) {
					return p.employee_name === $routeParams.personName;
				});

				$scope.locatePerson(person);

				$scope.$apply();
			}

		});

		$rootScope.$on('waypoints-data-ready', function(event, data) {
			$scope.wayPoints = data;
			
			peopleService.take();

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
			$scope.personToLocate = personObject;
			$scope.targetGrid = {col: personObject.col, row: personObject.row};
		}
	}

	$scope.hintPerson = function(personObject) {
		if(personObject.col && personObject.row) {
			$scope.hintGrid = {col: personObject.col, row: personObject.row};
		}
	}

	$scope.endHintPerson = function() {
		$scope.hintGrid = null;
	}

	$scope.locateMe = function(personObject) {
		if(personObject.col && personObject.row /*&& personObject.employee_name*/) {
			$scope.pinGrid = {col: personObject.col, row: personObject.row};
			$scope.selectedMe = personObject;
			if (supports_html5_storage()) {
				localStorage.setItem('me', angular.toJson(personObject));
			}
		}
	}

	function supports_html5_storage() {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}

	$scope.resetSearch = function() {
		$scope.search = ''; 
		$scope.targetGrid = null; 
		$scope.pinGrid = null; 
		$scope.selectedPerson = null; 
		$scope.selectedMe = null;
	}

	$scope.resetMap = function() {
		// $scope.search = '';
		$scope.mapZoomLevel = 12;
		$scope.offsetLeft = 0;
		$scope.offsetTop = 0;
	}

	function generateGrids(allPersonsData, wayPointsData, cols, rows) {

		cols = cols || 28//(63 / 9);
		rows = rows || 20//(45 / 9);

		var colWidth = 6300 / cols;
		var rowHeight = 4500 / rows;

		var colWidthPercent = 1.0 / cols;
		var rowHeightPercent = 1.0 / rows;

		var grids = [];
		var holder = {};
		var wayPointsHolder = {};

		if(allPersonsData) {
			if(angular.isArray(allPersonsData)) {
				for (var i = 0, len = allPersonsData.length; i < len; i++) {
					var p = allPersonsData[i];
					if(!holder[p.col + '-' + p.row]) {
						holder[p.col + '-' + p.row] = {};
						holder[p.col + '-' + p.row].persons = [];
						holder[p.col + '-' + p.row].persons.push(p);
						holder[p.col + '-' + p.row].names = (p.employee_name || p.room_name || '') + ' ';
					}
					else{
						holder[p.col + '-' + p.row].persons.push(p);
						holder[p.col + '-' + p.row].names += '<br>' + (p.employee_name || p.room_name || '');
					}
				}
			}
		}

		if(wayPointsData) {
			if(angular.isArray(wayPointsData)) {
				for (var i = 0, len = wayPointsData.length; i < len; i++) {
					var wp = wayPointsData[i];
					if(!wayPointsHolder[wp.col + '-' + wp.row]) {
						wayPointsHolder[wp.col + '-' + wp.row] = {};
						wayPointsHolder[wp.col + '-' + wp.row] = wp;
					}
				}
			}
		}

		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < cols; j++) {
				var ho = holder[j + '-' + i] || {};
				var wayPoint = wayPointsHolder[j + '-' + i] || {};
				if(j == 8 && i == 10){
					console.log('wayPoint: ', wayPoint)
				}
				var grid = {
					id: 'grid-' + j + '-' + i, 
					col: j, 
					row: i,
					width: colWidthPercent * 100,
					height: rowHeightPercent * 100, 
					persons: ho.names || '', 
					wayPoint: wayPoint 
				};

				grids.push(grid);
			}
		}



		return grids;
	}

	function applyWayPoints(scope_grids, data) {
		
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
}]);

appModule.directive('showPersonTooltip', [function () {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			scope.$watch(attrs, function() {
				if(attrs.title) {					
					$(element).tooltip({html: true, placement: 'top', container: 'body'});
					console.log(attrs.title);	
				}
				
			});
		}
	};
}]);

appModule.directive('showWaypointPopover', [function () {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			scope.$watch(attrs, function() {
				if(attrs['wayPoint']) {
					$(element).popover({
						html: true, 
						trigger: 'hover', 
						placement: 'top', 
						content: function(){
							return '<img src="assets/images/'+ attrs['wayPoint'] + '" />';
						}
					});
				}
			});
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
			$rootScope.$broadcast('allpersons-data-ready', data);
		}
		else {
			jsonDataSrv.async('data/allpeople.json')
			.then(function(data){
				$rootScope.$broadcast('allpersons-data-ready', data);
			});
		}
	};

}]);

appModule.service('wayPointsService', ['jsonDataSrv', '$rootScope', function (jsonDataSrv, $rootScope) {
	var that = this;

	this.take = function() {
		if (that.allWayPoints) {
			$rootScope.$broadcast('waypoints-data-ready', data);
		}
		else {
			jsonDataSrv.async('data/waypoints.json')
			.then(function(data){
				that.allWayPoints = data;
				$rootScope.$broadcast('waypoints-data-ready', data);
			});
		}
	};

}]);

appModule.filter('replaceSpace', function() {
	return function(input) {
		return input.replace(/\s/g, '__');
	};
});