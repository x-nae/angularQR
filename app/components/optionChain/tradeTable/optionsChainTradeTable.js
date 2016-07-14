app.directive('optionsChainTradeTable', [function () {

    var controller = ['$scope', '$element', '$log', 'optionSymbolService', 'priceService', 'optionTradeService',

        function ($scope, $element, $log, optionSymbolService, priceService, optionTradeService) {

            var symbolMap = {};

            var parentContainer = $element.parents('.XWIDGET-CONTENT');
            var buyDateTable = $element.find("div[rel=buyDate]");
            var buyDataTable = $element.find("div[rel=buyData]");
            var buyDatePercentageTable = $element.find("div[rel=buyDatePercentage]");
            var sellDateTable = $element.find("div[rel=sellDate]");
            var sellDataTable = $element.find("div[rel=sellData]");
            var sellDatePercentageTable = $element.find("div[rel=sellDatePercentage]");
            var midPriceTable = $element.find("div[rel=midPrice]");

            $scope.tradeMap = {};

            //$scope.scale = 5;

            /**
             * show trades using service
             */
            $scope.showTrades = function () {
                optionSymbolService.getOptions($scope.symbol).then(function (optionSymbols) {
                    $scope.strikePrices = [];
                    angular.forEach(optionSymbols, function (value) {
                        if ($scope.strikePrices.indexOf(value.strikePrice) === -1) {
                            $scope.strikePrices.push(value.strikePrice);
                        }
                    });
                    var orders = optionTradeService.getOrders($scope.symbol);
                    $scope.expiryDates = [];
                    angular.forEach(orders, function (order) {
                        angular.forEach(order, function (o) {
                            $scope.tradeMap[o.id] = o;
                            if (angular.isUndefined(symbolMap[o.symbol.expiryDate])) {
                                symbolMap[o.symbol.expiryDate] = {};
                                $scope.expiryDates.push({
                                    name: o.symbol.name,
                                    daysToExpire: $scope.getDateDifferenceInDays(new Date(), new Date(o.symbol.expiryDate))
                                });
                            }
                        });
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
                $log.debug('optionsChainTradeTable => scrollDown()');
            };

            $scope.scrollUp = function () {
                $log.debug('optionsChainTradeTable => scrollUp()');
            };

            $scope.scrollLeft = function () {
                $log.debug('optionsChainTradeTable => scrollLeft()');
                var width = $element.find("div.OC-TD").outerWidth();
                midPriceTable.animate({scrollLeft: '-=' + width}, 'slow');
                buyDataTable.animate({scrollLeft: '-=' + width}, 'slow');
                sellDataTable.animate({scrollLeft: '-=' + width}, 'slow');
            };

            $scope.scrollRight = function () {
                $log.debug('optionsChainTradeTable => scrollRight()');
                var width = $element.find("div.OC-TD").outerWidth();
                midPriceTable.animate({scrollLeft: '+=' + width}, 'slow');
                buyDataTable.animate({scrollLeft: '+=' + width}, 'slow');
                sellDataTable.animate({scrollLeft: '+=' + width}, 'slow');
            };
        }];

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: 'app/components/optionChain/tradeTable/optionsChainTradeTable.html',
        link: function (scope) {
            scope.showTrades();
        }
    }
}]);
