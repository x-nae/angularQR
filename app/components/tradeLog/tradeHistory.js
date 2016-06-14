app.directive("tradeHistory", [ function() {
    var controller = function ($scope, $rootScope, $element, $attrs, QRDataService, NotificationService) {

        $scope.dataModel    = undefined;
        $scope.finalData    = [];

        this.onWidgetLoad = function () {
            console.info('qrTradingHistory => onWidgetLoad Triggered ' + $scope.widgetId);
            if(angular.isUndefined($scope.filter)){
                $scope.filter = 'Boeck_xCLQ6_COQ6_70';
            }
            initWidget();
        };

        this.onDestroy = function(){
            unSubscribe();
            $scope.$destroy();
        };

        var initWidget = function(){
            subscribe($scope.filter);
        };

        $scope.changeModel = function(modelParam){
            unSubscribe();
            $scope.filter = modelParam;
            initWidget();
        };

        $scope.$watch(
            // This function returns the value being watched. It is called for each turn of the $digest loop
            function() { return $scope.dataModel; },
            // This is the change listener, called when the value returned from the above function changes
            function(newValue, oldValue) {
                // Only increment the counter if the value changed
                console.info('qrTradingHistory => dataModel Changed');
                //Reset totals to zero

                if(!newValue){
                    return;
                }

                var SYMBOL_INDEX        = 2;
                var SIZE_INDEX          = 5;
                var SIM_PRICE_INDEX     = 6;
                var TRADE_PRICE_INDEX   = 7;
                var POS_INDEX           = 11;

                var costPerTrade = 2;//???

                var dataLength = newValue.length;
                var finalData = [];

                var data = {};
                var totalMarketValue = 0;
                var totalDiff1       = 0;
                var totalDiff2       = 0;
                var accSize1         = 0;
                var accSize2         = 0;

                if(dataLength >= 2){

                    for ( var i = 0; i < dataLength; i += 2) {

                        if(newValue[i] && newValue[i+1]){

                            var line1 = newValue[i].split(";");
                            var line2 = newValue[i + 1].split(";");

                            var size1       =  line1[SIZE_INDEX];
                            var size2       =  line2[SIZE_INDEX];
                            var tradePrice1 =  parseInt(line1[TRADE_PRICE_INDEX]);
                            var tradePrice2 =  parseInt(line2[TRADE_PRICE_INDEX]);
                            var pos1        =  parseInt(line1[POS_INDEX]);
                            var pos2        =  parseInt(line2[POS_INDEX]);
                            var simPrice1   =  parseInt(line1[SIM_PRICE_INDEX]);
                            var simPrice2   =  parseInt(line2[SIM_PRICE_INDEX]);

                            totalMarketValue += size1 * tradePrice2 - size1 * tradePrice1;

                            var pnl = totalMarketValue + pos1 * tradePrice1 + pos2 * tradePrice2;

                            var td3 = Math.round((pnl - parseFloat(costPerTrade * (i + 2))));

                            var diff1 = (simPrice1 - tradePrice1) * size1;

                            //calculation total size
                            accSize1 += size1;

                            totalDiff1 += diff1;//Add dif 1 to total dif

                            pos1 += tradePrice1 * size1;

                            var bgColor1 = diff1 == 0 ? "" : (diff1 > 0 ?'#DDffDD':'FFDDDD' );
                            var difClass1 = diff1 == 0 ? "" : (diff1 > 0 ?'label-green':'label-red' );


                            var diff2 = (simPrice2 - tradePrice2) * size2;

                            totalDiff1 += diff2;//Add dif 1 to total dif

                            var bgColor2  = diff1 == 0 ? "" : (diff1 > 0 ?'#DDffDD':'FFDDDD' );
                            var difClass2 = diff1 == 0 ? "" : (diff1 > 0 ?'label-green':'label-red' );

                            var dLoss  = totalDiff1 - totalDiff2;
                            totalDiff2 = totalDiff1;

                            data = {
                                td1 :  ((i / 2) + 1),                 // TD 1 Index Number
                                date1 : line1[0],                     // TD 2 Date
                                td3 : isNaN(td3) ? '--' :td3,         // TD 3 ??
                                symbol1 : line1[SYMBOL_INDEX],        // TD 4 Symbol
                                size1 : size1,                        // TD 5 Size > Pos
                                pos1 : isNaN(pos1) ? '' :pos1,        // TD 5 Size > Pos
                                symbol2 : line2[SYMBOL_INDEX],        // TD 6 Symbol
                                size2 : size2,                        // TD 7 Size > Pos
                                pos2 : isNaN(pos2) ? '' :pos2,        // TD 7 Size > Pos
                                tradePrice1 : tradePrice1,  // TD 8
                                diff1 : diff1,              // TD 9
                                bgColor1 : bgColor1,        // TD 9 bg-color
                                difClass1 : difClass1,      // TD 9 bg-color
                                totalDiff1 : totalDiff1,    // TD 9 bg-color
                                tradePrice2 : tradePrice2,  // TD 10
                                diff2 : diff2,              // TD 11
                                bgColor2 : bgColor2,        // TD 11 bg-color
                                difClass2 : difClass2,      // TD 11 bg-color
                                dLoss : dLoss               // TD 11 bg-color
                            };

                            finalData.push(data);
                        }
                    }
                }

                $scope.finalData = finalData;

            }
        );

        $scope.switchModelData = false;

        var dataType = NotificationService.dataServiceTypes.TRADE_HISTORY, listener, channel;

        var subscribe = function(filter) {
            if(!angular.isUndefined(filter)){
                channel = NotificationService.subscribe(dataType, QRDataService.getTradeHistoryParams(filter));
                listener = $rootScope.$on(channel, function(event, data){
                    $scope.dataModel = data.trim().split("\n");
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

    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/tradeLog/tradeHistory.html",
        link : function(scope, element, attrs, ctrl) {
            if(ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }

            // When the DOM element is removed from the page,
            // AngularJS will trigger the $destroy event on
            // the scope. This gives us a chance to cancel any
            // pending timer that we may have.
            element.on('$destroy', function(){
                console.log('qrTradingHistory => destroying....');
                ctrl.onDestroy();
            });
        }
    }
}]);

