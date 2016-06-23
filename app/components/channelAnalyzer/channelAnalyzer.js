app.directive("channelAnalyzer", [function () {

    var controller = function($element, $scope, QRDataService, $log, $filter){

        $scope.types = ['Profit', 'Positive Trades', 'Negative Trades', 'All Trades'];

        this.onWidgetLoad = function(){
            $log.info('channelAnalyzer => onWidgetLoad..');
            if(angular.isUndefined($scope.type)){
                $scope.type = $scope.types[0];
            }
            if(angular.isUndefined($scope.filter)){
                $scope.filter = 'TITTEL';
            }
            if(angular.isUndefined($scope.categories)){
                $scope.categories = '60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,250,300,U,V,X';
            }
            var startDate;
            if(angular.isUndefined($scope.startDate)){
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear()-1);
                $scope.startDate = $filter('date')(startDate, 'yyyy-MM-dd');
            }else{
                startDate = new Date($scope.startDate);
            }
            var endDate;
            if(angular.isUndefined($scope.endDate)){
                endDate = new Date();
                $scope.endDate = $filter('date')(endDate, 'yyyy-MM-dd');
            }else{
                endDate = new Date($scope.endDate);
            }
            $element.find('input[rel="from"]').datepicker({ dateFormat : "yy-mm-dd", onSelect :
                function(){
                    $(this).change();
                }
            }).datepicker("setDate", startDate);
            $element.find('input[rel="to"]').datepicker({ dateFormat : "yy-mm-dd", onSelect :
                function(){
                    $(this).change();
                }
            }).datepicker("setDate", endDate);
            getChartContainer().highcharts(getChartConfig());
            $scope.onAnalyze();
        };

        this.onResize = function (width, height){
            getChart().setSize(width, height - 100, false);
        };

        this.onDestroy = function(){
            $log.info('channelAnalyzer => onDestroy..');
            getChart().destroy();
        };

        var getChart = function(){
            return getChartContainer().highcharts();
        };

        var getChartConfig = function(){
            return {
                chart: {
                    type: 'column'
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    }
                },
                xAxis : {
                    categories:[]
                },
                series:[]
            }
        };

        var getChartContainer = function(){
            return $element.find('div[rel="chart"]');
        };

        var showHideMask = function(show){
            var chartContainer = getChartContainer();
            $element.find('input[rel="filter"]').prop('disabled', show);
            $element.find('select[rel="category"]').prop('disabled', show);
            $element.find('input[rel="from"]').prop('disabled', show);
            $element.find('input[rel="to"]').prop('disabled', show);
            $element.find('input[rel="analyze"]').prop('disabled', show);
            if(show){
                chartContainer.mask("<div class='circle'></div><div class='circle1'></div>");
            }else{
                chartContainer.unmask();
            }
        };

        $scope.onAnalyze = function(){
            $log.debug('channelAnalyzer => onAnalyze called!');
            getData($scope.type, $scope.filter, $scope.categories, $scope.startDate, $scope.endDate);
        };

        var getData = function(type, filter, categories, startDate, endDate){
            showHideMask(true);
            QRDataService.getChannelAnalyzerData(type, filter, categories, startDate, endDate).then(function(data){
                var chart = getChart();
                while(chart.series.length > 0){
                    chart.series[0].remove(false);
                }
                chart.setTitle({text : data.title.text});
                chart.xAxis[0].setCategories(data.xAxis.categories);
                angular.forEach(data.series, function(value, index){
                    var series = chart.get(value.name);
                    if(angular.isUndefined(series) || series === null){
                        series = chart.addSeries({name : value.name, data : []}, false, false);
                    }
                    series.update({name : value.name, data : value.data}, false);
                });
                chart.redraw();
            }).catch(function(response){
                $log.error('channelAnalyzer getData => ' + response);
            }).finally(function(){
                showHideMask(false);
            });

        };
    };

    return {
        "restrict": "E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/channelAnalyzer/channelAnalyzer.html",
        link: function (scope, element, attrs, ctrl) {
            if (ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }

            element.on('$destroy', function () {
                ctrl.onDestroy();
            });
        }
    }
}]);
