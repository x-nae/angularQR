app.directive("accountSummary", [ function() {

    var controller = function ($scope, $rootScope, $element, $attrs, $log, TradeService, NotificationService) {
        $scope.portfolios = [];

        $scope.portfolioObj = undefined;

        var dataType = NotificationService.dataServiceTypes.ACCOUNT_SUMMARY, listener, channel;

        this.onWidgetLoad = function () {
            if(angular.isUndefined($scope.widgetId)){
                $scope.widgetId = 'qrAccountSummary';
            }
            if(angular.isUndefined($scope.portfolio)){
                $scope.portfolio = 'TITTEL';
            }
            console.info('qrAccountSummary => onWidgetLoad Triggered');
            initWidget();
        };

        var initWidget = function(){
            TradeService.getTradeAccounts()
                .then(setPortfolios)
                .then(function () {
                    subscribe($scope.portfolioObj);
                });
            initAccountSummaryData();
            var tElem = $element.find("div[rel='table']");
            tElem.attr('id', $scope.widgetId + '_table');
        };

        var setPortfolios = function(portfolioMap){
            for(var portfolio in portfolioMap){
                if(portfolioMap.hasOwnProperty(portfolio)){
                    var account = portfolioMap[portfolio];
                    var obj = {key : portfolio, account : account};
                    if(angular.isUndefined($scope.portfolio)){
                        $scope.portfolioObj = obj;
                    }else{
                        if(portfolio === $scope.portfolio){
                            $scope.portfolioObj = obj;
                        }
                    }
                    $scope.portfolios.push(obj);
                }
            }
        };

        var updateAccountSummaryOnSuccess = function(data){
            if(data){
                angular.forEach(data, function(value, index) {
                    $scope.data.currency = value.currency;
                    setBalances(value);
                    setRequirements(value);
                    setTrading(value);
                });
            }
        };

        var setBalances = function(data){
            $scope.data.netLiquidation = data.netLiquidation;
            $scope.data.totalCashValue = data.totalCashValue;
            $scope.data.settledCash = data.settledCash;
            $scope.data.accruedCash = data.accruedCash;
            $scope.data.buyingPower = data.buyingPower;
            $scope.data.equityWithLoanValue = data.equityWithLoanValue;
            $scope.data.previousEquityWithLoanValue = data.previousEquityWithLoanValue;
            $scope.data.grossPositionValue = data.grossPositionValue;

            setSpanColor(data.netLiquidation, 'qras_netLiquidation');
            setSpanColor(data.totalCashValue, 'qras_totalCashValue');
            setSpanColor(data.settledCash, 'qras_settledCash');
            setSpanColor(data.accruedCash, 'qras_accruedCash');
            setSpanColor(data.buyingPower, 'qras_buyingPower');
            setSpanColor(data.equityWithLoanValue, 'qras_equityWithLoanValue');
            setSpanColor(data.previousEquityWithLoanValue, 'qras_previousEquityWithLoanValue');
            setSpanColor(data.grossPositionValue, 'qras_grossPositionValue');
        };

        var setRequirements = function(data){
            $scope.data.initMarginReq = data.initMarginReq;
            $scope.data.maintMarginReq = data.maintMarginReq;
            $scope.data.fullInitMarginReq = data.fullInitMarginReq;
            $scope.data.fullMaintMarginReq = data.fullMaintMarginReq;

            setSpanColor(data.initMarginReq, 'qras_initMarginReq');
            setSpanColor(data.maintMarginReq, 'qras_maintMarginReq');
            setSpanColor(data.fullInitMarginReq, 'qras_fullInitMarginReq');
            setSpanColor(data.fullMaintMarginReq, 'qras_fullMaintMarginReq');
        };

        var setTrading = function(data){
            $scope.data.availableFunds = data.availableFunds;
            $scope.data.excessLiquidity = data.excessLiquidity;
            $scope.data.fullAvailableFunds = data.fullAvailableFunds;
            $scope.data.fullExcessLiquidity = data.fullExcessLiquidity;

            setSpanColor(data.availableFunds, 'qras_availableFunds');
            setSpanColor(data.excessLiquidity, 'qras_excessLiquidity');
            setSpanColor(data.fullAvailableFunds, 'qras_fullAvailableFunds');
            setSpanColor(data.fullExcessLiquidity, 'qras_fullExcessLiquidity');
        };

        var setSpanColor = function(number, spanId){
            var span = $element.find('span#' + spanId);
            if(number > 0){
                span.removeClass('TX-RED');
                span.removeClass('TX-GREEN');
                span.addClass('TX-GREEN');
            }else if(number < 0){
                span.removeClass('TX-RED');
                span.removeClass('TX-GREEN');
                span.addClass('TX-RED');
            }
        };

        var formatNumbers = function(number, decimalPoints){
            return number; //todo ::
        };

        var enableDisablePortfolio = function(enable){
            var main = $element.find("select[name='mainPortfolioChooser']");
            if(enable){
                main.prop("disabled", false);
            }else{
                main.prop("disabled", true);
            }
        };

        var initAccountSummaryData = function(){
            $scope.data = {
                netLiquidation : '--',
                totalCashValue : '--',
                settledCash : '--',
                accruedCash : '--',
                buyingPower : '--',
                equityWithLoanValue : '--',
                previousEquityWithLoanValue : '--',
                grossPositionValue : '--',
                initMarginReq : '--',
                maintMarginReq : '--',
                fullInitMarginReq : '--',
                fullMaintMarginReq : '--',
                availableFunds : '--',
                excessLiquidity : '--',
                fullAvailableFunds : '--',
                fullExcessLiquidity : '--'
            };
        };

        $scope.$watch("portfolioObj",
            // This is the change listener, called when the value returned from the above function changes
            function (newValue, oldValue) {
                if(newValue && newValue != oldValue){
                    unSubscribe();
                    subscribe(newValue);
                }
            }
        );

        var subscribe = function(portfolio) {
            if(portfolio){
                channel = NotificationService.subscribe(dataType, TradeService.getAccountSummaryParams(portfolio.account));
                listener = $rootScope.$on(channel, function(event, data){
                    updateAccountSummaryOnSuccess(data);
                });
            }
        };

        var unSubscribe = function(){
            if (listener) {
                listener();
            }
            if(channel){
                NotificationService.unSubscribe(channel);
            }
        };

        this.onResize = function(width, height){
            $log.debug('qrAccountSummary => resizing width : ' + width + ", height : " + height);
        };

        this.onDestroy = function(){
            $log.info('qrAccountSummary => destroying..');
            unSubscribe();
        };

    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/accountSummary/accountSummary.html",
        link : function(scope, element, attrs, ctrl) {
            if(ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }

            // When the DOM element is removed from the page,
            // AngularJS will trigger the $destroy event on
            // the scope. This gives us a chance to cancel any
            // pending timer that we may have.
            element.on('$destroy', function(){
                console.log('destroying qrAccountSummary....');
                ctrl.onDestroy();
            });

        }
    }
}]);
