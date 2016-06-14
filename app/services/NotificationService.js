app.factory('NotificationService', function (DataService, $rootScope, $q, $timeout) {

    var subscriptions = {};

    var dataServiceTypes = {
        LATEST_NAV: 'ln',
        NAV_UPDATES: 'nu',
        TICKS: 't',
        TICK_UPDATES: 'tu',
        ACCOUNT_SUMMARY: 'as',
        HOLDINGS: 'h',
        TIME_LEFT : 'tl',
        IS_SERVICE_ENABLED : 'ise',
        CHANNELS : 'c',
        TRADE_HISTORY : 'th',
        CONTRACT_INFO : 'ci',
        CLIENT_CHANNELS : 'cc'
    };

    var dataUpdateFrequency = {
        ln: 10000,
        nu: 10000,
        t: 10000,
        tu: 10000,
        as: 30000,
        h: 30000,
        tl : 10000,
        ise : 10000,
        c : 10000,
        th : 10000,
        ci : 10000,
        cc : 10000
    };

    var getDataPromiseByType = function(type, key){
        switch (type) {
            case dataServiceTypes.LATEST_NAV:
                return DataService.getLatestNAV(key);
            case dataServiceTypes.TICK_UPDATES:
                return DataService.getTickUpdates(key);
            case dataServiceTypes.ACCOUNT_SUMMARY:
                return DataService.getAccountSummary(key);
            case dataServiceTypes.HOLDINGS:
                return DataService.getPortfolioData(key);
            case dataServiceTypes.TIME_LEFT:
                return DataService.getTimeLeft(key);
            case dataServiceTypes.IS_SERVICE_ENABLED:
                return DataService.isServiceEnabled(key);
            case dataServiceTypes.CHANNELS:
                return DataService.getModels(key);
            case dataServiceTypes.TRADE_HISTORY:
                return DataService.getTrades(key);
            case dataServiceTypes.CONTRACT_INFO:
                return DataService.getContractInfo(key);
            case dataServiceTypes.CLIENT_CHANNELS:
                return DataService.getClientChannels(key);
            default:
                break;
        }
    };

    var updateData = function (type) {
        var promises = [];
        angular.forEach(subscriptions[type].keys, function (key, index) {
            promises.push(getDataPromiseByType(type, JSON.parse(key)));
        });
        $q.all(promises).then(function (responseArray) {
            angular.forEach(responseArray, function (response, index) {
                var data;
                if(type === dataServiceTypes.CLIENT_CHANNELS){
                    data = response;
                }else{
                    data = response.data;
                }
                var channel = getSubscriptionChannel(type, subscriptions[type].keys[index]);
                subscriptions[type].data[channel] = data;
                emitData(channel, data);
            });
        }).finally(function () {
            subscriptions[type].timer = $timeout(function () {
                updateData(type);
            }, dataUpdateFrequency[type]);
        });
    };

    var emitData = function (channel, data) {
        $rootScope.$emit(channel, data);
    };

    var getSubscriptionChannel = function (type, key) {
        return type + '|' + key;
    };

    var getTypeFromChannel = function (channel, key) {
        return channel.substring(0, channel.indexOf('|' + key));
    };

    var subscribe = function (type, key) {
        var stringifiedKey = JSON.stringify(key);
        var channel = getSubscriptionChannel(type, stringifiedKey);
        if (angular.isUndefined(subscriptions[type])) {//if no subscriptions for this type
            subscriptions[type] = {
                keys: [],
                listeners: {},
                data: {}
            };
            subscriptions[type].keys.push(stringifiedKey);
            subscriptions[type].listeners[stringifiedKey] = 1;
            updateData(type);
        } else {
            var index = subscriptions[type].keys.indexOf(stringifiedKey);
            if (index === -1) {
                subscriptions[type].keys.push(stringifiedKey);
                subscriptions[type].listeners[stringifiedKey] = 1;
                $timeout.cancel(subscriptions[stringifiedKey].timer);
                updateData(type);
            } else {
                subscriptions[type].listeners[stringifiedKey]++;
                emitData(channel, subscriptions[type].data[channel]);
            }
        }
        return channel;
    };

    var unSubscribe = function (channel, key) {
        var stringifiedKey = JSON.stringify(key);
        var type = getTypeFromChannel(channel, stringifiedKey);
        if (subscriptions[type]) {
            if (subscriptions[type].listeners[stringifiedKey] === 1) {
                var index = subscriptions[type].keys.indexOf(stringifiedKey);
                subscriptions[type].keys.splice(index, 1);
            }
            subscriptions[type].listeners[stringifiedKey]--;
            if (subscriptions[type].keys.length === 0) {
                $timeout.cancel(subscriptions[type].timer);
                subscriptions[type] = undefined;
            }
        }
    };

    return {
        subscribe: subscribe,
        unSubscribe: unSubscribe,
        dataServiceTypes: dataServiceTypes
    };

});
