// Ionic Starter App

angular.module('app', ['ionic', 'app.controllers', 'app.routes', 
  'app.services', 'app.directives', 'ionic-datepicker', 'app.ratesController', 
  'app.chartDirective'])

.constant('serverUrl','https://quiet-everglades-44500.herokuapp.com/')
//.constant('serverUrl','http://localhost:31333/')

.constant('monthList', ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})