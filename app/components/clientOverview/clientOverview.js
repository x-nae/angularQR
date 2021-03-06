app.directive("clientOverview", [ function () {
    var controller = function ($scope, $rootScope, $element, $attrs, QRDataService, NotificationService) {

        $scope.widgetId = 'undefined' === typeof $scope.widgetId ? 'QRClientOverview' : $scope.widgetId;

        $scope.dummyClient = 'TITTEL';

        this.onWidgetLoad = function () {
            console.log('qrClientOverview => onWidgetLoad...');
            initWidget();
        };

        this.onResize = function (width, height) {
            console.log('qrClientOverview => onResize... width : ' + width + ", height : " + height);
        };

        this.onDestroy = function () {
            console.log('qrClientOverview => onDestroy...');
            unSubscribe();
        };

        $scope.expandClient = function (client) {
            if ('undefined' === typeof $scope.client) {
                unSubscribe();
                $scope.clients[client].expanded = true;
                $scope.client = client;
                subscribe(client);
            } else {
                this.expandPair($scope.pair);
                $scope.clients[$scope.client].expanded = false;
                if (client !== $scope.client) {
                    unSubscribe();
                    $scope.clients[client].expanded = true;
                    $scope.client = client;
                    subscribe(client);
                } else {
                    $scope.client = undefined;
                }
            }
        };

        $scope.expandPair = function (pair) {
            if (pair) {
                if ('undefined' === typeof $scope.pair) {
                    $scope.clients[$scope.client].pairs[pair].expanded = true;
                    $scope.pair = pair;
                } else {
                    $scope.clients[$scope.client].pairs[$scope.pair].expanded = false;
                    if (pair !== $scope.pair) {
                        $scope.clients[$scope.client].pairs[pair].expanded = true;
                        $scope.pair = pair;
                    } else {
                        $scope.pair = undefined;
                    }
                }
            }
        };

        var initWidget = function () {
            subscribe(angular.isUndefined($scope.client) ? $scope.dummyClient : $scope.client);
        };

        var validateData = function(data){
            var key;
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    return true;
                }
            }
            return false;
        };

        var updateOnSuccess = function(processedData){
            var data = processedData.data;
            if ($scope.client && data[$scope.client]) {
                data[$scope.client].expanded = true;
                if($scope.pair && data[$scope.client].pairs[$scope.pair]){
                    data[$scope.client].pairs[$scope.pair].expanded = true;
                }
            }
            $scope.clients = data;
            $scope.clientHeaders = processedData.clientHeaders;
            $scope.pairHeaders = processedData.pairHeaders;
        };

        var dataType = NotificationService.dataServiceTypes.CLIENT_CHANNELS, listener, channel;

        var subscribe = function(client) {
            channel = NotificationService.subscribe(dataType, QRDataService.getClientOverviewParams(client));
            listener = $rootScope.$on(channel, function(event, data){
                var processedData = QRDataService.processClientChannels(data);
                if(validateData(processedData)){
                    updateOnSuccess(processedData);
                }else{
                    alert('no data available for this client!');
                }
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

    };

    return {
        "restrict": "E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/clientOverview/clientOverview.html",
        link: function (scope, element, attrs, ctrl) {
            if (ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }

            // When the DOM element is removed from the page,
            // AngularJS will trigger the $destroy event on
            // the scope. This gives us a chance to cancel any
            // pending timer that we may have.
            element.on('$destroy', function () {
                console.log('destroying qrClientOverview....');
                ctrl.onDestroy();
            });

        }
    }
}]);
