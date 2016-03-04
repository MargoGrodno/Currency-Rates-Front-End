angular.module('app.chartDirective', [])

.directive('coursesChart', ['$ionicPopup', '$http', 'serverUrl', 'monthList',
    function($ionicPopup, $http, serverUrl, monthList) {

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
            var menueHeight = window.innerWidth > 450 ? 150 : 210;
            var svgHeight = window.innerHeight - menueHeight;
            var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
            var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

            var svgChart = d3.select("#chart").append("svg")
                .attr("width", chartWidth + chartMargin.left + chartMargin.right)
                .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
                .append("g")
                .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

            var xScale = d3.time.scale()
                .range([0, chartWidth])
                .domain(d3.extent(data, function(d) {
                    return d.date;
                }));

            var yScale = d3.scale.linear()
                .range([chartHeight, 0])
                .domain(d3.extent(data, function(d) {
                    return d.rate;
                }));

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
                .interpolate("cardinal");


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

            var div = d3.select("#chart").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svgChart.selectAll(".dot")
                .data(makeControlPoints(90, data))
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", line.x())
                .attr("cy", line.y())
                .attr("r", 2.5)
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(formatTime(d.date) + "<br/>" + d.rate)
                        .style("left", (d3.event.pageX - 40) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

        };

        function diffDays(lastDay, firstDay) {
            var milisecDiff = firstDay.getTime() - lastDay.getTime();
            return Math.ceil(milisecDiff / (1000 * 3600 * 24));
        }

        function getMinMaxPoints(data) {
            var min = data[0],
                max = data[0];
            for (var i = 0; i < data.length; i++) {
                if (data[i].rate < min.rate) {
                    min = data[i];
                }
                if (data[i].rate > max.rate) {
                    max = data[i];
                }
            };
            return { min: min, max: max };
        }

        function makeControlPoints(numPionts, data) {
            if (data.length == 0) {
                return [];
            }
            var result = [];

            var firstDay = data[0].date;
            var lastDay = data[data.length - 1].date;
            var diff = diffDays(firstDay, lastDay);
            
            var numMins = numPionts / 2;
            if (diff < numMins) {
                return data;
            }
            
            var period = diff / numMins;
            console.log("period: " + period);

            var prevInd = 0;
            var processingPeriod = 0;
            
            while (Math.ceil(processingPeriod) < diff) {
                processingPeriod += period;
                var ind = Math.ceil(processingPeriod);
                minMAx = getMinMaxPoints(data.slice(prevInd, ind + 1));
                if (minMAx.min == result[result.length - 1]) {
                    console.log("OPA!");
                    console.log(minMAx.min.date);
                    
                    minMAx.min = data[prevInd + Math.round(period / 2)];
                }
                result.push(minMAx.min);
                result.push(minMAx.max);
                prevInd = ind;
            }
            console.log(result.length);
            return result;
        }

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
                $scope.listCurrencies = [];
                $scope.ratesHistory = [];

                $scope.filter = {
                    selectCur: 'USD',
                    dateFrom: new Date(2016, 0, 3),
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
            },
            templateUrl: 'templates/coursesChart.html'
        };
    }
]);
