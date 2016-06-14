app.directive("navChart", [ function() {
    var controller = function ($scope, $rootScope, $element, $attrs, NAVDataService, NotificationService) {

        $scope.widgetId = $scope.widgetId === undefined ? 'MAIN_CHART' : $scope.widgetId;

        $scope.portfolios = [];

        $scope.nav = '--';
        $scope.navTime = '--';

        var navUpdateDataType = NotificationService.dataServiceTypes.LATEST_NAV,
            navUpdateChannel, navUpdateListener;

        this.onWidgetLoad = function(){
            $scope.period = $scope.period === undefined ? '5Y' : $scope.period;
            $scope.type = $scope.type === undefined ? 'NAV' : $scope.type;

            NAVDataService.getPortfolios()
                .then(setPortfolios)
                .then(function(){
                    subscribe($scope.portfolioObj);
                });

            setSelectedPeriod();
            setSelectedType();
        };

        $scope.$watch("portfolioObj",
            // This is the change listener, called when the value returned from the above function changes
            function (newValue, oldValue) {
                if(newValue && oldValue && newValue != oldValue){
                    $scope.nav = '--';
                    $scope.navTime = '--';
                    unSubscribe(oldValue);
                    subscribe(newValue)
                }
            }
        );

        var subscribe = function(portfolio){
            navUpdateChannel = NotificationService.subscribe(navUpdateDataType, NAVDataService.getLatestNavParams(portfolio.key));
            getData();
            navUpdateListener = $rootScope.$on(navUpdateChannel, function(event, data){
                NAVDataService.getNavUpdates(portfolio.key, $scope.period, $scope.type, data).then(updateOnNavUpdate);
            });
        };

        var unSubscribe = function(portfolio){
            if(navUpdateListener){
                navUpdateListener();
                NotificationService.unSubscribe(navUpdateChannel, NAVDataService.getLatestNavParams(portfolio.key));
            }
        };

        $scope.changePeriod = function(period){
            $scope.period = period;
            setSelectedPeriod();
            getData();
        };

        $scope.changeType = function(type){
            $scope.type = type;
            setSelectedType();
            getData();
        };

        var setPortfolios = function(portfolioMap){
            for(var portfolio in portfolioMap){
                if(portfolioMap.hasOwnProperty(portfolio)){
                    var account = portfolioMap[portfolio];
                    var obj = {key : portfolio, account : account};
                    if(angular.isUndefined($scope.portfolio)){
                        $scope.portfolioObj = obj;
                    }else{
                        if(portfolio === $scope.portfolio){
                            $scope.portfolioObj = obj;
                        }
                    }
                    $scope.portfolios.push(obj);
                }
            }
            var elem = $element.find("div[rel='chart_container']");
            elem.attr('id', $scope.widgetId + '_container');
            elem.highcharts('StockChart', getChart());
        };

        var setSelectedPeriod = function(){
            $element.find("li[name='period']").removeClass("active");
            $element.find("li#period_" + $scope.period).addClass("active");
        };

        var setSelectedType = function(){
            $element.find("li[name='type']").removeClass("current");
            $element.find("li#type_" + $scope.type).addClass("current");
        };

        var getData = function(){
            showHideMask(true);
            var promise;
            if($scope.type === 'NAV'){
                promise = NAVDataService.getNavData($scope.portfolioObj.key, $scope.period);
            }else if($scope.type === 'PROFIT'){
                promise = NAVDataService.getProfitData($scope.portfolioObj.key, $scope.period);
            }else{
                promise = NAVDataService.getPerformanceData($scope.portfolioObj.key, $scope.period);
            }
            promise.then(updateChartData).catch(showMsgOnError);
        };

        var updateChartData = function(data){
            var chart = getChartContainer().highcharts();
            var series = chart.get('s_0');
            series.update({
                data : data,
                name : $scope.portfolioObj.key
            });
            if($scope.nav === '--'){
                $scope.nav = Highcharts.numberFormat(data[data.length - 1].tv, 2, ",", ".");
                $scope.navTime = Highcharts.dateFormat('%m.%d %H:%M', data[data.length - 1].x);
            }
            chart.redraw(false);
            showHideMask(false);
        };

        var showMsgOnError = function(){
            var msg = 'No data available for ' + $scope.portfolioObj.key;
            console.log(msg);
            alert(msg);
            showHideMask(false);
        };

        var updateOnNavUpdate = function(data){
            if(data && data.x){
                $scope.navTime = Highcharts.dateFormat('%m.%d %H:%M', data.x);
                if(data.y && data.tv){
                    $scope.nav = Highcharts.numberFormat(data.tv, 2, ",", ".");
                    var chart = getChartContainer().highcharts();
                    var series = chart.get('s_0');
                    if(series){
                        series.addPoint(data);
                    }
                }
            }
        };

        var getChartContainer = function(){
            return $element.find("div#" + $scope.widgetId + "_container");
        };

        var getChart = function(){
            return {
                chart: {
                    pinchType: ''
                },
                annotationsOptions: {
                    "enabledButtons": false
                },
                credits: {
                    enabled: false
                },
                annotations: [],
                navigator: {
                    enabled: false
                },
                tooltip : {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    borderColor: '#f6ff00',
                    style: {
                        color: '#F0F0F0'
                    },
                    formatter: function () {
                        var dateFormat;
                        switch($scope.period){
                            case '1D':
                            case '1W':
                                dateFormat = '%A, %b %e, %H:%M';
                                break;
                            default:
                                dateFormat = '%A, %b %e, %Y';
                                break;
                        }
                        var s = '<b>' + Highcharts.dateFormat(dateFormat, this.x) + '</b>';

                        $.each(this.points, function () {
                            s += '<br/><span style="color:'+ this.point.series.color +'">\u25CF</span>' + this.series.name + ': ';
                            s += Highcharts.numberFormat(this.point.tv, 2, ",", ".");
                        });

                        return s;
                    }
                },
                rangeSelector: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                },
                title: {
                    text: null
                },
                plotOptions: {
                    series: {
                        dataGrouping: {
                            "enabled": false,
                            "smoothed": true
                        },
                        turboThreshold: 0
                    }
                },
                xAxis: {
                    type: "datetime",
                    dateTimeLabelFormats: {
                        "minute": "%H:%M",
                        "hour": "%H:%M",
                        "day": "%e.%b'%y",
                        "week": "%e.%b'%y",
                        "month": "%b '%y",
                        "year": "%Y"
                    }
                },
                series: [{
                    name : $scope.portfolioObj.key,
                    id : 's_0',
                    type : 'line',
                    data : []
                }]
            };
        };

        var showHideMask = function(show){
            var chartContainer = getChartContainer();
            if(show){
                enableDisablePortfolio(false);
                chartContainer.mask("<div class='circle'></div><div class='circle1'></div>");
            }else{
                enableDisablePortfolio(true);
                chartContainer.unmask();
            }
        };

        var enableDisablePortfolio = function(enable){
            var main = $element.find("select[name='portfolioChooser']");
            if(enable){
                main.prop("disabled", false);
            }else{
                main.prop("disabled", true);
            }
        };

        this.onDestroy = function(){
            getChartContainer().highcharts().destroy();
            unSubscribe($scope.portfolioObj);
            $scope.$destroy();
        };

        this.onResize = function(width, height){
            console.log('resize : qrNavChart');
            var chart = getChartContainer().highcharts();
            chart.setSize(width * .95, height * .8, false);
        }

    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/navChart/navChart.html",
        link : function(scope, element, attrs, ctrl) {
            if(ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }
            element.on('$destroy', function(){
                console.log('destroying qrNavChart....');
                ctrl.onDestroy();
            });
        }
    }
}]);