app.directive('corelationMatrix', [function(){

    var controller = function($scope, $element, $log, $timeout, QRDataService){

        var size = 10;

        this.onWidgetLoad = function(){
            QRDataService.getCorrelationMatrixData().then(function(data){
                var processedData = processData(data);
                drawChart(processedData, data.meta.symbols, size);
            })
        };

        this.onDestroy = function(){
            removeContainer();
            $scope.$destroy();
        };

        this.onResize = function(width){
            $scope.width = width;
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
                        angular.forEach(data.data[mainValue + secondaryValue], function(value, index){
                            processedData.push(
                                {
                                    x : (mainIndex * 3) + (index % 3),
                                    y : (secondaryIndex * 3) + Math.floor(index / 3),
                                    v : value
                                }
                            );
                        });
                        processedData.push(
                            {
                                t : mainValue + secondaryValue,
                                f : data.meta.fields,
                                v : data.data[mainValue + secondaryValue],
                                x : mainIndex,
                                y : secondaryIndex,
                                b : true
                            }
                        );
                    }
                });
            });
            return processedData;

        };

        /**
         * remove svg container
         */
        var removeContainer = function(){
            var svgContainer = d3.select(getSVGContainer()).select("svg");
            svgContainer.remove();
        };

        var getSVGContainer = function(){
            return $element.find("div#corelationMatrix div.svg-container").get(0);
        };

        var getTooltipContainer = function(){
            return $element.find("div#corelationMatrix div.tooltip").get(0);
        };

        /**
         * draw the matrix chart
         * @param data
         * @param symbols
         */
        var drawChart = function(data, symbols){

            removeContainer();

            var aspectRatio = 1, container = getSVGContainer(),
                containerWidth = angular.isUndefined($scope.width) ? 720 : $scope.width,
                containerHeight = aspectRatio * containerWidth;

            var outerElementWidth = containerWidth/symbols.length, innerElementWidth = outerElementWidth/3;
            var outerElementHeight = containerHeight/symbols.length, innerElementHeight = outerElementHeight/3;

            var elementCount = symbols.length,
                margin = {top: 40, right: 40, bottom: 40, left: 40},
                width = containerWidth - margin.left - margin.right,
                height = containerHeight - margin.top - margin.bottom, translate = "translate(" + margin.left + "," + margin.top + ")";

            var svgContainer = d3.select(container)
                .append("svg")
                //responsive SVG needs these 2 attributes and no width and height attr
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + (containerWidth + margin.left + margin.right) + " " + (containerHeight + margin.top + margin.bottom))
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                //class to make it responsive
                .style("class", "svg-content-responsive")
                .style('background', '#1c1c1c');


            //Create the Scale for the x-Axis
            var xAxisScale = d3.scaleLinear().domain([0, elementCount]).range([0, containerWidth]);
            //Create the x-Axis
            var xAxis = d3.axisTop(xAxisScale).ticks(elementCount).tickFormat(function(d){
                return symbols[d];
            });
            //Create an SVG group Element for the Axis elements and call the xAxis function
            var xAxisGroup = svgContainer.append("g").attr("transform", translate).call(xAxis);
            //align labels
            xAxisGroup.selectAll('text')
                .attr("transform", "translate(" + (0.5 * outerElementWidth) +  ", 0) rotate(-90 0 -15)" )
                .style('fill', 'white');

            //Create the Scale for the y-Axis
            var yAxisScale = d3.scaleLinear().domain([0, elementCount]).range([containerHeight, 0]);
            //Create the y-Axis
            var yAxis = d3.axisLeft(yAxisScale).ticks(elementCount).tickFormat(function(d){
                return symbols[d];
            });
            //Create an SVG group Element for the Axis elements and call the yAxis function
            var yAxisGroup = svgContainer.append("g")
                .attr("transform", "translate(" + margin.left + "," +  margin.top + ")")
                .call(yAxis);
            //align labels
            yAxisGroup.selectAll('text').attr("transform", "translate(0," + (-0.5 * outerElementHeight) + ")").style('fill', 'white');

            //create the data bozes
            var rectangles = svgContainer.selectAll("rect").data(data).enter().append("rect")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("x", function (d) {
                    return (d.b === true ? (d.x * outerElementWidth) : d.x * innerElementWidth);
                })
                .attr("y", function (d) {
                    return (d.b === true ? (d.y * outerElementHeight) : d.y * innerElementHeight);
                })
                .attr("width", function (d) {
                    return d.b === true ? (outerElementWidth) : innerElementWidth;
                })
                .attr("height", function (d) {
                    return d.b === true ? (outerElementHeight) : innerElementHeight;
                })
                .style("stroke", function (d) {
                    return d.b === true ? 'black' : 'none'
                })
                .style("fill", function (d) {
                    return d.b === true ? 'transparent' : getColor(d.v);
                })
                .filter(function (d) {
                    return d.b === true;
                })
                .on("mouseover", function(d) {
                    var div = d3.select(getTooltipContainer());
                    div.transition().duration(200).style("opacity", .9);
                    var position = getRelativePosition(d3.event.pageX, d3.event.pageY), html = '<table><thead><tr><th colspan="3">' + d.t + '</th></tr></thead><tbody>';
                    angular.forEach(d.f, function(value, index){
                        html += '<tr><td><div style="background-color:' + getColor(d.v[index]) + ';width:15px;height:15px"></div></td><td>' + value + '</td><td>' + d.v[index] + '</td></tr>';
                    });
                    html += '</tbody></table>';
                    div.html(html).style("left", (position.x) + "px").style("top", (position.y) + "px");
                })
                .on("mouseout", function(d) {
                    d3.select(getTooltipContainer()).transition().duration(500).style("opacity", 0);
                });
        };

        /**
         * get color according to value
         * @param value
         * @returns {*}
         */
        var getColor = function(value){
            var returnColor;
            if (value < 0) {
                var r = 255 - Math.ceil(Math.abs(value) / 100 * 255);
                returnColor = "rgb(255," + r + "," + r + ")";
            } else if (value === 0) {
                returnColor = "white";
            } else {
                var g = 255 - Math.ceil(value / 100 * 255);
                returnColor = "rgb(" + g + ",255," + g + ")";
            }
            return returnColor;
        };

        /**
         * get position according to layout
         * @param x
         * @param y
         * @returns {*}
         */
        var getRelativePosition = function(x, y){
            var rel = $element.offset();
            var position = {x : x - rel.left, y : y - rel.top};
            if($ && $.portal){
                switch($.portal.config.layout.type){
                    case 'flex':
                        position = {x : x, y : y - $("div.AREA-NORTH").height()};
                        break;
                    default :
                        break;
                }
            }
            return position;
        };

    };

    return {
        "restrict": "E",
        "controller": controller,
        "controllerAs": "widget",
        "template": "<div id='corelationMatrix'><div class='svg-container'></div><div class='tooltip' style='opacity: 0;'></div></div>",
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
