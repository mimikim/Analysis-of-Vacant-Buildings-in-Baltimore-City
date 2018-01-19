var vacancies_graph = function () {
    var $Endpoint = "https://data.baltimorecity.gov/resource/rw5h-nvv4.json?$$app_token=C08vs2kMRPT7Vesf72N7Fxdcd",
        totalResults = {},
        graph = document.getElementsByClassName("graph"),
        chartMain;

    // generate graph
    var generateGraph = function (canvasID, chartType, data, title) {
        // if chart object already exists, please destroy before creating new chart
        if (typeof chartMain !== "undefined") {
            chartMain.destroy();
        }

        var ctx = document.getElementById("main-graph"),
            configOptions = {
                maintainAspectRatio: false,
                type: chartType,
                defaults: {
                    global: {
                        defaultFontColor: "#000000",
                        fontFamily: "'Montserrat', sans-serif",
                    }
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        fontSize: 18,
                        text: title
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }

                },
            };

        // merge passed data to config options
        configOptions.data = data;

        // create new chart!
        chartMain = new Chart(ctx, configOptions);
    };

    // function to assemble graph config options
    var generateGraphConfigs = function (object, parameters) {
        var graphTitle,
            objData,
            numOfLabels = object.labels.length,
            labels,
            length;

        // generate range
        switch (parameters.range) {
            case "all": {
                objData = object.count;
                length = numOfLabels;
                labels = object.labels;
                break;
            }
            case "half": {
                // see only half
                length = Math.ceil(numOfLabels / 2);
                objData = object.count.splice(0, length);
                labels = object.labels.splice(0, length);
                break;
            }
            case "quarter": {
                // see a quarter
                length = Math.ceil(numOfLabels / 4);
                objData = object.count.splice(0, length);
                labels = object.labels.splice(0, length);
                break;
            }
            case "eighth": {
                // see an eighth
                length = Math.ceil(numOfLabels / 8);
                objData = object.count.splice(0, length);
                labels = object.labels.splice(0, length);
                break;
            }
            default: {
                // ohnoes
                break;
            }
        }

        // generate colors for the number of labels
        var colors = Please.make_color({
            colors_returned: length
        });

        var data = {
            labels: labels,
            datasets: [{
                label: "# of Vacancies",
                data: objData,
                backgroundColor: colors
            }]
        };

        // place a space if there is "district"
        if( parameters.object.search("district") ) {
            var pos = parameters.object.search("district"),
                first_half = parameters.object.substring(0, pos),
                last_half = parameters.object.substring(pos, parameters.object.length);

            graphTitle = ("Vacancies by " + first_half + " " + last_half).toUpperCase();

        } else {
            graphTitle = ("Vacancies by" + parameters.object).toUpperCase();
        }

        generateGraph("main-graph", "bar", data, graphTitle);
    };

    // extrapolate data with SoQL
    var apiCalls = function (parameters) {
        var select,
            order,
            Xlabels;

        // if councildistrict, set data type to number
        if (parameters.object == "councildistrict") {
            select = parameters.object;
            Xlabels = parameters.object;
        } else {
            select = "upper(" + parameters.object + ")";
            Xlabels = "upper_" + parameters.object;
        }

        // set "order" parameters in the query
        switch (parameters.sort) {
            case "alphabeticalASC": {
                // alphabetically ascending
                order = select + " ASC";
                break;
            }
            case "alphabeticalDESC": {
                // alphabetically descending
                order = select + " DESC";
                break;
            }
            case "DESC": {
                // highest # vacants
                order = "count(referenceid) DESC";
                break;
            }
            case "ASC": {
                // lowest # vacants
                order = "count(referenceid) ASC";
                break;
            }
            default: {
                // you dun goofed up
                break;
            }
        }

        var query = encodeURI("&$select=" + select + ",count(referenceid)&$group=" + select + "&$order=" + order);

        // do xmlhttp request, callback will map array to be passed to generateGraphConfigs()
        var xhr = new XMLHttpRequest();
        xhr.open("GET", $Endpoint + query, true);
        xhr.send(null);
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText);

                // clean up results
                totalResults.labels = response.map(function (obj) {
                    return obj[Xlabels];
                });
                totalResults.count = response.map(function (obj) {
                    return obj.count_referenceid;
                });

                // if the results are for police district, please combine "notheastern" and "northeastern" columns
                if(parameters.object == "policedistrict") {
                    var northeastern_key,
                        northeastern_data,
                        wrong_key,
                        wrong_data,
                        new_data;

                    // find element keys and value
                    for( var key in totalResults.labels ) {
                        if(totalResults.labels[key] == "NORTHEASTERN") {
                            northeastern_key = key;
                            northeastern_data = totalResults.count[key];
                        }

                        if(totalResults.labels[key] == "NOTHEASTERN") {
                            wrong_key = key;
                            wrong_data = totalResults.count[key];
                        }
                    }

                    // calculate new value
                    new_data = (parseInt(northeastern_data) + parseInt(wrong_data)).toString();

                    // add new value to "Northeastern" column
                    totalResults.count[northeastern_key] = new_data;

                    // remove wrong columns
                    totalResults.count.splice(wrong_key, 1);
                    totalResults.labels.splice(wrong_key, 1);

                    // if parameters.sort is "ASC" or "DESC", make sure this newly combined data is in the right place
                    if(parameters.sort == "ASC" || parameters.sort == "DESC" ) {
                        // sort ascending
                        totalResults.count.sort(function (a, b) {
                            return a - b;
                        });

                        // if DESC, reverse order
                        if (parameters.sort == "DESC") {
                            totalResults.count.reverse();
                        }

                        // find the key of the new value
                        var sorted_key = totalResults.count.indexOf(new_data),
                            newkey = ( northeastern_key === 0) ? '0' : northeastern_key-1;

                        // make sure to swap the label elements
                        // remove the element at old key
                        totalResults.labels.splice(newkey, 1);

                        // insert new element into array at position "sorted_key"
                        totalResults.labels.splice(sorted_key, 0, "NORTHEASTERN");
                    }
                }

                // generate configs, pass data
                generateGraphConfigs(totalResults, parameters);
            }

            // if the request fails, display error message!
            if (this.readyState == 4 && this.status == 400) {
                for (var i = 0; i < graph.length; i++) {
                    graph[i].innerHTML = "Connection was unsuccessful, data could be displayed. Please try again later!";
                }
            }
        };
    };

    // function to listen to radio selections
    var radioSelection = function () {
        var parameters = {};

        // assemble graph info on radio button click
        var radioButtons = document.getElementsByClassName("radio_button");
        for (var x = 0; x < radioButtons.length; x++) {

            // on init, assemble default selection
            if (radioButtons[x].checked) {
                var classes = radioButtons[x].className.split(" ");
                parameters[classes[1]] = radioButtons[x].value;
            }

            // on radio click, reassemble api parameters and re-call api
            radioButtons[x].addEventListener("click", function () {
                var classes = this.className.split(" ");
                parameters[classes[1]] = this.value;

                if( parameters.object == "neighborhood" ) {
                    document.getElementById("graphRange").style.display = "inline-block";

                } else {
                    parameters.range = "all";
                    document.getElementById("graphRange").style.display = "none";
                }

                apiCalls(parameters);
            });
        }

        // assemble api calls based off radio selection
        apiCalls(parameters);
    };

    return {
        init: radioSelection
    };
}();

window.onload = function () {
    // last updated date. update this every time the text/analysis is updated
    var last_updated_date = "March&nbsp;16,&nbsp;2017";
    for (var x = 0; x < document.getElementsByClassName("last-updated-date").length; x++) {
        document.getElementsByClassName("last-updated-date")[x].innerHTML = last_updated_date;
    }

    vacancies_graph.init();
};