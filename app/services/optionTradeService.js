app.factory('optionTradeService', ['priceService', 'localStorageService', '$filter',

    function (priceService, localStorageService, $filter) {

        var ORDER_SIDE = {
            BUY: 'buy',
            SELL: 'sell'
        };

        var _createOrderObject = function (symbol, side, price, quantity) {
            var order = {
                id : symbol.uid + '|' + Math.random(),
                symbol: symbol,
                side: side,
                price: price,
                quantity: quantity
            };
            var orderObj = _getOrders();
            if (angular.isUndefined(orderObj[symbol])) {
                orderObj[symbol.uid] = [];
            }
            orderObj[symbol.uid].push(order);
            localStorageService.save(_getId(), orderObj);
            return order;
        };

        var _getAppId = function () {
            return $("input[name=appid]").val();
        };

        var _getUserId = function () {
            return $("input[name=author]").val();
        };

        var _getId = function () {
            return "optionTradeService : " + _getAppId() + " : " + _getUserId() + " : orders";
        };

        var _getOrders = function () {
            var orders = localStorageService.getData(_getId());
            if (angular.isUndefined(orders)) {
                orders = {};
            }
            return orders;
        };

        var _getPriceSnapshot = function (symbol) {
            return priceService.getSnapshot(symbol);
        };

        var _getOption = function (options, expiryCondition, strikePriceCondition) {
            var validOptions = $filter('optionFilter')(options, expiryCondition, strikePriceCondition);
            var option;
            if (validOptions.length > 0) {
                if (validOptions.length === 1) {
                    option = validOptions[0];
                } else {
                    angular.forEach(validOptions, function (value) {
                        if (angular.isUndefined(option)) {
                            option = value;
                        } else {
                            if (strikePriceCondition.rule === 'lesser') {
                                if (option.strikePrice < value.strikePrice) {
                                    option = value;
                                }
                            } else {
                                if (option.strikePrice > value.strikePrice) {
                                    option = value;
                                }
                            }

                        }
                    });
                }

            }
            return option;
        };

        var _getReturnObject = function (netPremiumPaid, netPremiumReceived, maxProfit, maxLoss, orders) {
            return {
                netPremiumPaid: netPremiumPaid,
                netPremiumReceived: netPremiumReceived,
                maxProfit: maxProfit,
                maxLoss: maxLoss,
                orders: orders
            };
        };

        var _getCondition = function (value, greater) {
            return {
                rule: greater ? 'greater' : 'lesser',
                value: value
            }
        };

        //region ladder

        /**
         * Number of Option Order - 3
         * Order 1 - Buy 1 ITM Call: Buy 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Sell 1 ATM Call: Sell 1 Call Option with closest Strike Price lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Sell 1 OTM Call: Sell 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Paid = Order 1 - (Order 2 + Order 3)
         * Max Profit = Strike Price of Order 2 - Strike Price of Order 1 - Net Premium Paid
         * Max Loss = …
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _longCallLadder = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestBid;
                maxProfit -= order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, false));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                maxProfit += order1Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxProfit -= netPremiumPaid;

            return _getReturnObject(netPremiumPaid, undefined, maxProfit, undefined, orders);
        };

        /**
         * Number of Option Order - 3
         * Order 1 - Sell 1 ITM Call: Sell 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Buy 1 ATM Call: Buy 1 Call Option with closest Strike Price lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Buy 1 OTM Call: Buy 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 1 - (Order 2 + Order 3)
         * Max Profit = …
         * Max Loss = Strike Price of Order 2 - Strike Price of Order 1 - Net Premium Received.
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _shortCallLadder = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxLoss = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumReceived += snapshot.bestAsk;
                maxLoss -= order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, false));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived -= snapshot.bestBid;
                maxLoss += order2Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumReceived -= snapshot.bestBid;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            maxLoss -= netPremiumReceived;

            return _getReturnObject(undefined, netPremiumReceived, undefined, maxLoss, orders);
        };

        /**
         * Number of Option Order - 3
         * Order 1 - Buy 1 ITM Put:    Buy 1 Put Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Sell 1 ATM Put: Sell 1 Put Option with closest Strike Price higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Sell 1 OTM Put: Sell 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Paid = Order 1 - (Order 2 + Order 3)
         * Max Profit = Strike Price of Order 1 - Strike Price of Order 3 - Net Premium Paid
         * Max Loss = …
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _longPutLadder = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestBid;
                maxProfit += order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                maxProfit -= order1Symbol.strikePrice;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxProfit -= netPremiumPaid;

            return _getReturnObject(netPremiumPaid, undefined, maxProfit, undefined, orders);
        };

        /**
         * Number of Option Order - 3
         * Order 1 - Sell 1 ITM Put: Sell 1 Put Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Buy 1 ATM Put:    Buy 1 Put Option with closest Strike Price higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Buy 1 OTM Put:    Buy 1 Put Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 1 - (Order 2 + Order 3)
         * Max Profit = …
         * Max Loss = Strike Price of Order 1 - Strike Price of Order 2 - Net Premium Received
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _shortPutLadder = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxLoss = 0, expiryCondition = _getCondition(15, true), snapshot;
            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumReceived += snapshot.bestAsk;
                maxLoss += order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived -= snapshot.bestBid;
                maxLoss -= order2Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumReceived -= snapshot.bestBid;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            maxLoss -= netPremiumReceived;

            return _getReturnObject(undefined, netPremiumReceived, undefined, maxLoss, orders);
        };

        //endregion

        //region guts

        /**
         * Number of Option Order - 2
         * Order 1 - Buy 1 ITM Call: Buy 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Buy 1 ITM Put:    Buy 1 Put Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Paid = Order 1 Price + Order 2 Price
         * Max Profit = …
         * Max Loss = Net Premium Paid + Strike Price of Order 2 - Strike Price of Order 1
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _longGuts = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, maxLoss = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestBid;
                maxLoss -= order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumPaid += snapshot.bestBid;
                maxLoss += order2Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            maxLoss += netPremiumPaid;

            return _getReturnObject(netPremiumPaid, undefined, undefined, maxLoss, orders);
        };

        /**
         * Number of Option Order - 2
         * Order 1 - Sell 1 ITM Call: Sell 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Sell 1 ITM Put: Sell 1 Put Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 1 Price + Order 2 Price
         * Max Profit = Net Premium Received + Strike Price of Order 2 - Strike Price of Order 1
         * Max Loss = …
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _shortGuts = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumReceived += snapshot.bestAsk;
                maxProfit -= order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived += snapshot.bestAsk;
                maxProfit += order2Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxProfit += netPremiumReceived;

            return _getReturnObject(undefined, netPremiumReceived, maxProfit, undefined, orders);
        };

        //endregion

        //region straddle

        /**
         * Number of Options Orders - 2
         * Order 1 - Sell 1 ATM Call: Sell 1 Call Option with closest Strike Price lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Sell 1 ATM Put: Sell 1 Put Option with closest Strike Price higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 1 Price + Order 2 Price
         * Max Profit = Net Premium Received
         * Max Loss = …
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _shortStraddle = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestAsk;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumPaid += snapshot.bestAsk;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            return _getReturnObject(netPremiumPaid, undefined, netPremiumPaid, undefined, orders);
        };

        //endregion

        //region ratio

        /**
         * Number of Option Orders - 3
         * Order 1 - Buy 1 ITM Call: Buy 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 & 3 - Sell 2 OTM Calls:    Sell 2 Call Options where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 2 Price + Order 3 Price - Order 1 Price
         * Max Profit = Strike Price of Order 2 - Strike Price of Order 1 + Net Premium Received
         * Max Loss = …
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _ratioSpread = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumReceived -= snapshot.bestBid;
                maxProfit -= order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived += snapshot.bestAsk;
                netPremiumReceived += snapshot.bestAsk;
                maxProfit += order2Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxProfit += netPremiumReceived;

            return _getReturnObject(undefined, netPremiumReceived, maxProfit, undefined, orders);
        };

        /**
         * Number of Option Orders - 3
         * Order 1 - Buy 1 ITM Put: Buy 1 Put Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 & 3 - Sell 2 OTM Puts: Sell 2 Put Options where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 2 + Order 3 - Order 1
         * Max Profit = Strike Price of Order 1 - Strike Price of Order 2 + Net Premium Received
         * Max Loss = …..
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _putRatioSpread = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumReceived -= snapshot.bestBid;
                maxProfit += order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived += snapshot.bestAsk;
                netPremiumReceived += snapshot.bestAsk;
                maxProfit -= order2Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxProfit += netPremiumReceived;

            return _getReturnObject(undefined, netPremiumReceived, maxProfit, undefined, orders);
        };

        /**
         * Number of Stock Orders - 1
         * Number of Option Orders - 2
         * Order 1 - 100 shares of Underlying Stock at current price
         * Order 2 & 3 - Sell 2 ATM Calls:    Sell 2 Call Options with closest Strike Price higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 2 Price + Order 3 Price
         * Max Profit = Net Premium Received
         * Max Loss = ….
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _ratioCallWrite = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            orders.push(_createOrderObject(underlyingSymbol, ORDER_SIDE.BUY, underlyingPrice, 100));

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived += snapshot.bestAsk;
                netPremiumReceived += snapshot.bestAsk;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            return _getReturnObject(undefined, netPremiumReceived, netPremiumReceived, undefined, orders);
        };

        /**
         * Number of Stock Orders - 1
         * Number of Option Orders - 2
         * Order 1 - Sell (Short) 100 shares of Underlying Stock at current price
         * Order 2 & 3 - Sell 2 ATM Puts:    Sell 2 Put Options with closest Strike Price higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 2 Price + Order 3 Price
         * Max Profit = Net Premium Received
         * Max Loss = …
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _ratioPutWrite = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            orders.push(_createOrderObject(underlyingSymbol, ORDER_SIDE.SELL, underlyingPrice, 100));

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived += snapshot.bestAsk;
                netPremiumReceived += snapshot.bestAsk;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            return _getReturnObject(undefined, netPremiumReceived, netPremiumReceived, undefined, orders);
        };

        /**
         * Number of Stock Orders - 1
         * Number of Option Orders - 2
         * Order 1 - Buy 100 shares of Underlying Stock at current price
         * Order 2 - Sell 1 ITM Call: Sell 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Sell 1 OTM Call: Sell 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 2 Price + Order 3 Price
         * Max Profit = Net Premium Received + Strike Price of Order 2 - (Purchase Price of Order 1 x 100 shares)
         * Max Loss = …
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _variableRatioWrite = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            orders.push(_createOrderObject(underlyingSymbol, ORDER_SIDE.BUY, underlyingPrice, 100));

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                maxProfit += order2Symbol.strikePrice;
                netPremiumReceived += snapshot.bestAsk;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumReceived += snapshot.bestAsk;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxProfit += netPremiumReceived - (underlyingPrice * 100);

            return _getReturnObject(undefined, netPremiumReceived, maxProfit, undefined, orders);
        };

        //endregion

        //region butterfly

        /**
         * Number of Option Orders - 4
         * Order 1 - Buy 1 ITM Call:    Buy 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 & 3 - Sell 2 ATM Calls:    Sell 2 Call Options with closest Strike Price higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Buy 1 OTM Call:    Buy 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Paid = Order 1 Price - (Order 2 + Order 3 Price) + Order 4 Price
         * Max Profit = Strike Price of Order 2 - Strike Price of Order 4 - Net Premium Paid
         * Max Loss = Net Premium Paid
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: number, maxProfit: number, maxLoss: number, orders: Array}}
         * @private
         */
        var _butterflySpread = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestBid;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
                netPremiumPaid -= snapshot.bestAsk;
                netPremiumPaid -= snapshot.bestAsk;
                maxProfit += snapshot.bestAsk;
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
                netPremiumPaid += snapshot.bestBid;
                maxProfit -= snapshot.bestBid;
            }

            maxProfit -= netPremiumPaid;

            return _getReturnObject(netPremiumPaid, maxProfit, netPremiumPaid, orders);
        };

        /**
         * Number of Option Orders - 4
         * Order 1 - Buy 1 OTM Put: Buy 1 Put Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Sell 1 ATM Put: Sell 1 Put Option with closest Strike Price lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Sell 1 ATM Call: Sell 1 Call Option with closest Strike Price higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Buy 1 OTM Call:    Buy 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 2 - Order 1 + Order 3 - Order 4
         * Max Profit = Net Premium Received
         * Max Loss = Strike Price of Order 4 - Strike Price of Order 3 - Net Premium Received
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _ironButterfly = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxLoss = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumReceived -= snapshot.bestBid;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, false));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived += snapshot.bestAsk;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, true));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumReceived += snapshot.bestAsk;
                maxLoss -= order3Symbol.strikePrice;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                netPremiumReceived -= snapshot.bestBid;
                maxLoss += order4Symbol.strikePrice;
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            maxLoss -= netPremiumReceived;

            return _getReturnObject(undefined, netPremiumReceived, netPremiumReceived, maxLoss, orders);
        };

        /**
         * Number of Option Orders - 4
         * Order 1 - Buy 1 OTM Put: Buy 1 Put Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 & 3 - Sell 2 ATM Puts: Sell 2 Put Options with closest Strike Price lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Buy 1 ITM Put: Buy 1 Put Option where Strike Price is 2% less than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Paid = Order 1 Price + Order 4 Price - Order 2 Price - Order 3 Price
         * Max Profit = Strike Price of Order 4 - Strike Price of Order 2 - Net Premium Paid
         * Max Loss = Net Premium Paid
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _longPutButterfly = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestBid;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, false));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                netPremiumPaid -= snapshot.bestAsk;
                maxProfit -= order2Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                netPremiumPaid += snapshot.bestBid;
                maxProfit += order2Symbol.strikePrice;
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            maxProfit -= netPremiumPaid;

            return _getReturnObject(netPremiumPaid, undefined, maxProfit, netPremiumPaid, orders);
        };

        /**
         * Number of Option Orders - 4
         * Order 1 - Sell 1 ITM Put: Sell 1 Put Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 & 3 - Buy 2 ATM Puts: Buy 2 Put Options with closest Strike Price higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Sell 1 OTM Put: Sell 1 Put Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 2 Price + Order 3 Price - Order 1 Price - Order 4 Price
         * Max Profit = Net Premium Received
         * Max Loss = Strike Price of Order 1 - Strike Price of Order 2 - Net Premium Received
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _shortPutButterfly = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxLoss = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumReceived -= snapshot.bestAsk;
                maxLoss += order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived += snapshot.bestBid;
                netPremiumReceived += snapshot.bestBid;
                maxLoss -= order2Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                netPremiumReceived -= snapshot.bestAsk;
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxLoss -= netPremiumReceived;

            return _getReturnObject(undefined, netPremiumReceived, netPremiumReceived, maxLoss, orders);
        };

        /**
         * Number of Option Orders - 4
         * Order 1 - Sell 1 ITM Call: Sell 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 & 3 - Buy 2 ATM Calls:    Buy 2 Call Options with closest Strike Price lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Sell 1 OTM Call:    Buy 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 1 Price + Order 4 Price - Order 2 Price - Order 3 Price
         * Max Profit = Net Premium Received
         * Max Loss = Strike Price of Order 2 - Strike Price of Order 1 - Net Premium Received
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _shortButterfly = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxLoss = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumReceived += snapshot.bestAsk;
                maxLoss -= snapshot.bestAsk;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, false));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived -= snapshot.bestBid;
                netPremiumReceived -= snapshot.bestBid;
                maxLoss += snapshot.bestBid;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                netPremiumReceived += snapshot.bestAsk;
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxLoss -= netPremiumReceived;

            return _getReturnObject(undefined, netPremiumReceived, netPremiumReceived, maxLoss, orders);
        };

        /**
         * Number of Option Orders - 4
         * Order 1 - Sell 1 OTM Put: Sell 1 Put Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Buy 1 ATM Put:    Buy 1 Put Option with closest Strike Price higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Buy 1 ATM Call: Buy 1 Call Option with closest Strike Price lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Sell 1 OTM Call:    Sell 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Paid = (Order 2 - Order 1) + (Order 3 - Order 4)
         * Max Profit = Strike Price of Order 4 - Strike Price of Order 3 - Net Premium Paid
         * Max Loss = Net Premium Paid
         * @param options option symbols
         * @param underlyingSymbol
         * @private
         */
        var _reverseIronButterfly = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumPaid += snapshot.bestBid;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice, false));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumPaid += snapshot.bestBid;
                maxProfit -= order3Symbol.strikePrice;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                maxProfit += order4Symbol.strikePrice;
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxProfit -= netPremiumPaid;

            return _getReturnObject(netPremiumPaid, undefined, maxProfit, netPremiumPaid, orders);
        };

        //endregion

        //region condor

        /**
         * Number of Option Orders - 4
         * Order 1 - Sell 1 ITM Call: Sell 1 Call Option where Strike Price is 3% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Buy 1 ITM Call: Buy 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Sell 1 OTM Call: Sell 1 Call Option where Strike Price is 3% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Buy 1 OTM Call: Buy 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Paid = Order 2 Price - Order 1 Price + Order 4 Price - Order 3 Price
         * Max Profit = Strike Price of Order 3 - Strike Price of Order 4 - Net Premium Paid
         * Max Loss = Net Premium Paid
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _condor = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.03, true));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
                netPremiumPaid += snapshot.bestBid;
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.97, false));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
                netPremiumPaid -= snapshot.bestAsk;
                maxProfit += snapshot.bestAsk;
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
                netPremiumPaid += snapshot.bestBid;
                maxProfit -= snapshot.bestBid;
            }

            maxProfit -= netPremiumPaid;

            return _getReturnObject(netPremiumPaid, maxProfit, netPremiumPaid, orders);
        };

        /**
         * Number of Option Orders - 4
         * Order 1 - Sell 1 OTM Put: Sell 1 Put Option where Strike Price is 3% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Buy 1 OTM Put: Buy 1 Put Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Sell 1 OTM Call: Sell 1 Call Option where Strike Price is 3% less than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Buy 1 OTM Call: Buy 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 1 - Order 2 + Order 3 - Order 4
         * Max Profit = Net Premium Received
         * Max Loss = Strike Price of Order 4 - Strike Price of Order 3 - Net Premium Received
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _ironCondor = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, maxLoss = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.03, true));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestAsk;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumPaid -= snapshot.bestBid;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.97, false));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumPaid += snapshot.bestAsk;
                maxLoss -= order3Symbol.strikePrice;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                netPremiumPaid -= snapshot.bestBid;
                maxLoss += order4Symbol.strikePrice;
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            maxLoss -= netPremiumPaid;

            return _getReturnObject(netPremiumPaid, undefined, netPremiumPaid, maxLoss, orders);
        };

        /**
         * Number of Option Orders - 4
         * Order 1 - Buy 1 OTM Put:    Buy 1 Put Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Sell 1 OTM Put: Sell 1 Put Option where Strike Price is 3% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Buy 1 OTM Call:    Buy 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Sell 1 OTM Call:    Sell 1 Call Option where Strike Price is 3% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Paid = (Order 1 - Order 2) + (Order 3 - Order 4)
         * Max Profit = Strike Price of Order 4 - Strike Price of Order 3 - Net Premium Paid
         * Max Loss = Net Premium Paid
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _reverseIronCondor = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, maxProfit = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestBid;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.97, false));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumPaid += snapshot.bestBid;
                maxProfit -= order3Symbol.strikePrice;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.03, true));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                netPremiumPaid -= snapshot.bestAsk;
                maxProfit += order4Symbol.strikePrice;
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxProfit -= netPremiumPaid;

            return _getReturnObject(netPremiumPaid, undefined, maxProfit, netPremiumPaid, orders);
        };

        /**
         * Number of Option Orders - 4
         * Order 1 - Buy 1 ITM Call: Buy 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Sell 1 ITM Call: Sell 1 Call Option where Strike Price is 3% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 3 - Buy 1 OTM Call: Buy 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 4 - Sell 1 OTM Call: Sell 1 Call Option where Strike Price is 3% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 2 Price + Order 4 Price - Order 1 Price - Order 3 Price
         * Max Profit = Net Premium Received
         * Max Loss = Strike Price of Order Order 1 - Strike Price of Order 2 - Net Premium Received
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _shortCondor = function (options, underlyingSymbol) {
            var orders = [], netPremiumReceived = 0, maxLoss = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumReceived -= snapshot.bestBid;
                maxLoss += order1Symbol.strikePrice;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.97, false));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumReceived -= snapshot.bestAsk;
                maxLoss -= order1Symbol.strikePrice;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order3Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order3Symbol)) {
                snapshot = _getPriceSnapshot(order3Symbol);
                netPremiumReceived -= snapshot.bestBid;
                orders.push(_createOrderObject(order3Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order4Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.03, true));
            if (!angular.isUndefined(order4Symbol)) {
                snapshot = _getPriceSnapshot(order4Symbol);
                netPremiumReceived += snapshot.bestAsk;
                orders.push(_createOrderObject(order4Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            maxLoss -= netPremiumReceived;

            return _getReturnObject(undefined, netPremiumReceived, netPremiumReceived, maxLoss, orders);
        };

        //endregion

        //region strangle

        /**
         * Number of Option Orders - 2
         * Order 1 - Buy 1 OTM Call: Buy 1 Call Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Buy 1 OTM Put: Buy 1 Put Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Paid = Order 1 Price + Order 2 Price
         * Max Profit = …
         * Max Loss = Net Premium Paid
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _longStrangle = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, expiryCondition = _getCondition(15, true), snapshot;
            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestBid;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.BUY, snapshot.bestBid, 1));
                netPremiumPaid += snapshot.bestBid;
            }

            return _getReturnObject(netPremiumPaid, undefined, undefined, netPremiumPaid, orders);
        };

        /**
         * Number of Options Orders - 2
         * Order 1 - Sell 1 OTM Call: Sell 1 Call Option where Strike Price is 2% higher than Current Underlying Price and Expiry date greater than 15 days from today.
         * Order 2 - Sell 1 OTM Put: Sell 1 Put Option where Strike Price is 2% lower than Current Underlying Price and Expiry date greater than 15 days from today.
         * Net Premium Received = Order 1 Price + Order 2 Price
         * Max Profit = Net Premium Received
         * Max Loss = ….
         * @param options option symbols
         * @param underlyingSymbol
         * @returns {{netPremiumPaid: *, maxProfit: *, maxLoss: *, orders: *}}
         * @private
         */
        var _shortStrangle = function (options, underlyingSymbol) {
            var orders = [], netPremiumPaid = 0, expiryCondition = _getCondition(15, true), snapshot;

            var underlyingPrice = _getPriceSnapshot(underlyingSymbol).lastPrice;

            var order1Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 1.02, true));
            if (!angular.isUndefined(order1Symbol)) {
                snapshot = _getPriceSnapshot(order1Symbol);
                netPremiumPaid += snapshot.bestAsk;
                orders.push(_createOrderObject(order1Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            var order2Symbol = _getOption(options, expiryCondition, _getCondition(underlyingPrice * 0.98, false));
            if (!angular.isUndefined(order2Symbol)) {
                snapshot = _getPriceSnapshot(order2Symbol);
                netPremiumPaid += snapshot.bestAsk;
                orders.push(_createOrderObject(order2Symbol, ORDER_SIDE.SELL, snapshot.bestAsk, 1));
            }

            return _getReturnObject(netPremiumPaid, undefined, netPremiumPaid, undefined, orders);
        };

        //endregion

        return {
            longStrangle: _longStrangle,
            shortStrangle : _shortStrangle,
            condor: _condor,
            ironCondor: _ironCondor,
            reverseIronCondor : _reverseIronCondor,
            shortCondor : _shortCondor,
            butterflySpread: _butterflySpread,
            ironButterfly: _ironButterfly,
            longPutButterfly: _longPutButterfly,
            shortPutButterfly: _shortPutButterfly,
            shortButterfly : _shortButterfly,
            reverseIronButterfly : _reverseIronButterfly,
            ratioSpread : _ratioSpread,
            putRatioSpread: _putRatioSpread,
            ratioPutWrite : _ratioPutWrite,
            ratioCallWrite: _ratioCallWrite,
            variableRatioWrite : _variableRatioWrite,
            shortStraddle : _shortStraddle,
            longGuts : _longGuts,
            shortGuts : _shortGuts,
            longCallLadder : _longCallLadder,
            shortCallLadder : _shortCallLadder,
            longPutLadder : _longPutLadder,
            shortPutLadder : _shortPutLadder,
            getOrders: _getOrders,
            createOrder : _createOrderObject,
            orderSides : ORDER_SIDE
        }
    }
]);
