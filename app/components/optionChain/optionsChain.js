app.directive('optionsChainN', [function () {

    var controller = ['$scope', '$element', '$timeout', '$log', 'optionSymbolService', 'optionTradeService',

        function ($scope, $element, $timeout, $log, optionSymbolService, optionTradeService) {

            $scope.optionMap = {};

            this.onWidgetLoad = function () {
                if (angular.isUndefined($scope.widgetId)) {
                    $scope.widgetId = 'option-chain';
                }
                if (angular.isUndefined($scope.symbol)) {
                    $scope.symbol = 'SPDR S&P 500';
                }
                $log.info('option-chain with id : ' + $scope.widgetId + ' onWidgetLoad symbol : ' + $scope.symbol);
                optionSymbolService.getOptions($scope.symbol).then(function (optionSymbols) {
                    $scope.expiryDates = [];
                    $scope.strikePrices = [];
                    angular.forEach(optionSymbols, function (value) {
                        if (angular.isUndefined($scope.optionMap[value.name])) {
                            $scope.optionMap[value.name] = {};
                            $scope.expiryDates.push({
                                name: value.name,
                                daysToExpire: getDateDifferenceInDays(new Date(), new Date(value.expiryDate))
                            })
                        }
                        $scope.optionMap[value.name][value.strikePrice] = value;
                        if ($scope.strikePrices.indexOf(value.strikePrice) === -1) {
                            $scope.strikePrices.push(value.strikePrice);
                        }
                    });
                }).finally(function () {
                    $timeout(function () {
                        $scope.$digest();
                        //$scope.initializeTable();
                    }, 0);
                });
            };

            this.onResize = function () {
                $log.info('option-chain with id : ' + $scope.widgetId + ' : onResize()');
                $scope.initializeTable();
            };

            this.onFullScreen = function () {
                $log.info('option-chain with id : ' + $scope.widgetId + ' : onFullScreen()');
                $scope.initializeTable();
            };

            this.onDestroy = function () {
                $log.info('option-chain with id : ' + $scope.widgetId + ' : onDestroy()');
                $scope.$destroy();
            };

            var _MS_PER_DAY = 1000 * 60 * 60 * 24;

            /**
             * get difference in days
             * @param a
             * @param b
             * @returns {number}
             */
            var getDateDifferenceInDays = function (a, b) {
                var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

                return Math.floor((utc2 - utc1) / _MS_PER_DAY);
            };

            /**
             * show trades using service
             */
            $scope.showTrades = function () {
                var orders = optionTradeService.getOrders();
                $log.debug('option-chain with id : ' + $scope.widgetId + ' : showTrades() orders => ' + JSON.stringify(orders));
            };

        }
    ];

    return {
        controller: controller,
        templateUrl: "app/components/optionChain/optionsChain.html",
        link: function (scope, element, attrs, ctrl) {
            element.on('$destroy', function () {
                ctrl.onDestroy();
            });

            if (ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }
        }
    }
}]);
