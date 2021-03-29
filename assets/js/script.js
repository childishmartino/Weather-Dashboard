window.addEventListener("load", function () {

    var existingHistory;
    if (!JSON.parse(localStorage.getItem("history"))) {
        existingHistory = [];
    } else {
        existingHistory = JSON.parse(localStorage.getItem("history"));
    };

    var historyItems = [];
    var historyEl = document.getElementById("history-list");

        /* trying to build history
        function buildHistory() { 
        historyEl.innerHTML = " ";
        for (i=0; i<historyItems.length; i++) {
            var historyListEl = document.createElement("input");
            historyListEl.setAttribute("type","text");
            historyListEl.setAttribute("readonly",true);
            historyListEl.setAttribute("class", "form-control d-block bg-white");
            historyListEl.setAttribute("value", historyItems[i]);
            historyListEl.addEventListener("click",function() {
                searchWeather(historyListEl.value);
            })
            historyEl.append(historyListEl);
        }
    }*/

    function getCity() {
        var city = document.getElementById("city-input").value;
        console.log(city);
        if (city) {
            searchWeather(city);
        }
        existingHistory.push(city);
        localStorage.setItem("history", JSON.stringify(existingHistory));
        buildHistory(city);
    };

    function searchWeather(city) {
        var endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=fde38d5a0d8b5537b69587195efc2f25`;

        fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            if(!existingHistory.includes(city)) {
                //buildHistory(city); 
            };
            console.log(data)

            // use information from first fetch to fill in city name, temp, humidity, wind speed and setup for UV Index call
            var todayEl= document.getElementById("today")
            todayEl.classList.add("border", "border-dark", "m-3", "rounded")

            var calculateDate = new Date(data.dt*1000);
            var todayDate = calculateDate.toLocaleDateString("en-US")
            console.log(todayDate)
            
            var cityNameEL = document.getElementById("city-name");
            cityNameEL.innerHTML = data.name +" ("+todayDate+")";

            var todayPicEl = document.getElementById("today-pic");
            var todayWeather = data.weather[0].icon;
            todayPicEl.setAttribute("src","https://openweathermap.org/img/wn/" + todayWeather + "@2x.png");
            todayPicEl.setAttribute("alt",data.weather[0].description);

            
            var todayTempEl = document.getElementById("temperature");
            todayTempEl.innerHTML = "Temperature: " +k2f(data.main.temp) +" &#176F";

            var todayHumidityEl = document.getElementById("humidity");
            todayHumidityEl.innerHTML = "Humidity: " + data.main.humidity + "%";
            
            var todayWindSpeedEl = document.getElementById("wind-speed");
            todayWindSpeedEl.innerHTML = "Wind Speed: " + data.wind.speed + " MPH";

            // info from first fetch needed to fetch UV index and 5 day
            var lat = data.coord.lat;
            var lon = data.coord.lon;
            var cityId = data.id;

            //fetch UV index information
            var getUV = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=fde38d5a0d8b5537b69587195efc2f25`;
            fetch(getUV)
            .then(response => response.json())
            .then(data => {
                var uvIndexEl = document.getElementById("uv-index");
                var uvValue = data.current.uvi
                var uvIndexColor = document.createElement("span");
                uvIndexColor.setAttribute("class", 'badge badge-'+ uvColor(uvValue));
                uvIndexEl.innerHTML = "UV Index: ";
                uvIndexColor.innerHTML = uvValue
                uvIndexEl.append(uvIndexColor)
            });

            //fetch 5 day info 
            var get5Day = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=fde38d5a0d8b5537b69587195efc2f25`
            fetch(get5Day)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                var fiveDayEl = document.getElementById("5-day");
                fiveDayEl.removeAttribute("class", "hide");
                var forecastEls = document.querySelectorAll(".forecast");
                for (i=0; i<forecastEls.length; i++) {
                    forecastEls[i].innerHTML= "";
                    var forecastIndex = i*8 +4;
                    console.log(forecastIndex);
                    
                    var calculateForecastDate = new Date(data.list[forecastIndex].dt*1000);
                    var forecastDate = calculateForecastDate.toLocaleDateString("en-US");
                    var forecastDateEl = document.createElement("h4");
                    forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
                    forecastDateEl.innerHTML = forecastDate;
                    forecastEls[i].append(forecastDateEl);

                    var forecastPicEl = document.createElement("img");
                    forecastPicEl.setAttribute("src","https://openweathermap.org/img/wn/" + data.list[forecastIndex].weather[0].icon + "@2x.png");
                    forecastPicEl.setAttribute("alt", data.list[forecastIndex].weather[0].description);
                    forecastEls[i].append(forecastPicEl); 
                    
                    var forecastTempEl = document.createElement("h5");
                    forecastTempEl.innerHTML = "Temp: " + k2f(data.list[forecastIndex].main.temp) + "&#176F";
                    forecastEls[i].append(forecastTempEl);
                    
                    var forecastHumidityEl = document.createElement("h5");
                    forecastHumidityEl = "Humidity " + data.list[forecastIndex].main.humidity + "%";
                    forecastEls[i].append(forecastHumidityEl);
                }
            });
        })
    };

    //does the math from Kelvin to Fahrenheit
    function k2f(K) {
        return Math.floor((K - 273.15) *1.8 +31);
    };

   // the logic for UV Index color
    function uvColor(uvValue) {
        if (uvValue >= 0 && uvValue <= 2){
            return "success";
        } else if (uvValue >= 3 && uvValue <= 5) {
            return "warning";
        } else {
            return "red"
        }
    };


    document.getElementById("search-btn").addEventListener("click", getCity)
});