app.directive('optionsChainN', [function () {

    var controller = ['$scope', '$element', '$timeout', '$log', 'priceService',

        function ($scope, $element, $timeout, $log, priceService) {

            $scope.optionMap = {};
            $scope.mode = 'watchlist';

            var _MS_PER_DAY = 1000 * 60 * 60 * 24;

            this.onWidgetLoad = function () {
                if (angular.isUndefined($scope.widgetId)) {
                    $scope.widgetId = 'option-chain';
                }
                if (angular.isUndefined($scope.symbol)) {
                    $scope.symbol = 'SPDR S&P 500';
                }
                $log.info('option-chain with id : ' + $scope.widgetId + ' onWidgetLoad symbol : ' + $scope.symbol);
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

            $scope.setMode = function(mode){
                $scope.mode = mode;
            };

            //$scope.scrollDown = function () {
            //    alert('hi');
            //};
            //
            //$scope.scrollUp = function () {
            //    alert('hi');
            //};

            $scope.getPrice = function (expiry, strikePrice, buy) {
                var symbol = $scope.optionMap[expiry][strikePrice];
                var snap = priceService.getSnapshot(symbol);
                return buy ? snap.bestAsk : snap.bestBid;
            };

            var scrollToCurrentPrice = function(symbol){
                var snap = priceService.getSnapshot(symbol);

            };

            /**
             * get difference in days
             * @param a
             * @param b
             * @returns {number}
             */
            $scope.getDateDifferenceInDays = function (a, b) {
                var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

                return Math.floor((utc2 - utc1) / _MS_PER_DAY);
            };
        }
    ];

    return {
        restrict : 'E',
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
