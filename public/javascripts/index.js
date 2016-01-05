/*global angular*/
(function(angular){
	'use strict';
	angular.module('app', [])
	.controller('ctrl', ['$http', function($http) {
		$http.post('/2016/city', {id:1,name:'zdl'}).success(function(resp){
			console.log(resp);
		});
	}]);

	angular.bootstrap(document, ['app']);
})(angular);