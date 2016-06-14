app.directive("channelOverview", [function () {
    var controller = function ($scope, $rootScope, $element, $attrs, $timeout, $window, NotificationService, QRDataService) {

        $scope.viewSize = 'l';
        $scope.widgetId = 'undefined' === typeof $scope.widgetId ? 'modelsElement1' : $scope.widgetId;
        $scope.dataModel = undefined;

        this.onWidgetLoad = function () {
            loadSettings();
            $window.addEventListener('beforeunload', function() {
                saveSettings();
            });
        };

        this.onFullScreen = function (maximized, contentW, contentH) {
            changeDeviceSize(contentW, 'onFullScreen', maximized);
        };

        this.onResize = function (width, height) {
            changeDeviceSize(width, 'onResize');
        };

        var changeDeviceSize = function (width, event, eventType) {
            if (width > 1000) {
                $scope.viewSize = 'xl';
            } else if (width < 1200 && width > 800) {
                $scope.viewSize = 'l';
            } else if (width < 800 && width > 600) {
                $scope.viewSize = 'm';
            } else if (width < 600 && width > 400) {
                $scope.viewSize = 's';
            } else if (width < 400 && width > 200) {
                $scope.viewSize = 'vs';
            } else if (width < 200) {
                $scope.viewSize = 'vvs';
            }
        };

        $scope.bgLimitBarClass = function (size) {
            return size == 0 ? 'limitClassZero' : size > 0 ? 'limitClassPlus' : 'limitClassMinus';
        };

        $scope.getEnabledGreenClass = function (flag) {
            return flag ? 'BULB-ON' : 'BULB-OFF';
        };

        $scope.getEnabledRedClass = function (flag) {
            return flag ? 'BULB-RED' : 'BULB-OFF';
        };

        $scope.hideColumns = function () {
            var args = Array.prototype.slice.call(arguments);
            return (args.indexOf($scope.viewSize) === -1);
        };

        $scope.$watch(
            // This function returns the value being watched. It is called for each turn of the $digest loop
            function () {
                return $scope.viewSize;
            },
            // This is the change listener, called when the value returned from the above function changes
            function (newValue, oldValue) {
                if (newValue != oldValue) {
                    console.debug('qrDataTableXIN => viewSize : ' + $scope.viewSize);
                    $timeout(function(){}, 0);
                }
            }
        );

        this.onSelectModel = function (model) {
            console.log('onSelectModel');
            if ($ && $.portal) {
                console.log('qrDataTableXIN => onSelectModel portal');
                $.portal.notifications.manager.notify("private", $scope.widgetChannel, $scope.widgetId, model);
            }
        };

        var initWidget = function () {
            $scope.filter = 'undefined' === typeof $scope.filter ? '_wCL' : $scope.filter;
            subscribe($scope.filter);
        };

        this.onDestroy = function () {
            console.log('qrDataTableXIN => onDestroy....');
            saveSettings();
            unSubscribe($scope.filter);
            $scope.$destroy();
        };

        $scope.switchModel = function (model, checkBoxStatus) {
            QRDataService.switchModel(model, checkBoxStatus).then(function(){
                console.log('qrDataTableXIN => switchModel : success');
            }).catch(function(){
                console.log('qrDataTableXIN => switchModel : fail');
            });
        };

        $scope.switchModelLong = function (model, checkBoxStatus) {
            QRDataService.switchLong(model, checkBoxStatus).then(function(){
                console.log('qrDataTableXIN => switchModelLong : success');
            }).catch(function(){
                console.log('qrDataTableXIN => switchModelLong : fail');
            });
        };

        $scope.switchModelShort = function (model, checkBoxStatus) {
            QRDataService.switchShort(model, checkBoxStatus).then(function(){
                console.log('qrDataTableXIN => switchModelShort : success');
            }).catch(function(){
                console.log('qrDataTableXIN => switchModelShort : fail');
            });
        };

        $scope.switchRunScript = function (model, checkBoxStatus) {
            QRDataService.switchRunScript(model, checkBoxStatus).then(function(){
                console.log('qrDataTableXIN => switchRunScript : success');
            }).catch(function(){
                console.log('qrDataTableXIN => switchRunScript : fail');
            });
        };

        $scope.$watch("filter",
            function (oldValue, newValue) {
                if(newValue && oldValue && newValue != oldValue){
                    unSubscribe(oldValue);
                    console.log('qrDataTableXIN => new Filter : ' + newValue);
                    initWidget();
                }
        });

        var saveSettings = function () {
            $.portal.storage.service.saveWidgetConfig($scope, $scope.widgetId, {filter: $scope.filter}, function () {
                console.log('qrDataTableXIN => settings saved successfully');
            }, function (data) {
                console.log('qrDataTableXIN => error on settings save :' + data);
            });
        };

        var loadSettings = function () {
            $.portal.storage.service.getWidgetConfig($scope, $scope.widgetId, function (data) {
                if (data && data.length > 0) {
                    var config = data[0].config;
                    var scope = this;
                    console.log('qrDataTableXIN => load settings :' + config.filter);
                    scope.filter = config.filter;
                }
                initWidget();
            }, function (data) {
                console.log('qrDataTableXIN => error on load settings :' + data);
                initWidget();
            });
        };

        var dataType = NotificationService.dataServiceTypes.CHANNELS, listener, channel;

        var subscribe = function(filter) {
            if(filter){
                channel = NotificationService.subscribe(dataType, QRDataService.getChannelOverviewParams(filter, false));
                listener = $rootScope.$on(channel, function(event, data){
                    $scope.dataModel = QRDataService.processChannels(data);
                });
            }
        };

        var unSubscribe = function(filter){
            if(filter) {
                if (listener) {
                    listener();
                }
                NotificationService.unSubscribe(dataType, QRDataService.getChannelOverviewParams(filter, false));
            }
        };

    };

    return {
        "restrict": "E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/channelOverview/channelOverview.html",
        link: function (scope, element, attrs, ctrl) {
            if (ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }
            //if (ctrl[0].registerForFullScreen) {
            //    ctrl[0].registerForFullScreen(ctrl[1].onFullScreen);
            //}
            //if (ctrl[0].registerForResize) {
            //    ctrl[0].registerForResize(ctrl[1].onResize);
            //}

            element.on('$destroy', function () {
                console.log('qrDataTableXIN => destroying....');
                ctrl.onDestroy();
            });
        }
    }
}]);