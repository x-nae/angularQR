app.directive("keyRiskIndicatorsSettings", [function() {

    var controller = function($scope, $rootScope, $element, $attrs, $log, QRDataService) {

        $scope.additionalColumnDesc = {
            'mom' : ' Delta Month',
            'yoy' : ' Delta 12M',
            '12ma' : ' 12M Average'
        };

        /**
         * on settings load
         * subscribe to popup close event to update changes to widget
         * get all fields
         * load saved settings
         */
        this.onSettingsLoad = function(){
            $log.info('keyRiskIndicatorsSettings => onSettingsLoad ');
            $scope.allColumns = [];
            $scope.columns = [];
            $scope.searchColumn = '';
            subscribeToSettingsClose();
            QRDataService.getKeyRiskIndicatorFields().then(function(data){
                $scope.allColumns = data;
            }).catch(function(response){
                $log.error('error in QRDataService.getKeyRiskIndicatorFields ' + response);
            }).finally(function(){
                $.each($scope.allColumns, function(field, fieldData){
                    $scope.columns.push(fieldData);
                });
                loadSettings();
            });
        };

        /**
         * on destroy
         * unSubscribe from popup close event
         */
        this.onDestroy = function(){
            $log.info('keyRiskIndicatorsSettings => onDestroy ');
            unSubscribeFromSettingsClose();
            $scope.$destroy();
        };

        /**
         * search fields using search txt
         * only matches to description
         */
        $scope.onSearch = function(){
            $log.info('keyRiskIndicatorsSettings => onSearch : ' + $scope.searchColumn);
            var resultColumns = [];
            if($scope.searchColumn.trim().length === 0){
                angular.forEach($scope.allColumns, function(value, index){
                    resultColumns.push(value);
                });
            }else{
                var regex = new RegExp("\\b" + $scope.searchColumn.toUpperCase(), "gi");
                angular.forEach($scope.allColumns, function(value, index){
                    if(value.desc.toUpperCase().match(regex) !== null){
                        resultColumns.push(value);
                    }
                });
            }
            $scope.columns = resultColumns;
        };

        var settingsListener;

        /**
         * create listener
         */
        var subscribeToSettingsClose = function() {
            settingsListener = $rootScope.$on($scope.widgetId + "-SettingsClose", function(event, data){
                $log.info('keyRiskIndicatorsSettings => onClose ');
                sendData();
                saveSettings();
            });
        };

        /**
         * destroy listener
         */
        var unSubscribeFromSettingsClose = function(){
            if (settingsListener) {
                settingsListener();
            }
        };

        /**
         * save config to DB
         */
        var saveSettings = function () {
            if($ && $.portal){
                $.portal.storage.service.saveWidgetConfig($scope, $scope.widgetId, {columns: $scope.displayColumns}, function () {
                    $log.info('keyRiskIndicatorsSettings => settings saved successfully');
                }, function (data) {
                    $log.error('keyRiskIndicatorsSettings => error on settings save :' + data);
                });
            }
        };

        /**
         * load saved config from DB
         */
        var loadSettings = function () {
            if($ && $.portal) {
                $.portal.storage.service.getWidgetConfig($scope, $scope.widgetId, function (data) {
                    if (data && data.length > 0 && data[0].config && data[0].config.columns) {
                        var config = data[0].config;
                        $log.debug('keyRiskIndicatorsSettings => load settings :' + config);
                        setDisplayProperties(config.columns);
                        sendData();
                    }else{
                        setDisplayProperties();
                        sendData();
                    }
                }, function (data) {
                    $log.error('keyRiskIndicatorsSettings => error on load settings :' + data);
                    setDisplayProperties();
                    sendData();
                });
            }
        };

        /**
         * notify key risk indicator widget of column changes
         */
        var sendData = function(){
            var dis = [];
            angular.forEach($scope.allColumns, function(value, index){
                if(value.show){
                    dis.push({"id" : value.id, "type" : value.type, "name" : value.name, "desc" : value.desc});
                }
                if(value.showMOM){
                    dis.push({"id" : value.id + '_mom', "type" : value.type, "name" : value.name, "desc" : value.desc + $scope.additionalColumnDesc['mom']});
                }
                if(value.showYOY){
                    dis.push({"id" : value.id + '_yoy', "type" : value.type, "name" : value.name, "desc" : value.desc + $scope.additionalColumnDesc['yoy']});
                }
                if(value.show12MA){
                    dis.push({"id" : value.id + '_12ma', "type" : 'double', "name" : value.name, "desc" : value.desc + $scope.additionalColumnDesc['12ma']});
                }
            });
            $rootScope.$emit($scope.widgetId + "-Settings", dis);
        };

        /**
         * set check box checked using the saved settings
         * @param columns saved settings
         */
        var setDisplayProperties = function(columns){
            if(angular.isUndefined(columns) || columns.length === 0){
                angular.forEach($scope.allColumns, function(value, index){
                    value.show = true;
                    value.showMOM = true;
                    value.showYOY = true;
                    value.show12MA = true;
                });
            }else{
                angular.forEach($scope.allColumns, function(value, index){
                    value.show = columns.indexOf(value.id) > -1;
                    value.showMOM = columns.indexOf(value.id + '_mom') > -1;
                    value.showYOY = columns.indexOf(value.id + '_yoy') > -1;
                    value.show12MA = columns.indexOf(value.id + '_12ma') > -1;
                });
            }
        }

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
