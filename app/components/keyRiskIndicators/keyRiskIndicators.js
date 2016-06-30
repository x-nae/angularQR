app.directive("keyRiskIndicators", [function () {

    var controller = function ($scope, $rootScope, $element, $attrs, $log, QRDataService) {

        $scope.selectedFields = [];
        $scope.data = [];

        this.onWidgetLoad = function(){
            if(angular.isUndefined($scope.filter)){
                $scope.filter = '';
            }
            subscribeToSettings();
            QRDataService.getKeyRiskIndicatorData($scope.filter).then(function(data){
                $scope.data = data;
            });
        };

        this.onDestroy = function(){
            unSubscribeFromSettings();
        };

        var settingsListener;

        var subscribeToSettings = function() {
            settingsListener = $rootScope.$on($scope.widgetId + "-Settings", function(event, data){
                $log.debug('keyRiskIndicators => onSettingsListener : data received' );
                $scope.selectedFields = data;
            });
        };

        var unSubscribeFromSettings = function(){
            if (settingsListener) {
                settingsListener();
            }
        };
    };

    return {
        "restrict": "E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/keyRiskIndicators/keyRiskIndicators.html",
        link: function (scope, element, attrs, ctrl) {
            element.on('$destroy', function () {
                scope.$destroy();
            });

            if (ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }
        }
    }
}]);