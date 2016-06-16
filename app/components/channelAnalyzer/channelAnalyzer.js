app.directive("channelAnalyzer", [function () {

    var controller = function($element, $scope, QRDataService, $log, $filter){

        this.onWidgetLoad = function(){
            $log.info('channelAnalyzer => onWidgetLoad..');
            if(angular.isUndefined($scope.filter)){
                $scope.filter = '_wCL';
            }
            if(angular.isUndefined($scope.categories)){
                $scope.categories = [
                    {key : '60', content : '60'},
                    {key : '70', content : '70'},
                    {key : '80', content : '80'},
                    {key : '90', content : '90'},
                    {key : '100', content : '100'},
                    {key : '110', content : '110'},
                    {key : '120', content : '120'},
                    {key : '130', content : '130'},
                    {key : '140', content : '140'},
                    {key : '150', content : '150'},
                    {key : '160', content : '160'},
                    {key : '170', content : '170'},
                    {key : '180', content : '180'},
                    {key : '190', content : '190'},
                    {key : '200', content : '200'},
                    {key : '250', content : '250'},
                    {key : '300', content : '300'},
                    {key : 'U', content : 'U'},
                    {key : 'V', content : 'V'},
                    {key : 'X', content : 'X'}
                ];
            }
            if(angular.isUndefined($scope.selectedCategories)){
                $scope.selectedCategories = [];
                angular.forEach($scope.categories, function(value, index){
                    $scope.selectedCategories.push(value.key);
                });
            }
            var d;
            if(angular.isUndefined($scope.startDate)){
                d = new Date();
                d.setFullYear(d.getFullYear()-1);
                $scope.startDate = d;
            }
            if(angular.isUndefined($scope.endDate)){
                d = new Date();
                $scope.endDate = d;
            }
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
            getData($scope.filter, $scope.selectedCategories, $filter('date')($scope.startDate, 'yyyy-MM-dd'), $filter('date')($scope.endDate, 'yyyy-MM-dd'));
        };

        var getData = function(filter, categories, startDate, endDate){
            showHideMask(true);
            QRDataService.getChannelAnalyzerData(filter, categories, startDate, endDate).then(function(data){
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
