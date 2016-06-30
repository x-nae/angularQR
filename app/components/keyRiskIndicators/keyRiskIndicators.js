app.directive("keyRiskIndicators", [function () {

    var controller = function ($scope, $rootScope, $element, $attrs, $log, QRDataService) {

        //$scope.columnOrder = [];
        $scope.selectedFields = [];
        $scope.data = [];

        this.onWidgetLoad = function(){
            if(angular.isUndefined($scope.filter)){
                $scope.filter = '';
            }
            subscribeToSettings();
            getData();
        };

        this.onDestroy = function(){
            unSubscribeFromSettings();
        };

        var getData = function(){
            QRDataService.getKeyRiskIndicatorData($scope.filter).then(function(data){
                $scope.data = data;
            });
        };

        $scope.onFilter = function(){
            getData();
        };

        //$scope.changeColumn = function(field, target){
        //    var targetColumn = angular.element(target).attr('drag-rel');
        //    $log.debug('keyRiskIndicators => drag column ' + field + ' to ' + targetColumn);
        //    var srcIndex = $scope.columnOrder.indexOf(field);
        //    var tarIndex = $scope.columnOrder.indexOf(targetColumn);
        //    $scope.columnOrder[tarIndex] = field;
        //    $scope.columnOrder[srcIndex] = targetColumn;
        //};
        //
        //$scope.order = function(field){
        //    return $scope.columnOrder.indexOf(field.id);
        //};

        var settingsListener;

        var subscribeToSettings = function() {
            settingsListener = $rootScope.$on($scope.widgetId + "-Settings", function(event, data){
                $log.debug('keyRiskIndicators => onSettingsListener : data received' );
                //if($scope.columnOrder.length === 0){
                //    angular.forEach(data, function(field, index){
                //        $scope.columnOrder[index] = field.id;
                //    });
                //}else{
                //    angular.forEach(data, function(field, index){
                //        if($scope.columnOrder.indexOf(field.id) === -1){
                //            $scope.columnOrder.push(field.id);
                //        }
                //    });
                //}
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