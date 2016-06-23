app.directive("virtualChannelOverview", [function () {

    var controller = function ($scope, $rootScope, $element, $attrs, $window, $timeout, $log, NotificationService, QRDataService) {

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
            $log.debug('vDataTableXIN => scrollTop : ' + $scope.scrollTop);
            updateDisplayList();
        };

        var changeDeviceSize = function (width, event, eventType) {
            if (width > 930) {
                $scope.viewSize = 'xl';
            } else if (width < 930 && width > 865) {
                $scope.viewSize = 'l';
            } else if (width < 865 && width > 690) {
                $scope.viewSize = 'm';
            } else if (width < 690 && width > 495) {
                $scope.viewSize = 's';
            } else if (width < 495 && width > 260) {
                $scope.viewSize = 'vs';
            } else if (width < 260) {
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

        $scope.hideColumn = function (column) {
            var show = true;
            switch (column){
                case 'enabled':
                case 'enableLong':
                case 'enableShort':
                    show = $scope.containerWidth > 270;
                    break;
                case 'size':
                    show = $scope.containerWidth > 320;
                    break;
                case 'activeLong':
                    show = $scope.containerWidth > 340;
                    break;
                case 'limit':
                    show = $scope.containerWidth > 420;
                    break;
                case 'activeShort':
                    show = $scope.containerWidth > 440;
                    break;
                case 'netchng':
                    show = $scope.containerWidth > 505;
                    break;
                case 'navPair':
                    show = $scope.containerWidth > 570;
                    break;
                case 'real':
                    show = $scope.containerWidth > 635;
                    break;
                case 'startingCapital':
                    show = $scope.containerWidth > 700;
                    break;
                case 'bias':
                    show = $scope.containerWidth > 750;
                    break;
                case 'multipleLong':
                    show = $scope.containerWidth > 800;
                    break;
                case 'multipleShort':
                    show = $scope.containerWidth > 850;
                    break;
                case 'runScript':
                    show = $scope.containerWidth > 875;
                    break;
                case 'signals':
                    show = $scope.containerWidth > 940;
                    break;
                default:
                    break;
            }
            return show;
        };

        var initWidget = function () {
            $scope.filter = 'undefined' === typeof $scope.filter ? '_wCL' : $scope.filter;
            subscribe($scope.filter);
        };

        this.onDestroy = function () {
            $log.info('vDataTableXIN => onDestroy....');
            saveSettings();
            unSubscribe();
            $scope.$destroy();
        };

        var updateDisplayList = function(){
            if($scope.containerHeight && $scope.containerHeight > 0 && qrData){
                var pageSize = Math.ceil($scope.containerHeight/rowHeight);
                var startIndex = Math.max($scope.scrollTop/rowHeight - pageSize, 0) | 0;
                var endIndex = Math.min(startIndex + (3 * pageSize), qrData.models.length - 1) | 0;
                $log.debug('vDataTableXIN => start : ' + startIndex + " & end : " + endIndex);
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
                $timeout(function() {
                    $scope.$digest();
                });
            }
        };

        $scope.switchModel = function (model, checkBoxStatus) {
            QRDataService.switchModel(model, checkBoxStatus).then(function(){
                $log.log('vDataTableXIN => switchModel : success');
            }).catch(function(){
                $log.error('vDataTableXIN => switchModel : fail');
            });
        };

        $scope.switchModelLong = function (model, checkBoxStatus) {
            QRDataService.switchLong(model, checkBoxStatus).then(function(){
                $log.log('vDataTableXIN => switchModelLong : success');
            }).catch(function(){
                $log.error('vDataTableXIN => switchModelLong : fail');
            });
        };

        $scope.switchModelShort = function (model, checkBoxStatus) {
            QRDataService.switchShort(model, checkBoxStatus).then(function(){
                $log.log('vDataTableXIN => switchModelShort : success');
            }).catch(function(){
                $log.error('vDataTableXIN => switchModelShort : fail');
            });
        };

        $scope.switchRunScript = function (model, checkBoxStatus) {
            QRDataService.switchRunScript(model, checkBoxStatus).then(function(){
                $log.log('vDataTableXIN => switchRunScript : success');
            }).catch(function(){
                $log.error('vDataTableXIN => switchRunScript : fail');
            });
        };

        $scope.$watch("filter",
            function (oldValue, newValue) {
                if(newValue && oldValue && newValue != oldValue){
                    unSubscribe();
                    $log.debug('qrDataTableXIN => new Filter : ' + newValue);
                    initWidget();
                }
            });

        var saveSettings = function () {
            if($ && $.portal){
                $.portal.storage.service.saveWidgetConfig($scope, $scope.widgetId, {filter: $scope.filter}, function () {
                    $log.log('vDataTableXIN => settings saved successfully');
                }, function (data) {
                    $log.error('vDataTableXIN => error on settings save :' + data);
                });
            }
        };

        var loadSettings = function () {
            if($ && $.portal){
                $.portal.storage.service.getWidgetConfig($scope, $scope.widgetId, function (data) {
                    if (data && data.length > 0) {
                        var config = data[0].config;
                        var scope = this;
                        $log.log('vDataTableXIN => load settings :' + config.filter);
                        scope.filter = config.filter;
                    }
                    initWidget();
                }, function (data) {
                    $log.error('vDataTableXIN => error on load settings :' + data);
                    initWidget();
                });
            }else{
                initWidget();
            }
        };

        var dataType = NotificationService.dataServiceTypes.CHANNELS, listener, channel;

        var subscribe = function(filter) {
            if(filter){
                channel = NotificationService.subscribe(dataType, QRDataService.getChannelOverviewParams(filter, false));
                listener = $rootScope.$on(channel, function(event, data){
                    if(angular.isUndefined(data)){
                        $log.error('vDataTableXIN => error in subscribe data undefined!');
                    }else{
                        qrData = QRDataService.processChannels(data);
                        updateDisplayList();
                    }
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