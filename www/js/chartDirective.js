angular.module('app.chartDirective', [])

.directive('coursesChart', ['$ionicPopup', '$http', 'serverUrl', 'monthList',
    function($ionicPopup, $http, serverUrl, monthList) {
        return {
            restrict: "A",
            //scope:{

            //},
            controller: function($scope, $element, $attrs) {
                var formDate = function(date) {
                    var dd = date.getDate();
                    var mon = monthList[date.getMonth()];
                    var yyyy = date.getFullYear();
                    return dd + '-' + mon + '-' + yyyy;
                }

                var makeUTCDate = function(incomeDate) {
                    var date = new Date(incomeDate);
                    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                    return date;
                }

                function dateInBelarus() {
                    var date = new Date();
                    date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + 3 * 60);
                    return date;
                }

                $scope.filter = {
                    selectCur: 'USD',
                    dateFrom: new Date(2016, 0, 3),
                    dateTo: dateInBelarus()
                };

                $scope.$watchCollection("filter", function(newValue, oldValue) {
                    $scope.getHistory();
                    $scope.formDateFrom = formDate(newValue.dateFrom);
                    $scope.formDateTo = formDate(newValue.dateTo);
                });

                $scope.formDateFrom = formDate($scope.filter.dateFrom);
                $scope.$on('fromDate_changed', function(event, data) {
                    $scope.filter.dateFrom = data;
                });

                $scope.formDateTo = formDate($scope.filter.dateTo);
                $scope.$on('toDate_changed', function(event, data) {
                    $scope.filter.dateTo = data;
                });

                $scope.listCurrencies = [];
                $scope.ratesHistory = [];

                $scope.getListCurrencies = function() {
                    $scope.$emit("showLoading", {});
                    $http.get(serverUrl, {
                        params: {
                            method: "currenciesForGraphics"
                        }
                    }).success(function(data) {
                        $scope.$emit("hideLoading", {});
                        $scope.listCurrencies = data;
                    }).error(function(error) {
                        $scope.$emit("hideLoading", {});
                        $scope.$emit("showSystemMsg", {});
                        console.log(error);
                    });
                }

                $scope.getHistory = function() {
                    $scope.$emit("showLoading", {});
                    $http.get(serverUrl, {
                        params: {
                            method: "currencyHistory",
                            dateFrom: makeUTCDate($scope.filter.dateFrom),
                            dateTo: makeUTCDate($scope.filter.dateTo),
                            currencyAbb: $scope.filter.selectCur
                        }
                    })
                    .success(function(response) {
                        $scope.$emit("hideLoading", {});
                        $scope.ratesHistory = response.data;
                        if (response.errorMsg) {
                            $scope.$emit("showSystemMsg", { template: response.errorMsg });
                        }
                        makeChart();
                    }).error(function(error) {
                        $scope.$emit("hideLoading", {});
                        $scope.$emit("showSystemMsg", {});
                        console.log(error);
                    });
                }


                $scope.getListCurrencies();








                var chartMargin = {
                    top: 20,
                    right: 15,
                    bottom: 30,
                    left: 55
                };

                var svgWidth = window.innerWidth - 10;
                var menueHeight = window.innerWidth > 450 ? 150 : 210;
                var svgHeight = window.innerHeight - menueHeight;
                var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
                var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

                var svgChart = d3.select("#chart").append("svg")
                    .attr("width", chartWidth + chartMargin.left + chartMargin.right)
                    .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

                var xScale = d3.time.scale().range([0, chartWidth]);
                var yScale = d3.scale.linear().range([chartHeight, 0]);

                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(4);

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5);

                var line = d3.svg.line()
                    .x(function(d) {
                        return xScale(d.date);
                    })
                    .y(function(d) {
                        return yScale(d.rate);
                    })
                    .interpolate("cardinal");

                var isChartPainted = false;

                function makeChart() {
                    var data = $scope.ratesHistory;
                    for (var i = 0; i < data.length; i++) {
                        var date = new Date(data[i].date);
                        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                        data[i].date = date;
                    };

                    xScale.domain(d3.extent(data, function(d) {
                        return d.date;
                    }));

                    yScale.domain(d3.extent(data, function(d) {
                        return d.rate;
                    }));

                    if (isChartPainted) {
                        var svgChartUpdate = svgChart.transition();

                        svgChartUpdate.select(".x.axis")
                            .duration(750)
                            .call(xAxis);
                        svgChartUpdate.select(".y.axis")
                            .duration(750)
                            .call(yAxis);
                        svgChartUpdate.select(".line")
                            .duration(750)
                            .attr("d", line(data));
                    } else {
                        isChartPainted = true;
                        svgChart.append("path")
                            .attr("class", "line")
                            .attr("d", line(data));

                        svgChart.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + chartHeight + ")")
                            .call(xAxis);

                        svgChart.append("g")
                            .attr("class", "y axis")
                            .call(yAxis)
                            .append("text")
                            .attr("transform", "rotate(-90)")
                            .attr("y", 6)
                            .attr("dy", ".71em")
                            .style("text-anchor", "end")
                            .text($scope.selectCur);
                    }
                }
            },
            templateUrl: 'templates/coursesChart.html'
        };
    }
]);
