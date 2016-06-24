app.directive("admin", [ function() {

    var controller = function ($scope, $rootScope, $element, $attrs, $log, NotificationService, QRDataService) {

        $scope.serverStatus = false;
        var newVersion = '6';

        this.onWidgetLoad = function () {
            //Temp solution to mange versions
            localStorageManager();
            $scope.serviceStaus = 'Loading server status...';
            subscribeToServerStatus();
            subscribeToTimeLeft();
        };

        var localStorageManager = function(){
            if (localStorage) {
                // LocalStorage is supported!
                var currentVersion = localStorage.getItem('version');
                if(currentVersion != newVersion){
                    localStorage.clear();
                    localStorage.setItem('version', newVersion);
                }
            } else {
                // No support. Use a fallback such as browser cookies or store on the server.
            }
        };

        this.onDestroy = function(){
            unSubscribeToServerStatus();
            unSubscribeToTimeLeft();
        };

        $scope._enable = function () {
            QRDataService.enableService().then(function (data) {
                $log.info('qrAdminBtn => enable.jsp success - response : ' + data);
            }).catch(function (data) {
                $log.error('qrAdminBtn => enable.jsp fail - response : ' + data);
            });
        };

        $scope._disable = function () {
            QRDataService.disableService().then(function (data) {
                $log.info('qrAdminBtn => disable.jsp success - response : ' + data);
            }).catch(function (data) {
                $log.error('qrAdminBtn => disable.jsp fail - response : ' + data);
            });
        };

        $scope.onOff = function () {
            unSubscribeToServerStatus();
            if ($scope.serverStatus) {
                $scope.serviceStaus = "Sending Turn ON signal to server..";
                $log.debug('qrAdminBtn => ' + $scope.serviceStaus);
                QRDataService.switchOnService().then(function () {
                    subscribeToServerStatus();
                }).catch(function () {
                    $log.error('qrAdminBtn => on fail..');
                    subscribeToServerStatus();
                });
            }else{
                $scope.serviceStaus = "Sending Turn OFF signal to server..";
                console.debug('qrAdminBtn => ' + $scope.serviceStaus);
                QRDataService.switchOffService().then(function () {
                    subscribeToServerStatus();
                }).catch(function () {
                    $log.error('qrAdminBtn => off fail..');
                    subscribeToServerStatus();
                });
            }
        };

        var updateTimeLeftChannel, updateTimeLeftListener, dataTypeTimeLeft = NotificationService.dataServiceTypes.TIME_LEFT;
        var updateServerStatusChannel, updateServerStatusListener, dataTypeServerStatus = NotificationService.dataServiceTypes.IS_SERVICE_ENABLED;

        var subscribeToTimeLeft = function() {
            updateTimeLeftChannel = NotificationService.subscribe(dataTypeTimeLeft, {});
            updateTimeLeftListener = $rootScope.$on(updateTimeLeftChannel, function(event, data){
                $scope.timeleft = (0 | (data - new Date().getTime()) / 1000 / 60) + ' minutes.';
            });
        };

        var unSubscribeToTimeLeft = function(){
            if (updateTimeLeftListener) {
                updateTimeLeftListener();
            }
            NotificationService.unSubscribe(updateTimeLeftChannel);
        };

        var subscribeToServerStatus = function(){
            updateServerStatusChannel = NotificationService.subscribe(dataTypeServerStatus, {});
            updateServerStatusListener = $rootScope.$on(updateServerStatusChannel, function(event, data){
                var isEnabled = !!(!angular.isUndefined(data) && data.trim() =='true');
                $scope.serviceStaus = (isEnabled ? 'Service is currently enabled' : 'Service is currently off');
                $scope.serverStatus = isEnabled;
            });
        };

        var unSubscribeToServerStatus = function(){
            if (updateServerStatusListener) {
                updateServerStatusListener();
            }
            NotificationService.unSubscribe(updateServerStatusChannel);
        };

    };

    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/admin/admin.html",
        link : function(scope, element, attrs, ctrl) {
            if(ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }

            element.on('$destroy', function(){
                console.log('qrAdminBtn => destroying....');
                ctrl.onDestroy();
            });
        }
    }
}]);
