app.factory('NAVDataService', function (DataService, StatisticService, $q) {

    var portfolios = undefined;
    var investments = undefined;

    var data = {};

    //region Data Cache

    /**
     * get time to cache
     * @param frequency data frequency(minute/hour/day)
     * @returns {number}
     * @private
     */
    var _getCacheTime = function (frequency) {
        switch (frequency) {
            case 'hour':
                return 1000 * 60 * 30;
            case 'day':
                return 1000 * 60 * 60 * 12;
            default :
                return 1000 * 60;
        }
    };

    /**
     * get period start date
     * @param period data period
     * @returns {number}
     * @private
     */
    var _getFromDate = function (period) {
        var day = new Date();
        switch (period) {
            case '1D':
                day.setDate(day.getDate() - 1);
                break;
            case '1W':
                day.setDate(day.getDate() - 7);
                break;
            case '1M':
                day.setMonth(day.getMonth() - 1);
                break;
            case '3M':
                day.setMonth(day.getMonth() - 3);
                break;
            case '6M':
                day.setMonth(day.getMonth() - 6);
                break;
            case 'YTD':
                day.setMonth(0);
                day.setDate(1);
                break;
            case '1Y':
                day.setFullYear(day.getFullYear() - 1);
                break;
            case '3Y':
                day.setFullYear(day.getFullYear() - 3);
                break;
            case '5Y':
                day.setFullYear(day.getFullYear() - 5);
                break;
            default :
                day.setFullYear(day.getFullYear() - 10);
                break;
        }
        return day.getTime();
    };

    /**
     * get data frequency(minute/hour/day)
     * @param period data period
     * @returns {*}
     * @private
     */
    var _getFrequency = function (period) {
        var frequency;
        switch (period) {
            case '1D':
                frequency = 'minute';
                break;
            case '1W':
                frequency = 'hour';
                break;
            default:
                frequency = 'day';
                break;
        }
        return frequency;
    };

    /**
     * trim time to remove seconds, milliseconds etc depending on data frequency
     * @param time time with seconds & milliseconds
     * @param frequency minute/hour/day
     * @returns {*}
     * @private
     */
    var _getTime = function (time, frequency) {
        var date = new Date(time), trimmedTime;
        switch (frequency) {
            case 'minute':
                date.setSeconds(0, 0);
                trimmedTime = date.getTime();
                break;
            case 'hour':
                date.setMinutes(0, 0, 0);
                trimmedTime = date.getTime();
                break;
            default :
                date.setHours(0, 0, 0, 0);
                trimmedTime = date.getTime();
                break;
        }
        return trimmedTime;
    };

    /**
     * cache response
     * @param dataResponse data
     * @param portfolio
     * @param frequency minute/hour/day
     * @private
     */
    var _defaultSuccessFn = function (dataResponse, portfolio, frequency) {
        if ('undefined' === typeof data[portfolio]) {
            data[portfolio] = {};
        }
        data[portfolio][frequency] = dataResponse;

        setTimeout(function () {
            delete data[portfolio][frequency];
        }, _getCacheTime(frequency));
    };

    //endregion

    //region process

    /**
     * get initial value compared to main portfolio initial value
     * @param portfolioInitialValue actual initial value
     * @param mainPortfolioInitialValue main portfolio initial value
     * @param mainPortfolioCompareValue main portfolio value for portfolio start time
     * @returns {number}
     * @private
     */
    var _getInitialValue = function (portfolioInitialValue, mainPortfolioInitialValue, mainPortfolioCompareValue) {
        return portfolioInitialValue / mainPortfolioCompareValue * mainPortfolioInitialValue;
    };

    /**
     * get data points for the specified period
     * @param from period start date
     * @param data all data
     * @param frequency minute/hour/day
     * @returns {Array}
     * @private
     */
    var _filterByPeriod = function (from, data, frequency) {
        var returnData = [];
        $.each(data, function (i, v) {
            if (v[0] > from && !angular.isUndefined(v[1]) && v[1] !== 'null') {
                returnData.push([_getTime(v[0], frequency), v[1]]);
            }
        });
        return returnData;
    };

    var _adjustCashTransactions = function (from, data, investments) {
        //get the cash transactions which will impact the calculations
        var impacts = {};
        for (var key in investments) {
            if (investments.hasOwnProperty(key)) {
                var year = parseInt(key.substr(0, 4), 10), month = parseInt(key.substr(4, 2), 10) - 1, day = parseInt(key.substr(6, 2), 10);
                var time = new Date(year, month, day, 0, 0, 0, 0).getTime();
                if (time > from) {
                    impacts[time] = investments[key];
                }
            }
        }
        var i, len = data.length, correctionFactor = 1, adjustedData = {}, usedInvestments = [];
        for (i = len; i > 0; i--) {
            var d = data[i - 1];
            var t = d[0], value = d[1];
            for (var investmentDate in impacts) {
                if (impacts.hasOwnProperty(investmentDate)) {
                    if (t < investmentDate && usedInvestments.indexOf(investmentDate) === -1) {
                        correctionFactor = ((value + impacts[investmentDate]) / value) * correctionFactor;
                        usedInvestments.push(investmentDate);
                    }
                }
            }
            adjustedData[t] = value * correctionFactor;
        }
        return adjustedData;
    };

    var _getPerformanceChangePctData = function (from, processedData, adjustedData, mainPortfolioAdjustedData) {
        var initial, returnData = [];
        for (var date in processedData) {
            if (processedData.hasOwnProperty(date) && adjustedData.hasOwnProperty(date)) {
                if ("undefined" === typeof initial) {
                    initial = _getInitialValue(adjustedData[date], mainPortfolioAdjustedData[from], mainPortfolioAdjustedData[date]);
                }
                if(initial > 0){
                    //calculate performance change %
                    returnData.push({
                        x: date,
                        y: (adjustedData[date] - initial) / initial * 100,
                        tv: processedData[date]
                    });
                }
            }
        }
        return returnData;
    };

    var _getSpreadData = function (from, processedData, adjustedData, mainPortfolioData, mainPortfolioAdjustedData) {
        var initial, mainPortfolioInitial, returnData = [];
        for (var date in processedData) {
            if (processedData.hasOwnProperty(date) && adjustedData.hasOwnProperty(date)) {
                if ("undefined" === typeof initial) {
                    initial = _getInitialValue(adjustedData[date], mainPortfolioAdjustedData[from], mainPortfolioAdjustedData[date]);
                    mainPortfolioInitial = mainPortfolioAdjustedData[from];
                }
                if(initial > 0 && mainPortfolioInitial > 0){
                    var portfolioPct = ((adjustedData[date] - initial) / initial * 100);
                    var mPortfolioPct = ((mainPortfolioAdjustedData[date] - mainPortfolioInitial) / mainPortfolioInitial * 100);
                    //calculate spread
                    returnData.push({
                        x: date,
                        y: portfolioPct - mPortfolioPct,
                        tv: processedData[date] + '|' + mainPortfolioData[date]
                    });
                }
            }
        }
        return returnData;
    };

    /**
     * process data
     * @param mainPortfolio
     * @param comparePortfolioArr
     * @param period
     * @param isNav
     * @returns {{}}
     * @private
     */
    var _processData = function (mainPortfolio, comparePortfolioArr, period, isNav) {
        var from = _getFromDate(period), frequency = _getFrequency(period), filteredData = {}, adjustedData = {}, processedData = {}, returnData = {};

        var minDataAvailableTime;
        filteredData[mainPortfolio] = _filterByPeriod(from, data[mainPortfolio][frequency], frequency);
        if ('undefined' === typeof minDataAvailableTime || minDataAvailableTime < filteredData[mainPortfolio][0][0]) {
            minDataAvailableTime = filteredData[mainPortfolio][0][0];
        }
        adjustedData[mainPortfolio] = _adjustCashTransactions(minDataAvailableTime, filteredData[mainPortfolio], investments[mainPortfolio]);
        processedData[mainPortfolio] = {};
        $.each(filteredData[mainPortfolio], function (i, a) {
            processedData[mainPortfolio][a[0]] = a[1];
        });
        if (isNav) {
            returnData[mainPortfolio] = _getPerformanceChangePctData(minDataAvailableTime, processedData[mainPortfolio], adjustedData[mainPortfolio], adjustedData[mainPortfolio]);
        }
        $.each(comparePortfolioArr, function (i, portfolio) {
            filteredData[portfolio] = _filterByPeriod(minDataAvailableTime, data[portfolio][frequency], frequency);
            adjustedData[portfolio] = _adjustCashTransactions(minDataAvailableTime, filteredData[portfolio], investments[portfolio]);
            processedData[portfolio] = {};
            $.each(filteredData[portfolio], function (i, a) {
                processedData[portfolio][a[0]] = a[1];
            });
            if (isNav) {
                returnData[portfolio] = _getPerformanceChangePctData(minDataAvailableTime, processedData[portfolio], adjustedData[portfolio], adjustedData[mainPortfolio]);
            } else {
                returnData[portfolio] = _getSpreadData(minDataAvailableTime, processedData[portfolio], adjustedData[portfolio], processedData[mainPortfolio], adjustedData[mainPortfolio]);
            }
        });
        return returnData;
    };

    var _processBasicChartData = function (portfolio, period, frequency, type) {
        var returnData = [], filteredData, initial, from = _getFromDate(period);
        filteredData = _filterByPeriod(from, data[portfolio][frequency], frequency);
        if (type === 'NAV') {
            $.each(filteredData, function (i, a) {
                returnData.push({
                    x: a[0],
                    y: a[1],
                    tv: a[1]
                });
            });
        }
        if (type === 'PROFIT') {
            var usedInvestments = [];
            $.each(filteredData, function (i, a) {
                var time = a[0], value = a[1];
                if ('undefined' === typeof initial) {
                    initial = value;
                }
                for (var investmentDate in investments[portfolio]) {
                    if (investments[portfolio].hasOwnProperty(investmentDate)) {
                        var year = parseInt(investmentDate.substr(0, 4), 10), month = parseInt(investmentDate.substr(4, 2), 10) - 1, day = parseInt(investmentDate.substr(6, 2), 10);
                        var iTime = new Date(year, month, day, 0, 0, 0, 0).getTime();
                        if (iTime <= time && usedInvestments.indexOf(investmentDate) === -1) {
                            //initial value is same as investment
                            if (i !== 0) {
                                initial += investments[portfolio][investmentDate];
                            }
                            usedInvestments.push(investmentDate);
                        }
                    }
                }
                returnData.push({
                    x: time,
                    y: value - initial,
                    tv: a[1]
                });
            });
        }
        if (type === 'PERFORMANCE') {
            var minDataAvailableTime = filteredData[0][0];
            var adjustedData = _adjustCashTransactions(minDataAvailableTime, filteredData, investments[portfolio]);
            var processedData = {};
            $.each(filteredData, function (i, a) {
                processedData[a[0]] = a[1];
            });
            returnData = _getPerformanceChangePctData(minDataAvailableTime, processedData, adjustedData, adjustedData);
        }
        return returnData;
    };

    var _calculateRatios = function (portfolioData, investments) {
        var frequency = 'day', from = _getFromDate('ALL'), filteredData = _filterByPeriod(from, portfolioData, frequency);
        var minDataAvailableTime = filteredData[0][0];
        var adjustedData = _adjustCashTransactions(minDataAvailableTime, filteredData, investments);
        var oneYrPerformance, ytdPerformance, mtdPerformance, twoYrPerformance, points = [];
        var i, len = filteredData.length, latestVal, val, latestTime, mtdTime, ytdTime, oneYrTime, twoYrTime;
        for (i = len; i > 0; i--) {
            var t = filteredData[i - 1][0], v = adjustedData[t];
            if ('undefined' === typeof latestVal) {
                latestVal = v;
                latestTime = new Date(t);
                mtdTime = new Date(latestTime.getFullYear(), latestTime.getMonth(), 1, 0, 0, 0, 0).getTime();
                ytdTime = new Date(latestTime.getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
                oneYrTime = new Date(latestTime.getFullYear() - 1, latestTime.getMonth(), latestTime.getDate(), 0, 0, 0, 0).getTime();
                twoYrTime = new Date(latestTime.getFullYear() - 2, latestTime.getMonth(), latestTime.getDate(), 0, 0, 0, 0).getTime();
            } else {
                if ('undefined' === typeof val && latestVal) {
                    val = latestVal;
                }
                points.push(StatisticService.getPerformance(val, v));

                if (latestVal && mtdTime && t <= mtdTime && 'undefined' === typeof mtdPerformance) {
                    mtdPerformance = StatisticService.getPerformance(val, latestVal);
                } else if (latestVal && ytdTime && t <= ytdTime && 'undefined' === typeof ytdPerformance) {
                    ytdPerformance = StatisticService.getPerformance(val, latestVal);
                } else if (latestVal && oneYrTime && t <= oneYrTime && 'undefined' === typeof oneYrPerformance) {
                    oneYrPerformance = StatisticService.getPerformance(val, latestVal);
                } else if (latestVal && twoYrTime && t <= twoYrTime && 'undefined' === typeof twoYrPerformance) {
                    twoYrPerformance = StatisticService.getPerformance(val, latestVal);
                }

                val = v;
            }
        }

        if ('undefined' === typeof oneYrPerformance) {
            oneYrPerformance = StatisticService.getPerformance(val, latestVal);
        }
        if ('undefined' === typeof twoYrPerformance) {
            twoYrPerformance = StatisticService.getPerformance(val, latestVal);
        }
        var dataPoints = points.reverse();
        var avg = StatisticService.getAverage(dataPoints), variance = StatisticService.getVariance(dataPoints, avg);

        return {
            points: dataPoints,
            avg: avg,
            variance: variance,
            volatility: StatisticService.getVolatility(variance),
            sharpe: StatisticService.getSharpeRatio(avg, variance),
            annualizedReturn: StatisticService.getAnnualizedReturn(avg, points.length),
            oneYrPerformance: oneYrPerformance,
            ytdPerformance: ytdPerformance,
            mtdPerformance: mtdPerformance,
            twoYrPerformance: twoYrPerformance
        };
    };

    var _calcRatios = function(portfolio, benchmark, frequency){
        var obj = {};
        obj[portfolio] = _calculateRatios(data[portfolio][frequency], investments[portfolio]);
        obj[benchmark] = _calculateRatios(data[benchmark][frequency], investments[benchmark]);
        obj[portfolio].treynor = StatisticService.getTreynorRatio(
            obj[portfolio].annualizedReturn, obj[portfolio].points, obj[portfolio].avg,
            obj[benchmark].points, obj[benchmark].avg, obj[benchmark].variance, 0);
        return obj;
    };

    //endregion

    var _getBasicNAVChartData = function(portfolio, period, type){
        var frequency = _getFrequency(period);
        return $q.all([getInvestments(), getNAVHistory(portfolio, frequency)]).then(
            function(){
                return _processBasicChartData(portfolio, period, frequency, type);
            }
        );
    };

    var _getNavOrSpread = function(mainPortfolio, comparePortfolio, period, nav){
        var frequency = _getFrequency(period), promises = [];
        promises.push(getInvestments());
        promises.push(getNAVHistory(mainPortfolio, frequency));
        angular.forEach(comparePortfolio, function (value, key) {
            promises.push(getNAVHistory(value, frequency));
        });
        return $q.all(promises).then(
            function () {
                return _processData(mainPortfolio, comparePortfolio, period, nav);
            }
        );
    };

    var getNavData = function (portfolio, period) {
        return _getBasicNAVChartData(portfolio, period, 'NAV');
    };

    var getProfitData = function (portfolio, period) {
        return _getBasicNAVChartData(portfolio, period, 'PROFIT');
    };

    var getPerformanceData = function (portfolio, period) {
        return _getBasicNAVChartData(portfolio, period, 'PERFORMANCE');
    };

    /**
     * nav updates
     * @param portfolio
     * @param period
     * @param type
     * @param latestNavData
     * @private
     */
    var getNavUpdates = function (portfolio, period, type, latestNavData) {
        var frequency = _getFrequency(period);
        return $q.all([getInvestments(), getNAVHistory(portfolio, frequency)]).then(function(){
            var fData = data[portfolio][frequency], dataLength = fData.length, returnData = {};
            if (latestNavData[1] !== fData[dataLength - 1][1]) {
                fData.push(latestNavData);
                var d = _processBasicChartData(portfolio, period, frequency, type);
                returnData = d[d.length - 1];
            }
            //if dataResponse[1] === fData[dataLength - 1][1] => just send time
            returnData.x = latestNavData[0];//set the response time -> getTime()
            return returnData;
        });
    };

    /**
     * get nav data
     * @param mainPortfolio
     * @param comparePortfolio
     * @param period
     * @private
     */
    var getNav = function (mainPortfolio, comparePortfolio, period) {
        return _getNavOrSpread(mainPortfolio, comparePortfolio, period, true);
    };

    /**
     * get spread
     * @param mainPortfolio
     * @param comparePortfolio
     * @param period
     * @private
     */
    var getSpread = function (mainPortfolio, comparePortfolio, period) {
        return _getNavOrSpread(mainPortfolio, comparePortfolio, period, false);
    };

    var getNAVHistory = function (portfolio, frequency) {
        var deferred = $q.defer();
        if (angular.isUndefined(data[portfolio]) || angular.isUndefined(data[portfolio][frequency])) {
            if (angular.isUndefined(data[portfolio])) {
                data[portfolio] = {};
            }
            DataService.getNAVHistory(portfolio, frequency).then(function (response) {
                console.log('getNAVHistory @ _defaultSuccessFn portfolio => ' + portfolio);
                _defaultSuccessFn(response.data, portfolio, frequency);
                deferred.resolve(data[portfolio][frequency]);
            });
        } else {
            deferred.resolve(data[portfolio][frequency]);
        }
        return deferred.promise;
    };

    var getRatios = function (portfolio, benchmark) {
        var frequency = 'day',
            pPromise = getNAVHistory(portfolio, frequency),
            bPromise = getNAVHistory(benchmark, frequency);
        return $q.all([getInvestments(), pPromise, bPromise])
            .then(
                function () {
                    return _calcRatios(portfolio, benchmark, frequency)
                }
            );
    };

    //todo : in portfolio widget we use tradeService.getPortfolios()
    var getPortfolios = function () {
        var deferred = $q.defer();
        if (angular.isUndefined(portfolios)) {
            portfolios = {};
            DataService.getMetaData().then(function (response) {
                angular.forEach(response.data.clients, function (value, key) {
                    portfolios[value.name] = angular.isUndefined(value.displayName) ? value.name : value.displayName;
                });
                deferred.resolve(portfolios);
            }, function (response) {
                deferred.reject(response);
            });
        } else {
            deferred.resolve(portfolios);
        }
        return deferred.promise;
    };

    var getInvestments = function () {
        var deferred = $q.defer();
        if (angular.isUndefined(investments)) {
            investments = {};
            DataService.getMetaData().then(function (response) {
                console.log('getInvestments @ ');
                angular.forEach(response.data.clients, function (value, key) {
                    investments[value.name] = {};
                    angular.forEach(value.investments, function (investment, key) {
                        investments[value.name][investment.date] = investment.amount;
                    });
                });
                deferred.resolve(investments);
            });
        } else {
            deferred.resolve(investments);
        }
        return deferred.promise;
    };

    var getLatestNavParams = function (portfolio) {
        return {client : portfolio};
    };

    return {
        getPortfolios: getPortfolios,
        getLatestNavParams: getLatestNavParams,
        getRatios: getRatios,
        getSpread: getSpread,
        getNAV: getNav,
        getNavUpdates: getNavUpdates,
        getPerformanceData: getPerformanceData,
        getProfitData: getProfitData,
        getNavData: getNavData
    };

});