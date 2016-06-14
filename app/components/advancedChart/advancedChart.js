app.directive("advancedChart", [ function() {
    var controller = function ($scope, $rootScope, $element, $attrs, QRDataService, NotificationService) {

        var chart, dataType = NotificationService.dataServiceTypes.TICK_UPDATES, updateChannel, updateListener;

        $scope.model = $scope.model === undefined ? 'Boeck_xCLQ6_COQ6_70' : $scope.model;
        $scope.widgetId = $scope.widgetId === undefined ? 'MAIN_CHART' : $scope.widgetId;
        $scope.type = $scope.type === undefined ? 'SPREAD' : $scope.type;

        this.onWidgetLoad = function(){
            var elem = $element.find("div[rel='qrDetailChart']"),
                th = $element.find("div[rel='qrAdvChartTh']");
            elem.attr('id', $scope.widgetId + '_container');
            // th.attr('id', $scope.widgetId + '_th');
            createChart($scope.widgetId, $scope.model, $scope.type);
        };

        var createChart = function(id, model, type){
            console.log('qrAdvChart => create ' + id + ' with model : ' + model);
            chart = new QRChart(id, model, type);
            QRDataService.getAdvancedChartHistoryData(model).then(
                function(data){
                    chart.update(data);
                }).finally(subscribe);
        };

        $scope.changeModel = function(model){
            unSubscribe();
            $scope.model = model;
            chart.setModel(model);
            QRDataService.getAdvancedChartHistoryData(model).then(
                function(data){
                    chart.update(data);
                }).finally(subscribe);
        };

        this.onResize = function(width, height) {
            if(chart){
                console.log('qrAdvChart => onResize');
                chart.resize(width, height);
            }else{
                console.debug('qrAdvChart => chart not available');
            }
        };

        var subscribe = function() {
            if($scope.model){
                updateChannel = NotificationService.subscribe(dataType, QRDataService.getTickUpdatesParams($scope.model));
                updateListener = $rootScope.$on(updateChannel, function(event, data){
                    chart.update(data);
                });
            }
        };

        var unSubscribe = function(){
            if (updateListener) {
                updateListener();
            }
            if(updateChannel){
                NotificationService.unSubscribe(updateChannel);
            }
        };

        this.onDestroy = function(){
            unSubscribe();
            chart.destroy();
            $scope.$destroy();
        };

    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/advancedChart/advancedChart.html",
        link : function(scope, element, attrs, ctrl) {
            if(ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }
            //if($ && $.portal) {
            //    $.portal.notifications.manager.subscribe("private", scope.widgetId, scope.widgetChannel, scope.changeModel);
            //}
            element.on('$destroy', function(){
                console.log('qrAdvChart => destroying ....');
                ctrl.onDestroy();
            });
        }
    }
}]);