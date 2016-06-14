$.portal = $.extend($.portal, {});

$.portal.storage = {
    manager : (function() {

        var config = {
            PAGE_CONFIG_PREFIX : "PAGE_CONFIG_ID_",
            PAGE_PREFIX : "PAGE_ID_",
            PAGE_SRC_PREFIX: "PAGE_SRC_",
            WIDGET_CONFIG_PREFIX : "WGT_CONFIG_"
        };

        var _save = function(id, object) {
            try {
                if (id !== null && id !== undefined && object && JSON.stringify(object) !== "{}") {
                    localStorage.setItem(id, JSON.stringify(object));
                }
            } catch(e) {
                console.log("Error saving page : " + e);
            }
        };

        var _load = function (id) {
            return  (id !== null && id !== undefined && localStorage.getItem(id)) ? JSON.parse(localStorage.getItem(id)) : null;
        };

        var _remove = function(id) {
            localStorage.removeItem(id);
        };

        var _savePageArrangement = function(pageId, properties) {
            var id = config.PAGE_CONFIG_PREFIX + pageId;
            _save(id, properties);
        };

        var _loadPageArrangement = function(pageId) {
            var id = config.PAGE_CONFIG_PREFIX + pageId;
            return _load(id);
        };

        var _loadPageContent = function(pageId) {
            var id = config.PAGE_PREFIX + pageId;
            return _load(id);
        };

        var _savePageContent = function(pageId, content) {
            var id = config.PAGE_PREFIX + pageId;
            //_setPageID(pageSrc, pageId);
            _save(id, content);
        };

        var _setPageID = function(src, pageID) {
            var id = config.PAGE_SRC_PREFIX + src;
            _save(id, pageID);
        };

        var _getPageID = function(src) {
            var id = config.PAGE_SRC_PREFIX + src;
            return _load(id);
        };

        //region Widget

        var _clearConfig = function(appId, userId,type, uniqueId) {
            var id = config.WIDGET_CONFIG_PREFIX + appId + "_" + userId + "_" + type + "_" +((uniqueId)?(uniqueId + "_") : "" );
            _remove(id);
        };

        var _getWidgetConfig = function(appId, userId,type, uniqueId){
            var id = config.WIDGET_CONFIG_PREFIX + appId + "_" + userId + "_" + type + "_" +((uniqueId)?(uniqueId + "_") : "" );
            return _load(id);
        };

        var _setWidgetConfig = function(appId, userId, type, uniqueId, widgetConfig){
            var id = config.WIDGET_CONFIG_PREFIX + appId + "_" + userId +  "_" + type + "_" +((uniqueId)?(uniqueId + "_") : "" ) ;
            _save(id, widgetConfig);
            _clearConfig(appId, userId, type);
        };

        var _removeConfigs = function(appId, userId, type) {
            for(var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);
                if(key.indexOf(config.WIDGET_CONFIG_PREFIX + appId + "_" + userId +  "_" + type) === 0) {
                    _remove(key);
                }
            }
        };

        //endregion

        return {
            savePageArrangement : _savePageArrangement,
            loadPageArrangement : _loadPageArrangement,
            savePageContent : _savePageContent,
            loadPageContent : _loadPageContent,
            getPageID : _getPageID,
            setPageID : _setPageID,
            getConfig : _getWidgetConfig,
            saveConfig : _setWidgetConfig,
            removeConfigs : _removeConfigs
        }
    })(),
    service : (function() {
        var appId = "";
        var userId = "";
        var srcGetCfg = "/x-one-proxy/proxy/mock/getPostData/x-mock/rest/container/getConfig";
        var srcSaveCfg = "/x-one-proxy/proxy/mock/getPostData/x-mock/rest/container/save";
        var srcDelCfg = "/x-one-proxy/proxy/mock/getPostData/x-mock/rest/container/deleteConfig";
        var srcResetCfg = "/x-one-proxy/proxy/mock/getPostData/x-mock/rest/container/resetSettings";

        var $http = function(object) {
            var timeout = false;
            var errorTimeout = setTimeout(function() {
                timeout = true;
                object.onError.apply({}, []);
            }, 2000);

            $.ajax({
                url : object.url,
                method: object.method,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Content-Type', object.headers["Content-Type"]);
                },
                //dataType : object.headers["Content-Type"],
                data:object.data,
                success: function (dataObj) {

                    if(!timeout) {
                        clearTimeout(errorTimeout);

                        try {
                            dataObj = JSON.parse(dataObj);
                        } catch (e) {
                            dataObj = {};
                            console.log("Error response - " + e);
                        }
                        object.onSuccess.apply({}, [dataObj]);
                    }
                },
                error : function(xhr, ajaxOptions, thrownError) {
                    if(!timeout) {
                        clearTimeout(errorTimeout);

                        console.log('error : ' + thrownError);
                        object.onError.apply({}, arguments);
                    }
                }
            });
        };

        var _onLoad = function(){
            appId = $("input[name=appid]").val();
            userId = $("input[name=author]").val();
        };

        var _resetCache = function() {
            $.portal.storage.manager.removeConfigs(appId, userId, "");
        };

        var _saveData = function(scope, type, uniqueId, configToSave, token, successFn, errorFn, isLocal){
            var data = {
                "reqToken": token,
                "applicationID": appId,
                "userID": userId,
                "config" : JSON.stringify(configToSave),
                "type": type

            };

            if(uniqueId && uniqueId.trim() != ""){
                data.uniqueID = uniqueId;
            }

            if(!isLocal) {
                var req = {
                    method: 'POST',
                    url: srcSaveCfg,
                    headers: {
                        'Content-Type': "application/json; charset=UTF-8"
                    },
                    data: JSON.stringify(data),
                    onSuccess: function (object) {
                        if (object && object.config && $.type(object.config) !== "array" && $.type(object.config) !== "object") {
                            object.config = JSON.parse(object.config);
                        }
                        $.portal.storage.manager.saveConfig(appId, userId, type, (data.uniqueID) ? data.uniqueID : object.uniqueID, [object]);
                        successFn.apply(scope, [[object]]);
                    },
                    onError: errorFn
                };

                $http(req);
            } else {
                data.config = JSON.parse(data.config);
                $.portal.storage.manager.saveConfig(appId, userId, type, (data.uniqueID) ? data.uniqueID : object.uniqueID, [data]);
            }
        };

        var _deleteData = function(scope, type, uniqueId, token, successFn, errorFn){
            var data = {
                "reqToken": token,
                "applicationID": appId,
                "userID": userId,
                "type": type
            };

            if(uniqueId && uniqueId.trim() != ""){
                data.uniqueID = uniqueId;
            }

            var req = {
                method: 'POST',
                url: srcDelCfg,
                headers: {
                    'Content-Type': "application/json; charset=UTF-8"
                },
                data: JSON.stringify(data),
                onSuccess: function(object){
                    successFn.apply(scope, [[object]]);
                },
                onError: errorFn
            };

            $http(req);
        };

        var _resetData = function(scope, type, token, successFn, errorFn){
            var data = {
                "reqToken": token,
                "applicationID": appId,
                "userID": userId,
                "type": type
            };

            var req = {
                method: 'POST',
                url: srcResetCfg,
                headers: {
                    'Content-Type': "application/json; charset=UTF-8"
                },
                data: JSON.stringify(data),
                onSuccess: function(object){
                    successFn.apply(scope, [[object]]);
                },
                onError: errorFn
            };

            $http(req);
        };

        var _getData = function(scope, type, uniqueId, token, successFn, errorFn) {

            appId = $("input[name=appid]").val();
            userId = $("input[name=author]").val();

            var configOnStorage = $.portal.storage.manager.getConfig(appId, userId, type, uniqueId);

            if(configOnStorage){
                angular.forEach(configOnStorage, function (val, key) {
                    if (val && val.config && $.type(val.config) !== "array" && $.type(val.config) !== "object") {
                        val.config = JSON.parse(val.config);
                    }
                });
                successFn.apply(scope, [configOnStorage]);
                return;
            }
            var data = {
                "reqToken": token,
                "applicationID": appId,
                "userID": userId,
                "type": type,
                "typeCategory":"ALL"

            };

            if(uniqueId && uniqueId.trim() != ""){
                data.uniqueID = uniqueId;
            }

            var req = {
                method: 'POST',
                url: srcGetCfg,
                headers: {
                    'Content-Type': "application/json; charset=UTF-8"
                },
                data: JSON.stringify(data),
                onSuccess: function(object){
                    var config = {};

                    //var requestData = JSON.parse(object.config.data);
                    if(object && object.length>0){
                        angular.forEach(object, function (val, key) {
                            if (val && val.config && $.type(val.config) !== "array" && $.type(val.config) !== "object") {
                                val.config = JSON.parse(val.config);
                            }
                        });
                        $.portal.storage.manager.saveConfig(appId, userId, type, (data.uniqueID) ? data.uniqueID : object[0].uniqueID, object);
                    }
                    successFn.apply(scope, [object]);
                },
                onError: errorFn
            };

            $http(req);
        };

        var _getWidgetConfig = function (scope, widgetId, callback, callbackOnError) {
            _getData(scope, "WGT_CFG", widgetId, "", callback, callbackOnError);
        };

        var _saveWidgetConfig = function(scope, widgetId, config, callback, callbackOnError){
            //TODO :: use saveData method
            _saveData (scope, "WGT_CFG", widgetId, config, "", callback, callbackOnError);

            /*  var data = {
             "reqToken": "",
             "applicationID": appId,
             "userID": userId,
             "config" : JSON.stringify(config),
             "type": "WGT_CFG"

             };

             if(widgetId && widgetId.trim() != ""){
             data.uniqueID = widgetId;
             }

             var req = {
             method: 'POST',
             url: srcSaveCfg,
             headers: {
             'Content-Type': "application/json; charset=UTF-8"
             },
             data: JSON.stringify(data),
             onSuccess: function(object){
             var config = {};
             //var requestData = JSON.parse(data.config.data);
             if(object){
             //config = JSON.parse(data.data.config);
             $.portal.storage.manager.saveConfig(appId, userId, (data.uniqueID) ? data.uniqueID : object.uniqueID, [object])
             }
             callback(object);
             },
             onError: callbackOnError
             };

             $http(req);*/
        };

        var _createNewWatchlist = function(scope, wlName, callback, callbackOnError){
            _saveData(scope, "WL", undefined, {name : wlName}, "", callback, callbackOnError);
        };

        var _getWatchlists = function(scope, callback, callbackOnError){
            _getData(scope, "WL", undefined, "", callback, callbackOnError);
        };

        var _createDynamicPage = function(scope, pageid, page, callback, callbackOnError, isLocal) {
            _saveData(scope, "DPG", (pageid) ? pageid : undefined, page, "", callback, callbackOnError, isLocal);
        };

        var _deleteDynamicPage = function(scope, pageid, token, callback, callbackOnError) {
            _deleteData(scope, "DPG", pageid, token, callback, callbackOnError);
        };

        var _LoadDynamicPage = function(scope, pageid, callback, callbackOnError) {
            _getData(scope, "DPG", pageid, "", callback, callbackOnError);
        };

        var _saveDynamicMenu = function(scope, config, callback, callbackOnError) {
            _saveData(scope, "MNU", "menu-item-0-0-2", config, "", callback, callbackOnError);
        };

        var _loadDynamicMenu = function(scope, callback, callbackOnError, token) {
            _getData(scope, "MNU", "menu-item-0-0-2", token, callback, callbackOnError)
        };

        var _savePageArrangement = function(scope, pageid, config, callback, callbackOnError, isLocal) {
            _saveData(scope, "DPA", "dpa-" + pageid, config, "", callback, callbackOnError, isLocal);
        };

        var _loadPageArrangement = function(scope, pageid, callback, callbackOnError) {
            _getData(scope, "DPA", "dpa-" + pageid, "", callback, callbackOnError);
        };

        var _deletePageArrangement = function(scope, pageid, callback, callbackOnError) {
            _deleteData(scope, "DPA", "dpa-" + pageid, callback, callbackOnError);
        };

        var _reset = function(scope, token, callback, callbackOnError) {
            _resetData(scope, "", token, callback, callbackOnError);
        };

        return {
            onLoad : _onLoad,
            getWidgetConfig: _getWidgetConfig,
            saveWidgetConfig:_saveWidgetConfig,
            createNewWatchlist:_createNewWatchlist,
            getWatchlists:_getWatchlists,
            createDynamicPage: _createDynamicPage,
            deleteDynamicPage: _deleteDynamicPage,
            saveDynamicMenu: _saveDynamicMenu,
            loadDynamicMenu: _loadDynamicMenu,
            loadDynamicPage: _LoadDynamicPage,
            savePageArrangement: _savePageArrangement,
            loadPageArrangement: _loadPageArrangement,
            deletePageArrangement: _deletePageArrangement,
            getData : _getData,
            saveData : _saveData,
            deleteData : _deleteData,
            resetCache : _resetCache,
            reset: _reset
        }
    })()
};