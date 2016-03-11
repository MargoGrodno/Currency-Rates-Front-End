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

.controller('changesCtrl', ['$scope', '$location', '$http', 'serverUrl', 
    function($scope, $location, $http, serverUrl) {
    $scope.swipeRight = function() {
        $location.path('/page1/chart');
    }

    $scope.swipeLeft = function() {
        $location.path('/page1/geography');
    }

    $scope.listCurrencies = ['USD', 'EUR', 'PLN', 'RUB'];

    $scope.changeVal = function (newVal) {
        console.log(newVal);
    }

    $scope.getListCurrencies = function() {
        $scope.$emit("showLoading", {});
        $http.get(serverUrl, {
            params: {
                method: "currenciesForGraphics"
            }
        }).success(function(data) {
            $scope.listCurrencies = data;
        }).error(function(error) {
            $scope.$emit("showSystemMsg", {});
            console.log(error);
        });
    }
    $scope.getListCurrencies();
}])

.controller('geographyCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.swipeRight = function() {
        $location.path('/page1/changes');
    }
}])
