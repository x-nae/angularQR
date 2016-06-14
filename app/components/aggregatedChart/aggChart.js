app.directive("aggregatedChart", [function() {
    var controller = function ($scope, $rootScope, $element, $attrs ,$timeout, NAVDataService) {

        var colors = [
                '#f45b5b', '#f6ff00', '#00ffb0', '#ff00de', '#ff2237', '#00b4ff', '#FFD922', '#E7FC22',
                '#90F120','#1BBCC3','#324ECF','#9125CD','#EA206E','#FF5E22','#1DB6C4','#FF9353',
                '#1321CF','#00CD7A','#FF1800','#984B85','#ACC461','#3E249A','#0B8D0B','#FFB000',
                '#D00076', '#08D165'];

        $scope.widgetId = $scope.widgetId === undefined ? 'MAIN_CHART' : $scope.widgetId;


        this.onWidgetLoad = function(){
            NAVDataService.getPortfolios()
                .then(setPortfolios)
                .then(getData);

            $scope.compareType = 'All';
            $scope.period = $scope.period === undefined ? '1M' : $scope.period;
            $scope.type = $scope.type === undefined ? 'Performance' : $scope.type;

            var elem = $element.find("div[rel='chart_container']");
            elem.attr('id', $scope.widgetId + '_container');
            elem.highcharts('StockChart', getChart());

            setSelectedPeriod();
            setSelectedType();
            //setSelectedCompareType();
        };

        var setPortfolios = function(portfolios){
            $scope.portfolios = [];
            for(var portfolio in portfolios){
                if(portfolios.hasOwnProperty(portfolio)){
                    var obj = {key : portfolio, content : portfolio};
                    if(angular.isUndefined($scope.portfolio)){
                        if(angular.isUndefined($scope.mainPortfolio)){
                            $scope.mainPortfolio = obj;
                        }
                    }else{
                        if(portfolio === $scope.portfolio){
                            $scope.mainPortfolio = obj;
                        }
                    }
                    $scope.portfolios.push(obj);
                }
            }
            $scope.pMainPortfolio = $scope.mainPortfolio.key;
            $scope.comparePortfolio = [];
            if(angular.isUndefined($scope.compare)){
                $.each($scope.portfolios, function(i, portfolio){
                    if(portfolio.key !== $scope.mainPortfolio.key){
                        $scope.comparePortfolio.push(portfolio.key);
                    }
                });
            }else{
                $.each($scope.compare.split(','), function(i, portfolio){
                    $scope.comparePortfolio.push(portfolio);
                });
            }
        };

        var setSelectedPeriod = function(){
            $element.find("li[name='period']").removeClass("active");
            $element.find("li#period_" + $scope.period).addClass("active");
        };

        var setSelectedType = function(){
            $element.find("li[name='type']").removeClass("current");
            $element.find("li#type_" + $scope.type).addClass("current");
        };

        var setSelectedCompareType = function(){
            $element.find("li[name='compareType']").removeClass("current");
            $element.find("li#compareType_" + $scope.compareType).addClass("current");
        };

        $scope.changePortfolio = function(){
            var index = $scope.comparePortfolio.indexOf($scope.mainPortfolio.key);
            $scope.comparePortfolio[index] = $scope.pMainPortfolio;
            var chart = getChartContainer().highcharts();
            var series = chart.get($scope.pMainPortfolio),
                mainSeries = chart.get($scope.mainPortfolio.key);
            if($scope.compareType !== 'All'){
                if(mainSeries.visible === false){
                    series.setVisible(false, false);
                }
            }
            $scope.pMainPortfolio = $scope.mainPortfolio.key;
            getData();
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

        $scope.changeCompareType = function(compareType){
            showHideMask(true);
            $scope.compareType = compareType;
            setSelectedCompareType();
            var chart = getChartContainer().highcharts(), selected = true;
            $.each(chart.series, function(i, series){
                if(series && series.options.id !== $scope.mainPortfolio.key){
                    series.setVisible(selected, false);
                    if($scope.compareType !== 'All' && selected === true){
                        selected = false;
                    }
                }
            });
            chart.redraw();
            showHideMask(false);
        };

        var getData = function(){
            showHideMask(true);
            updateMainSeries($scope.type !== 'Spread');
            updateCompareSeries();
            if($scope.type === 'Spread'){
                NAVDataService.getSpread($scope.mainPortfolio.key, $scope.comparePortfolio, $scope.period).then(updateChartData).catch(showMsgOnError);
            }else{
                NAVDataService.getNAV($scope.mainPortfolio.key, $scope.comparePortfolio, $scope.period).then(updateChartData).catch(showMsgOnError);
            }
        };

        var updateChartData = function(data){
            var chart = getChartContainer().highcharts();
            for (var portfolio in data) {
                if (data.hasOwnProperty(portfolio)){
                    var series = chart.get(portfolio);
                    if(series){
                        series.setData(data[portfolio], false);
                    }
                }
            }
            chart.redraw(false);
            showHideMask(false);
        };

        var showMsgOnError = function(portfolio){
            var msg = 'No data available for ' + portfolio;
            console.log(msg);
            alert(msg);
            showHideMask(false);
        };

        var getChartContainer = function(){
            return $element.find("div#" + $scope.widgetId + "_container");
        };

        var updateCompareSeries = function(){
            var chart = getChartContainer().highcharts();
            $.each($scope.comparePortfolio, function(i, portfolio){
                if(portfolio !== $scope.mainPortfolio.key){
                    var series = chart.get(portfolio);
                    if('undefined' === typeof series || series === null) {
                        chart.addSeries({
                            id: portfolio,
                            name: portfolio,
                            data: [],
                            type: 'line',
                            color: colors[i],
                            lineColor: colors[i],
                            tooltip: {
                                valueDecimals: 2
                            }
                        }, false);
                    }else{
                        series.update({color: colors[i], lineColor: colors[i], data : []}, false);
                    }
                }
            });
        };

        var updateMainSeries = function(show){
            var chart = getChartContainer().highcharts();
            var series = chart.get($scope.mainPortfolio.key);
            if(show){
                if('undefined' === typeof series || series === null){
                    chart.addSeries({
                        id: $scope.mainPortfolio.key,
                        name: $scope.mainPortfolio.content,
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
                    series.update({color: '#2d81a1', lineColor: '#2d81a1', data : []}, false);
                }
            }else{
                if(series) {
                    series.remove(false);
                }
            }
        };

        var getChart = function(){
            return {
                chart: {
                    pinchType: ''
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
                            if($scope.type === 'Spread'){
                                var d = this.point.tv.split('|');
                                s += Highcharts.numberFormat(d[0], 2, ",", ".") + '-' + Highcharts.numberFormat(d[1], 2, ",", ".");
                            }else{
                                s += Highcharts.numberFormat(this.point.tv, 2, ",", ".");
                            }
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
                        turboThreshold: 0,
                        events: {
                            legendItemClick: function () {
                                if(this.options.id === $scope.mainPortfolio.key){
                                    return false;
                                }else{
                                    if($scope.compareType !== 'All'){
                                        var newId = this.options.id;
                                        $.each(this.chart.series, function(i, series){
                                            if(series.options.id !== $scope.mainPortfolio.key && series.options.id !== newId){
                                                series.hide();
                                            }
                                        });
                                    }
                                }
                            }
                        }
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
                series: []
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
            var main = $element.find("select[name='mainPortfolioChooser']");
            if(enable){
                main.prop("disabled", false);
            }else{
                main.prop("disabled", true);
            }
        };

        this.onDestroy = function(){
            getChartContainer().highcharts().destroy();
            $scope.$destroy();
        };

        this.onResize = function(width, height){
            console.log('resize : qrAggChart');
            var chart = getChartContainer().highcharts();
            chart.setSize(width * .95, height * .8, false);
        }

    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/aggregatedChart/aggChart.html",
        link : function(scope, element, attrs, ctrl) {
            if(ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }

            element.on('$destroy', function(){
                console.log('destroying qrAggChart....');
                ctrl.onDestroy();
            });
        }
    }
}]);