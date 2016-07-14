app.directive('optionsChainTable', [function(){

    var controller = ['$scope', '$rootScope', '$element', '$log', 'optionSymbolService', 'optionTradeService', 'priceService',

        function($scope, $rootScope, $element, $log, optionSymbolService, optionTradeService, priceService){

            var parentContainer = $element.parents('.XWIDGET-CONTENT');
            var buyDateTable = $element.find("div[rel=buyDate]");
            var buyDataTable = $element.find("div[rel=buyData]");
            var buyDatePercentageTable = $element.find("div[rel=buyDatePercentage]");
            var sellDateTable = $element.find("div[rel=sellDate]");
            var sellDataTable = $element.find("div[rel=sellData]");
            var sellDatePercentageTable = $element.find("div[rel=sellDatePercentage]");
            var midPriceTable = $element.find("div[rel=midPrice]");

            $scope.initializeTable = function () {
                $log.debug('optionsChainTable => onWidgetLoad()');

                optionSymbolService.getOptions($scope.symbol).then(function (optionSymbols) {
                    $scope.expiryDates = [];
                    $scope.strikePrices = [];
                    angular.forEach(optionSymbols, function (value) {
                        if (angular.isUndefined($scope.optionMap[value.name])) {
                            $scope.optionMap[value.name] = {};
                            $scope.expiryDates.push({
                                name: value.name,
                                daysToExpire: $scope.getDateDifferenceInDays(new Date(), new Date(value.expiryDate))
                            })
                        }
                        $scope.optionMap[value.name][value.strikePrice] = value;
                        if ($scope.strikePrices.indexOf(value.strikePrice) === -1) {
                            $scope.strikePrices.push(value.strikePrice);
                        }
                    });
                }).finally(function () {
                    var tableHeight = (parentContainer.height() - parentContainer.find('div.OC-HEADER').height() - midPriceTable.height()) / 2;

                    buyDateTable.height(tableHeight);
                    buyDataTable.height(tableHeight);
                    buyDatePercentageTable.height(tableHeight);
                    sellDateTable.height(tableHeight);
                    sellDataTable.height(tableHeight);
                    sellDatePercentageTable.height(tableHeight);
                });
            };

            $scope.scrollDown = function () {
                alert('hi');
                $log.debug('optionsChainTable => scrollDown()');
                var height = $element.find(".OC-TR").height();
                buyDateTable.animate({scrollTop: '+=' + height}, 'slow');
                buyDataTable.animate({scrollTop: '+=' + height}, 'slow');
                buyDatePercentageTable.animate({scrollTop: '+=' + height}, 'slow');
                sellDateTable.animate({scrollTop: '+=' + height}, 'slow');
                sellDataTable.animate({scrollTop: '+=' + height}, 'slow');
                sellDatePercentageTable.animate({scrollTop: '+=' + height}, 'slow');
            };

            $scope.scrollUp = function () {
                alert('hi');
                $log.debug('optionsChainTable => scrollUp()');
                var height = $element.find(".OC-TR").height();
                buyDateTable.animate({scrollTop: '-=' + height}, 'slow');
                buyDataTable.animate({scrollTop: '-=' + height}, 'slow');
                buyDatePercentageTable.animate({scrollTop: '-=' + height}, 'slow');
                sellDateTable.animate({scrollTop: '-=' + height}, 'slow');
                sellDataTable.animate({scrollTop: '-=' + height}, 'slow');
                sellDatePercentageTable.animate({scrollTop: '-=' + height}, 'slow');
            };

            $scope.scrollLeft = function () {
                $log.debug('optionsChainTable => scrollLeft()');
                var width = $element.find("div.OC-TD").outerWidth();
                midPriceTable.animate({scrollLeft: '-=' + width}, 'slow');
                buyDataTable.animate({scrollLeft: '-=' + width}, 'slow');
                sellDataTable.animate({scrollLeft: '-=' + width}, 'slow');
            };

            $scope.scrollRight = function () {
                $log.debug('optionsChainTable => scrollRight()');
                var width = $element.find("div.OC-TD").outerWidth();
                midPriceTable.animate({scrollLeft: '+=' + width}, 'slow');
                buyDataTable.animate({scrollLeft: '+=' + width}, 'slow');
                sellDataTable.animate({scrollLeft: '+=' + width}, 'slow');
            };

            $scope.getPrice = function (expiry, strikePrice, buy) {
                var symbol = $scope.optionMap[expiry][strikePrice];
                var snap = priceService.getSnapshot(symbol);
                return buy ? snap.bestAsk : snap.bestBid;
            };

            $scope.onClick = function(expiry, strikePrice, buy){
                var symbol = $scope.optionMap[expiry][strikePrice];
                var snap = priceService.getSnapshot(symbol);
                var order = optionTradeService.createOrder(symbol, buy ? optionTradeService.orderSides.BUY : optionTradeService.orderSides.SELL, buy ? snap.bestAsk : snap.bestBid, 1);
                $log.debug('optionsChainTable : order => ' + JSON.stringify(order));
                $scope.setMode('trade');
                //$scope.mode = 'trade';
            }
        }
    ];

    return {
        controller : controller,
        templateUrl : "app/components/optionChain/table/optionsChainTable.html",
        link : function(scope){
            scope.initializeTable();
        }
    }
}]);
