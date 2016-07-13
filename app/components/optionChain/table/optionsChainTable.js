app.directive('optionsChainTable', [function(){

    var controller = ['$scope', '$element', '$log', 'optionSymbolService', 'priceService',

        function($scope, $element, $log, optionSymbolService, priceService){

            var parentContainer = $element.parents('.XWIDGET-CONTENT');
            var buyDateTable = $element.find("div[rel=buyDate]");
            var buyDataTable = $element.find("div[rel=buyData]");
            var buyDatePercentageTable = $element.find("div[rel=buyDatePercentage]");
            var sellDateTable = $element.find("div[rel=sellDate]");
            var sellDataTable = $element.find("div[rel=sellData]");
            var sellDatePercentageTable = $element.find("div[rel=sellDatePercentage]");
            var midPriceTable = $element.find("div[rel=midPrice]");

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
                                daysToExpire: getDateDifferenceInDays(new Date(), new Date(value.expiryDate))
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
