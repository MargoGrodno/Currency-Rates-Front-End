angular.module('app.directives', [])

.directive('systemMsg', ['$ionicPopup', function($ionicPopup) {
    return {
        restrict: "A",
        link: function(scope, element, attributs) {
            scope.$on('showSystemMsg', function(event, data) {
                var title = data["title"] || 'Sorry!';
                var template = data["template"] || "Server unavailible. Please, try later.";

                var alertPopup = $ionicPopup.alert({
                    title: title,
                    template: template
                });

                alertPopup.then(function(res) {
                    //действия после нажание "ok" в попапе
                });
            });
        }
    }
}])

.directive('loading', ['$ionicLoading', '$http', function($ionicLoading, $http) {
    return {
        restrict: "A",
        link: function(scope, element, attributs) {
            scope.$on('showLoading', function(event, data) {
                $ionicLoading.show({
                    templateUrl: "templates/loading.html"
                });
            });
            scope.$on('hideLoading', function(event, data) {
                if ($http.pendingRequests.length == 0) {
                    $ionicLoading.hide();
                }
            });
        }
    }
}])

.directive('dateSelector', ['$timeout', function($timeout) {

    function dateInBelarus() {
        var date = new Date();
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + 3 * 60);
        return date;
    }

    return {
        restrict: "E",
        scope: {
            inputDate: '=',
            dateFrom: '=',
            dateTo: '='
        },
        template: '<ionic-datepicker input-obj="datepickerObjectPopup" ng-if="!!isShow">' +
            '<button class="button button-light dateBtn">{{datepickerObjectPopup.inputDate | date:datepickerObjectPopup.dateFormat}}</button>' +
            '</ionic-datepicker>',

        controller: function($scope, $element, $attrs) {
            $scope.$watch("dateFrom", function(newValue, oldValue) {
                $scope.isShow = false;
                $timeout(function() {
                    $scope.datepickerObjectPopup.from = newValue;
                    //$scope.$apply();
                    $scope.isShow = true;
                });
            })

            $scope.$watch("dateTo", function(newValue, oldValue) {
                $scope.isShow = false;
                $timeout(function() {
                    $scope.datepickerObjectPopup.to = newValue;
                    //$scope.$apply();
                    $scope.isShow = true;
                });
            })

            var dateFrom = $scope.dateFrom || new Date(1995, 6, 1);
            var dateTo = $scope.dateTo || dateInBelarus();

            $scope.datepickerObjectPopup = {
                titleLabel: $attrs.titleLabel,
                inputDate: $scope.inputDate,
                templateType: 'popup',
                monthList: $scope.monthList,
                mondayFirst: true,
                from: dateFrom,
                to: dateTo,
                callback: function(val) {
                    datePickerCallbackPopup(val);
                },
                dateFormat: 'dd-MM-yyyy',
            };

            var datePickerCallbackPopup = function(val) {
                if (typeof(val) === 'undefined') {
                    console.log('No date selected');
                } else {
                    $scope.datepickerObjectPopup.inputDate = val;
                    $scope.$emit($attrs.changeEvent, val);
                    console.log('Selected date is : ', val)
                }
            };
        }
    }
}]);
