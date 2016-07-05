app.directive('corelationMatrix', [function(){

    var controller = function($scope, QRDataService){

        var size = 10;

        this.onWidgetLoad = function(){
            QRDataService.getCorrelationMatrixData().then(function(data){
                var processedData = processData(data);
                drawChart(processedData, data.meta.symbols.length, size);
            });
        };

        this.onDestroy = function(){
            var svgContainer = d3.select("#corelationMatrix");
            svgContainer.remove();
            $scope.$destroy();
        };

        /**
         * convert data from service according to view
         * @param data
         * @returns {Array}
         */
        var processData = function(data){
            var processedData = [], borderData = [], len = data.meta.symbols.length;
            var s1 = Array.prototype.slice.call(data.meta.symbols);
            s1.reverse();
            angular.forEach(data.meta.symbols, function(mainValue, mainIndex){
                angular.forEach(s1, function(secondaryValue, secondaryIndex){
                    if(mainValue !== secondaryValue && (mainIndex + secondaryIndex) < len){
                        processedData.push(
                            {
                                x : mainIndex,
                                y : secondaryIndex,
                                b : true
                            }
                        );
                        angular.forEach(data.data[mainValue + secondaryValue], function(value, index){
                            processedData.push(
                                {
                                    t : mainValue + secondaryValue,
                                    f : data.meta.fields[index],
                                    x : (mainIndex * 3) + (index % 3),
                                    y : (secondaryIndex * 3) + Math.floor(index / 3),
                                    v : value
                                }
                            );
                        });
                    }
                });
            });
            return processedData;

        };

        /**
         * draw the matrix chart
         * @param data
         * @param elementCount
         * @param elementSize
         */
        var drawChart = function(data, elementCount, elementSize){
            var svgContainer = d3.select("#corelationMatrix").append("svg").attr("width", elementCount * elementSize * 3).attr("height", elementCount * elementSize * 3);

            var rectangles = svgContainer.selectAll("rect").data(data).enter().append("rect")
                .attr("x", function (d) {
                    return d.b === true ? (3 * d.x * elementSize) : d.x * elementSize;
                })
                .attr("y", function (d) {
                    return d.b === true ? (3 * d.y * elementSize) : d.y * elementSize;
                })
                .attr("width", function (d) {
                    return d.b === true ? (3 * elementSize) : elementSize;
                }).attr("height", function (d) {
                    return d.b === true ? (3 * elementSize) : elementSize;
                })
                .style("stroke", function (d) {
                    return d.b === true ? 'black' : 'none'
                })
                .style("fill", function (d) {
                    var returnColor;
                    if (d.b === true) {
                        returnColor = 'none';
                    } else {
                        if (d.v < 0) {
                            var r = 255 - Math.ceil(Math.abs(d.v) / 100 * 255);
                            returnColor = "rgb(255," + r + "," + r + ")";
                        } else if (d.v === 0) {
                            returnColor = "white";
                        } else if (d.v > 0) {
                            var g = 255 - Math.ceil(d.v / 100 * 255);
                            returnColor = "rgb(" + g + ",255," + g + ")";
                        }
                    }
                    return returnColor;
                }).filter(function (d) {
                    return d.b !== true;
                }).append("svg:title").text(function (d) {
                    return d.t + " : " + d.f + " => " + d.v;
                });
        };

    };

    return {
        "restrict": "E",
        "controller": controller,
        "controllerAs": "widget",
        "template": "<div id='corelationMatrix'></div>",
        link: function (scope, element, attrs, ctrl) {
            element.on('$destroy', function () {
                ctrl.onDestroy();
            });

            if (ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }
        }
    }
}]);
