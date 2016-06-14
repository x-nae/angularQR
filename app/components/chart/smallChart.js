app.directive("chart", [ function() {
    var controller = function ($scope, $rootScope, $element, $attrs, $window, QRDataService, NotificationService) {

        var chart, dataType = NotificationService.dataServiceTypes.TICK_UPDATES, updateChannel, updateListener;

        $scope.widgetId = $scope.widgetId === undefined ? 'MAIN_CHART' : $scope.widgetId;

        this.onWidgetLoad = function(){
            loadSettings();
            $window.addEventListener('beforeunload', function() {
                saveSettings();
            });
        };

        $scope.changeModel = function(model){
            unSubscribe();
            $scope.model = model;
            $('div#' + $scope.widgetId + '_th').text(model);
            chart.setModel(model);
            QRDataService.getChartHistoryData(model).then(
                function(data){
                    chart.update(data);
                }).finally(subscribe);
        };

        this.onResize = function(width, height) {
            console.log('qrSmallChart => onResize');
            if(chart){
                chart.resize(width, height);
            }else{
                console.debug('qrSmallChart => chart not available');
            }
        };

        var initWidget = function(){
            var elem = $($element).find("div[rel='qrSmallChart']"),
                th = $($element).find("div[rel='qrSmallChartTh']");
            elem.attr('id', $scope.widgetId + '_container');
            th.attr('id', $scope.widgetId + '_th');
            $scope.model = $scope.model === undefined ? 'Boeck_xCLQ6_COQ6_70' : $scope.model;
            th.text($scope.model);
            createChart($scope.widgetId, $scope.model);
        };

        var createChart = function(id, model){
            var width = 200, height = 100;//resize() will set the correct size
            console.log('qrSmallChart => create ' + id + ' with model : ' + model);
            chart = new CanvasChart(id, model, width, height);
            QRDataService.getChartHistoryData(model).then(
                function(data){
                    chart.update(data);
                }).finally(subscribe);
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
            if(updateChannel) {
                NotificationService.unSubscribe(updateChannel);
            }
        };

        this.onDestroy = function(){
            unSubscribe();
            chart.destroy();
            saveSettings();
            $scope.$destroy();
        };

        var saveSettings = function () {
            $.portal.storage.service.saveWidgetConfig($scope, $scope.widgetId, {model: $scope.model}, function () {
                console.log('qrSmallChart => settings saved successfully');
            }, function (data) {
                console.log('qrSmallChart => error on settings save :' + data);
            });
        };

        var loadSettings = function () {
            $.portal.storage.service.getWidgetConfig($scope, $scope.widgetId, function (data) {
                if (data && data.length > 0) {
                    var config = data[0].config;
                    var scope = this;
                    console.log('qrSmallChart => load settings : ' + config.model);
                    scope.model = config.model;
                }
                initWidget();
            }, function (data) {
                console.log('qrSmallChart => error on load settings : ' + data);
                initWidget();
            });
        };


    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/chart/smallChart.html",
        link : function(scope, element, attrs, ctrl) {
            if(ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }
            element.on('$destroy', function(){
                console.log('qrSmallChart => destroying....');
                ctrl.onDestroy();
            });
        }
    }
}]);
