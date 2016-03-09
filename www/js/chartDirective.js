angular.module('app.chartDirective', [])

.directive('coursesChart', ['$ionicPopup', '$http', 'serverUrl', 'monthList', '$timeout',
    function($ionicPopup, $http, serverUrl, monthList, $timeout) {

        function makeChart(data, currencyAbb) {
            d3.select("svg").remove();
            var chartMargin = {
                top: 20,
                right: 15,
                bottom: 90,
                left: 65
            };
            var formatTime = d3.time.format("%e %B");

            var svgWidth = window.innerWidth - 10;
            var menueHeight = window.innerWidth > 470 ? 140 : 190;
            var svgHeight = window.innerHeight - menueHeight;
            var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
            var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

            var svgChart = d3.select("#chart").append("svg")
                .attr("width", chartWidth + chartMargin.left + chartMargin.right)
                .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
                .append("g")
                .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");


            var div = d3.select("#chart").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var xScale = d3.time.scale()
                .range([0, chartWidth])
                .domain(d3.extent(data, function(d) {
                    return d.date;
                }));

            var yMinRate = d3.min(data, function(d) {
                return d.rate;
            });

            var yMaxRate = d3.max(data, function(d) {
                return d.rate;
            });

            var difference = yMaxRate - yMinRate;

            var rateMargin = 1 + difference * 0.2;

            var yScale = d3.scale.linear()
                .range([chartHeight, 0])
                .domain([yMinRate-rateMargin , yMaxRate+rateMargin]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(5);

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(5)
                .tickSize(6, 0);

            var line = d3.svg.line()
                .x(function(d) {
                    return xScale(d.date);
                })
                .y(function(d) {
                    return yScale(d.rate);
                })
                .interpolate("monotone");


            svgChart.append("path")
                .attr("class", "line")
                .attr("d", line(data));

            svgChart.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(currencyAbb);

            svgChart.append("g")
                .attr("class", "x axis")
                .call(xAxis)
                .attr("transform", "translate(0," + chartHeight + ")");

            svgChart.selectAll(".x").selectAll(".tick").selectAll("text")
                .attr("transform", function(d) {
                    return "translate(" + (4 + this.getBBox().height / 2) + "," + (9 + this.getBBox().width / 2) + ")rotate(90)";
                });

            var bisectDate = d3.bisector(function(d) {
                return d.date;
            }).left;

            var formatCurrency = function(d) {
                return d3.format(",")(d);
            };

            svgChart.append("rect")
                .attr("class", "overlay")
                .attr("width", chartWidth)
                .attr("height", chartHeight)
                .on("mouseover", function() {
                    focus.style("display", null);
                })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", mousemove);

            var focus = svgChart.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("rect")
                .attr("x", -83)
                .attr("y", -2)
                .attr("width", 75)
                .attr("height", 35)
                .attr("fill", "#1f77b4")
                .attr("fill-opacity", ".8");

            focus.append("circle")
                .attr("r", 3.5);

            focus.append("text")
                .attr("x", -79)
                .attr("class", "date")
                .attr("dy", "2.5em");

            focus.append("text")
                .attr("x", -79)
                .attr("class", "rate")
                .attr("dy", "1em")

            function mousemove() {
                var x0 = 0;
                var x0 = xScale.invert(d3.mouse(this)[0]),
                    i = bisectDate(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i],
                    d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                focus.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d.rate) + ")");
                focus.select(".date").text(formatTime(d.date));
                focus.select(".rate").text(formatCurrency(d.rate));

                div.html(formatTime(d.date) + "<br/>" + d.rate)
                    .style("left", (d3.event.pageX - 40) + "px")
                    .style("top", (yScale(d.rate)) + "px");
            }
        };
 
        var makeUTCDate = function(incomeDate) {
            var date = new Date(incomeDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date;
        };

        var dateInBelarus = function() {
            var date = new Date();
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + 3 * 60);
            return date;
        };

        var convertDates = function(data) {
            for (var i = 0; i < data.length; i++) {
                var date = new Date(data[i].date);
                date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                data[i].date = date;
            };
            return data;
        }

        return {
            restrict: "A",

            controller: function($scope, $element, $attrs) {

                $scope.showDropdown = function(elementId) {
                    var element = document.getElementById(elementId),
                        event = document.createEvent('MouseEvents');
                    event.initMouseEvent('mousedown', true, true, window);
                    $timeout(function() {
                        element.dispatchEvent(event);
                    });
                };

                $scope.listCurrencies = [];
                $scope.ratesHistory = [];

                $scope.filter = {
                    selectCur: 'USD',
                    dateFrom: new Date(2016, 0, 1),
                    dateTo: dateInBelarus()
                };

                $scope.$watchCollection("filter", function(newValue, oldValue) {
                    $scope.getHistory();
                });

                $scope.$watch("ratesHistory", function(newValue, oldValue) {
                    makeChart($scope.ratesHistory, $scope.filter.selectCur);
                })

                $scope.$on('fromDate_changed', function(event, data) {
                    $scope.filter.dateFrom = data;
                });
                $scope.$on('toDate_changed', function(event, data) {
                    $scope.filter.dateTo = data;
                });

                function showErrorMsg(msg) {
                    if (msg) {
                        $scope.$emit("showSystemMsg", { template: msg });
                    }
                }

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
                            $scope.ratesHistory = convertDates(response.data);
                            showErrorMsg(response.errorMsg);
                        }).error(function(error) {
                            $scope.$emit("hideLoading", {});
                            $scope.$emit("showSystemMsg", {});
                        });
                }

                $scope.getListCurrencies();

                angular.element(window).bind('resize orientationchange', function() {
                    makeChart($scope.ratesHistory, $scope.filter.selectCur);
                });
            },
            templateUrl: 'templates/coursesChart.html'
        };
    }
]);
