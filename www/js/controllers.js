angular.module('app.controllers', [])


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

.controller('DatePickerCtrl', ['$scope', '$timeout', 'monthList', function($scope, $timeout, monthList) {
    //$scope.datepickerObjectPopup = {};

    //$timeout(function() {
        // $scope.inputDate = new Date();
        $scope.datepickerObjectPopup = {
            titleLabel: $scope.titleLabel,
            errorMsgLabel: 'Please select date.', //Optional
            setButtonType: 'button-stable', //Optional
            templateType: 'popup', //Optional
            inputDate: $scope.inputDate,
            monthList: monthList,
            mondayFirst: true,
            from: new Date(1995, 6, 1), //Optional
            to: new Date(), //Optional
            dateFormat: 'dd-MM-yyyy', //Optional
            callback: function(val) { //Optional
                datePickerCallbackPopup(val);
            }
        };

        var datePickerCallbackPopup = function(val) {
            if (typeof(val) === 'undefined') {
                console.log('No date selected');
            } else {
                $scope.datepickerObjectPopup.inputDate = val;
                $scope.$emit('Date changed', val);
                console.log('Selected date is : ', val)
            }
        };


    //});

}]);
