app.factory('TradeService', function (DataService, $q) {

    var tradeAccounts = undefined;

    var getTradeAccounts = function () {
        if (angular.isUndefined(tradeAccounts)) {
            return DataService.getMetaData().then(function (response) {
                tradeAccounts = {};
                angular.forEach(response.data.clients, function (value, key) {
                    tradeAccounts[value.name] = angular.isUndefined(value.account) ? value.name : value.account;
                });
                return $q.when(tradeAccounts);
            }).catch(function (response) {
                return $q.reject(response);
            });
        } else {
            return $q.when(tradeAccounts);
        }
    };

    var getPortfolioParams = function (portfolio) {
        return portfolio;
    };

    var getAccountSummaryParams = function (account) {
        return account;
    };

    return {
        getTradeAccounts : getTradeAccounts,
        getPortfolioParams: getPortfolioParams,
        getAccountSummaryParams : getAccountSummaryParams
    }

});