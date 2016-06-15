app.directive("virtualChannelOverview", [function () {

    var controller = function ($scope, $rootScope, $element, $attrs, NotificationService, QRDataService, $window) {

        var rowHeight = 25, constHeight = 80, constWidth = 10; // 5 seconds;

        $scope.dataModel = undefined;

        var qrData;
        $scope.scrollTop = 0;

        this.onWidgetLoad = function () {
            if(angular.isUndefined($scope.widgetId)){
                $scope.widgetId = 'modelsElement1';
            }
            if(angular.isUndefined($scope.viewSize)){
                $scope.viewSize = 'l';
            }
            loadSettings();
            $window.addEventListener('beforeunload', function() {
                saveSettings();
            });
            $element.find('div#vList')[0].addEventListener('scroll', onScroll);
        };

        this.onFullScreen = function (maximized, contentW, contentH) {
            changeDeviceSize(contentW, 'onFullScreen', maximized);
            updateDisplayList();
        };

        this.onResize = function (width, height) {
            $scope.containerHeight = height - constHeight;
            $scope.containerWidth = width - constWidth;
            changeDeviceSize(width, 'onResize');
            updateDisplayList();
        };

        var onScroll = function(){
            $scope.scrollTop = $element.find('div#vList').prop('scrollTop');
            console.log('vDataTableXIN => scrollTop : ' + $scope.scrollTop);
            updateDisplayList();
        };

        var changeDeviceSize = function (width, event, eventType) {
            if (width > 980) {
                $scope.viewSize = 'xl';
            } else if (width < 980 && width > 910) {
                $scope.viewSize = 'l';
            } else if (width < 910 && width > 740) {
                $scope.viewSize = 'm';
            } else if (width < 740 && width > 530) {
                $scope.viewSize = 's';
            } else if (width < 530 && width > 270) {
                $scope.viewSize = 'vs';
            } else if (width < 270) {
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
            return flag ? 'activeShort BULB-RED' : 'activeShort BULB-OFF';
        };

        $scope.hideColumns = function () {
            var args = Array.prototype.slice.call(arguments);
            return (args.indexOf($scope.viewSize) === -1);
        };

        var initWidget = function () {
            $scope.filter = 'undefined' === typeof $scope.filter ? '_wCL' : $scope.filter;
            subscribe($scope.filter);
        };

        this.onDestroy = function () {
            console.log('vDataTableXIN => onDestroy....');
            saveSettings();
            unSubscribe();
            $scope.$destroy();
        };

        var updateDisplayList = function(){
            if($scope.containerHeight && $scope.containerHeight > 0 && qrData){
                var pageSize = Math.ceil($scope.containerHeight/rowHeight);
                var startIndex = Math.max($scope.scrollTop/rowHeight - pageSize, 0) | 0;
                var endIndex = Math.min(startIndex + (3 * pageSize), qrData.models.length - 1) | 0;
                console.log('vDataTableXIN => start : ' + startIndex + " & end : " + endIndex);
                var displayedModels = qrData.models.slice(startIndex, endIndex);

                angular.forEach(displayedModels, function (value, key) {
                    value.style = ((startIndex + key) * rowHeight);
                });

                $scope.fullHeight = qrData.models.length * rowHeight;
                $scope.dataModel = {
                    models : displayedModels,
                    nav : qrData.nav,
                    size : qrData.size,
                    change : qrData.change,
                    pchg : qrData.pchg
                };
                $scope.$digest();
            }
        };

        $scope.switchModel = function (model, checkBoxStatus) {
            QRDataService.switchModel(model, checkBoxStatus).then(function(){
                console.log('vDataTableXIN => switchModel : success');
            }).catch(function(){
                console.log('vDataTableXIN => switchModel : fail');
            });
        };

        $scope.switchModelLong = function (model, checkBoxStatus) {
            QRDataService.switchLong(model, checkBoxStatus).then(function(){
                console.log('vDataTableXIN => switchModelLong : success');
            }).catch(function(){
                console.log('vDataTableXIN => switchModelLong : fail');
            });
        };

        $scope.switchModelShort = function (model, checkBoxStatus) {
            QRDataService.switchShort(model, checkBoxStatus).then(function(){
                console.log('vDataTableXIN => switchModelShort : success');
            }).catch(function(){
                console.log('vDataTableXIN => switchModelShort : fail');
            });
        };

        $scope.switchRunScript = function (model, checkBoxStatus) {
            QRDataService.switchRunScript(model, checkBoxStatus).then(function(){
                console.log('vDataTableXIN => switchRunScript : success');
            }).catch(function(){
                console.log('vDataTableXIN => switchRunScript : fail');
            });
        };

        $scope.$watch("filter",
            function (oldValue, newValue) {
                if(newValue && oldValue && newValue != oldValue){
                    unSubscribe();
                    console.log('qrDataTableXIN => new Filter : ' + newValue);
                    initWidget();
                }
            });

        var saveSettings = function () {
            $.portal.storage.service.saveWidgetConfig($scope, $scope.widgetId, {filter: $scope.filter}, function () {
                console.log('vDataTableXIN => settings saved successfully');
            }, function (data) {
                console.log('vDataTableXIN => error on settings save :' + data);
            });
        };

        var loadSettings = function () {
            $.portal.storage.service.getWidgetConfig($scope, $scope.widgetId, function (data) {
                if (data && data.length > 0) {
                    var config = data[0].config;
                    var scope = this;
                    console.log('vDataTableXIN => load settings :' + config.filter);
                    scope.filter = config.filter;
                }
                initWidget();
            }, function (data) {
                console.log('vDataTableXIN => error on load settings :' + data);
                initWidget();
            });
        };

        var dataType = NotificationService.dataServiceTypes.CHANNELS, listener, channel;

        var subscribe = function(filter) {
            if(filter){
                channel = NotificationService.subscribe(dataType, QRDataService.getChannelOverviewParams(filter, false));
                listener = $rootScope.$on(channel, function(event, data){
                    qrData = data;
                    updateDisplayList();
                });
            }
        };

        var unSubscribe = function(){
            if (listener) {
                listener();
            }
            if(channel) {
                NotificationService.unSubscribe(channel);
            }
        };

    };

    return {
        "restrict": "E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/virtualChannelOverview/virtualChannelOverview.html",
        link: function (scope, element, attrs, ctrl) {
            if (ctrl.onWidgetLoad) {
                ctrl.onWidgetLoad();
            }

            element.on('$destroy', function () {
                console.log('vDataTableXIN => destroying....');
                ctrl.onDestroy();
            });
        }
    }
}]);