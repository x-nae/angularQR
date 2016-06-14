var QRChart = function (id, model, type) {
    this.id = id;
    this.model = model;
    this.type = type !== undefined ? type : "CANDLE";
    this.startTime = 0;
    this.endTime = 0;
    this.chart = new Highcharts.StockChart(this.getHighChartConfig(this.type));
};

QRChart.prototype.getHighChartConfig = function(type){
    var mxvChart = this;
    if (type == "CANDLE"){
        return {
            chart: {
                renderTo: this.id + '_container'
            },
            annotationsOptions: {
                "enabledButtons": false
            },
            annotations: [],
            legend: {
                enabled: true,
                align: 'right',
                //backgroundColor : '#FCFFC5',
                borderColor: 'black',
                borderWidth: 2,
                layout: 'vertical',
                verticalAlign: 'top',
                y: 100,
                shadow: true
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                borderColor: '#f6ff00',
                style: {
                    color: '#F0F0F0'
                },
                formatter: function () {
                    var s = '<b>' + Highcharts.dateFormat('%A, %b %e, %H:%M', this.x) + '</b>';

                    $.each(this.points, function () {
                        s += '<br/><span style="color:'+ this.point.series.color +'">\u25CF</span>' + this.series.name + ': ';
                        s += Highcharts.numberFormat(this.point.y, 2, ".", ",");
                    });

                    return s;
                }
            },
            yAxis: [{
                lineWidth: 1,
                offset: 0,
                labels: {
                    align: 'right',
                    x: -3,
                    y: 6
                },
                showLastLabel: true
            }],
            title: {
                text: this.model
            },
            series: [{
                type: 'candlestick',
                lineWidth: 1,
                color: '#000000',
                dataGrouping: {
                    units: [['week', // unit name
                        [1] // allowed multiples
                    ], ['month', [1, 2, 3, 4, 6]]]
                }
            }, {
                type: 'line',
                yAxis: 0,
                name: 'Indicator',
                color: '#000080'
            }, {
                type: 'line',
                yAxis: 0,
                name: 'Indicator',
                color: '#800000'
            }]
        };
    }
    if (type === "SPREAD"){
        return {
            chart: {
                type: 'arearange',
                renderTo: mxvChart.id + '_container',
                zoomType: 'x',
                alignTicks: true,
                animation: false,
                backgroundColor: '#12161f',
                events: {
                    selection: function (event) {
                        if (event.xAxis != null) {
                            mxvChart.startTime = event.xAxis[0].min;
                            mxvChart.endTime = event.xAxis[0].max;
                        } else
                            mxvChart.startTime = this.endTime = 0;
                        window.setTimeout(mxvChart.callback, 0);
                    },
                    redraw: function () {
                        if (this.xAxis != null) {
                            if (mxvChart.startTime !== this.xAxis[0].min || mxvChart.endTime !== this.xAxis[0].max) {
                                mxvChart.startTime = this.xAxis[0].min;
                                mxvChart.endTime = this.xAxis[0].max;
                                window.setTimeout(function(){
                                    mxvChart.callback();
                                }, 0);
                            }
                        }
                    }
                }
            },
            annotationsOptions: {
                "enabledButtons": false
            },
            credits: {
                enabled: false
            },
            annotations: [],
            legend: {
                enabled: true,
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'top',
                y: 100,
                shadow: true,
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
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                borderColor: '#f6ff00',
                style: {
                    color: '#F0F0F0'
                },
                formatter: function () {
                    var s = '<b>' + Highcharts.dateFormat('%A, %b %e, %H:%M', this.x) + '</b>';

                    $.each(this.points, function () {
                        var color = this.point.series.color;
                        if(this.point.series.options.id === 'Misprice_area'){
                            color = this.point.series.options.lineColor;
                        }
                        s += '<br/><span style="color:'+ color +'">\u25CF</span>' + this.series.name + ': ';
                        s += Highcharts.numberFormat(this.point.y, 2, ",", ".");
                    });

                    return s;
                }
            },
            rangeSelector: {
                buttons: [],
                inputEnabled: false
            },
            title: {
                text: mxvChart.model
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150,
                gridLineWidth: 1
            },
            yAxis: [{
                title: {
                    text: 'SPREAD & NAV'
                },
                lineWidth: 1,
                top: 0,
                offset: 0,
                height: 360,
                labels: {
                    align: 'right',
                    x: -3,
                    y: 6
                },
                showLastLabel: true
            }, {
                title: {
                    text: 'NAV'
                },
                labels: {
                    align: 'right',
                    x: 0,
                    y: 0
                },
                top: 400,
                height: 90,
                offset: 0,
                gridLineWidth: 1,
                lineWidth: 2
            }, {
                title: {
                    text: 'B'
                },
                offset: 0,
                top: 500,
                height: 90,
                labels: {
                    align: 'right',
                    x: 0,
                    y: 0
                },
                gridLineWidth: 1,
                lineWidth: 1
            }, {
                title: {
                    text: 'C'
                },
                offset: 0,
                top: 600,
                height: 90,
                labels: {
                    align: 'right',
                    x: 0,
                    y: 0
                },
                gridLineWidth: 1,
                lineWidth: 1
            }],
            plotOptions: {
                series: {
                    animation: false,
                    shadow: false,
                    lineWidth: 1.5,
                    cropThreshold: 300,
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [
                {
                    id: 'Misprice_area',
                    showInLegend: true,
                    name: 'Misprice',
                    color: 'rgba(69, 72, 79, .1)',
                    lineColor: '#888888',
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }, {
                    showInLegend: true,
                    name: 'Spread',
                    color: '#6F7580',
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }, {
                    type: 'line',
                    showInLegend: true,
                    name: 'Misprice',
                    color: '#FDFDFD',
                    lineColor: '#FDFDFD',
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }, {
                    type: 'line',
                    showInLegend: true,
                    name: 'Alpha',
                    color: '#d03d47',
                    lineColor: '#d03d47',
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }, {
                    type: 'line',
                    showInLegend: true,
                    name: 'NAV',
                    yAxis: 1,
                    lineWidth: 2,
                    color: '#ff4400',
                    lineColor: '#ff4400',
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }, {
                    type: 'line',
                    step: false,
                    showInLegend: true,
                    name: 'IND_1',
                    lineWidth: 1,
                    yAxis: 2,
                    lineColor: '#00ff00',
                    color: '#00ff00'
                }, {
                    type: 'line',
                    showInLegend: true,
                    name: 'IND_2',
                    yAxis: 2,
                    lineWidth: 2,
                    lineColor: '#00fff6',
                    color: '#00fff6'
                }, {
                    type: 'line',
                    showInLegend: true,
                    name: 'IND_3',
                    yAxis: 3,
                    lineWidth: 2,
                    lineColor: '#1F7CFD',
                    color: '#1F7CFD'
                }, {
                    type: 'line',
                    showInLegend: true,
                    name: 'IND_4',
                    yAxis: 3,
                    lineWidth: 2,
                    lineColor: '#FFFFFF',
                    color: '#FFFFFF'
                }
            ]
        };
    }
};

QRChart.prototype.resize = function (width, height) {
    this.chart.setSize(width, 780, false);
};

QRChart.prototype.setModel = function (model) {
    // exit on same model
    if (model.indexOf(this.model) == 0 && model.length == this.model.length) {
        return;
    }
    this.model = model;

    var chart = this.chart;
    for (var i = 0; i < 8; i++) {
        chart.series[i].setData([], false);
    }
    chart.setTitle({text: model}, false);
    this.startTime = this.endTime = 0;
    this.historyData = undefined;
};

QRChart.prototype.getData = function (startTime, endTime, data, field) {

    var newData = [], minTime, maxTime, step, step2, innerLast, outerLast, i, end, d, time;

    if (data == null || data.length < 2) {
        return null;
    }

    minTime = data[0][0];
    maxTime = data[data.length - 1][0];

    step2 = (maxTime - minTime) / 1000;

    if (startTime == 0) {
        startTime = minTime;
    }
    if (endTime == 0) {
        endTime = maxTime;
    }

    step = (endTime - startTime) / 1000;
    if (step < 100) {
        return null;
    }

    startTime -= 1000 * 60 * 60 * 2;
    endTime += 1000 * 60 * 60 * 2;

    innerLast = 0;
    outerLast = 0;
    end = data.length - 1;

    switch (field) {
        case 1:
            for (i = 0; i <= end; i++) {
                d = data[i];
                time = d[0];
                if ((time > innerLast && time >= startTime && time <= endTime) || (i == 0 || i == end - 1) || time >= outerLast) {
                    newData.push([d[0], d[1], d[2]]);
                    innerLast = time + step;
                    outerLast = time + step2;
                }
            }
            break;
        case 2:
            for (i = 0; i <= end; i++) {
                d = data[i];
                time = d[0];
                if ((time > innerLast && time >= startTime && time <= endTime) || (i == 0 || i == end - 1) || time >= outerLast) {
                    newData.push([d[0], d[3], d[4]]);
                    innerLast = time + step;
                    outerLast = time + step2;
                }
            }
            break;
        case 3:
            for (i = 0; i <= end; i++) {
                d = data[i];
                time = d[0];
                if ((time > innerLast && time >= startTime && time <= endTime) || (i == 0 || i == end - 1) || time >= outerLast) {
                    newData.push([d[0], (d[3] + d[4]) / 2]);
                    innerLast = time + step;
                    outerLast = time + step2;
                }
            }
            break;
        default:
            for (i = 0; i <= end; i++) {
                d = data[i];
                time = d[0];
                if ((time > innerLast && time >= startTime && time <= endTime) || (i == 0 || i == end - 1) || time >= outerLast) {
                    newData.push([d[0], d[field]]);
                    innerLast = time + step;
                    outerLast = time + step2;
                }
            }
    }
    return newData;
};

QRChart.prototype.recalc = function () {
    try {
        var data, chart, startTime, endTime, historyData;
        if (this.historyData == undefined){
            return;
        }
        var mxvChart = this;
        startTime = this.startTime;
        endTime = this.endTime;
        historyData = this.historyData;
        chart = this.chart;
        var setData = function (i, fields, repaint) {
            if (chart.series[i] !== undefined) {
                data = mxvChart.getData(startTime, endTime, historyData, fields);
                chart.series[i].setData(data, repaint);
            }
        };
        if (this.type === "CANDLE") {
            // TODO :
            setData(0, [1, 2, 3, 4], false);
            setData(1, [5, 5, 5, 5], false);
            setData(2, [6, 6, 6, 6], true);
        } else {
            setData(0, 1, false);
            setData(1, 2, false);
            setData(2, 3, false);
            setData(3, 5, false);
            setData(4, 6, false);
            setData(5, 7, false);
            setData(6, 8, false);
            setData(7, 9, false);
            setData(8, 10, true);
        }
    } catch (e) {
        console.log("Error in recalc function of MXV_CHART. " + e);
    }
};

QRChart.prototype.callback = function () {
    try {
        if(this.endTime && this.startTime){
            var zoom = (this.endTime - this.startTime) / 1000000;
            if (this.zoom === undefined || zoom / this.zoom > 1.1 || zoom / this.zoom < 0.9) {
                this.recalc();
                this.zoom = zoom;
            }
        }
    } catch (e) {
        console.log("Error in callback function of MXV_CHART." + e);
    }
};

QRChart.prototype.update = function(dataObj){
    var highChart = this.chart, mxvChart = this;
    var data = [], d;
    if (dataObj.indexOf("<html>") == -1 && $.trim(dataObj).length > 0) {

        try {
            with (mxvChart)
                eval(dataObj);
        } catch (e) {
            console.log(e);
            console.log(dataObj);
        }

        if (data.length > 0) {
            if (mxvChart.historyData === undefined) {
                 console.log("set history data " + data.length);
                mxvChart.historyData = data;
                mxvChart.startTime = data[0][0];
                mxvChart.endTime = data[data.length - 1][0];
                mxvChart.recalc();
            } else {
                // console.log("add point " + data.length);
                d = data[data.length - 1];
                highChart.series[0].addPoint([d[0], d[1], d[2]], false);
                highChart.series[1].addPoint([d[0], d[3], d[4]], false);
                highChart.series[2].addPoint([d[0], (d[3] + d[4]) / 2], false);
                highChart.series[3].addPoint([d[0], d[5]], false);
                highChart.series[4].addPoint([d[0], d[6]], false);
                highChart.series[5].addPoint([d[0], d[7]], false);
                highChart.series[6].addPoint([d[0], d[8]], false);
                highChart.series[7].addPoint([d[0], d[9]], false);
                highChart.series[8].addPoint([d[0], d[10]], true);
            }
        }
    }
};

QRChart.prototype.destroy = function(){
    this.chart.destroy();
};