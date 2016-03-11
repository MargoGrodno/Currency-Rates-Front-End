angular.module('app.ratesController', [])

.controller('ratesCtrl', ['$ionicPopup', '$scope', '$http', "$location", "serverUrl",
    function($ionicPopup, $scope, $http, $location, serverUrl) {
     
        var makeUTCDate = function(incomeDate) {
            var date = new Date(incomeDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date;
        }

        function dateInBelarus () {
            var date = new Date();
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset()+3*60);
            return date;
        }

        $scope.Math = window.Math;
        $scope.monthList = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
        $scope.periodProp = '1';
        $scope.sortType = 'name';
        $scope.sortReverse = false;
        $scope.searchCur = '';
        $scope.rates = [];
        $scope.date = dateInBelarus();

        $scope.$on('ratesDate_changed', function(event, data) {
            $scope.date = data;
            $scope.getRates();
        });

        $scope.setPeriod = function(mySelect) {
            $scope.periodProp = mySelect;
            $scope.getRates();
        }

        $scope.getRates = function() {
            $scope.$emit("showLoading", {});
            $http.get(serverUrl, {
                params: {
                    method: "tableRates",
                    date: makeUTCDate($scope.date),
                    period: $scope.periodProp
                }
            }).success(function(data) {
               $scope.rates = data;
            }).error(function(error) {
               $scope.$emit("showSystemMsg", {});
                console.log(error);
            });
        }

        $scope.getRates();

        $scope.swipeLeft = function() {
            $location.path('/page1/chart');
        }
    }
])
