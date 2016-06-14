app.directive("serverStatus", [function() {
    var controller = function ($scope, $rootScope, $element, $attrs, NotificationService) {

        this.onWidgetLoad = function (scope) {
            console.info('qrDataCheck => onWidgetLoad Triggered');
            initWidget(scope);
        };

        var initWidget = function(){
            subscribe();
        };

        $scope.dataModel    = undefined;
        $scope.finalData    = [];

        $scope.$watch(
            // This function returns the value being watched. It is called for each turn of the $digest loop
            function() { return $scope.dataModel; },
            // This is the change listener, called when the value returned from the above function changes
            function(newValue, oldValue) {
                // Only increment the counter if the value changed
                console.info('qrDataCheck => dataModel Changed');
                //Reset totals to zero

                if(!newValue){
                    return;
                }
                var SYMBOL_INDEX             = 0;
                var LAST_UPDATE_TIME_INDEX   = 1;
                var LAST_UPDATE_MS_INDEX     = 2;
                var BID_INDEX                = 3;
                var ASK_INDEX                = 4;


                var finalData = [];
                var data = {};

                angular.forEach(newValue, function(value, key) {

                    var line = value.split(';');

                    data = {
                        symbol          : line[SYMBOL_INDEX],
                        lastUpdatedTime : line[LAST_UPDATE_TIME_INDEX],
                        lastUpdatedMs   : line[LAST_UPDATE_MS_INDEX],
                        bid             : line[BID_INDEX],
                        ask             : line[ASK_INDEX]

                    };

                    finalData.push(data);

                }, finalData);

                $scope.finalData = finalData;

            }
        );

        $scope.switchModelData = false;

        var dataType = NotificationService.dataServiceTypes.CONTRACT_INFO, listener, channel;

        var subscribe = function() {
            channel = NotificationService.subscribe(dataType, {});
            listener = $rootScope.$on(channel, function(event, data){
                $scope.dataModel = data.trim().split("\n");
            });
        };

        var unSubscribe = function(){
            if (listener) {
                listener();
            }
            if(channel){
                NotificationService.unSubscribe(channel);
            }
        };

        this.onDestroy = function(){
            unSubscribe();
        };

    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/serverStatus/serverStatus.html",
        link : function(scope, element, attrs, ctrl) {
            if(ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }

            element.on('$destroy', function(){
                console.log('qrDataCheck => destroying....');
                ctrl.onDestroy();
            });
        }
    }
}]);
