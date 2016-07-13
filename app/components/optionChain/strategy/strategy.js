app.directive('optionsChainStrategy', [function () {

    var controller = ['$scope', '$element', '$log', 'optionSymbolService', 'optionTradeService',
        function ($scope, $element, $log, optionSymbolService, optionTradeService) {

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

            $scope.subData = {
                long: {
                    name: 'Long',
                    key: STRATEGY_MAP.longStrangle
                },
                short: {
                    name: 'Short',
                    key: STRATEGY_MAP.shortStrangle
                }
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
             * show strategy box
             */
            $scope.showStrategies = function () {
                if ($element.find('div[name="strategyBox"]').is(":visible")) {
                    $element.find('div[name="strategyBox"]').hide();
                } else {
                    $element.find('div[name="strategyBox"]').show();
                }
            };

            $scope.onMouseOver = function (sub) {
                $scope.subData = sub;
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
        }];

    return {
        restrict: "A",
        controller: controller,
        templateUrl: "app/components/optionChain/strategy/strategy.html"
    }
}]);
