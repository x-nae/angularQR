app.directive("vChannelOverview", ["$compile", "vDataService", function ($compile, DataService) {
    var controller = function ($scope, $rootScope, $element, $attrs, $timeout, $http, $window) {

        //Prod urls NOTE : change updateDataModel() function also
        // var dataUrlPrefix = '/x-one-proxy/proxy/qr/getData/', dataURL = dataUrlPrefix + 'm-x-v/setModels.jsp?';

        // MOCK data url NOTE : change updateDataModel() function also
        var dataUrlPrefix = '/x-one-proxy/proxy/trade/getData/';

        var dataUpdateFrequency = 10000, rowHeight = 25, constHeight = 80, constWidth = 10; // 5 seconds;

        $scope.updateDataModelTimer;

        $scope.viewSize = 'l';
        $scope.widgetId = 'undefined' === typeof $scope.widgetId ? 'modelsElement1' : $scope.widgetId;
        $scope.dataModel = undefined;

        var qrData;
        $scope.scrollTop = 0;

        this.onWidgetLoad = function () {
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

        this.onSelectModel = function (model) {
            console.log('onSelectModel');
            if ($ && $.portal) {
                console.log('vDataTableXIN => onSelectModel portal');
                $.portal.notifications.manager.notify("private", $scope.widgetChannel, $scope.widgetId, model);
            }
        };

        var initWidget = function () {
            $scope.filter = 'undefined' === typeof $scope.filter ? '_wCL' : $scope.filter;
            updateDataModelWithTimer();
        };

        //Timeout function
        var updateDataModelTimerFunction = function () {
            console.log('vDataTableXIN => updateDataModelTimerFunction Starting a new timer');
            $scope.updateDataModelTimer = $timeout(function () {
                updateDataModelWithTimer();
            }, dataUpdateFrequency);
        };

        var updateDataModelWithTimer = function () {
            var filter = $scope.filter;
            filter = filter ? filter : '_';
            console.log('vDataTableXIN => update with updateDataModel fired....filter : ' + filter);
            //1st time data loading
            updateDataModel(filter);
        };

        this.onDestroy = function () {
            console.log('vDataTableXIN => onDestroy....');
            saveSettings();
            $timeout.cancel($scope.updateDataModelTimer);
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

        var updateDataModel = function (filter) {
            console.log('vDataTableXIN => Updating Channel Overview Data Model');
            DataService.getModels(dataUrlPrefix, filter, false, function(data){
                if(data && data.params.nameFilter === $scope.filter){
                    qrData = data;
                    updateDisplayList();
                    updateDataModelTimerFunction();
                }
            }, function () {
                console.error('vDataTableXIN => Server is busy');
            });
        };

        $scope.switchModel = function (model, checkBoxStatus) {
            DataService.switchModel(dataUrlPrefix, model, checkBoxStatus);
        };

        $scope.switchModelLong = function (model, checkBoxStatus) {
            DataService.switchLong(dataUrlPrefix, model, checkBoxStatus);
        };

        $scope.switchModelShort = function (model, checkBoxStatus) {
            DataService.switchShort(dataUrlPrefix, model, checkBoxStatus);
        };

        $scope.switchRunScript = function (model, checkBoxStatus) {
            DataService.switchRunScript(dataUrlPrefix, model, checkBoxStatus);
        };

        $scope.setNewFilter = function () {
            console.log('vDataTableXIN => new Filter : ' + $scope.filter);
            var newFilter = $scope.filter ? $scope.filter : '_';
            // Stop the pending timeout
            $timeout.cancel($scope.updateDataModelTimer);
            initWidget($scope, newFilter);
        };

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

    };

    return {
        "restrict": "E",
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "views/virtualizedChannelOverview.html",
        link: function (scope, element, attrs, ctrl) {
            if (ctrl[1].onWidgetLoad) {
                ctrl[1].onWidgetLoad();
            }
            if (ctrl[0].registerForFullScreen) {
                ctrl[0].registerForFullScreen(ctrl[1].onFullScreen);
            }
            if (ctrl[0].registerForResize) {
                ctrl[0].registerForResize(ctrl[1].onResize);
            }

            element.on('$destroy', function () {
                console.log('vDataTableXIN => destroying....');
                ctrl[1].onDestroy();
            });
        }
    }
}]);