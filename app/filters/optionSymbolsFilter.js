app.filter('optionFilter', [function(){

    var _MS_PER_DAY = 1000 * 60 * 60 * 24;

    /**
     * get difference in days
     * @param a
     * @param b
     * @returns {number}
     */
    var getDateDifferenceInDays = function(a,b){
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    };

    /**
     * check expiry date meets the condition
     * @param option symbol
     * @param condition
     * @returns {boolean}
     */
    var validateExpiryDate = function(option, condition){
        var valid = false;
        switch (condition.rule){
            case 'greater':
                valid = getDateDifferenceInDays(new Date(), new Date(option.expiryDate)) > condition.value;
                break;
        }
        return valid;
    };

    /**
     * check strike price meets the price condition
     * @param option
     * @param condition
     * @returns {boolean}
     */
    var validateStrikePrice = function(option, condition){
        var valid = false;
        switch (condition.rule){
            case 'greater':
                valid = option.strikePrice > condition.value;
                break;
            case 'lesser':
                valid = option.strikePrice < condition.value;
                break;
        }
        return valid;
    };

    return function(options, expiryDateCondition, strikePriceCondition) {

        var out = [];

        angular.forEach(options, function(option) {
            if(validateExpiryDate(option, expiryDateCondition) && validateStrikePrice(option, strikePriceCondition)){
                out.push(option);
            }
        });

        return out;
    }

}]);

