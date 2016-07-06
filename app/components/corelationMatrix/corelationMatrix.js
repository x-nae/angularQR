app.directive('corelationMatrix', [function(){

    var controller = function($scope, $element, $log, QRDataService){

        var size = 10;

        this.onWidgetLoad = function(){
            QRDataService.getCorrelationMatrixData().then(function(data){
                var processedData = processData(data);
                drawChart(processedData, data.meta.symbols, size);
            });
        };

        this.onDestroy = function(){
            var svgContainer = d3.select($element.find("div#corelationMatrix").get(0));
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
         * draw the matrix chart
         * @param data
         * @param symbols
         * @param elementSize
         */
        var drawChart = function(data, symbols, elementSize){

            var elementCount = symbols.length,
                margin = {top: 40, right: 40, bottom: 40, left: 40},
                width = elementCount * elementSize * 3 - margin.left - margin.right,
                height = elementCount * elementSize * 3 - margin.top - margin.bottom;

            var svgContainer = d3.select($element.find("div#corelationMatrix").get(0)).append("svg")
                .attr("width", elementCount * elementSize * 3 + margin.left + margin.right)
                .attr("height", elementCount * elementSize * 3 + margin.top + margin.bottom)
                .style('background', '#1c1c1c')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            //Create the Scale for the x-Axis
            var xAxisScale = d3.scaleLinear().domain([0, elementCount]).range([0, elementCount * elementSize * 3]);
            //Create the x-Axis
            var xAxis = d3.axisTop(xAxisScale).ticks(elementCount).tickFormat(function(d){
                return symbols[d];
            });
            //Create an SVG group Element for the Axis elements and call the xAxis function
            var xAxisGroup = svgContainer.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(xAxis);
            //align labels
            xAxisGroup.selectAll('text').attr("transform", "translate(30, -15) rotate(-90)").style('fill', 'white');

            //Create the Scale for the y-Axis
            var yAxisScale = d3.scaleLinear().domain([0, elementCount]).range([elementCount * elementSize * 3, 0]);
            //Create the y-Axis
            var yAxis = d3.axisLeft(yAxisScale).ticks(elementCount).tickFormat(function(d){
                return symbols[d];
            });
            //Create an SVG group Element for the Axis elements and call the yAxis function
            var yAxisGroup = svgContainer.append("g")
                .attr("transform", "translate(" + margin.left + "," +  margin.top + ")")
                .call(yAxis);
            //align labels
            yAxisGroup.selectAll('text').attr("transform", "translate(0,-15)").style('fill', 'white');

            //// Define the div for the tooltip
            var div = d3.select($element.find("div#corelationMatrix").get(0)).append('div').attr('class', 'tooltip').style("opacity", 0);

            //create the data bozes
            var rectangles = svgContainer.selectAll("rect").data(data).enter().append("rect")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("x", function (d) {
                    return (d.b === true ? (3 * d.x * elementSize) : d.x * elementSize);
                })
                .attr("y", function (d) {
                    return (d.b === true ? (3 * d.y * elementSize) : d.y * elementSize);
                })
                .attr("width", function (d) {
                    return d.b === true ? (3 * elementSize) : elementSize;
                })
                .attr("height", function (d) {
                    return d.b === true ? (3 * elementSize) : elementSize;
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
                    div.transition().duration(200).style("opacity", .9);
                    var position = getRelativePosition(d3.event.pageX, d3.event.pageY), html = '<table><thead><tr><th colspan="3">' + d.t + '</th></tr></thead><tbody>';
                    angular.forEach(d.f, function(value, index){
                        html += '<tr><td><div style="background-color:' + getColor(d.v[index]) + ';width:15px;height:15px"></div></td><td>' + value + '</td><td>' + d.v[index] + '</td></tr>';
                    });
                    html += '</tbody></table>';
                    div.html(html).style("left", (position.x) + "px").style("top", (position.y) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition().duration(500).style("opacity", 0);
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
