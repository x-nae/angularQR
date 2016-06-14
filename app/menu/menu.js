app.directive("menu",
    [
        function () {
            return {
                "restrict": "E",
                "templateUrl": 'app/menu/menu.html'
            }
        }
    ]
);

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'app/views/homePage.html'
        })
        .when('/chart', {
            templateUrl: 'app/views/aggregatedChartPage.html'
        })
        .when('/portfolio', {
            templateUrl: 'app/views/portfolioPage.html'
        })
        .when('/client', {
            templateUrl: 'app/views/clientPage.html'
        })
        .otherwise({redirectTo : '/'});
});
