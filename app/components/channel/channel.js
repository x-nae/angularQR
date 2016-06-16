app.directive("channel", [function () {

    var controller = function($scope, $log, QRDataService){

        this.onLoad = function(){
            $log.info('channel => onLoad');
            if(angular.isUndefined($scope.data)){
                $scope.data = {};
            }
        };

        this.onDestroy = function(){
            $log.info('channel => onDestroy');
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

    };

    return {
        "restrict": "EA",
        "scope":{
            data : "=channel"
        },
        "controller": controller,
        "controllerAs": "widget",
        "templateUrl": "app/components/channel/channel.html",
        link: function (scope, element, attrs, ctrl) {

            if(ctrl.onLoad){
                ctrl.onLoad();
            }

            element.on('$destroy', function () {
                ctrl.onDestroy();
            });
        }
    }
}]);