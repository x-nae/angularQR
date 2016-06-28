app.directive("keyRiskIndicatorsSettings", [function() {

    var controller = function($scope, $rootScope, $element, $attrs, $log, QRDataService) {

        this.onSettingsLoad = function(){
            $log.info('keyRiskIndicatorsSettings => onSettingsLoad ');
            $scope.allColumns = {};
            $scope.displayColumns = [];
            $scope.columns = [];
            $scope.searchColumn = '';
            subscribeToSettingsClose();
            QRDataService.getKeyRiskIndicatorFields('').then(function(data){
                $scope.allColumns = data;
            }).catch(function(response){
                $log.error('error in QRDataService.getKeyRiskIndicatorFields ' + response);
                $scope.allColumns = {
                    "f1": {
                        "desc" : "Field 1",
                        "type" : "number"
                    },
                    "f2": {
                        "desc" : "Field 2",
                        "type" : "double"
                    },
                    "f3": {
                        "desc" : "Field 3",
                        "type" : "double"
                    }
                };//fallback
            }).finally(function(){
                $.each($scope.allColumns, function(field, fieldDesc){
                    $scope.columns.push(field);
                });
                loadSettings();
            });
        };

        this.onDestroy = function(){
            $log.info('keyRiskIndicatorsSettings => onDestroy ');
            unSubscribeFromSettingsClose();
            $scope.$destroy();
        };

        $scope.onSelectChange = function(column){
            $log.info('keyRiskIndicatorsSettings => onSelectChange : ' + column);
            var index = $scope.displayColumns.indexOf(column);
            if(index=== -1){
                $scope.displayColumns.push(column);
            }else{
                $scope.displayColumns.splice(index, 1);
            }
        };

        $scope.onSearch = function(){
            $log.info('keyRiskIndicatorsSettings => onSearch : ' + $scope.searchColumn);
            var resultColumns = [];
            if($scope.searchColumn.trim().length === 0){
                angular.forEach($scope.allColumns, function(value, index){
                    resultColumns.push(index);
                });
            }else{
                var regex = new RegExp("\\b" + $scope.searchColumn.toUpperCase(), "gi");
                angular.forEach($scope.allColumns, function(value, index){
                    if(value.desc.toUpperCase().match(regex) !== null){
                        resultColumns.push(index);
                    }
                });
            }
            $scope.columns = resultColumns;
        };

        var settingsListener;

        var subscribeToSettingsClose = function() {
            settingsListener = $rootScope.$on($scope.widgetId + "-SettingsClose", function(event, data){
                $log.info('keyRiskIndicatorsSettings => onClose ');
                $rootScope.$emit($scope.widgetId + "-Settings", $scope.displayColumns);
                saveSettings();
            });
        };

        var unSubscribeFromSettingsClose = function(){
            if (settingsListener) {
                settingsListener();
            }
        };

        var saveSettings = function () {
            if($ && $.portal){
                $.portal.storage.service.saveWidgetConfig($scope, $scope.widgetId, {columns: $scope.displayColumns}, function () {
                    $log.info('keyRiskIndicatorsSettings => settings saved successfully');
                }, function (data) {
                    $log.error('keyRiskIndicatorsSettings => error on settings save :' + data);
                });
            }
        };

        var loadSettings = function () {
            if($ && $.portal) {
                $.portal.storage.service.getWidgetConfig($scope, $scope.widgetId, function (data) {
                    if (data && data.length > 0 && data[0].config && data[0].config.columns) {
                        var config = data[0].config;
                        $log.debug('keyRiskIndicatorsSettings => load settings :' + config);
                        $scope.displayColumns = config.columns;
                        $rootScope.$emit($scope.widgetId + "-Settings", $scope.displayColumns);
                    }else{
                        $scope.displayColumns = $scope.columns.slice();
                        $rootScope.$emit($scope.widgetId + "-Settings", $scope.displayColumns);
                    }
                }, function (data) {
                    $log.error('keyRiskIndicatorsSettings => error on load settings :' + data);
                    $scope.displayColumns = $scope.columns.slice();
                    $rootScope.$emit($scope.widgetId + "-Settings", $scope.displayColumns);
                });
            }
        };

    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widgetset",
        "templateUrl" : "app/components/keyRiskIndicators/settings/settings.html",
        link : function(scope, element, attrs, ctrl) {

            if(ctrl.onSettingsLoad){
                ctrl.onSettingsLoad();
            }

            element.on('$destroy', function () {
                ctrl.onDestroy();
            });
        }
    }
}]);
