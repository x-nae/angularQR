app.factory('QRDataService', function (DataService, $timeout) {

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

    var processClientChannels = function (response) {
        var data = {};
        angular.forEach(response.clientData, function (value, key) {
            data[value.name] = {
                name : value.name,
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
                    name : pair.name,
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
        var clientHeaders = JSON.parse('[{"key": "name","displayName": "Client", "type": "string"}, {"key": "nav","displayName": "NAV","type": "number"}, {"key": "changeMonth","displayName": "MTD","type": "percentageBar"}, {"key": "changeYear","displayName": "YTD","type": "percentageBar"}, {"key": "changeAll","displayName": "Total","type": "percentageBar"}]');
        var pairHeaders = JSON.parse('[{"key": "name","displayName": "Pair", "type": "string"}, {"key": "nav","displayName": "NAV","type": "number"}, {"key": "changeMonth","displayName": "MTD","type": "percentageBar"}, {"key": "changeYear","displayName": "YTD","type": "percentageBar"}, {"key": "changeAll","displayName": "Total","type": "percentageBar"}]');

        return {
            clientHeaders: clientHeaders,
            pairHeaders: pairHeaders,
            //channelHeaders : [],
            data: data
        };
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

    var getChannelAnalyzerData = function () {
        return $timeout(function () {
            return JSON.parse('{"xAxis":{"categories":["Dez","Jan","Feb","Mär","Apr","Mai","Jun","Jul"]},"series":[{"data":[276,-675,291,188,296,-285,-100],"name":"60"},{"data":[521,-305,-1495,380,1111,-77,-82],"name":"70"},{"data":[295,-449,-785,-1565,1629,628,-480],"name":"80"},{"data":[1936,3847,7097,3117,2017,653,-91],"name":"90"},{"data":[1456,5435,639,993,-41,238,-1018],"name":"100"},{"data":[-1511,1044,-865,938,-208,2,-250],"name":"110"},{"data":[1085,3206,888,797,300,260,315],"name":"120"},{"data":[1676,-489,-238,672,0,236,425],"name":"130"},{"data":[-1652,-797,252,-383,0,245,776],"name":"140"},{"data":[-78,-112,-2129,-920,1154,0,815],"name":"150"},{"data":[276,-675,291,11,0,0,630],"name":"160"},{"data":[521,-305,-1495,195],"name":"170"},{"data":[295,-449,-785],"name":"180"},{"data":[-119,1097,1749,0,295],"name":"190"},{"data":[0,676,0,0,325],"name":"200"},{"data":[427,329],"name":"250"},{"data":[-2521,-34,0,165],"name":"300"},{"data":[0,0,0,0,0,0,1800],"name":"U"},{"data":[0,0,0,0,0,0,1721],"name":"V"},{"data":[0,0,0,0,0,0,1297],"name":"X"}],"title":{"text":"filter: TITTEL"}}');
        }, 100);
        //return DataService.getChannelAnalyzerData().then(function(response){
        //    return response.data;
        //});
    };

    var getKeyRiskIndicatorData = function(){
        return $timeout(function () {
            return {
                "meta": {
                    "fields": {
                        "f1": {
                            "desc" : "Field 1",
                            "type" : "number"
                        },
                        "f2": {
                            "desc" : "Field 2",
                            "type" : "double"
                        },
                        "f3": {
                            "desc" : "Field 3",
                            "type" : "double"
                        }
                    },
                    "dates": {
                        JAN16: "JAN-16",
                        FEB16: "FEB-16",
                        MAR16: "MAR-16",
                        APR16: "APR-16",
                        MAY16: "MAY-16",
                        JUN16: "JUN-16",
                        JUL16: "JUL-16",
                        AUG16: "AUG-16",
                        SEP16: "SEP-16",
                        OCT16: "OCT-16",
                        NOV16: "NOV-16",
                        DEC16: "DEC-16",
                        JAN17: "JAN-17",
                        FEB17: "DEC-17",
                        MAR17: "MAR-17",
                        APR17: "APR-17"
                    }
                },
                "data": {
                    "f1": {
                        "JAN16": 56,
                        "FEB16": 31,
                        "MAR16": 82,
                        "APR16": 79,
                        "MAY16": 32,
                        "JUN16": 45,
                        "JUL16": 32,
                        "AUG16": 78,
                        "SEP16": 49,
                        "OCT16": 72,
                        "NOV16": 40,
                        "DEC16": 7,
                        "JAN17": 9,
                        "FEB17": 68,
                        "MAR17": 13,
                        "APR17": 98
                    },
                    "f2": {
                        "JAN16": 92,
                        "FEB16": 85,
                        "MAR16": 37,
                        "APR16": 58,
                        "MAY16": 83,
                        "JUN16": 10,
                        "JUL16": 99,
                        "AUG16": 37,
                        "SEP16": 25,
                        "OCT16": 44,
                        "NOV16": 98,
                        "DEC16": 51,
                        "JAN17": 34,
                        "FEB17": 30,
                        "MAR17": 63,
                        "APR17": 52
                    },
                    "f3": {
                        "JAN16": 4,
                        "FEB16": 85,
                        "MAR16": 36,
                        "APR16": 20,
                        "MAY16": 95,
                        "JUN16": 44,
                        "JUL16": 44,
                        "AUG16": 2,
                        "SEP16": 61,
                        "OCT16": 43,
                        "NOV16": 50,
                        "DEC16": 78,
                        "JAN17": 37,
                        "FEB17": 19,
                        "MAR17": 93,
                        "APR17": 82
                    },
                    "f4": {
                        "JAN16": 86,
                        "FEB16": 69,
                        "MAR16": 33,
                        "APR16": 94,
                        "MAY16": 78,
                        "JUN16": 82,
                        "JUL16": 36,
                        "AUG16": 48,
                        "SEP16": 30,
                        "OCT16": 25,
                        "NOV16": 73,
                        "DEC16": 51,
                        "JAN17": 76,
                        "FEB17": 79,
                        "MAR17": 5,
                        "APR17": 77
                    },
                    "f5": {
                        "JAN16": 86,
                        "FEB16": 95,
                        "MAR16": 60,
                        "APR16": 66,
                        "MAY16": 15,
                        "JUN16": 98,
                        "JUL16": 9,
                        "AUG16": 88,
                        "SEP16": 22,
                        "OCT16": 99,
                        "NOV16": 63,
                        "DEC16": 22,
                        "JAN17": 93,
                        "FEB17": 21,
                        "MAR17": 54,
                        "APR17": 28
                    },
                    "f6": {
                        "JAN16": 18,
                        "FEB16": 81,
                        "MAR16": 90,
                        "APR16": 59,
                        "MAY16": 62,
                        "JUN16": 6,
                        "JUL16": 96,
                        "AUG16": 75,
                        "SEP16": 86,
                        "OCT16": 83,
                        "NOV16": 17,
                        "DEC16": 77,
                        "JAN17": 49,
                        "FEB17": 1,
                        "MAR17": 10,
                        "APR17": 27
                    },
                    "f7": {
                        "JAN16": 61,
                        "FEB16": 54,
                        "MAR16": 18,
                        "APR16": 37,
                        "MAY16": 9,
                        "JUN16": 20,
                        "JUL16": 60,
                        "AUG16": 37,
                        "SEP16": 99,
                        "OCT16": 48,
                        "NOV16": 61,
                        "DEC16": 47,
                        "JAN17": 51,
                        "FEB17": 50,
                        "MAR17": 7,
                        "APR17": 95
                    },
                    "f8": {
                        "JAN16": 23,
                        "FEB16": 10,
                        "MAR16": 10,
                        "APR16": 57,
                        "MAY16": 46,
                        "JUN16": 10,
                        "JUL16": 54,
                        "AUG16": 46,
                        "SEP16": 37,
                        "OCT16": 91,
                        "NOV16": 85,
                        "DEC16": 27,
                        "JAN17": 60,
                        "FEB17": 59,
                        "MAR17": 81,
                        "APR17": 64
                    },
                    "f9": {
                        "JAN16": 32,
                        "FEB16": 10,
                        "MAR16": 23,
                        "APR16": 20,
                        "MAY16": 67,
                        "JUN16": 46,
                        "JUL16": 97,
                        "AUG16": 68,
                        "SEP16": 54,
                        "OCT16": 81,
                        "NOV16": 37,
                        "DEC16": 32,
                        "JAN17": 98,
                        "FEB17": 47,
                        "MAR17": 46,
                        "APR17": 49
                    },
                    "f10": {
                        "JAN16": 49,
                        "FEB16": 67,
                        "MAR16": 83,
                        "APR16": 96,
                        "MAY16": 46,
                        "JUN16": 26,
                        "JUL16": 75,
                        "AUG16": 44,
                        "SEP16": 61,
                        "OCT16": 16,
                        "NOV16": 46,
                        "DEC16": 15,
                        "JAN17": 49,
                        "FEB17": 39,
                        "MAR17": 60,
                        "APR17": 17
                    }
                }
            };
        }, 100);

        //return DataService.getKeyRiskIndicatorData().then(function(response){
        //    return response.data;
        //});
    };

    var getKeyRiskIndicatorFields = function() {
        return $timeout(function () {
            return {
                    "f1": {
                        "desc" : "Field 1",
                        "type" : "number"
                    },
                    "f2": {
                        "desc" : "Field 2",
                        "type" : "double"
                    },
                    "f3": {
                        "desc" : "Field 3",
                        "type" : "double"
                    }
            };
        }, 100);

        //return DataService.getKeyRiskIndicatorData().then(function(response){
        //    return response.data.meta.fields;
        //});
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
        getChannelAnalyzerData: getChannelAnalyzerData,
        switchModel: switchModel,
        switchLong: switchLong,
        switchShort: switchShort,
        switchRunScript: switchRunScript,
        enableService: enableService,
        disableService: disableService,
        switchOnService: switchOnService,
        switchOffService: switchOffService,
        processChannels: processChannels,
        processClientChannels: processClientChannels,
        getKeyRiskIndicatorData : getKeyRiskIndicatorData,
        getKeyRiskIndicatorFields : getKeyRiskIndicatorFields,
        getTickUpdatesParams: getTickUpdatesParams,
        getChannelOverviewParams: getChannelOverviewParams,
        getClientOverviewParams: getClientOverviewParams,
        getTradeHistoryParams: getTradeHistoryParams
    }

});