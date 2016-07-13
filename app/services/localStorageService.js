app.service('localStorageService', [function(){

    this.getData = function (id) {
        return (id !== null && id !== undefined && localStorage.getItem(id)) ? JSON.parse(localStorage.getItem(id)) : undefined;
    };

    this.save = function (id, object) {
        try {
            if (id !== null && id !== undefined && object && JSON.stringify(object) !== "{}") {
                localStorage.setItem(id, JSON.stringify(object));
            }
        } catch (e) {
            $log.error("Error saving page : " + e);
        }
    };

    this.remove = function (id) {
        localStorage.removeItem(id);
    };

    this.removeAll = function(keyPrefix){
        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);
            if (key.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key);
            }
        }
    };
}]);
