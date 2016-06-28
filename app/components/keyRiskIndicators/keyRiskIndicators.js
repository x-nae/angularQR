app.directive("keyRiskIndicators", [function () {

    var controller = function ($scope, $rootScope, $element, $attrs, $log, QRDataService) {

        $scope.selectedFields = ["f1", "f2"];//fallback
        $scope.meta = {};
        $scope.data = {};

        this.onWidgetLoad = function(){
            if(angular.isUndefined($scope.filter)){
                $scope.filter = '';
            }
            subscribeToSettings();
            QRDataService.getKeyRiskIndicatorData($scope.filter).then(function(data){
                processData(data);
            });
        };

        this.onDestroy = function(){
            unSubscribeFromSettings();
        };

        var processData = function (data) {

            var processedData = {};
            //loop through the fields
            $.each(data.data, function (field, fieldData) {
                processedData[field] = {};
                processedData[field + "_mom"] = {};
                processedData[field + "_12ma"] = {};
                processedData[field + "_yoy"] = {};

                var annualData = [];
                var prevValue;
                var cumilativeFieldData = 0;
                var fmom, f12ma, fyoy;

                $.each(fieldData, function (month, value) {

                    annualData.push(value);

                    if (prevValue) {
                        fmom = value - prevValue;
                    } else {
                        fmom = 0;
                    }
                    prevValue = value;

                    cumilativeFieldData += value;
                    f12ma = cumilativeFieldData / (annualData.length);
                    fyoy = value - f12ma;

                    processedData[field][month] = value;
                    processedData[field + "_mom"][month] = fmom;
                    processedData[field + "_12ma"][month] = f12ma;
                    processedData[field + "_yoy"][month] = fyoy;

                    if (annualData.length == 12) {
                        cumilativeFieldData -= annualData[0];
                        annualData.splice(0, 1);
                    }
                });
            });

            $scope.meta = data.meta;
            $.each($scope.meta.dates, function (date, desc) {
                $scope.data[date] = {};
                $.each($scope.meta.fields, function (field, fieldDesc) {
                    $scope.data[date][field] = processedData[field][date];
                    $scope.data[date][field + "_mom"] = processedData[field + "_mom"][date];
                    $scope.data[date][field + "_12ma"] = processedData[field + "_12ma"][date];
                    $scope.data[date][field + "_yoy"] = processedData[field + "_yoy"][date];
                });
            });
        };

        var settingsListener;

        var subscribeToSettings = function() {
            settingsListener = $rootScope.$on($scope.widgetId + "-Settings", function(event, data){
                $log.debug('keyRiskIndicators => onSettingsListener : data received' );
                $scope.selectedFields = data.slice();
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