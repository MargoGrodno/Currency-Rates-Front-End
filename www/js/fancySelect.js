angular.module('fancySelect', ['ionic'])
    .directive('fancySelect', ['$ionicModal', function($ionicModal) {        
        return {
            restrict: 'E',
            template: '<div class="item item-input selectBlock currency" ng-click="showItems($event);">'+
                '{{text}} </div>',

            scope: {
                'list': '=',
                'callback': '='
            },

            link: function(scope, element, attrs) {
                scope.items = [];
                scope.multiSelect = attrs.multiSelect === 'true' ? true : false;
                scope.allowEmpty = attrs.allowEmpty === 'false' ? false : true;
                scope.headerText = attrs.headerText || '';
                scope.text = attrs.text || '';
                scope.defaultText = scope.text || '';
                scope.value = [];
                // scope.callback = attrs.callback || null;
                scope.modal = $ionicModal.fromTemplate(fancySelectItemsStr, { 'scope': scope });

                scope.$watch('list', function (newValue, oldValue) {
                    for (var i = 0; i < scope.list.length; i++) {
                        scope.items.push({text: scope.list[i], checked: false});
                        if(scope.list[i] == 'USD'){
                            scope.items[i].checked = true;
                        }
                    };
                })

                scope.validate = function(event) {
                    if (scope.multiSelect == true) {
                        scope.value = [];
                        scope.text = '';

                        for (var i = 0; i < scope.items.length; i++) {
                            if (scope.items[i].checked) {
                                scope.value.push(scope.items[i].text);
                                scope.text = scope.text + scope.items[i].text + ', ';
                            }
                        };

                        // Remove trailing comma
                        scope.text = scope.text.substr(0, scope.text.length - 2);
                    }
                    
                    // Select first value if not nullable
                    if (scope.value.langth == 0 || typeof scope.value == 'undefined' || scope.value == '' || scope.value == null) {
                        if (scope.allowEmpty == false) {
                            scope.value.push(scope.items[0].text);
                            scope.text = scope.items[0].text;

                            // Check for multi select
                            scope.items[0].checked = true;
                        } else {
                            scope.text = scope.defaultText;
                        }
                    }
                    
                    scope.hideItems();

                    if (typeof scope.callback == 'function') {
                        scope.callback(scope.value);                    
                    }
                }

                scope.showItems = function(event) {
                    event.preventDefault();
                    scope.modal.show();
                }

                scope.hideItems = function() {
                    scope.modal.hide();
                }

            }
        };
    }]);


 var fancySelectItemsStr = '<ion-modal-view class="fancy-select-items modal">'+
                '<ion-header-bar class="bar-positive">'+
                    '<button ng-click="hideItems()" class="button button-positive button-icon ion-ios7-arrow-back"></button>'+
                    '<h1 class="title">{{headerText}}</h1>'+
                    '<button ng-click="validate()" class="button button-positive button-icon ion-checkmark"></button>'+
                '</ion-header-bar>'+
                '<ion-content>'+
                    '<div class="list">'+
                        '<ion-toggle ng-repeat="item in items" ng-if="multiSelect" ng-checked="item.checked" ng-model="item.checked" class="item item-text-wrap">'+
                            '{{item.text}}'+
                        '</ion-toggle>'+
                    '</div>'+
                '</ion-content>'+
            '</ion-modal-view>'