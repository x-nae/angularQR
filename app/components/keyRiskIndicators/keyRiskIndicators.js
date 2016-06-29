app.directive("keyRiskIndicators", [function () {

    var controller = function ($scope, $rootScope, $element, $attrs, $log, QRDataService) {

        $scope.selectedFields = [];//fallback
        $scope.data = [];

        this.onWidgetLoad = function(){
            if(angular.isUndefined($scope.filter)){
                $scope.filter = '';
            }
            subscribeToSettings();
            QRDataService.getKeyRiskIndicatorData($scope.filter).then(function(data){
                if($scope.selectedFields.length === 0){
                    for(var field in data.meta.fields){
                        if(data.meta.fields.hasOwnProperty(field)){
                            var obj = data.meta.fields[field];
                            obj.key = field;
                            $scope.selectedFields.push(obj);
                        }
                    }
                }
                processData(data);
            });
        };

        this.onDestroy = function(){
            unSubscribeFromSettings();
        };

        var getDataCount = function(data){
            var hasOwn = Object.prototype.hasOwnProperty;
            var count = 0;
            for (var k in data) if (hasOwn.call(data, k)) ++count;
            return count;
        };

        var processData = function (data) {
            var processedData = [], dataLength = getDataCount(data.meta.dates), i = 0, annualData = {}, cumulativeData = {};
            for(i; i < dataLength; i++){
                var date = 't' + i;
                if(data.data.hasOwnProperty(date)){
                    var dataObj = {key : i, desc : data.meta.dates[date]};
                    var fieldData = data.data[date];
                    for(var field in fieldData){
                        if(fieldData.hasOwnProperty(field)){
                            dataObj[field] = fieldData[field];
                            if(angular.isUndefined(annualData[field])){//only on t0
                                annualData[field] = [];
                                annualData[field][0] = fieldData[field];
                                cumulativeData[field] = fieldData[field];
                                dataObj[field + "_mom"] = 0;
                                dataObj[field + "_12ma"] = fieldData[field];
                                dataObj[field + "_yoy"] = 0;
                            }else{
                                if(annualData[field].length === 12){
                                    cumulativeData[field] += (fieldData[field] - annualData[field][(i) % 12]);
                                    dataObj[field + "_mom"] = fieldData[field] - annualData[field][(i - 1) % 12];
                                    dataObj[field + "_12ma"] = cumulativeData[field]/12;
                                    dataObj[field + "_yoy"] = fieldData[field] - cumulativeData[field]/12;
                                    annualData[field][i%12] = fieldData[field];
                                }else{
                                    annualData[field][i] = fieldData[field];
                                    cumulativeData[field] += fieldData[field];
                                    dataObj[field + "_mom"] = fieldData[field] - annualData[field][i - 1];
                                    dataObj[field + "_12ma"] = cumulativeData[field]/i;
                                    dataObj[field + "_yoy"] = fieldData[field] - cumulativeData[field]/i;
                                }
                            }
                        }
                    }
                    processedData.push(dataObj);
                }else{
                    $log.error('keyRiskIndicators => processData : date key not found for ' + date);
                }
            }
            $scope.data = processedData;
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