app.factory('priceService', [function(){

    var _getSnapshot = function(symbol){
        return {
            symbol : symbol.underlyingSymbol + '-' + symbol.expiryDate + '-' + symbol.strikePrice,
            lastPrice : 210,
            bestBid : 212,
            bestAsk : 208
        }
    };

    return{
        getSnapshot : _getSnapshot
    }
}]);
