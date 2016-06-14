app.directive("widget", [ function() {

    //var _showHideOptions = function(element, options) {
    //    var optionElement;
    //
    //    for(var op in options) {
    //        if(options.hasOwnProperty(op)) {
    //            optionElement = element.find("div.OPTIONS ul li[rel='" + op + "']");
    //            if(options[op]) {
    //                optionElement.show();
    //            } else {
    //                optionElement.hide();
    //            }
    //        }
    //    }
    //};
    //
    //var _controller = function($scope, $element, $attrs){
    //    this.registerForFullScreen = function(fn) {
    //        this.onFullScreen = fn;
    //    };
    //
    //    this.registerForResize = function(fn) {
    //        this.onResizeWidget = fn;
    //    };
    //
    //    this.registerForSettings = function(fn) {
    //        this.onSaveWidget = fn;
    //    };
    //
    //    this.onResize = function(object) {
    //        if(this.onResizeWidget) {
    //            this.onResizeWidget(object.width, object.height);
    //        }
    //        console.log("*** On Resized Fired ***");
    //    }.bind(this);
    //
    //    this.onSave = function(config) {
    //        if(this.onSaveWidget) {
    //            this.onSaveWidget(config);
    //        }
    //    };
    //};

    return {
        "restrict":"A",
        "scope":{
            widgetType : "@xinWidgetType",
            widgetHeader: "@xinWidgetHeader",
            widgetOptions: "@xinWidgetOptions",
            widgetChannel: "@xinWidgetChannel",
            widgetId: "@xinWidgetId",
            widgetDisableheader: "@xinWidgetDisableheader",
            widgetTemplateNone: "@xinWidgetTemplateNone"
        },
        templateUrl: "app/components/widget.html",
        //controller : _controller,
        compile : function(tElement, tAttributes){

            var contentElement = tElement.find(".XWIDGET-CONTENT");
            contentElement.html("<" + tAttributes.xinWidgetType + ">" + "</" + tAttributes.xinWidgetType + ">");

            return {
                post: function( scope, element, attributes ) {
                    for(var k in attributes){
                        if(attributes.hasOwnProperty(k) && k.indexOf('xinWidget') === -1 && k.indexOf('xin') === 0){
                            scope[k.substr(3)] = attributes[k];
                            console.log( k + ' (post-link value)'  + attributes[k]);
                        }
                    }
                }
            };
        }
    }
}]);

