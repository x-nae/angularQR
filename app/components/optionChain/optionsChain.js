app.directive('optionsChainN', [function () {

    var controller = ['$scope', '$element', '$timeout', '$log', 'optionTradeService',

        function ($scope, $element, $timeout, $log, optionTradeService) {

            $scope.optionMap = {};

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
