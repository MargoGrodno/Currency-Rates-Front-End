angular.module('app.routes', [])
    .config(function($stateProvider, $urlRouterProvider) {
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            .state('tabsController', {
                url: '/page1',
                abstract: true,
                templateUrl: 'templates/tabsController.html'
            })
            .state('tabsController.rates', {
                url: '/rates',
                views: {
                    'tab1': {
                        templateUrl: 'templates/rates.html',
                        controller: 'ratesCtrl'
                    }
                }
            })
            .state('tabsController.chart', {
                url: '/chart',
                views: {
                    'tab2': {
                        templateUrl: 'templates/chart.html',
                        controller: 'chartCtrl'
                    }
                }
            })
            .state('tabsController.changes', {
                url: '/changes',
                views: {
                    'tab3': {
                        templateUrl: 'templates/changes.html',
                        controller: 'changesCtrl'
                    }
                }
            })
            .state('tabsController.geography', {
                url: '/geography',
                views: {
                    'tab4': {
                        templateUrl: 'templates/geography.html',
                        controller: 'geographyCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/page1/rates');
    });
