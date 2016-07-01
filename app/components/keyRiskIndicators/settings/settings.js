app.directive("keyRiskIndicatorsSettings", [function() {

    var controller = function($scope, $rootScope, $element, $attrs, $log, QRDataService) {

        $scope.additionalColumnDesc = {
            'mom' : ' Delta Month',
            'momChg' : ' Delta Month Chg%',
            'yoy' : ' Delta 12M',
            'yoyChg' : ' Delta 12M Chg%',
            '12ma' : ' 12M Average'
        };

        $scope.changeAll = false;
        $scope.changeAllMOM = false;
        $scope.changeAllMOMChg = false;
        $scope.changeAllYOY = false;
        $scope.changeAllYOYChg = false;
        $scope.changeAll12MA = false;

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

        $scope.changeAllColumns = function(columnType){
            switch (columnType){
                case 'mom':
                    angular.forEach($scope.allColumns, function(value, index){
                        value.showMOM = $scope.changeAllMOM;
                    });
                    break;
                case 'momChg':
                    angular.forEach($scope.allColumns, function(value, index){
                        value.showMOMChg = $scope.changeAllMOMChg;
                    });
                    break;
                case 'yoy':
                    angular.forEach($scope.allColumns, function(value, index){
                        value.showYOY = $scope.changeAllYOY;
                    });
                    break;
                case 'yoyChg':
                    angular.forEach($scope.allColumns, function(value, index){
                        value.showYOYChg = $scope.changeAllYOYChg;
                    });
                    break;
                case '12ma':
                    angular.forEach($scope.allColumns, function(value, index){
                        value.show12MA = $scope.changeAll12MA;
                    });
                    break;
                default :
                    angular.forEach($scope.allColumns, function(value, index){
                        value.show = $scope.changeAll;
                    });
                    break;
            }
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
                $.portal.storage.service.saveWidgetConfig($scope, $scope.widgetId, {columns: getVisibleColumnsToSave()}, function () {
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
         * get data to notify widget
         * @returns {Array}
         */
        var getDataToNotify = function(){
            var dis = [];
            angular.forEach($scope.allColumns, function(value, index){
                if(value.show){
                    dis.push({"id" : value.id, "type" : value.type, "name" : value.name, "desc" : value.desc});
                }
                if(value.showMOM){
                    dis.push({"id" : value.id + '_mom', "type" : value.type, "name" : value.name + ' \u0394 M', "desc" : value.desc + $scope.additionalColumnDesc['mom']});
                }
                if(value.showMOMChg){
                    dis.push({"id" : value.id + '_momChg', "type" : "percentageBar", "name" : value.name + ' \u0394 M%', "desc" : value.desc + $scope.additionalColumnDesc['momChg']});
                }
                if(value.showYOY){
                    dis.push({"id" : value.id + '_yoy', "type" : value.type, "name" : value.name + ' \u0394 Y', "desc" : value.desc + $scope.additionalColumnDesc['yoy']});
                }
                if(value.showYOYChg){
                    dis.push({"id" : value.id + '_yoyChg', "type" : "percentageBar", "name" : value.name + ' \u0394 Y%', "desc" : value.desc + $scope.additionalColumnDesc['yoyChg']});
                }
                if(value.show12MA){
                    dis.push({"id" : value.id + '_12ma', "type" : 'double', "name" : value.name + ' 12M Avg', "desc" : value.desc + $scope.additionalColumnDesc['12ma']});
                }
            });
            return dis;
        };

        /**
         * get data to save to DB
         * @returns {Array}
         */
        var getVisibleColumnsToSave = function(){
            var dis = [];
            angular.forEach($scope.allColumns, function(value, index){
                if(value.show){
                    dis.push(value.id);
                }
                if(value.showMOM){
                    dis.push(value.id + '_mom');
                }
                if(value.showMOMChg){
                    dis.push(value.id + '_momChg');
                }
                if(value.showYOY){
                    dis.push(value.id + '_yoy');
                }
                if(value.showYOYChg){
                    dis.push(value.id + '_yoyChg');
                }
                if(value.show12MA){
                    dis.push(value.id + '_12ma');
                }
            });
            return dis;
        };

        /**
         * notify key risk indicator widget of column changes
         */
        var sendData = function(){
            var dis = getDataToNotify();
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
                    value.showMOMChg = true;
                    value.showYOY = true;
                    value.showYOYChg = true;
                    value.show12MA = true;
                });
                $scope.changeAll = true;
                $scope.changeAllMOM = true;
                $scope.changeAllMOMChg = true;
                $scope.changeAllYOY = true;
                $scope.changeAllYOYChg = true;
                $scope.changeAll12MA = true;
            }else{
                angular.forEach($scope.allColumns, function(value, index){
                    value.show = columns.indexOf(value.id) > -1;
                    value.showMOM = columns.indexOf(value.id + '_mom') > -1;
                    value.showMOMChg = columns.indexOf(value.id + '_momChg') > -1;
                    value.showYOY = columns.indexOf(value.id + '_yoy') > -1;
                    value.showYOYChg = columns.indexOf(value.id + '_yoyChg') > -1;
                    value.show12MA = columns.indexOf(value.id + '_12ma') > -1;
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
