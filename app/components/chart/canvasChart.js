var CanvasChart = function(id, modelName, width, height) {
    this.id = id;
    this.model = modelName;
    this.width = width;
    this.height = height;
    this.data = [];
    this.counter = 0;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');

    $('div#' + this.id + '_container').append(this.canvas);
};

CanvasChart.prototype.setModel = function(model) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.data = [];
    this.model = model;
};

CanvasChart.prototype.parseData = function(data) {
    var min = 1000000000.0;
    var max = -1000000000.0;
    var i, x;
    for (i = 0; i < data.length; i++) {
        for (x = 1; x < 6; x++) {
            min = Math.min(min, data[i][x]);
            max = Math.max(max, data[i][x]);
        }
    }
    var range = (max - min);
    var newData = [];
    for (i = 0; i < data.length; i++) {
        newData.push([]);
        for (x = 1; x <= 6; x++){
            newData[i][x] = (data[i][x] - min) / range;
        }
        for (x = 7; x <= 11; x++){
            newData[i][x] = data[i][x];
        }
        newData[i][12] = data[i][6];
    }
    return newData;
};

CanvasChart.prototype.update = function(response){
    var chart = this;
    chart.counter += 17 * 4;
    var pos = chart.data.length;
    new Function("data", response)(chart.data);
    while (pos < chart.data.length) {
        if (pos > 0) {
            var i;
            for (i = 1; i <= 6; i++)
                if (chart.data[pos][i] == 0)
                    chart.data[pos][i] = chart.data[pos - 1][i];
        }
        pos++;
    }

    chart.updateChart();

};

CanvasChart.prototype.updateChart = function(){
    var chart = this;

    if (chart.data.length > chart.width){
        chart.data.splice((chart.counter % (chart.width / 4)), 1);
    }

    while (chart.data.length > chart.width / 4){
        chart.data.shift();
    }

    var data2 = chart.parseData(chart.data), dx = 4, h = chart.height, context = chart.context;
    context.clearRect(0, 0, chart.width, chart.height);

    for (i = 0; i < chart.data.length; i++) {
        var y1 = data2[i][1];
        var h1 = data2[i][2] - y1;
        var y2 = data2[i][3];
        var h2 = data2[i][4] - y2;
        var y3 = data2[i][5];
        var y4 = (data2[i][1] + data2[i][2]) / 2;
        chart.addRect(context, i * dx, -(y1 * h) + h - (h1 * h), dx + 1, h1 * h, 'rgba(75, 75, 75, 1)');
        chart.addRect(context, i * dx, -(y2 * h) + h - (h2 * h), dx + 1, h2 * h, 'rgb(170,192,216)');
        chart.addRect(context, i * dx, -(y3 * h) + h, dx + 1, 1, 'rgb(0,0,0)');
        chart.addRect(context, i * dx, -(y4 * h) + h, dx + 1, 1, 'rgb(255,0,0)');
    }
};

CanvasChart.prototype.resize = function(width, height){
    // resize the canvas
    this.width = width - 10;
    this.height = height - 40;
    this.canvas.width = width - 10;
    this.canvas.height = height - 40;
    this.updateChart();
};

CanvasChart.prototype.addRect = function(context, x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
};

CanvasChart.prototype.destroy = function(){
    $('div#' + this.id + '_container').remove();
};