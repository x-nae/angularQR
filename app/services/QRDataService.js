app.factory('QRDataService', function (DataService) {

    var getAdvancedChartHistoryData = function (model) {
        return DataService.getHistory(model).then(function (response) {
            return response.data;
        }).catch(function (response) {
            return response;
        });
    };

    var getChartHistoryData = function (model) {
        return DataService.getTicks(model).then(function (response) {
            return response.data;
        }).catch(function (response) {
            return response;
        });
    };

    var processChannels = function (data) {
        var navTotal = 0, startingCapitalTotal = 0, changeTotal = 0, sizeTotal = 0, models = [], processedData = [];
        angular.forEach(data.models, function (value, key) {
            if (models.indexOf(value.name) === -1) {
                models.push(value.name);
                navTotal = navTotal + value.nav;
                startingCapitalTotal = startingCapitalTotal + value.startingCapital;
                changeTotal = changeTotal + (value.nav - value.startingCapital);
                sizeTotal = sizeTotal + value.size;
                processedData.push(value);
            }
        });
        return {
            nav: navTotal,
            size: sizeTotal,
            change: changeTotal,
            pchg: startingCapitalTotal !== 0 ? changeTotal / startingCapitalTotal * 100 : '',
            models: processedData
        };
    };

    var processClientChannels = function(response){
        var data = {};
        angular.forEach(response.clientData, function (value, key) {
            data[value.name] = {
                change: value.change,
                nav: value.nav,
                capShort: value.capShort,
                changeYear: value.changeYear,
                changeMonth: value.changeMonth,
                capLong: value.capLong,
                changeAll: value.changeAll
            };
            var pairs = {};
            angular.forEach(value.pairs, function (pair, index) {
                pairs[pair.name] = {
                    nav: pair.nav,
                    changeYear: pair.changeYear,
                    changeMonth: pair.changeMonth,
                    size: pair.size,
                    changeAll: value.changeAll,
                    channels: pair.channels
                };
            });
            data[value.name].pairs = pairs;
        });

        for(var o in data){
            if(data.hasOwnProperty(o) && o !== 'TITTEL'){
                data[o].pairs = data['TITTEL'].pairs;
            }
        }
        return data;
    };

    var switchModel = function (model, enable) {
        return DataService.switchModel(model, enable).then(function (response) {
            return response.data;
        });
    };

    var switchLong = function (model, enable) {
        return DataService.switchLong(model, enable).then(function (response) {
            return response.data;
        });
    };

    var switchShort = function (model, enable) {
        return DataService.switchShort(model, enable).then(function (response) {
            return response.data;
        });
    };

    var switchRunScript = function (model, enable) {
        return DataService.switchRunScript(model, enable).then(function (response) {
            return response.data;
        });
    };

    var enableService = function () {
        return DataService.enableService().then(function (response) {
            return response.data;
        });
    };

    var disableService = function () {
        return DataService.disableService().then(function (response) {
            return response.data;
        });
    };

    var switchOnService = function () {
        return DataService.switchOnService().then(function (response) {
            return response.data;
        }).catch(function (response) {
            return response;
        });
    };

    var switchOffService = function () {
        return DataService.switchOffService().then(function (response) {
            return response.data;
        }).catch(function (response) {
            return response;
        });
    };

    var getTickUpdatesParams = function (model) {
        return {model: model};
    };

    var getChannelOverviewParams = function (filter, debug) {
        return {nameFilter: filter, debug: debug};
    };

    var getClientOverviewParams = function (client) {
        return {client: client};
    };

    var getTradeHistoryParams = function (model) {
        return {model: model};
    };

    return {
        getAdvancedChartHistoryData: getAdvancedChartHistoryData,
        getChartHistoryData: getChartHistoryData,
        switchModel : switchModel,
        switchLong : switchLong,
        switchShort : switchShort,
        switchRunScript : switchRunScript,
        enableService : enableService,
        disableService : disableService,
        switchOnService : switchOnService,
        switchOffService : switchOffService,
        processChannels : processChannels,
        processClientChannels : processClientChannels,
        getTickUpdatesParams : getTickUpdatesParams,
        getChannelOverviewParams : getChannelOverviewParams,
        getClientOverviewParams : getClientOverviewParams,
        getTradeHistoryParams : getTradeHistoryParams
    }

});