app.service('DataService', function ($http) {

    var HTTP_METHOD = {
        GET: 'GET',
        POST: 'POST'
    };

    var mock = true;

    var URL;
    if (mock) {

        URL = {
            modelDetails: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/modelDetails.jsp',
            setModel: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/setModels.jsp',
            contractInfo: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/contractinfo.jsp',
            isEnabled: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/isenabled.jsp',
            enable: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/isenabled.jsp',
            disable: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/isenabled.jsp',
            on: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/isenabled.jsp',
            off: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/isenabled.jsp',
            timeLeft: '/x-one-proxy/proxy/trade/getData/x-mock/rest/mockServiceCommon/loadResponse/timeleft',
            getTrades: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/getTrades.jsp',
            ticks: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/ticks.jsp',
            tickUpdates: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/tickUpdate.jsp',
            history: '/x-one-proxy/proxy/trade/getData/x-mock/rest/qr_service/history.jsp',
            navHistory: '/x-one-proxy/proxy/trade/getData/x-mock/rest/mockServiceCommon/loadResponse/navHistory',
            navLatest: '/x-one-proxy/proxy/trade/getData/x-mock/rest/mockServiceCommon/loadResponse/nav.jsp',
            clients: '/x-one-proxy/proxy/trade/getData/x-mock/rest/mockServiceCommon/loadResponse/clients',
            accountSummary: '/x-one-proxy/proxy/trade/getData/x-trading/rest/mockTrading/accountSummary',
            portfolio: '/x-one-proxy/proxy/trade/getData/x-trading/rest/mockTrading/portfolio',
            clientChannel: '/x-one-proxy/proxy/trade/getData/x-mock/rest/mockServiceCommon/loadResponse/clientModelDetails',
            channelAnalyzer : '/x-one-proxy/proxy/trade/getData/x-mock/rest/mockServiceCommon/loadResponse/channelAnalyzer'
        };
    } else {
        URL = {
            modelDetails: '/x-one-proxy/proxy/qr/getData/m-x-v/json/modelDetails.jsp',
            setModel: '/x-one-proxy/proxy/qr/getData/m-x-v/setModels.jsp',
            contractInfo: '/x-one-proxy/proxy/qr/getData/m-x-v/json/contractinfo.jsp',
            isEnabled: '/x-one-proxy/proxy/qr/getData/m-x-v/isenabled.jsp',
            enable: '/x-one-proxy/proxy/qr/getData/m-x-v/enable.jsp',
            disable: '/x-one-proxy/proxy/qr/getData/m-x-v/disable.jsp',
            on: '/x-one-proxy/proxy/qr/getData/m-x-v/on.jsp',
            off: '/x-one-proxy/proxy/qr/getData/m-x-v/off.jsp',
            timeLeft: '/x-one-proxy/proxy/qr/getData/m-x-v/timeleft.jsp',
            getTrades: '/x-one-proxy/proxy/qr/getData/m-x-v/getTrades.jsp',
            ticks: '/x-one-proxy/proxy/qr/getData/m-x-v/ticks.jsp',
            tickUpdates: '/x-one-proxy/proxy/qr/getData/m-x-v/tickUpdate.jsp',
            history: '/x-one-proxy/proxy/qr/getData/m-x-v/history.jsp',
            navHistory: '/x-one-proxy/proxy/qr/getData/m-x-v/json/navHistory.jsp',
            navLatest: '/x-one-proxy/proxy/qr/getData/m-x-v/json/nav.jsp',
            clients: '/x-one-proxy/proxy/trade/getData/x-mock/rest/mockServiceCommon/loadResponse/clients',
            accountSummary: '/x-one-proxy/proxy/trade/getData/x-trading/rest/mockTrading/accountSummary',
            portfolio: '/x-one-proxy/proxy/trade/getData/x-trading/rest/mockTrading/portfolio',
            clientChannel: '/x-one-proxy/proxy/qr/getData//m-x-v/json/clientModelDetails.jsp',
            channelAnalyzer : '/x-one-proxy/proxy/trade/getData/x-mock/rest/mockServiceCommon/loadResponse/channelAnalyzer'
        };
    }

    var clients;

    //region channel/client overview urls

    this.switchModel = function (model, enable) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.setModel,
            params : {model: model, enabled: enable}
        });
    };

    this.switchLong = function (model, enable) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.setModel,
            params : {model: model, enableLong: enable}
        });
    };

    this.switchShort = function (model, enable) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.setModel,
            params : {model: model, enableShort: enable}
        });
    };

    this.switchRunScript = function (model, enable) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.setModel,
            params : {model: model, runScript: enable}
        });
    };

    //endregion

    //region admin

    this.enableService = function () {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.enable
        });
    };

    this.disableService = function () {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.disable
        });
    };

    this.switchOnService = function () {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.on
        });
    };

    this.switchOffService = function () {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.off
        });
    };

    //endregion

    //region advanced chart

    this.getHistory = function (model) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.history,
            params : {model: model}
        });
    };

    //endregion

    //region small chart

    this.getTicks = function (model) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.ticks,
            params : {model: model}
        });
    };

    //endregion

    //region aggregated/nav chart

    this.getNAVHistory = function (client, periodicity) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.navHistory,
            params : {'client': client, 'periodicity' : periodicity}
        });
    };

    //endregion

    //region channel analyzer

    this.getChannelAnalyzerData = function(filter, categories, startDate, endDate){
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.navHistory,
            params : {filter: filter, categories : categories, startDate : startDate, endDate : endDate}
        });
    };

    //endregion

    //region notification urls

    /**
     * dataServiceTypes.TIME_LEFT
     * @param params
     * @returns {*}
     */
    this.getTimeLeft = function (params) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.timeLeft
        });
    };

    /**
     * dataServiceTypes.ACCOUNT_SUMMARY
     * @param params
     * @returns {*}
     */
    this.getAccountSummary = function (params) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.accountSummary + '/' + params
        });
    };

    /**
     * dataServiceTypes.HOLDINGS
     * @param params
     * @returns {*}
     */
    this.getPortfolioData = function (params) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.portfolio + '/' + params
        });
    };

    /**
     * dataServiceTypes.LATEST_NAV
     * @param params
     * @returns {*}
     */
    this.getLatestNAV = function (params) {
        if(mock === true){
            return $http({
                method: HTTP_METHOD.GET,
                url: URL.navLatest
            });
        }else{
            return $http({
                method: HTTP_METHOD.GET,
                url: URL.navLatest,
                params : params
            });
        }

    };

    /**
     * dataServiceTypes.TICK_UPDATES
     * @param params
     * @returns {*}
     */
    this.getTickUpdates = function (params) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.tickUpdates,
            params : params
        });
    };

    /**
     * dataServiceTypes.CLIENT_CHANNELS
     * @param params
     * @returns {*}
     */
    this.getClientChannels = function (params) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.clientChannel,
            params : params
        });
    };

    /**
     * dataServiceTypes.CHANNELS
     * @param params
     * @returns {*}
     */
    this.getModels = function (params) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.modelDetails,
            params : params
        });
    };

    /**
     * dataServiceTypes.CONTRACT_INFO
     * @param params
     * @returns {*}
     */
    this.getContractInfo = function (params) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.contractInfo
        });
    };

    /**
     * dataServiceTypes.IS_SERVICE_ENABLED
     * @param params
     * @returns {*}
     */
    this.isServiceEnabled = function (params) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.isEnabled
        });
    };

    /**
     * dataServiceTypes.TRADE_HISTORY
     * @param params
     * @returns {*}
     */
    this.getTrades = function (params) {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.getTrades,
            params : params
        });
    };

    //endregion

    this.getMetaData = function () {
        return $http({
            method: HTTP_METHOD.GET,
            url: URL.clients
        });
    };

});

