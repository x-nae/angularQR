app.service('StatisticService', function (){

    /**
     * get avg of number array
     * @param numArr
     * @returns {number}
     * @private
     */
    this.getAverage = function (numArr) {
        var i = numArr.length,
            sum = 0;
        while (i--) {
            sum += numArr[i];
        }
        return (sum / numArr.length );
    };

    /**
     * get variance of number array
     * @param numArr
     * @param avg
     * @returns {number}
     * @private
     */
    this.getVariance = function (numArr, avg) {
        var i = numArr.length,
            v = 0;

        while (i--) {
            v += Math.pow((numArr[i] - avg), 2);
        }
        v /= (numArr.length - 1); //sample not population
        return v;
    };

    /**
     * get covariance of 2 number arrays
     * @param numArr1
     * @param numArr2
     * @param avg1
     * @param avg2
     * @returns {number}
     * @private
     */
    this.getCovariance = function (numArr1, numArr2, avg1, avg2) {
        var i = numArr1.length, sum12 = 0;
        while (i--) {
            sum12 += ((numArr1[i] - avg1) * (numArr2[i] - avg2));
        }
        return sum12 / (numArr1.length - 1);
    };

    /**
     * get standard deviation given variance
     * @param variance
     * @returns {number}
     * @private
     */
    this.getStandardDeviation = function (variance) {
        return Math.sqrt(variance);
    };

    /**
     * get median of given series
     * @param values
     * @returns {*}
     * @private
     */
    this.getMedian = function (values) {

        values.sort(function (a, b) {
            return a - b;
        });

        var half = Math.floor(values.length / 2);

        if (values.length % 2) {
            return values[half];
        } else {
            return (values[half - 1] + values[half]) / 2.0;
        }
    };

    this.getPerformance = function (start, end) {
        return (end / start - 1) * 100;
    };

    this.getAnnualizedReturn = function (average, points) {
        return Math.pow((1 + average), 252 / points) - 1;
    };

    this.getSharpeRatio = function (average, variance) {
        return Math.sqrt(252) * (average / this.getStandardDeviation(variance));
    };

    this.getTreynorRatio = function (annualizedReturn, mainData, mainDataAvg, benchmarkData, benchmarkDataAvg, benchmarkVariance, riskFreeRate) {
        var beta = this.getCovariance(mainData, benchmarkData, mainDataAvg, benchmarkDataAvg) / benchmarkVariance;
        return (annualizedReturn - riskFreeRate) / beta;
    };

    this.getVolatility = function (variance) {
        return Math.sqrt(252) * variance;
    };

});