angular.module('app.controllers', [])

.controller('chartCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.swipeRight = function() {
        console.log("swipeRight");
        $location.path('/page1/rates');
    }

    $scope.swipeLeft = function() {
        console.log("swipeLeft");
        $location.path('/page1/changes');
    }
}])

.controller('changesCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.swipeRight = function() {
        $location.path('/page1/chart');
    }

    $scope.swipeLeft = function() {
        $location.path('/page1/geography');
    }

}])

.controller('geographyCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.swipeRight = function() {
        $location.path('/page1/changes');
    }
}])

