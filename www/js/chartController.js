angular.module('app.chartController', [])

.controller('chartCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.swipeRight = function() {
        console.log("swipeRight");
        $location.path('/page1/rates');
    }

    $scope.swipeLeft = function() {
        console.log("swipeLeft");
        $location.path('/page1/changes');
    }
}]);
