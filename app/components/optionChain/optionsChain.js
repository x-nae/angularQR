app.directive('optionsChainN', [function () {

    var controller = ['$scope', '$element', '$timeout', '$log', 'optionSymbolService', 'optionTradeService',

        function ($scope, $element, $timeout, $log, optionSymbolService, optionTradeService) {

            var STRATEGY_MAP = {
                longStrangle: 'longStrangle',
                shortStrangle: 'shortStrangle',
                condor: 'condor',
                ironCondor: 'ironCondor',
                reverseIronCondor: 'reverseIronCondor',
                shortCondor: 'shortCondor',
                butterflySpread: 'butterflySpread',
                ironButterfly: 'ironButterfly',
                longPutButterfly: 'longPutButterfly',
                shortPutButterfly: 'shortPutButterfly',
                shortButterfly: 'shortButterfly',
                reverseIronButterfly: 'reverseIronButterfly',
                ratioSpread: 'ratioSpread',
                putRatioSpread: 'putRatioSpread',
                ratioPutWrite: 'ratioPutWrite',
                ratioCallWrite: 'ratioCallWrite',
                variableRatioWrite: 'variableRatioWrite',
                shortStraddle: 'shortStraddle',
                longGuts: 'longGuts',
                shortGuts: 'shortGuts',
                longCallLadder: 'longCallLadder',
                shortCallLadder: 'shortCallLadder',
                longPutLadder: 'longPutLadder',
                shortPutLadder: 'shortPutLadder'
            };

            $scope.strategies = {
                strangle: {
                    name: 'Strangle',
                    def: 'long',
                    sub: {
                        long: {
                            name: 'Long',
                            key: STRATEGY_MAP.longStrangle
                        },
                        short: {
                            name: 'Short',
                            key: STRATEGY_MAP.shortStrangle
                        }
                    }
                },
                condor: {
                    name: 'Condor',
                    def: 'condor',
                    sub: {
                        condor: {
                            name: 'Condor',
                            key: STRATEGY_MAP.condor
                        },
                        ironCondor: {
                            name: 'Iron',
                            key: STRATEGY_MAP.ironCondor
                        },
                        reverseIronCondor: {
                            name: 'Reverse Iron',
                            key: STRATEGY_MAP.reverseIronCondor
                        },
                        shortCondor: {
                            name: 'Short',
                            key: STRATEGY_MAP.shortCondor
                        }
                    }
                },
                butterfly: {
                    name: 'Butterfly',
                    def: 'spread',
                    sub: {
                        spread: {
                            name: 'Spread',
                            key: STRATEGY_MAP.butterflySpread
                        },
                        iron: {
                            name: 'Iron',
                            key: STRATEGY_MAP.ironButterfly
                        },
                        longPut: {
                            name: 'Long Put',
                            key: STRATEGY_MAP.longPutButterfly
                        },
                        shortPut: {
                            name: 'Short Put',
                            key: STRATEGY_MAP.shortPutButterfly
                        },
                        short: {
                            name: 'Short',
                            key: STRATEGY_MAP.shortButterfly
                        },
                        reverseIron: {
                            name: 'Reverse Iron',
                            key: STRATEGY_MAP.reverseIronButterfly
                        }
                    }
                },
                ratio: {
                    name: 'Ratio',
                    def: 'spread',
                    sub: {
                        spread: {
                            name: 'Spread',
                            key: STRATEGY_MAP.ratioSpread
                        },
                        putSpread: {
                            name: 'Put Spread',
                            key: STRATEGY_MAP.putRatioSpread
                        },
                        putWrite: {
                            name: 'Put Write',
                            key: STRATEGY_MAP.ratioPutWrite
                        },
                        callWrite: {
                            name: 'Call Write',
                            key: STRATEGY_MAP.ratioCallWrite
                        },
                        variableWrite: {
                            name: 'Variable Write',
                            key: STRATEGY_MAP.variableRatioWrite
                        }
                    }
                },
                straddle: {
                    name: 'Straddle',
                    def: 'short',
                    sub: {
                        short: {
                            name: 'Short',
                            key: STRATEGY_MAP.shortStraddle
                        }
                    }
                },
                guts: {
                    name: 'Guts',
                    def: 'long',
                    sub: {
                        long: {
                            name: 'Long',
                            key: STRATEGY_MAP.longGuts
                        },
                        short: {
                            name: 'Short',
                            key: STRATEGY_MAP.shortGuts
                        }
                    }
                },
                ladder: {
                    name: 'Ladder',
                    def: 'longCall',
                    sub: {
                        longCall: {
                            name: 'Long Call',
                            key: STRATEGY_MAP.longCallLadder
                        },
                        shortCall: {
                            name: 'Short Call',
                            key: STRATEGY_MAP.shortCallLadder
                        },
                        longPut: {
                            name: 'Long Put',
                            key: STRATEGY_MAP.longPutLadder
                        },
                        shortPut: {
                            name: 'Short Put',
                            key: STRATEGY_MAP.shortPutLadder
                        }
                    }
                }
            };

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
             * show strategy box
             */
            $scope.showStrategies = function () {
                $element.find('div[name="strategyBox"]').show();
            };

            /**
             * on click event for strategy
             * @param key
             */
            $scope.setStrategy = function (key) {
                $log.debug('option-chain with id : ' + $scope.widgetId + ' : setStrategy() strategy => ' + key);
                $element.find('div[name="strategyBox"]').hide();
                _getData(key, $scope.symbol).then(function (data) {
                    $log.debug('option-chain with id : ' + $scope.widgetId + ' : setStrategy() data => ' + JSON.stringify(data));
                });
            };

            /**
             * show trades using service
             */
            $scope.showTrades = function () {
                var orders = optionTradeService.getOrders();
                $log.debug('option-chain with id : ' + $scope.widgetId + ' : showTrades() orders => ' + JSON.stringify(orders));
            };

            /**
             * get data using trade service
             * @param key
             * @param underlyingSymbol
             * @returns {*}
             * @private
             */
            var _getData = function (key, underlyingSymbol) {
                return optionSymbolService.getOptions(underlyingSymbol).then(function (options) {
                    switch (key) {
                        case STRATEGY_MAP.longStrangle:
                            return optionTradeService.longStrangle(options, underlyingSymbol);
                        case STRATEGY_MAP.shortStrangle:
                            return optionTradeService.shortStrangle(options, underlyingSymbol);
                        case STRATEGY_MAP.condor:
                            return optionTradeService.condor(options, underlyingSymbol);
                        case STRATEGY_MAP.ironCondor:
                            return optionTradeService.ironCondor(options, underlyingSymbol);
                        case STRATEGY_MAP.reverseIronCondor:
                            return optionTradeService.reverseIronCondor(options, underlyingSymbol);
                        case STRATEGY_MAP.shortCondor:
                            return optionTradeService.shortCondor(options, underlyingSymbol);
                        case STRATEGY_MAP.butterflySpread:
                            return optionTradeService.butterflySpread(options, underlyingSymbol);
                        case STRATEGY_MAP.ironButterfly:
                            return optionTradeService.ironButterfly(options, underlyingSymbol);
                        case STRATEGY_MAP.longPutButterfly:
                            return optionTradeService.longPutButterfly(options, underlyingSymbol);
                        case STRATEGY_MAP.shortPutButterfly:
                            return optionTradeService.shortPutButterfly(options, underlyingSymbol);
                        case STRATEGY_MAP.shortButterfly:
                            return optionTradeService.shortButterfly(options, underlyingSymbol);
                        case STRATEGY_MAP.reverseIronButterfly:
                            return optionTradeService.reverseIronButterfly(options, underlyingSymbol);
                        case STRATEGY_MAP.ratioSpread:
                            return optionTradeService.ratioSpread(options, underlyingSymbol);
                        case STRATEGY_MAP.putRatioSpread:
                            return optionTradeService.putRatioSpread(options, underlyingSymbol);
                        case STRATEGY_MAP.ratioPutWrite:
                            return optionTradeService.ratioPutWrite(options, underlyingSymbol);
                        case STRATEGY_MAP.ratioCallWrite:
                            return optionTradeService.ratioCallWrite(options, underlyingSymbol);
                        case STRATEGY_MAP.variableRatioWrite:
                            return optionTradeService.variableRatioWrite(options, underlyingSymbol);
                        case STRATEGY_MAP.shortStraddle:
                            return optionTradeService.shortStraddle(options, underlyingSymbol);
                        case STRATEGY_MAP.longGuts:
                            return optionTradeService.longGuts(options, underlyingSymbol);
                        case STRATEGY_MAP.shortGuts:
                            return optionTradeService.shortGuts(options, underlyingSymbol);
                        case STRATEGY_MAP.longCallLadder:
                            return optionTradeService.longCallLadder(options, underlyingSymbol);
                        case STRATEGY_MAP.shortCallLadder:
                            return optionTradeService.shortCallLadder(options, underlyingSymbol);
                        case STRATEGY_MAP.longPutLadder:
                            return optionTradeService.longPutLadder(options, underlyingSymbol);
                        case STRATEGY_MAP.shortPutLadder:
                            return optionTradeService.shortPutLadder(options, underlyingSymbol);
                    }
                    return undefined;
                });
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
