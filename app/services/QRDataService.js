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
                name: value.name,
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
                    name: pair.name,
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

    var getKeyRiskIndicatorData = function () {
        return $timeout(function () {
            return {
                "data" : {
                    "t4" : {
                        "f10" : 46,
                        "f20" : -4.760540319279613,
                        "f12" : -4.072861236185052,
                        "f11" : -9950.00000000008,
                        "f14" : -4.147239263803628,
                        "f13" : -6759.999999999913,
                        "f16" : -3.9237392373925797,
                        "f1" : 174346,
                        "f15" : -3190.0000000001673,
                        "f2" : 1630,
                        "f18" : -11630.000000000095,
                        "f3" : -97746,
                        "f17" : 1680.0000000000146,
                        "f4" : 813,
                        "f5" : 106,
                        "f19" : 0.6876790830945618,
                        "f6" : 214,
                        "f7" : 2.004920049200492,
                        "f8" : 36,
                        "f9" : 30
                    },
                    "t5" : {
                        "f10" : 68,
                        "f20" : -4.816784869976372,
                        "f12" : -5.283687943262957,
                        "f11" : -8940.000000000924,
                        "f14" : -5.939629990263362,
                        "f13" : -6100.000000000473,
                        "f16" : -4.270676691730002,
                        "f1" : 112415,
                        "f15" : -2840.000000000451,
                        "f2" : 1027,
                        "f18" : -8150.000000000022,
                        "f3" : -105328,
                        "f17" : -790.0000000009022,
                        "f4" : 665,
                        "f5" : 109,
                        "f19" : -0.46690307328658526,
                        "f6" : 169,
                        "f7" : 1.544360902255639,
                        "f8" : 44,
                        "f9" : 28
                    },
                    "t6" : {
                        "f10" : 64,
                        "f20" : -5.058064516128769,
                        "f12" : -0.8322580645156972,
                        "f11" : -1289.9999999993306,
                        "f14" : -0.8309178743958049,
                        "f13" : -859.999999999658,
                        "f16" : -0.8349514563100439,
                        "f1" : 150532,
                        "f15" : -429.9999999996726,
                        "f2" : 1035,
                        "f18" : -7839.999999999593,
                        "f3" : -98968,
                        "f17" : 6550.000000000262,
                        "f4" : 515,
                        "f5" : 145,
                        "f19" : 4.225806451613072,
                        "f6" : 292,
                        "f7" : 2.0097087378640777,
                        "f8" : 69,
                        "f9" : 72
                    },
                    "t7" : {
                        "f10" : 126,
                        "f20" : -13.304498269896257,
                        "f12" : -12.214532871972393,
                        "f11" : -7060.000000000044,
                        "f14" : -12.778993435448387,
                        "f13" : -5839.999999999913,
                        "f16" : -10.082644628100256,
                        "f1" : 44545,
                        "f15" : -1220.000000000131,
                        "f2" : 457,
                        "f18" : -7690.000000000036,
                        "f3" : -10676,
                        "f17" : 629.9999999999927,
                        "f4" : 121,
                        "f5" : 97,
                        "f19" : 1.0899653979238628,
                        "f6" : 368,
                        "f7" : 3.7768595041322315,
                        "f8" : 78,
                        "f9" : 65
                    },
                    "t0" : {
                        "f10" : 68,
                        "f20" : 13.005671077504038,
                        "f12" : 19.187145557655032,
                        "f11" : 10149.999999999513,
                        "f14" : 19.932126696831574,
                        "f13" : 8809.999999999556,
                        "f16" : 15.40229885057421,
                        "f1" : 76501,
                        "f15" : 1339.9999999999563,
                        "f2" : 442,
                        "f18" : 6879.999999999636,
                        "f3" : -23368,
                        "f17" : 3269.9999999998763,
                        "f4" : 87,
                        "f5" : 173,
                        "f19" : 6.181474480150995,
                        "f6" : 879,
                        "f7" : 5.080459770114943,
                        "f8" : 27,
                        "f9" : 18
                    },
                    "t1" : {
                        "f10" : 25,
                        "f20" : 10.989810771469736,
                        "f12" : 19.650655021833437,
                        "f11" : 13499.99999999957,
                        "f14" : 18.917609046849133,
                        "f13" : 11709.999999999614,
                        "f16" : 26.323529411764063,
                        "f1" : 110880,
                        "f15" : 1789.9999999999563,
                        "f2" : 619,
                        "f18" : 7549.999999999709,
                        "f3" : -5960,
                        "f17" : 5949.999999999862,
                        "f4" : 68,
                        "f5" : 179,
                        "f19" : 8.6608442503637,
                        "f6" : 1630,
                        "f7" : 9.102941176470589,
                        "f8" : 11,
                        "f9" : 10
                    },
                    "t2" : {
                        "f10" : 45,
                        "f20" : 1.624365482233441,
                        "f12" : 8.502538071065826,
                        "f11" : 10049.999999999807,
                        "f14" : 9.016786570743227,
                        "f13" : 7519.999999999851,
                        "f16" : 7.27011494252861,
                        "f1" : 162153,
                        "f15" : 2529.9999999999563,
                        "f2" : 834,
                        "f18" : 1919.9999999999272,
                        "f3" : -123027,
                        "f17" : 8129.99999999988,
                        "f4" : 348,
                        "f5" : 194,
                        "f19" : 6.878172588832386,
                        "f6" : 465,
                        "f7" : 2.396551724137931,
                        "f8" : 23,
                        "f9" : 13
                    },
                    "t3" : {
                        "f10" : 41,
                        "f20" : -5.2393162393161585,
                        "f12" : -4.8034188034187135,
                        "f11" : -5619.9999999998945,
                        "f14" : -3.2137518684602964,
                        "f13" : -2149.999999999938,
                        "f16" : -6.926147704590731,
                        "f1" : 81811,
                        "f15" : -3469.9999999999563,
                        "f2" : 669,
                        "f18" : -6129.999999999905,
                        "f3" : -70311,
                        "f17" : 510.0000000000109,
                        "f4" : 501,
                        "f5" : 122,
                        "f19" : 0.43589743589744523,
                        "f6" : 163,
                        "f7" : 1.3353293413173652,
                        "f8" : 29,
                        "f9" : 20
                    }
                },
                "meta" : {
                    "dates" : {
                        "t4" : "FEB16",
                        "t5" : "MAR16",
                        "t6" : "APR16",
                        "t7" : "MAY16",
                        "t0" : "OCT15",
                        "t1" : "NOV15",
                        "t2" : "DEC15",
                        "t3" : "JAN16"
                    },
                    "fields": {
                        "f10": {
                            "desc": "f10",
                            "type": "number",
                            "order" : 10
                        },
                        "f20": {
                            "desc": "f20",
                            "type": "double",
                            "order" : 20
                        },
                        "f12": {
                            "desc": "f12",
                            "type": "number",
                            "order" : 12
                        },
                        "f11": {
                            "desc": "f11",
                            "type": "double",
                            "order" : 11
                        },
                        "f14": {
                            "desc": "f14",
                            "type": "double",
                            "order" : 14
                        },
                        "f13": {
                            "desc": "f13",
                            "type": "double",
                            "order" : 13
                        },
                        "f16": {
                            "desc": "f16",
                            "type": "double",
                            "order" : 16
                        },
                        "f1": {
                            "desc": "Win",
                            "type": "number",
                            "order" : 1
                        },
                        "f15": {
                            "desc": "f15",
                            "type": "double",
                            "order" : 15
                        },
                        "f2": {
                            "desc": "WinTrds",
                            "type": "number",
                            "order" : 2
                        },
                        "f18": {
                            "desc": "f18",
                            "type": "double",
                            "order" : 18
                        },
                        "f3": {
                            "desc": "Los",
                            "type": "number",
                            "order" : 3
                        },
                        "f17": {
                            "desc": "f17",
                            "type": "double",
                            "order" : 17
                        },
                        "f4": {
                            "desc": "LosTrds",
                            "type": "number",
                            "order" : 4
                        },
                        "f5": {
                            "desc": "Win/Trd",
                            "type": "number",
                            "order" : 5
                        },
                        "f19": {
                            "desc": "f19",
                            "type": "double",
                            "order" : 19
                        },
                        "f6": {
                            "desc": "Los/Trd",
                            "type": "number",
                            "order" : 6
                        },
                        "f7": {
                            "desc": "f7",
                            "type": "double",
                            "order" : 7
                        },
                        "f8": {
                            "desc": "f8",
                            "type": "number",
                            "order" : 8
                        },
                        "f9": {
                            "desc": "f9",
                            "type": "number",
                            "order" : 9
                        }
                    }
                }
            };
        }, 100);

        //return DataService.getKeyRiskIndicatorData().then(function(response){
        //    return response.data;
        //});
    };

    var getKeyRiskIndicatorFields = function () {
        return getKeyRiskIndicatorData().then(function(response){
            return response.meta.fields;
        });

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
        getKeyRiskIndicatorData: getKeyRiskIndicatorData,
        getKeyRiskIndicatorFields: getKeyRiskIndicatorFields,
        getTickUpdatesParams: getTickUpdatesParams,
        getChannelOverviewParams: getChannelOverviewParams,
        getClientOverviewParams: getClientOverviewParams,
        getTradeHistoryParams: getTradeHistoryParams
    }

});