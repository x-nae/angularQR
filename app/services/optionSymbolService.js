app.factory('optionSymbolService', ['priceService', 'localStorageService', '$q', function(priceService, localStorageService, $q){

    var monthNames = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    var _generateOptionSymbols = function(underlyingSymbol){
        var price = priceService.getSnapshot(underlyingSymbol).lastPrice, symbols = [], today = new Date(), i, j;
        var dateInWeek = today.getDay();
        if(dateInWeek > 5){
            today.setDate(today.getDate() + 6);
        }else{
            today.setDate(today.getDate() + 5 - dateInWeek);
        }

        var startDate = today.getTime();
        var endDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()).getTime();
        var start = price - 100, end = price + 100;
        for(i = startDate; i < endDate; i+= (7 * 1000 * 60 * 60 * 24)) {
            var d = new Date(i), year = d.getFullYear(), month = d.getMonth() + 1, date = d.getDate(),
                e = year + '-' + (month < 9 ? ('0' + month) : month) + '-' + (date < 10 ? ('0' + date) : date),
                n = monthNames[d.getMonth()] + ' ' + (date < 10 ? ('0' + date) : date) + "'" + year.toString().substring(2);
            for (j = start; j < end; j+=5) {
                symbols.push({
                    name : n,
                    underlyingSymbol : underlyingSymbol,
                    expiryDate : e,
                    strikePrice : j
                });
            }
        }
        return symbols;
    };

    var _getId = function(){
        var today = new Date(), month = today.getMonth() + 1,
            e = today.getFullYear() + '-' + (month < 9 ? ('0' + month) : month) + '-' + (today.getDate() < 10 ? ('0' + today.getDate()) : today.getDate());
        return 'optionSymbolService : options : ' + e;
    };

    var _getOptions = function(underlyingSymbol){
        var deferred = $q.defer(), id = _getId();
        var symbols = localStorageService.getData(id);
        if (angular.isUndefined(symbols)) {
            symbols = _generateOptionSymbols(underlyingSymbol);
            localStorageService.save(id);
            deferred.resolve(symbols);
        } else {
            deferred.resolve(symbols);
        }
        return deferred.promise;
    };

    return {
        getOptions : _getOptions
    }
}]);
