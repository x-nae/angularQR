app.directive("portfolio", [ function() {
    var controller = function ($scope, $rootScope, $element, $attrs, $log, NAVDataService, TradeService, NotificationService) {

        $scope.portfolios = [];

        $scope.positions = [];

        var portfolioDataType = NotificationService.dataServiceTypes.HOLDINGS,
            navUpdateDataType = NotificationService.dataServiceTypes.LATEST_NAV,
            portfolioUpdateChannel, navUpdateChannel,
            portfolioUpdateListener, navUpdateListener;

        this.onWidgetLoad = function () {
            $log.info('qrPortfolio => onWidgetLoad Triggered');
            if(angular.isUndefined($scope.widgetId)){
                $scope.widgetId = 'qrAccountSummary';
            }
            if(angular.isUndefined($scope.portfolio)){
                $scope.portfolio = 'Morsch';
            }
            if(angular.isUndefined($scope.benchmark)){
                $scope.benchmark = 'TITTEL';
            }
            if(angular.isUndefined($scope.type)){
                $scope.type = 'Summary';
            }
            if(angular.isUndefined($scope.chartType)){
                $scope.chartType = 'Performance';
            }
            if(angular.isUndefined($scope.chartPeriod)){
                $scope.chartPeriod = 'ALL';
            }
            initWidget();
        };

        this.onResize = function(width, height){
            $log.debug('qrPortfolio resizing => width : ' + width + ", height : " + height);
            getChartContainer().highcharts().setSize(width, height - 250, false);
        };

        this.onDestroy = function(){
            $log.info('qrPortfolio => destroying..');
            getChartContainer().highcharts().destroy();
            unSubscribe();
        };

        $scope.changeType = function(type){
            $scope.type = type;
            setSelectedType();
        };

        $scope.changeChartType = function(chartType){
            $scope.chartType = chartType;
            setSelectedChartType(chartType);
            getChartData();
        };

        $scope.changeChartPeriod = function(period){
            $scope.chartPeriod = period;
            setSelectedChartPeriod();
            getChartData();
        };

        var initWidget = function(){
            TradeService.getTradeAccounts()
                .then(setPortfolios)
                .then(function () {
                    subscribe($scope.portfolioObj);
                });

            var cElem = $($element).find("div[rel='chart']"), tElem = $($element).find("div[rel='table']");
            cElem.attr('id', $scope.widgetId + '_chart');
            tElem.attr('id', $scope.widgetId + '_table');
            cElem.find("div#chart_container").highcharts('StockChart', getChart());

            setSelectedType();
            setSelectedChartType();
            setSelectedChartPeriod();
        };

        var setPortfolios = function(portfolios){
            for(var portfolio in portfolios){
                if(portfolios.hasOwnProperty(portfolio)){
                    var account = portfolios[portfolio], obj = {key : portfolio, account : account};
                    if(portfolio !== $scope.benchmark){
                        if(portfolio === $scope.portfolio){
                            $scope.portfolioObj = obj;
                        }
                        $scope.portfolios.push(obj);
                    }else{
                        $scope.benchmarkObj = obj;
                    }
                }
            }
        };

        var setSelectedType = function(){
            $element.find("li[name='type']").removeClass("current");
            $element.find("li#type_" + $scope.type).addClass("current");
            var chart = $element.find('div#' + $scope.widgetId + '_chart'),
                table = $element.find('div#' + $scope.widgetId + '_table');
            if($scope.type === 'Summary'){
                chart.show();
                table.hide();
            }else{
                chart.hide();
                table.show();
            }
        };

        var setSelectedChartType = function(){
            $element.find("li[name='chartType']").removeClass("current");
            $element.find("li#chartType_" + $scope.chartType).addClass("current");
        };

        var setSelectedChartPeriod = function(){
            $element.find("li[name='chartPeriod']").removeClass("active");
            $element.find("li#chartPeriod_" + $scope.chartPeriod).addClass("active");
        };

        $scope.$watch("portfolioObj",
            // This is the change listener, called when the value returned from the above function changes
            function (newValue, oldValue) {
                if(newValue && newValue != oldValue){
                    unSubscribe();
                    subscribe(newValue);
                }
            }
        );

        var subscribe = function(portfolio) {
            if(portfolio){
                showHideMask(true);
                initScopeDataOnPortfolioChange();
                getRatioData(portfolio.key);
                portfolioUpdateChannel = NotificationService.subscribe(portfolioDataType, TradeService.getPortfolioParams(portfolio.account));
                navUpdateChannel = NotificationService.subscribe(navUpdateDataType, NAVDataService.getLatestNavParams(portfolio.key));
                portfolioUpdateListener = $rootScope.$on(portfolioUpdateChannel, function(event, data){
                    updateOnPortfolioUpdate(data);
                });
                navUpdateListener = $rootScope.$on(navUpdateChannel, function(event, data){
                    updateOnNavUpdate(data);
                });
            }
        };

        var initScopeDataOnPortfolioChange = function(){
            $scope.positions = [];
            $scope.portfolioData = {
                nav : '--',
                unrealizedProfit : '--',
                mtdPerformance : '--',
                ytdPerformance : '--',
                oneYrPerformance : '--',
                twoYrPerformance : '--',
                sharpe : '--',
                volatility : '--',
                treynor : '--'
            };
            $scope.benchmarkData = {
                mtdPerformance : '--',
                ytdPerformance : '--',
                oneYrPerformance : '--',
                twoYrPerformance : '--',
                sharpe : '--',
                volatility : '--'
            };
            $scope.nav = '--';
            $scope.navTime = '--';
            $scope.unrealizedProfit = '--';
        };

        var getRatioData = function(portfolio){
            NAVDataService.getRatios(portfolio, $scope.benchmarkObj.key)
                .then(function(data){
                    updateRatiosOnSuccess(data);
                    getChartData();
                }
            );
        };

        var updateRatiosOnSuccess = function(data){
            if(data){
                if(data[$scope.benchmarkObj.key]){
                    var benchmarkData = data[$scope.benchmarkObj.key];
                    $scope.benchmarkData.mtdPerformance = benchmarkData.mtdPerformance;
                    $scope.benchmarkData.ytdPerformance = benchmarkData.ytdPerformance;
                    $scope.benchmarkData.oneYrPerformance = benchmarkData.oneYrPerformance;
                    $scope.benchmarkData.twoYrPerformance = benchmarkData.twoYrPerformance;
                    $scope.benchmarkData.sharpe = benchmarkData.sharpe;
                    $scope.benchmarkData.volatility = benchmarkData.volatility;

                    setSpanColor(benchmarkData.mtdPerformance, 'qrPortfolio_mtdb');
                    setSpanColor(benchmarkData.ytdPerformance, 'qrPortfolio_ytdb');
                    setSpanColor(benchmarkData.oneYrPerformance, 'qrPortfolio_oyb');
                    setSpanColor(benchmarkData.twoYrPerformance, 'qrPortfolio_tyb');
                }
                if(data[$scope.portfolioObj.key]){
                    var portfolioData = data[$scope.portfolioObj.key];
                    $scope.portfolioData.mtdPerformance = portfolioData.mtdPerformance;
                    $scope.portfolioData.ytdPerformance = portfolioData.ytdPerformance;
                    $scope.portfolioData.oneYrPerformance = portfolioData.oneYrPerformance;
                    $scope.portfolioData.twoYrPerformance = portfolioData.twoYrPerformance;
                    $scope.portfolioData.sharpe = portfolioData.sharpe;
                    $scope.portfolioData.treynor = portfolioData.treynor;
                    $scope.portfolioData.volatility = portfolioData.volatility;

                    setSpanColor(portfolioData.mtdPerformance, 'qrPortfolio_mtdp');
                    setSpanColor(portfolioData.ytdPerformance, 'qrPortfolio_ytdp');
                    setSpanColor(portfolioData.oneYrPerformance, 'qrPortfolio_oyp');
                    setSpanColor(portfolioData.twoYrPerformance, 'qrPortfolio_typ');
                }
            }
        };

        var updateRatiosOnError = function(portfolio){
            var msg = 'No data available for ' + portfolio;
            //todo : show msg
            $log.error(msg);
        };

        var setSpanColor = function(number, spanId){
            var span = $element.find('span#' + spanId);
            if(number > 0){
                span.removeClass('TX-RED');
                span.removeClass('TX-GREEN');
                span.addClass('TX-GREEN');
            }else{
                span.removeClass('TX-RED');
                span.removeClass('TX-GREEN');
                span.addClass('TX-RED');
            }
        };

        var formatNumbers = function(number, decimalPoints){
            return Highcharts.numberFormat(number, decimalPoints, ",", ".");
        };

        var getChartData = function(){
            updateMainSeries($scope.chartType !== 'Spread');
            updateCompareSeries();
            if($scope.chartType === 'Spread'){
                NAVDataService.getSpread($scope.portfolioObj.key, [$scope.benchmarkObj.key], $scope.chartPeriod).then(
                    function(data){
                        updateChartData(data);
                        showHideMask(false);
                    }
                );
            }else{
                NAVDataService.getNAV($scope.portfolioObj.key, [$scope.benchmarkObj.key], $scope.chartPeriod).then(
                    function(data){
                        updateChartData(data);
                        showHideMask(false);
                    }
                );
            }
        };

        var updateOnPortfolioUpdate = function(data){
            $scope.positions = [];
            var unrealizedProfit = 0;
            angular.forEach(data, function(value, index) {
                unrealizedProfit += value.unrealizedPNL;
                $scope.positions.push({
                    name : value.contract.name,
                    position : value.position,
                    unrealizedPNL : value.unrealizedPNL,
                    marketPrice : value.marketPrice,
                    averageCost : value.averageCost
                });
            });
            $scope.unrealizedProfit = unrealizedProfit;
        };

        var unSubscribe = function(){
            if(portfolioUpdateListener){
                portfolioUpdateListener();
            }
            if(portfolioUpdateChannel){
                NotificationService.unSubscribe(portfolioUpdateChannel);
            }

            if(navUpdateListener){
                navUpdateListener();
            }
            if(navUpdateChannel){
                NotificationService.unSubscribe(navUpdateChannel);
            }
        };

        var updateOnNavUpdate = function(data){
            if(data && data.length > 0){
                $log.debug('qrPortfolio => Nav : ' + data);
                $scope.nav = data[1];
                $scope.navTime = Highcharts.dateFormat('%m.%d %H:%M', data[0]);
            }
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
                legend: {
                    enabled: true,
                    align: 'center',
                    verticalAlign: 'bottom',
                    layout: 'horizontal',
                    itemStyle: {
                        color: '#E0E0E3'
                    },
                    itemHoverStyle: {
                        color: '#FFF'
                    },
                    itemHiddenStyle: {
                        color: '#606063'
                    }
                },
                tooltip : {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    borderColor: '#f6ff00',
                    style: {
                        color: '#F0F0F0'
                    },
                    formatter: function () {
                        var s = '<b>' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</b>';

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
                    name : $scope.portfolio,
                    id : 'portfolio',
                    type : 'line',
                    data : []
                },{
                    name : $scope.benchmark,
                    id : 'benchmark',
                    type : 'line',
                    data : []
                }]
            };
        };

        var getChartContainer = function(){
            return $element.find("div#" + $scope.widgetId + "_chart").find('div#chart_container');
        };

        var updateChartData = function(data){
            var chart = getChartContainer().highcharts();
            for (var portfolio in data) {
                if (data.hasOwnProperty(portfolio)){
                    var series;
                    if(portfolio === $scope.portfolioObj.key){
                        series = chart.get('portfolio');
                    }else if(portfolio === $scope.benchmarkObj.key){
                        series = chart.get('benchmark');
                    }else{
                        console.log(portfolio + ' not valid..');
                    }
                    if(series){
                        series.setData(data[portfolio], false);
                    }
                }
            }
            chart.redraw(false);
            showHideMask(false);
        };

        var showMsgOnError = function(portfolio){
            showHideMask(false);
            updateRatiosOnError(portfolio);
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
            var main = $element.find("select[name='mainPortfolioChooser']");
            if(enable){
                main.prop("disabled", false);
            }else{
                main.prop("disabled", true);
            }
        };

        var updateCompareSeries = function(){
            var chart = getChartContainer().highcharts();
            var series = chart.get('benchmark');
            if('undefined' === typeof series || series === null) {
                chart.addSeries({
                    id: 'benchmark',
                    name: $scope.benchmarkObj.key,
                    data: [],
                    type: 'line',
                    color: '#f45b5b',
                    lineColor: '#f45b5b',
                    tooltip: {
                        valueDecimals: 2
                    }
                }, false);
            }else{
                series.update({name: $scope.benchmarkObj.key, color: '#f45b5b', lineColor: '#f45b5b', data : []}, false);
            }
        };

        var updateMainSeries = function(show){
            var chart = getChartContainer().highcharts();
            var series = chart.get('portfolio');
            if(show){
                if('undefined' === typeof series || series === null){
                    chart.addSeries({
                        id: 'portfolio',
                        name: $scope.portfolioObj.key,
                        data: [],
                        type: 'line',
                        color: '#2d81a1',
                        lineColor: '#2d81a1',
                        tooltip: {
                            valueDecimals: 2
                        }
                    }, false);
                }else{
                    series.setVisible(true, false);
                    series.update({name: $scope.portfolioObj.key, color: '#2d81a1', lineColor: '#2d81a1', data : []}, false);
                }
            }else{
                if(series) {
                    series.remove(false);
                }
            }
        };

    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/portfolio/portfolio.html",
        link : function(scope, element, attrs, ctrl) {
            if(ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }

            // When the DOM element is removed from the page,
            // AngularJS will trigger the $destroy event on
            // the scope. This gives us a chance to cancel any
            // pending timer that we may have.
            element.on('$destroy', function(){
                console.log('destroying qrPortfolio....');
                ctrl.onDestroy();
            });

        }
    }
}]);