app.directive("widgetLink", [ function() {
    var controller = function($scope, $element, $attrs) {
        this.openLinkSection = function (event) {
            $element.find("ul.link").toggle();

            angular.element(document.body).unbind("click");
            angular.element(document.body).bind("click", function() {
                $element.find("ul.link").hide();
            });

            if(event)
                event.stopPropagation();
        };

        this.onSelectLinkValue = function(event) {
            $scope.wChannel = angular.element(event.target).attr("rel");
            this.linkWidget($scope.wChannel);
            this.openLinkSection();
            event.stopPropagation();
        }.bind(this);

        this.linkWidget = function(value) {
            if(value !== null && value !== undefined) {
                var linkEle = $element.find("ul.link li[rel='" + value + "']");
                var selClass = '', hoverClass = '';
                if (linkEle && linkEle.length > 0) {

                    switch (value){
                        case "r":
                            selClass = 'TX-XMAGENTA';
                            hoverClass = 'HEADER-GRA-XMAGENTA';
                            break;
                        case "b":
                            selClass = 'TX-XPRPL';
                            hoverClass = 'HEADER-GRA-XPRPL';
                            break;
                        case "g":
                            selClass = 'TX-XAQUA';
                            hoverClass = 'HEADER-GRA-XAQUA';
                            break;
                        case "y":
                            selClass = 'TX-XYELLOW';
                            hoverClass = 'HEADER-GRA-XYELLOW';
                            break;
                        default :
                            break;
                    }
                    //link button class
                    $element.find("span[rel='selectedChannel']").removeClass(function (index, css) {
                        return (css.match(/(^|\s)TX-X\S+/g) || []).join(' ');
                    });
                    $element.find("span[rel='selectedChannel']").addClass(selClass);
                    //hover class
                    $element.parents("div.XWIDGET-HEADER").removeClass(function (index, css) {
                        return (css.match(/(^|\s)HEADER-GRA-X\S+/g) || []).join(' ');
                    });
                    $element.parents("div.XWIDGET-HEADER").addClass(hoverClass);
                    if($ && $.portal) {
                        $.portal.notifications.manager.subscribe("private", $scope.wId, $scope.wChannel);
                    }
                }
            }
        };
    };
    return {
        "restrict":"A",
        "controller": controller,
        link : function(scope, element, attrs, ctrl) {
            element.find("span").bind('click', ctrl.openLinkSection);
            element.find("ul.link li").bind('click', ctrl.onSelectLinkValue);

            element.find("ul.link").hide();

            angular.element(document.body).bind("click", function() {
                element.find("ul.link").hide();
            });

            ctrl.linkWidget(scope.wChannel);
        }
    }
}]).directive("widgetClose", [ function() {
    var controller = function($scope, $element, $attrs) {

        this.closeWidget = function(event) {
            if($ && $.portal) {
                stopWidgetStreaming($scope.wId);

                $.portal.layout[$.portal.config.layout.type].remove(angular.element("[widget-id="+$scope.wId+"]")[0]);

                $.portal.notifications.manager.removeSubscription("private", "rz_" + $scope.wId);//remove subscription to on resize
            }
        }.bind(this);
    };
    return {
        "restrict":"A",
        "controller": controller,
        link : function(scope, element, attrs, ctrl) {
            element.bind('click', ctrl.closeWidget);
        }
    }
}]).directive("widgetMinimize", [ function() {
    var controller = function($scope, $element, $attrs) {

        this.isWidgetLibrary = false;
        this.isCloseEnabled = false;

        this.expandWidget = function(event) {
            if($.portal.layout[$.portal.config.layout.type].expandWidget){
                $.portal.layout[$.portal.config.layout.type].expandWidget(event, $scope.wId, $scope.maximized);
                $scope.maximized = !$scope.maximized;
            } else {
                var widgetEl = angular.element("[widget-id="+$scope.wId+"]");
                var gridContainer = $.portal.layout[$.portal.config.layout.type].getContainer();
                var newContainer = gridContainer[0].parentNode;
                var widgetContentEl = widgetEl.find(".XWIDGET-CONTENT");
                var widgetLibraryEle = $("[portal-widgets]");
                var closeBtn = angular.element(widgetEl[0]).find("li[widget-close]");

                if($scope.maximized){
                    gridContainer[0].appendChild(widgetEl[0]);
                    $(event.currentTarget).find("span").addClass("ico-arrows-expand");
                    $(event.currentTarget).find("span").removeClass("ico-arrows-compress");
                    gridContainer.show();
                    if(this.isWidgetLibrary) {
                        widgetLibraryEle.show();
                    }
                    if(this.isCloseEnabled) {
                        closeBtn.show();
                    }

                    widgetContentEl.height($scope.widgetH);
                    widgetContentEl.width($scope.widgetW);
                }
                else {

                    $scope.widgetH = widgetContentEl.height();
                    $scope.widgetW = widgetContentEl.width();

                    newContainer.appendChild(widgetEl[0]);
                    $(event.currentTarget).find("span").removeClass("ico-arrows-expand");
                    $(event.currentTarget).find("span").addClass("ico-arrows-compress");
                    gridContainer.hide();
                    if(widgetLibraryEle.is(":visible")) {
                        widgetLibraryEle.hide();
                        this.isWidgetLibrary = true;
                    }

                    if(closeBtn.is(":visible")) {
                        this.isCloseEnabled = true;
                        closeBtn.hide();
                    }

                    var widgetHeight = widgetEl.height();
                    var viewportHeight = $(window).height();
                    if(viewportHeight> widgetHeight){
                        widgetContentEl.height(viewportHeight-widgetContentEl.offset().top);
                        widgetContentEl.width(widgetEl.width());
                    }
                }

                $scope.maximized = !$scope.maximized;
                if(this.widgetCtrl.onFullScreen) {
                    this.widgetCtrl.onFullScreen($scope.maximized, widgetContentEl.width(), widgetContentEl.height());
                }
            }

        }.bind(this);

        this.registerWidget = function(widgetCtrl){
            this.widgetCtrl = widgetCtrl;
        }
    };
    return {
        "restrict":"A",
        "controller": controller,
        link : function(scope, element, attrs, ctrl) {
            element.bind('click', ctrl.expandWidget);
            ctrl.registerWidget(ctrl);
        }
    }
}]);

