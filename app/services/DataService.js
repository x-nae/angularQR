app.service('DataService', function ($http, $timeout) {

    var HTTP_METHOD = {
        GET: 'GET',
        POST: 'POST'
    };

    var mock = false;

    var URL;
    if (mock) {

        URL = {
            modelDetails: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/modelDetails.jsp?',
            setModel: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/setModels.jsp?',
            contractInfo: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/contractinfo.jsp',
            isEnabled: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/isenabled.jsp',
            enable: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/isenabled.jsp',
            disable: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/isenabled.jsp',
            on: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/isenabled.jsp',
            off: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/isenabled.jsp',
            timeLeft: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/timeleft.jsp',
            getTrades: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/getTrades.jsp?',
            ticks: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/ticks.jsp?',
            tickUpdates: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/tickUpdate.jsp?',
            history: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/qr_service/history.jsp?',
            navHistory: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/mockServiceCommon/loadResponse/navHistory.jsp?',
            navLatest: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/mockServiceCommon/loadResponse/nav.jsp',
            clients: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/mockServiceCommon/loadResponse/clients',
            accountSummary: '/x-one-proxy/proxy/trade/getData/x-trading/rest/mockTrading/accountSummary',
            portfolio: '/x-one-proxy/proxy/trade/getData/x-trading/rest/mockTrading/portfolio',
            clientChannel: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/mockServiceCommon/loadResponse'
        };
    } else {
        URL = {
            modelDetails: '/x-one-proxy/proxy/qr/getData/m-x-v/json/modelDetails.jsp?',
            setModel: '/x-one-proxy/proxy/qr/getData/m-x-v/setModels.jsp?',
            contractInfo: '/x-one-proxy/proxy/qr/getData/m-x-v/json/contractinfo.jsp',
            isEnabled: '/x-one-proxy/proxy/qr/getData/m-x-v/isenabled.jsp',
            enable: '/x-one-proxy/proxy/qr/getData/m-x-v/enable.jsp',
            disable: '/x-one-proxy/proxy/qr/getData/m-x-v/disable.jsp',
            on: '/x-one-proxy/proxy/qr/getData/m-x-v/on.jsp',
            off: '/x-one-proxy/proxy/qr/getData/m-x-v/off.jsp',
            timeLeft: '/x-one-proxy/proxy/qr/getData/m-x-v/timeleft.jsp',
            getTrades: '/x-one-proxy/proxy/qr/getData/m-x-v/getTrades.jsp?',
            ticks: '/x-one-proxy/proxy/qr/getData/m-x-v/ticks.jsp?',
            tickUpdates: '/x-one-proxy/proxy/qr/getData/m-x-v/tickUpdate.jsp?',
            history: '/x-one-proxy/proxy/qr/getData/m-x-v/history.jsp?',
            navHistory: '/x-one-proxy/proxy/qr/getData/m-x-v/json/navHistory.jsp',
            navLatest: '/x-one-proxy/proxy/qr/getData/m-x-v/json/nav.jsp',
            clients: '/x-one-proxy/proxy/trade/getData/x-mock-rest-2/rest/mockServiceCommon/loadResponse/clients',
            accountSummary: '/x-one-proxy/proxy/trade/getData/x-trading/rest/mockTrading/accountSummary',
            portfolio: '/x-one-proxy/proxy/trade/getData/x-trading/rest/mockTrading/portfolio',
            clientChannel: '/x-one-proxy/proxy/qr/getData//m-x-v/json/clientModelDetails.jsp?'
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
        if(mock === true){
            return $http({
                method: HTTP_METHOD.GET,
                url: URL.navHistory
            });
        }else{
            return $http({
                method: HTTP_METHOD.GET,
                url: URL.navHistory,
                params : {client: client, periodicity : periodicity}
            });
        }

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
        //var url = mock === true ? (URL.clientChannel + '/client=' + params.client) : URL.clientChannel;
        //var urlParams = mock === true ? {} : params;
        //return $http({
        //    method: HTTP_METHOD.GET,
        //    url: url,
        //    params : urlParams
        //});
        //
        return $timeout(
            function(){
                return JSON.parse('{"clientData":[{"pairs":[],"change":273,"name":"Eis","nav":282387,"capShort":242387,"changeYear":5173,"changeMonth":-350,"capLong":262387,"changeAll":19306},{"pairs":[{"name":"CLM7_COM7","nav":126000,"channels":[{"enabled":true,"sellLimit":-790,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":18291,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_190","nav":18291,"bias":190,"ask":-820,"bid":-870,"buyLimit":-1170,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-4,"size":0,"signals":[6,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_110","nav":-28,"bias":110,"ask":-820,"bid":-870,"buyLimit":-1010,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":0,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_180","nav":0,"bias":180,"ask":-820,"bid":-870,"buyLimit":-1150,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":0,"size":0,"signals":[9,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_90","nav":0,"bias":90,"ask":-820,"bid":-870,"buyLimit":-970,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":0,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_170","nav":0,"bias":170,"ask":-820,"bid":-870,"buyLimit":-1130,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"activeLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":5,"size":0,"signals":[5,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_120","nav":162,"bias":120,"ask":-820,"bid":-870,"buyLimit":-1030,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"activeLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-14,"size":0,"signals":[4,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_60","nav":51,"bias":60,"ask":-820,"bid":-870,"buyLimit":-910,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-4,"size":0,"signals":[1,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_140","nav":763,"bias":140,"ask":-820,"bid":-870,"buyLimit":-1070,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-4,"size":0,"signals":[8,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_70","nav":-108,"bias":70,"ask":-820,"bid":-870,"buyLimit":-930,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":2,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":5,"size":0,"signals":[10,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_80","nav":-8,"bias":80,"ask":-820,"bid":-870,"buyLimit":-950,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-4,"size":0,"signals":[2,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_130","nav":342,"bias":130,"ask":-820,"bid":-870,"buyLimit":-1050,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":0,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_250","nav":0,"bias":250,"ask":-820,"bid":-870,"buyLimit":-1290,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-14,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_150","nav":803,"bias":150,"ask":-820,"bid":-870,"buyLimit":-1090,"multipleShort":0},{"sellLimit":-690,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"changeYear":0,"changeMonth":0,"startingCapital":0,"signals":[0,0,0,1],"size":0,"name":"TITTEL_CLM7_COM7_300","netchng":0,"nav":0,"bias":300,"ask":-820,"bid":-870,"multipleShort":0,"buyLimit":-1290},{"enabled":true,"sellLimit":-790,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-4,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_160","nav":622,"bias":160,"ask":-820,"bid":-870,"buyLimit":-1110,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":105000,"size":0,"signals":[7,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_100","nav":105110,"bias":100,"ask":-820,"bid":-870,"buyLimit":-990,"multipleShort":0},{"enabled":true,"sellLimit":-790,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":0,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLM7_COM7_200","nav":0,"bias":200,"ask":-820,"bid":-870,"buyLimit":-1190,"multipleShort":0}],"changeYear":2709,"changeMonth":0,"changeAll":2747,"size":17},{"name":"wCL_CO","nav":209000,"channels":[{"enabled":true,"sellLimit":-310,"multipleLong":2,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":175724,"size":0,"signals":[0,0,0,0],"netchng":0,"name":"TITTEL_wCL_CO_V","nav":173854,"bias":60,"ask":-360,"bid":-390,"buyLimit":-430,"multipleShort":0},{"enabled":true,"sellLimit":-210,"multipleLong":2,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":10,"size":0,"signals":[0,0,0,0],"netchng":0,"name":"TITTEL_wCL_CO_X","nav":1261,"bias":60,"ask":-270,"bid":-310,"buyLimit":-330,"multipleShort":0},{"enabled":true,"sellLimit":-390,"multipleLong":2,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":31079,"size":0,"signals":[0,0,0,0],"netchng":0,"name":"TITTEL_wCL_CO_U","nav":33885,"bias":60,"ask":-420,"bid":-440,"buyLimit":-510,"multipleShort":0}],"changeYear":86932,"changeMonth":0,"changeAll":2187,"size":3},{"name":"CLQ6_COQ6","nav":0,"channels":[{"enabled":true,"sellLimit":-180,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-101260,"size":0,"signals":[0,0,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_200","nav":-101260,"bias":200,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-320,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[7,10,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_130","nav":1411,"bias":130,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"sellLimit":-160,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":29935,"signals":[0,0,0,1],"size":0,"netchng":0,"name":"TITTEL_CLQ6_COQ6_300","nav":30095,"bias":300,"ask":-460,"bid":-480,"buyLimit":-760,"multipleShort":0},{"enabled":true,"sellLimit":-100,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLQ6_COQ6_250","nav":2,"bias":250,"ask":-460,"bid":-480,"buyLimit":-600,"multipleShort":0},{"enabled":true,"sellLimit":-220,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[0,0,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_180","nav":104,"bias":180,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-360,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-40013,"size":0,"signals":[10,6,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_110","nav":-39950,"bias":110,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-200,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[0,0,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_190","nav":958,"bias":190,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-260,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":29935,"size":0,"signals":[1,1,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_160","nav":29906,"bias":160,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-300,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":29935,"size":0,"signals":[4,5,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_140","nav":29525,"bias":140,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-400,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":29935,"size":0,"signals":[8,9,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_90","nav":34837,"bias":90,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-440,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[3,2,1,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_70","nav":-255,"bias":70,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-340,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":29935,"size":0,"signals":[9,7,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_120","nav":32896,"bias":120,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-380,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-18948,"size":0,"signals":[6,8,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_100","nav":-17722,"bias":100,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-240,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[0,0,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_170","nav":175,"bias":170,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-420,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-4,"size":0,"signals":[5,4,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_80","nav":-7,"bias":80,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0},{"enabled":true,"sellLimit":-440,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLQ6_COQ6_60","nav":-443,"bias":60,"ask":-460,"bid":-480,"buyLimit":-560,"multipleShort":0},{"enabled":true,"sellLimit":-280,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[2,3,0,1],"netchng":0,"name":"TITTEL_CLQ6_COQ6_150","nav":-272,"bias":150,"ask":-460,"bid":-480,"buyLimit":-580,"multipleShort":0}],"changeYear":-383634,"changeMonth":0,"changeAll":10536,"size":17},{"name":"CLZ7_COZ7","nav":125980,"channels":[{"enabled":true,"sellLimit":-1190,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2395,"size":0,"signals":[0,0,1,1],"netchng":0,"name":"TITTEL_CLZ7_COZ7_180","nav":2335,"bias":180,"ask":-1210,"bid":-1270,"buyLimit":-1550,"multipleShort":0},{"enabled":true,"sellLimit":-1200,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":39913,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_170","nav":40319,"bias":170,"ask":-1210,"bid":-1270,"buyLimit":-1540,"multipleShort":0},{"enabled":true,"sellLimit":-1200,"multipleLong":1,"change":-140,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":-140,"changeMonth":-140,"enableShort":true,"startingCapital":1,"size":-1,"signals":[7,7,1,0],"netchng":-94,"name":"TITTEL_CLZ7_COZ7_110","nav":-2308,"bias":110,"ask":-1210,"bid":-1270,"buyLimit":-1420,"multipleShort":0},{"enabled":true,"sellLimit":-1200,"multipleLong":1,"change":-140,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":-140,"changeMonth":-140,"enableShort":true,"startingCapital":51471,"size":-1,"signals":[8,8,1,0],"netchng":-135,"name":"TITTEL_CLZ7_COZ7_100","nav":52378,"bias":100,"ask":-1210,"bid":-1270,"buyLimit":-1400,"multipleShort":0},{"enabled":true,"sellLimit":-1200,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[2,2,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_60","nav":-199,"bias":60,"ask":-1210,"bid":-1270,"buyLimit":-1320,"multipleShort":0},{"enabled":true,"sellLimit":-1200,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":39913,"size":0,"signals":[6,6,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_120","nav":40666,"bias":120,"ask":-1210,"bid":-1270,"buyLimit":-1440,"multipleShort":0},{"enabled":true,"sellLimit":-1200,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_160","nav":-297,"bias":160,"ask":-1210,"bid":-1270,"buyLimit":-1520,"multipleShort":0},{"enabled":true,"sellLimit":-1150,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[0,0,0,1],"netchng":0,"name":"TITTEL_CLZ7_COZ7_200","nav":322,"bias":200,"ask":-1210,"bid":-1270,"buyLimit":-1550,"multipleShort":0},{"enabled":true,"sellLimit":-1200,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[1,1,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_150","nav":-1143,"bias":150,"ask":-1210,"bid":-1270,"buyLimit":-1500,"multipleShort":0},{"sellLimit":-690,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"changeYear":0,"changeMonth":0,"startingCapital":1,"signals":[0,0,0,1],"size":0,"name":"TITTEL_CLZ7_COZ7_300","netchng":0,"nav":-2568,"bias":300,"ask":-1210,"bid":-1270,"multipleShort":0,"buyLimit":-1290},{"enabled":true,"sellLimit":-1210,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[3,3,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_140","nav":-3355,"bias":140,"ask":-1210,"bid":-1270,"buyLimit":-1490,"multipleShort":0},{"enabled":true,"sellLimit":-1210,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"activeLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[4,4,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_70","nav":256,"bias":70,"ask":-1210,"bid":-1270,"buyLimit":-1350,"multipleShort":0},{"enabled":true,"sellLimit":-1210,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[9,9,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_80","nav":453,"bias":80,"ask":-1210,"bid":-1270,"buyLimit":-1370,"multipleShort":0},{"enabled":true,"sellLimit":-1210,"multipleLong":1,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"activeLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[5,5,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_130","nav":363,"bias":130,"ask":-1210,"bid":-1270,"buyLimit":-1470,"multipleShort":0},{"enabled":true,"sellLimit":-1210,"multipleLong":2,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[10,10,1,0],"netchng":0,"name":"TITTEL_CLZ7_COZ7_90","nav":-2012,"bias":90,"ask":-1210,"bid":-1270,"buyLimit":-1390,"multipleShort":0},{"enabled":true,"sellLimit":-1050,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[0,0,0,1],"netchng":0,"name":"TITTEL_CLZ7_COZ7_250","nav":326,"bias":250,"ask":-1210,"bid":-1270,"buyLimit":-1550,"multipleShort":0},{"enabled":true,"sellLimit":-1170,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[0,0,0,1],"netchng":0,"name":"TITTEL_CLZ7_COZ7_190","nav":444,"bias":190,"ask":-1210,"bid":-1270,"buyLimit":-1550,"multipleShort":0}],"changeYear":112028,"changeMonth":-280,"changeAll":-7725,"size":17},{"name":"CLZ6_CLZ6","nav":131873,"channels":[{"enabled":true,"sellLimit":-170,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":-30305,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_160","nav":-29922,"bias":160,"ask":-350,"bid":-380,"buyLimit":-490,"multipleShort":0},{"enabled":true,"sellLimit":-170,"multipleLong":0,"change":20,"runScript":true,"pctchng":4,"enableLong":true,"activeLong":true,"changeYear":20,"changeMonth":20,"enableShort":true,"startingCapital":2,"size":-1,"signals":[2,2,1,0],"netchng":25,"name":"TITTEL_CLZ6_CLZ6_140","nav":789,"bias":140,"ask":-350,"bid":-380,"buyLimit":-450,"multipleShort":0},{"enabled":true,"sellLimit":-190,"multipleLong":0,"change":111,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":111,"changeMonth":111,"enableShort":true,"activeShort":true,"startingCapital":2,"size":0,"signals":[5,5,0,1],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_120","nav":725,"bias":120,"ask":-350,"bid":-380,"buyLimit":-430,"multipleShort":1},{"sellLimit":-170,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"changeYear":0,"changeMonth":0,"startingCapital":2,"signals":[0,0,0,1],"size":0,"name":"TITTEL_CLZ6_CLZ6_300","netchng":0,"nav":2,"bias":300,"ask":-350,"bid":-380,"multipleShort":0,"buyLimit":-770},{"enabled":true,"sellLimit":-180,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_180","nav":2,"bias":180,"ask":-350,"bid":-380,"buyLimit":-540,"multipleShort":0},{"enabled":true,"sellLimit":-250,"multipleLong":0,"change":-20,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":-20,"changeMonth":-20,"enableShort":true,"startingCapital":29935,"size":1,"signals":[10,10,0,1],"netchng":-15,"name":"TITTEL_CLZ6_CLZ6_90","nav":40591,"bias":90,"ask":-350,"bid":-380,"buyLimit":-430,"multipleShort":2},{"enabled":true,"sellLimit":-120,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":29935,"size":0,"signals":[0,0,0,1],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_250","nav":27685,"bias":250,"ask":-350,"bid":-380,"buyLimit":-620,"multipleShort":0},{"enabled":true,"sellLimit":-270,"multipleLong":0,"change":76,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":76,"changeMonth":76,"enableShort":true,"startingCapital":-4,"size":0,"signals":[9,9,0,1],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_80","nav":-911,"bias":80,"ask":-350,"bid":-380,"buyLimit":-430,"multipleShort":1},{"enabled":true,"sellLimit":-180,"multipleLong":1,"change":85,"runScript":true,"pctchng":4,"enableLong":true,"activeLong":true,"changeYear":85,"changeMonth":85,"enableShort":true,"startingCapital":29935,"size":0,"signals":[4,4,1,0],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_130","nav":30481,"bias":130,"ask":-350,"bid":-380,"buyLimit":-440,"multipleShort":0},{"enabled":true,"sellLimit":-180,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_170","nav":303,"bias":170,"ask":-350,"bid":-380,"buyLimit":-520,"multipleShort":0},{"enabled":true,"sellLimit":-310,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[3,3,0,1],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_60","nav":671,"bias":60,"ask":-350,"bid":-380,"buyLimit":-430,"multipleShort":0},{"enabled":true,"sellLimit":-170,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_190","nav":2,"bias":190,"ask":-350,"bid":-380,"buyLimit":-550,"multipleShort":0},{"enabled":true,"sellLimit":-290,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":1,"size":0,"signals":[7,7,0,1],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_70","nav":877,"bias":70,"ask":-350,"bid":-380,"buyLimit":-430,"multipleShort":1},{"enabled":true,"sellLimit":-170,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[0,0,1,0],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_200","nav":2,"bias":200,"ask":-350,"bid":-380,"buyLimit":-570,"multipleShort":0},{"enabled":true,"sellLimit":-210,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":2,"size":0,"signals":[6,6,0,1],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_110","nav":142,"bias":110,"ask":-350,"bid":-380,"buyLimit":-430,"multipleShort":1},{"enabled":true,"sellLimit":-230,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":26174,"size":0,"signals":[8,8,0,1],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_100","nav":30642,"bias":100,"ask":-350,"bid":-380,"buyLimit":-430,"multipleShort":1},{"enabled":true,"sellLimit":-170,"multipleLong":0,"change":0,"runScript":true,"pctchng":4,"enableLong":true,"changeYear":0,"changeMonth":0,"enableShort":true,"startingCapital":29935,"size":0,"signals":[1,1,1,0],"netchng":0,"name":"TITTEL_CLZ6_CLZ6_150","nav":29792,"bias":150,"ask":-350,"bid":-380,"buyLimit":-470,"multipleShort":0}],"changeYear":195874,"changeMonth":272,"changeAll":16250,"size":17}],"change":189,"name":"TITTEL","nav":592853,"capShort":532853,"changeYear":13909,"changeMonth":-8,"capLong":572853,"changeAll":23995},{"pairs":[],"change":0,"name":"welzel","nav":108978,"capShort":108978,"changeYear":3246,"changeMonth":0,"capLong":108978,"changeAll":9596},{"pairs":[],"change":0,"name":"infinity","nav":109295,"capShort":109295,"changeYear":3552,"changeMonth":0,"capLong":109295,"changeAll":6066},{"pairs":[],"change":0,"name":"Maelzer","nav":136582,"capShort":136582,"changeYear":3094,"changeMonth":0,"capLong":136582,"changeAll":8546},{"pairs":[],"change":243,"name":"Morsch","nav":431050,"capShort":351050,"changeYear":60792,"changeMonth":-135,"capLong":411050,"changeAll":35264},{"pairs":[],"change":142,"name":"hatz","nav":315726,"capShort":235726,"changeYear":7491,"changeMonth":-133,"capLong":295726,"changeAll":25703},{"pairs":[],"change":0,"name":"krause","nav":110984,"capShort":110984,"changeYear":-20516,"changeMonth":0,"capLong":110984,"changeAll":10048},{"pairs":[],"change":186,"name":"brandis","nav":342416,"capShort":282416,"changeYear":3550,"changeMonth":-193,"capLong":322416,"changeAll":19020},{"pairs":[],"change":0,"name":"stephan","nav":117076,"capShort":117076,"changeYear":5062,"changeMonth":0,"capLong":117076,"changeAll":8831},{"pairs":[],"change":110,"name":"Boeck","nav":169833,"capShort":149833,"changeYear":6348,"changeMonth":-170,"capLong":149833,"changeAll":8693},{"pairs":[],"change":0,"name":"Schmid","nav":1077,"capShort":1077,"changeYear":0,"changeMonth":0,"capLong":1077,"changeAll":0},{"pairs":[],"change":0,"name":"Schomann","nav":137273,"capShort":137273,"changeYear":3774,"changeMonth":0,"capLong":137273,"changeAll":11053},{"pairs":[],"change":70,"name":"U1661094","nav":9790,"capShort":9790,"changeYear":-210,"changeMonth":70,"capLong":1790,"changeAll":-210},{"pairs":[],"change":100,"name":"Global","nav":177048,"capShort":157048,"changeYear":6177,"changeMonth":-200,"capLong":157048,"changeAll":20513},{"pairs":[],"change":0,"name":"VIX","nav":100000,"capShort":100000,"changeYear":0,"changeMonth":0,"capLong":100000,"changeAll":0},{"pairs":[],"change":0,"name":"FRONT","nav":1,"capShort":1,"changeYear":0,"changeMonth":0,"capLong":1,"changeAll":0},{"pairs":[],"change":121,"name":"heim","nav":343300,"capShort":283300,"changeYear":2999,"changeMonth":-139,"capLong":303300,"changeAll":19774},{"pairs":[],"change":0,"name":"kiessling","nav":110657,"capShort":110657,"changeYear":4169,"changeMonth":0,"capLong":110657,"changeAll":10735},{"pairs":[],"change":0,"name":"Rittau","nav":111269,"capShort":111269,"changeYear":4527,"changeMonth":0,"capLong":111269,"changeAll":7249},{"pairs":[],"change":114,"name":"Lutz","nav":282086,"capShort":262086,"changeYear":4879,"changeMonth":-175,"capLong":242086,"changeAll":10075},{"pairs":[],"change":0,"name":"Franz","nav":117161,"capShort":117161,"changeYear":3964,"changeMonth":0,"capLong":117161,"changeAll":8641},{"pairs":[],"change":0,"name":"notebook","nav":110710,"capShort":110710,"changeYear":3863,"changeMonth":0,"capLong":110710,"changeAll":8168},{"pairs":[],"change":-25,"name":"Niethammer","nav":140564,"capShort":140564,"changeYear":2741,"changeMonth":-50,"capLong":120564,"changeAll":9503},{"pairs":[],"change":105,"name":"hoeger","nav":205857,"capShort":185857,"changeYear":7684,"changeMonth":-210,"capLong":165857,"changeAll":-1580},{"pairs":[],"change":177,"name":"vtc","nav":348259,"capShort":288259,"changeYear":4694,"changeMonth":-185,"capLong":328259,"changeAll":19442},{"pairs":[],"change":0,"name":"Kurt","nav":115864,"capShort":115864,"changeYear":3865,"changeMonth":0,"capLong":115864,"changeAll":3766},{"pairs":[],"change":138,"name":"weimer","nav":348764,"capShort":268764,"changeYear":4846,"changeMonth":-194,"capLong":308764,"changeAll":21945},{"pairs":[],"change":0,"name":"Boeckle","nav":114882,"capShort":114882,"changeYear":3972,"changeMonth":0,"capLong":114882,"changeAll":8471}]}');
            }, 100);
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

