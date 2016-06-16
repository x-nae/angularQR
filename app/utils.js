app.directive('dropDown',[ "$compile", function($compile){
    return {
        controller : function($scope, $element, $attrs ) {
            var selections=[];

            function addClickListener(i, callback){
                selections[i].addEventListener('click', function(){
                    callback(i);

                }, false);
            }

            function multiSelectClick (i){
                if ($scope.isSelected[i] === true) {
                    // if previously it is selected (red color), now make it unselected (black color / default color)
                    angular.element(selections[i]).removeClass('selected');
                    $scope.isSelected[i] = false;
                } else {
                    // previously black color, so change it to red color
                    angular.element(selections[i]).addClass('selected');
                    $scope.isSelected[i] = true;
                }
                $scope.ddList[i].selected = $scope.isSelected[i];
                selections[i].querySelector('input[dd-check]').checked = $scope.isSelected[i];
                var selectedVals = [], selectedKs = [];
                for (var key = 0, keyl = $scope.isSelected.length; key < keyl; key++) {
                    if ($scope.isSelected[key]) {
                        selectedVals.push(selections[key].innerText);
                        selectedKs.push($scope.ddList[key].key);
                    }
                }

                $scope.selectedText = selectedVals.join(',');
                $scope.selectedKeys = selectedKs;
                $scope.$parent.$apply();
            }

            function singleSelectClick(i){
                if ($scope.isSelected[i] === true) {
                    // do nothing
                } else {
                    // previously black color, so change it to red color
                    angular.element(selections[i]).addClass('selected');
                    $scope.isSelected[i] = true;

                    angular.element(selections[$scope.currentSelection]).removeClass('selected');
                    $scope.isSelected[$scope.currentSelection] = false;
                    $scope.currentSelection = i;
                    $scope.selectedText = selections[i].innerText;
                    $scope.selectedKeys = $scope.ddList[i].key;
                    $scope.$parent.$digest();
                }
            }

            this.onLoad = function(){
                $attrs.multiSelect = $attrs.multiSelect || 'true';
                $scope.isDisplay = false;
                $scope.isSelected = [];
                $scope.onDropDownClick = function() {
                    $scope.isDisplay = !$scope.isDisplay;
                };
                $scope.selectedText = "";
                $scope.containerCls = "dropdown";
                $scope.getSelectedKeys = function(){

                    return $scope.selectedKeys;
                };

                $scope.$watch(function(scope) { return scope.ddList },
                    function() {

                        var container =
                            $element[0].querySelector('ul[dd-li]');
                        angular.element(container).html('');
                        //var itemList = JSON.parse(ddItemList);
                        var itemList = $scope.ddList;
                        if (itemList) {
                            var selectedVals = [];
                            for (var di = 0, dil = itemList.length; di < dil; di++) {
                                var liContent = $attrs.multiSelect === "true"? '<input type="checkbox" dd-check/><span>' + itemList[di].content + '</span>' :
                                    itemList[di].content;
                                var newli = angular.element('<li>' + liContent + '</li>');
                                if($scope.selectedKeys && (($attrs.multiSelect === "true" && $scope.selectedKeys.indexOf(itemList[di].key)>=0)||
                                    ($attrs.multiSelect === "false" && $scope.selectedKeys == itemList[di].key))){
                                    newli.addClass('selected');
                                    if($attrs.multiSelect === "true") {
                                        newli[0].querySelector('input[dd-check]').checked = true;
                                    }
                                    $scope.isSelected[di] = true;
                                    selectedVals.push(newli[0].innerText);
                                }
                                else {
                                    $scope.isSelected[di] = false;
                                }
                                angular.element(container).append(newli);

                            }
                            $scope.selectedText = selectedVals.join(',');
                            selections = $element[0].getElementsByTagName('li');

                            if ($attrs.multiSelect === "true") {
                                for (var i = 0; i < selections.length; i++) {
                                    //scope.isSelected[i] = false;
                                    addClickListener(i, multiSelectClick);
                                }
                            } else {
                                $scope.currentSelection = -1;
                                for (var i = 0; i < selections.length; i++) {
                                    $scope.isSelected[i] = false;
                                    if($scope.selectedKeys == $scope.ddList[i].key){
                                        $scope.currentSelection = i;
                                    }
                                    addClickListener(i, singleSelectClick);
                                }
                            }
                            selections = $element[0].getElementsByTagName('li');
                            $compile(angular.element(container).contents())($scope);
                        }
                    }
                );
            }

        },
        transclude: true,
        scope :{
            selectedKeys : '=',
            ddList:'=',
            multiSelect : '@',
            ddEvents : '&'
        },
        "controllerAs": "dropdown",
        //terminal: true,
        template: '<div ng-class="containerCls" ><div class="dd-input" dd-selected ng-click="onDropDownClick(); $event.stopPropagation();">{{selectedText}}</div><ul ng-transclude ng-show="isDisplay" dd-li></ul></div>',
        link: function(scope, element, attrs, ctrl){
            ctrl.onLoad();
        }
    }
}]);

$(document).click(function(e) {

    /* To collapse multi select boxes opened */
    var elements = angular.element(document).find('[dd-li]:visible');
    if(elements && elements.length > 0 ){
        var targetScope = angular.element(e.target).scope();
        var target = e.target;
        angular.forEach(elements, function(value, key){
            var scope = angular.element(value).scope();
            if(!(targetScope && targetScope.$id == scope.$id)){
                scope.isDisplay = false;
                scope.$digest();
            }
            else {
                if( $(target).closest('[dd-li]').length<=0){
                    scope.isDisplay = false;
                    scope.$digest();
                }else if(scope.multiSelect != "true"){
                    scope.isDisplay = false;
                    scope.$digest();
                }
            }
        });
    }
});