app.directive("widgetSettingsAction", [ function() {
    var controller = function($scope, $element, $attrs) {
        this.openSettings = function(event){
            var widgetEl = angular.element("[widget-id="+$scope.wId+"]");
            angular.element(widgetEl.find(".XWIDGET-SETTINGS")).show();
            event.preventDefault();
        };

        this.closeSettings = function(event){
            var widgetEl = angular.element("[widget-id="+$scope.wId+"]");
            angular.element(widgetEl.find(".XWIDGET-SETTINGS")).hide();
        };

    };
    return {
        "restrict":"A",
        "controller": controller,
        link : function(scope, element, attrs, ctrl) {
            element.find("span").bind('click', ctrl.openSettings);

            angular.element(document.body).bind("click", function() {
                // ctrl.closeSettings();
            });
            ctrl.closeSettings();
        }
    }
}]).directive("widgetSettings", [ function() {
    var controller = function($scope, $element, $attrs) {
        this.closeSettings = function(){
            var widgetEl = angular.element("[widget-id="+$scope.wId+"]");
            angular.element(widgetEl.find(".XWIDGET-SETTINGS")).hide();
        }

    };
    return {
        "restrict":"E",
        "controller": controller,
        "controllerAs":"widgetsetting",
        link : function(scope, element, attrs, ctrl) {

            var parent = angular.element(angular.element(element).closest( "div[widget]" )[0]);
            var wType = parent.attr("widget-type");
            var wId = parent.attr("widget-id");
            var widgetIDPrc = wType.toLowerCase().replace("_", "");
            widgetIDPrc = "wgt" + widgetIDPrc.replace("-", "") + "-wgt";
            var widgetSetIDPrc = widgetIDPrc+ "-settings";
            scope.wId = wId;
            var newSettingsEl = angular.element("<" + widgetSetIDPrc + ">" + "</" + widgetSetIDPrc + ">");

            angular.forEach(parent[0].attributes, function (value, key) {
                if (value.name !== "widget" && value.name !== "class" && value.name !== "widget-type" && value.name !== 'style') {
                    newSettingsEl.attr(value.name, value.value);
                }
            });

            newSettingsEl.append(element[0].childNodes);

            element.append(newSettingsEl);

            var settingContentEl = parent.find(".XWIDGET-SETTINGS");
            if(settingContentEl && settingContentEl.length>0){
                settingContentEl.append(element);
            }
            else {
                element.html(newSettingsEl);
            }


            //$compile(newSettingsEl)(parent.scope());
            $compile(element.contents())(scope);
            settingContentEl.find(".XWIDGET-SETTINGS-CLOSE").bind('click', function(event){
                var widgetEl = angular.element("[widget-id="+wId+"]");
                angular.element(widgetEl.find(".XWIDGET-SETTINGS")).hide();
            });
            angular.element(settingContentEl).hide();
        }
    }
}]);

app.directive("draggable", function() {
    return function(scope, element) {
        // this gives us the native JS object
        var el = element[0];

        el.draggable = true;

        el.addEventListener('dragstart', function(e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('dropProperty', angular.element(this).attr('drag-rel'));
                this.classList.add('drag');
                return false;
            },
            false
        );

        el.addEventListener('dragend', function(e) {
                this.classList.remove('drag');
                return false;
            },
            false
        );
    }
}).directive('droppable', function() {
    return {
        scope: {
            drop: '&' // parent
        },
        link: function(scope, element) {
            // again we need the native object
            var el = element[0];

            el.addEventListener('dragover', function(e) {
                    e.dataTransfer.dropEffect = 'move';
                    // allows us to drop
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    angular.element(e.target).closest('.XWIDGET-CONTENT').addClass('over');
                    return false;
                },
                false
            );

            el.addEventListener('dragenter', function(e) {
                    angular.element(e.target).closest('.XWIDGET-CONTENT').addClass('over');
                    return false;
                },
                false
            );

            el.addEventListener('dragleave', function(e) {
                    angular.element(e.target).closest('.XWIDGET-CONTENT').removeClass('over');
                    return false;
                },
                false
            );

            el.addEventListener('drop', function(e) {
                    // Stops some browsers from redirecting.
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }

                    angular.element(e.target).closest('.XWIDGET-CONTENT').removeClass('over');

                    var dropProperty = e.dataTransfer.getData('dropProperty');
                    //console.log(dropProperty);

                    // call the drop passed drop function
                    scope.$apply(function(scope) {
                        scope.drop()(dropProperty);
                        //var fn = scope.drop;
                        //if ('undefined' !== typeof fn) {
                        //    fn({dropProperty : dropProperty});
                        //}
                    });

                    return false;
                },
                false
            );
        }
    }
});
