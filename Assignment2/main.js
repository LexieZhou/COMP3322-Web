// Author: Zhou Zihan
// Student ID: 3035772640

var main = () => {
    fetchData().then(renderEverything);
    
};

var renderEverything = ({WR, WF, aqhi, location, WS, aqhiS}) => {
    console.log(WR);
    console.log(WF);
    console.log(aqhi);
    console.log(location);
    console.log(WS);
    console.log(aqhiS);

    renderTitle();
    renderHeaderBlock(WR);
    renderMydataBlock(WR, aqhi, location, WS, aqhiS);
    renderTemperatureBlock(WR);
    renderRainfallBlock(WR);
    renderAirBlock(aqhi);
    renderForecastBlock(WF);
    renderNightMode();

    // expand block
    var temperatureBlock = document.getElementById("temperatureBlock");
    temperatureBlock.addEventListener("click", (event) => blockClickHandler(event, "temperatureBlock"));
    var rainfallBlock = document.getElementById("rainfallBlock");
    rainfallBlock.addEventListener("click", (event) => blockClickHandler(event, "rainfallBlock"));
    var airBlock = document.getElementById("airBlock");
    airBlock.addEventListener("click", (event) => blockClickHandler(event, "airBlock"));

    // event listener
    var temperatureSelector = document.getElementById("locationSelect");
    temperatureSelector.addEventListener("change", (event) => {
        console.log(event.target.value);
        event.stopPropagation();
        if (event.target.value == "") {
            document.getElementById("locationTemperature").innerHTML = "";
        } else {
            for (key of WR.temperature.data) {
                if (event.target.value == key.place) {
                    document.getElementById("locationTemperature").innerHTML = `${key.value}<span class="selectSuffix" id="TselectSuffix">°C</span>`;
                }
            }
        }
    });
    var rainfallSelector = document.getElementById("rainfallSelect");
    rainfallSelector.addEventListener("change", (event) => {
        console.log(event.target.value);
        event.stopPropagation();
        if (event.target.value == "") {
            document.getElementById("locationRainfall").innerHTML = "";
        } else {
            for (key of WR.rainfall.data) {
                if (event.target.value == key.place) {
                    document.getElementById("locationRainfall").innerHTML = `${key.max}<span class="selectSuffix">mm</span>`;
                }
            }
        }
    });
    var aqhiSelector = document.getElementById("aqhiSelect");
    aqhiSelector.addEventListener("change", (event) => {
        console.log(event.target.value);
        event.stopPropagation();
        if (event.target.value == "") {
            document.getElementById("locationAQHIlevel").innerHTML = "";
            document.getElementById("locationAQHIrisk").innerHTML = "";
        } else {
            for (let i = 0; i < Object.keys(aqhi).length; i++) {
                if (event.target.value == aqhi[i].station) {
                    document.getElementById("locationAQHIlevel").innerHTML = `Level: ${aqhi[i].aqhi}`;
                    document.getElementById("locationAQHIrisk").innerHTML = `Risk: ${aqhi[i].health_risk}`;
                }
            }
        }
    });
    if (WR.warningMessage) {
        var warningBtn = document.getElementById("warningBtn");
        warningBtn.addEventListener("click", () => toggleWarning(WR));
    }
};

var renderTitle = () => {
    var heading = document.createElement("h1");
    heading.textContent = "My Weather Portal";
    document.body.appendChild(heading);
    for (var i = 0; i < 3; i++) {
        var row = document.createElement("div");
        row.className = "row";
        row.id = "row" + i;
        document.body.appendChild(row);
    }
};

var renderHeaderBlock = (WR) => {
    appendElement("row0", "<div class='block' id='headerBlock'></div>")
    // background
    renderBackground(WR.rainfall.data[13].max);
    appendElement("headerBlock", "<h2 class='blockTitle'>Hong Kong</h2>")
    // header info row
    appendElement("headerBlock", "<div class='rowBox' id='headerInfoRow'></div>")
    renderHeaderIcon(WR.icon[0]);
    appendElement("headerInfoRow", `<p class="infoTxt" id="temperature">${WR.temperature.data[1].value}<span class="suffix" id="temperatureSuffix">°C</span></p>`);
    appendElement("headerInfoRow", `<p class="infoTxt" id="humidity">${WR.humidity.data[0].value}<span class="suffix">%</span></p>`);
    renderSmallIcon("humidityIcon", "humidity", "images/drop-64.png", "humidity");
    appendElement("headerInfoRow", `<p class="infoTxt" id="rainfall">${WR.rainfall.data[13].max}<span class="suffix">mm</span></p>`);
    renderSmallIcon("rainfallIcon", "rainfall", "images/rain-48.png", "rainfall");
    // UV
    if (WR.uvindex != "" && WR.uvindex.data[0].value > 0) {
        appendElement("headerInfoRow", `<p class="infoTxt" id="UV">${WR.uvindex.data[0].value}</p>`);
        renderSmallIcon("UVIcon", "UV", "images/UVindex-48.png", "UV");
    }
    appendElement("headerBlock", `<p id="updateMsg">Last Update: ${getUpdateTime(WR.updateTime)}</p>`)
    // warning
    if (WR.warningMessage != "") {
        renderWarning();
    }

};
var getUpdateTime = (timeString) => {
    const dateTime = new Date(timeString);
    const hours = dateTime.getHours().toString().padStart(2, '0');
    const minutes = dateTime.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime;
};
var renderBackground = (rain) => {
    var hour = new Date().getHours();
    var daytime = 7 <= hour && hour < 18;
    var raining = rain > 0;
    var block = document.getElementById("headerBlock");

    if (raining && daytime) {
        block.style.backgroundImage = 'url("images/water-drops-glass-day.jpg")';
    } else if (raining && !daytime) {
        block.style.backgroundImage = 'url("images/water-drops-glass-night.jpg")';
    } else if (!raining && daytime) {
        block.style.backgroundImage = 'url("images/blue-sky.jpg")';
    } else {
        block.style.backgroundImage = 'url("images/night-sky.jpg")';
    } 
    block.style.backgroundSize = "100% 100%";
    block.style.backgroundRepeat = "no-repeat";
};
var renderHeaderIcon = (icon) => {
    var headerInfoRow = document.getElementById("headerInfoRow");
    var iconImg = document.createElement("img");
    iconImg.className = "icon";
    iconImg.src = `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${icon}.png`;
    headerInfoRow.appendChild(iconImg);
};
var renderSmallIcon = (id, blockId, src, alt) => {
    var block = document.getElementById(blockId);
    var iconImg = document.createElement("img");
    iconImg.className = "smallIcon";
    iconImg.id = id;
    iconImg.src = src;
    iconImg.alt = alt;
    block.appendChild(iconImg);
};
var renderWarning = () => {
    appendElement("headerBlock", "<Button id='warningBtn'><strong>Warning</strong></Button>");
};
var toggleWarning = (WR) => {
    var warningBtn = document.getElementById("warningBtn");
    if (warningBtn.innerHTML == "<strong>Warning</strong>") {
        warningBtn.innerHTML = `<strong>Warning</strong><p id="warningMsg">${WR.warningMessage}</p>`;
    } else {
        warningBtn.innerHTML = "<strong>Warning</strong>";
    }
};
    
/* MyData block */
var renderMydataBlock = (WR, aqhi, location, WS, aqhiS) => {
    appendElement("row0", "<div class='block' id='myDataBlock'></div>")
    appendElement("myDataBlock", "<h2 class='blockTitle'>My Location</h2>");
    var suburb = renderSuburb(location);
    var district = renderDistrict(location);
    appendElement("myDataBlock", `<p class='myLocationTxt' id='locationTxt'>${suburb}, ${district}</p>`);
    appendElement("myDataBlock", "<div class='rowBox' id='myDataInfoRow'></div>")
    var nearestTStation = findNearestTStation(location, WS);
    renderStationTemperature(nearestTStation, WR);
    renderStationRainfall(district, WR);
    var nearestAQHIStation = findNearestAQHIStation(location, aqhiS);
    renderStationAQHI(nearestAQHIStation, aqhi);
};
var renderSuburb = (location) => {
    var suburbPos;
    if (location.address.hasOwnProperty('suburb')) {
        suburbPos = location.address.suburb;
    } else if (location.address.hasOwnProperty('borough')) {
        suburbPos = location.address.borough;
    } else if (location.address.hasOwnProperty('town')) {
        suburbPos = location.address.town;
    } else {
        suburbPos = "Unknown";
    }
    return suburbPos;
};
var renderDistrict = (location) => {
    var districtPos;
    if (location.address.hasOwnProperty('city_district')) {
        districtPos = location.address.city_district;
    } else {
        for (key of location.address) {
            if (key.includes("District")) {
                districtPos = location.address.key;
                break;
            }
        }
        districtPos = "Unknown";
    }
    return districtPos;
};
var findNearestTStation = (location, WS) => {
    var lat = location.lat * Math.PI/180;
    var lon = location.lon * Math.PI/180;
    var nearestStation;
    var minDistance = Infinity;
    for (let i = 0; i < Object.keys(WS).length; i++) {
        var stationLat = WS[i].latitude * Math.PI/180;
        var stationLon = WS[i].longitude * Math.PI/180;
        var x = (stationLon - lon) * Math.cos((lat + stationLat)/2);
        var y = stationLat - lat;
        var distance = Math.sqrt(x*x + y*y) * 6371;
        if (distance < minDistance) {
            minDistance = distance;
            nearestStation = WS[i];
        }
    }
    return nearestStation;
};
var findNearestAQHIStation = (location, aqhiS) => {
    var lat = location.lat * Math.PI/180;
    var lon = location.lon * Math.PI/180;
    var nearestStation;
    var minDistance = Infinity;
    for (let i = 0; i < Object.keys(aqhiS).length; i++) {
        var stationLat = aqhiS[i].lat * Math.PI/180;
        var stationLon = aqhiS[i].lng * Math.PI/180;
        var x = (stationLon - lon) * Math.cos((lat + stationLat)/2);
        var y = stationLat - lat;
        var distance = Math.sqrt(x*x + y*y) * 6371;
        if (distance < minDistance) {
            minDistance = distance;
            nearestStation = aqhiS[i];
        }
    }
    return nearestStation;
};
var renderStationTemperature = (station, WR) => {
    var stationName = station.station_name_en;
    var stationTemp;
    for (key of WR.temperature.data) {
        if (stationName == "Tseun Wan" && key.place == "Tsuen Wan Ho Koon") {
            stationTemp = key.value;
            console.log("stationName: " + stationName + "matching: " + key.place + " stationTemp: " + stationTemp);
            break;
        }
        if (stationName == key.place) {
            stationTemp = key.value;
            console.log("stationName: " + stationName + "matching: " + key.place + " stationTemp: " + stationTemp);
            break;
        }
        stationTemp = "Unknown";
    }
    appendElement("myDataInfoRow", `<p class="infoTxt" id="stationTemp">${stationTemp}<span class="suffix" id="stationTsuffix">°C</span></p>`);
};
var renderStationRainfall = (district, WR) => {
    let rainfall = "0";
    console.log("district: " + district);
    for (key of WR.rainfall.data) {
        if (key.place == "Central & Western District" && district == "Central and Western District") {
            rainfall = key.max;
            console.log("matching1: " + key.place + " stationRainfall: " + key.max);
            break;
        }
        if (district.includes(key.place)) {
            console.log("matching2: " + key.place + " stationRainfall: " + key.max);
            rainfall = key.max;
            break;
        }
    }
    appendElement("myDataInfoRow", `<p class='infoTxt' id='stationRainfall'>${rainfall}<span class="suffix">mm</span></p>`)
    renderSmallIcon("stationRainfallIcon", "stationRainfall", "images/rain-48.png", "rainfall");
};
var renderStationAQHI = (station, aqhi) => {
    var stationName = station.station;
    var stationAQHIlevel, stationAQHIrisk;
    for (let i = 0; i < Object.keys(aqhi).length; i++) {
        if (stationName == aqhi[i].station) {
            stationAQHIlevel = aqhi[i].aqhi;
            stationAQHIrisk = aqhi[i].health_risk;
            break;
        }
        stationAQHIlevel = "Unknown";
        stationAQHIrisk = "Unknown";
    }
    appendElement("myDataInfoRow", "<div id='stationAQHIInfo'></div>");
    appendElement("stationAQHIInfo", `<p class='AQHIinfoTxt' id='stationAQHIlevel'>${stationAQHIlevel}</p>`);
    appendElement("stationAQHIInfo", `<p class='AQHIinfoTxt' id='stationAQHIrisk'>${stationAQHIrisk}</p>`);
    var risk = stationAQHIrisk.toLowerCase();
    renderSmallIcon("stationAQHIRiskIcon", "stationAQHIInfo", `images/aqhi-${risk}.png`, "AQHIriskIcon");
};

var renderTemperatureBlock = (WR) => {
    appendElement("row1", "<div class='block' id='temperatureBlock'></div>")
    appendElement("temperatureBlock", "<h2 class='blockTitle'>Temperatures</h2>");
    appendElement("temperatureBlock", "<p class='selectP'>Select the location</p>")
    appendElement("temperatureBlock", "<select class='select' id='locationSelect'></select>")
    appendElement("locationSelect", `<option value=""></option>`); // default option
    var temperatureData = WR.temperature.data;
    var temperatureList = [];
    for (let i = 0; i < Object.keys(temperatureData).length; i++) {
        temperatureList.push(temperatureData[i].place);
    }
    temperatureList.sort();
    temperatureList.forEach((location) => {
        appendElement("locationSelect", `<option value="${location}">${location}</option>}`);
    });
    appendElement("temperatureBlock", "<p class='selectResult' id='locationTemperature'></p>");

};

var renderRainfallBlock = (WR) => {
    appendElement("row1", "<div class='block' id='rainfallBlock'></div>")
    appendElement("rainfallBlock", "<h2 class='blockTitle'>Rainfall</h2>");
    appendElement("rainfallBlock", "<p class='selectP'>Select the district</p>")
    appendElement("rainfallBlock", "<select class='select' id='rainfallSelect'></select>")
    appendElement("rainfallSelect", `<option value=""></option>`);
    var rainfallData = WR.rainfall.data;
    var rainfallList = [];
    for (let i = 0; i < Object.keys(rainfallData).length; i++) {
        rainfallList.push(rainfallData[i].place);
    }
    rainfallList.sort();
    rainfallList.forEach((district) => {
        appendElement("rainfallSelect", `<option value="${district}">${district}</option>}`);
    });
    appendElement("rainfallBlock", "<p class='selectResult' id='locationRainfall'></p>");
}

var renderAirBlock = (aqhi) => {
    appendElement("row1", "<div class='block' id='airBlock'></div>")
    appendElement("airBlock", "<h2 class='blockTitle'>Air Quality</h2>");
    appendElement("airBlock", "<p class='selectP'>Select the AQ station</p>")
    appendElement("airBlock", "<select class='select' id='aqhiSelect'></select>")
    appendElement("aqhiSelect", `<option value=""></option>`);
    var aqhiList = [];
    for (let i = 0; i < Object.keys(aqhi).length; i++) {
        aqhiList.push(aqhi[i].station);
    }
    aqhiList.sort();
    aqhiList.forEach((station) => {
        appendElement("aqhiSelect", `<option value="${station}">${station}</option>}`);
    });
    appendElement("airBlock", "<p class='selectResultaqhi' id='locationAQHIlevel'></p>");
    appendElement("airBlock", "<p class='selectResultaqhi' id='locationAQHIrisk'></p>");
};
var isSelectElement = (element) => {
    return element.tagName.toLowerCase() == "select" || element.tagName.toLowerCase() == "option";
};
var blockClickHandler = (event, blockID) => {
    if (isSelectElement(event.target)) {
        return;
    }
    toggleBlock(blockID);
};
var toggleBlock = (blockID) => {
    switch (blockID) {
        case "temperatureBlock":
            console.log("temperatureBlock clicked");
            var block = document.getElementById("temperatureBlock");
            if (block.classList.contains("expanded")) {
                block.classList.remove("expanded");
            } else {
                block.classList.add("expanded");
                document.getElementById("rainfallBlock").classList.remove("expanded");
                document.getElementById("airBlock").classList.remove("expanded");
            }
            break;
        case "rainfallBlock":
            var block = document.getElementById("rainfallBlock");
            if (block.classList.contains("expanded")) {
                block.classList.remove("expanded");
            } else {
                block.classList.add("expanded");
                document.getElementById("temperatureBlock").classList.remove("expanded");
                document.getElementById("airBlock").classList.remove("expanded");
            }
            break;
        case "airBlock":
            var block = document.getElementById("airBlock");
            if (block.classList.contains("expanded")) {
                block.classList.remove("expanded");
            } else {
                block.classList.add("expanded");
                document.getElementById("temperatureBlock").classList.remove("expanded");
                document.getElementById("rainfallBlock").classList.remove("expanded");
            }
            break;
    }
};


var renderForecastBlock = (WF) => {
    appendElement("row2", "<div class='block' id='forecastBlock'></div>")
    appendElement("forecastBlock", "<h2 class='blockTitle'>9-Day Forecast</h2>");
    appendElement("forecastBlock", "<div class='forecastInfo' id='forecasts'></div>");
    appendElement("forecasts", "<div id='forecastContent'></div>");

    var WFdata = WF.weatherForecast;
    for (let i = 0; i < Object.keys(WFdata).length; i++) {
        renderDayForecast(i, WFdata[i]);
    }
};

var renderDayForecast = (i, dayData) => {
    appendElement("forecastContent", `<div class='dayForecast' id='forecast${i}'></div>`);
    var date = renderDate(dayData.week, dayData.forecastDate);
    var icon = dayData.ForecastIcon;
    var PSR = dayData.PSR.replace(/\s/g, "");
    var tempMin = dayData.forecastMintemp.value;
    var tempMax = dayData.forecastMaxtemp.value;
    var humidityMin = dayData.forecastMinrh.value;
    var humidityMax = dayData.forecastMaxrh.value;
    appendElement(`forecast${i}`, `<p class='forecastDate'>${date}</p>`);
    renderForcastIcon(i, icon);
    // renderPSRIcon(`PSRicon${i}`, `forecast${i}`, `images/PSR${PSR}_50_light.png`, "PSRicon");
    renderPSRIcon(`PSRicon${i}`, `forecast${i}`, `https://www.hko.gov.hk/common/images/PSR${PSR}_50_light.png`, "PSRicon");
    appendElement(`forecast${i}`, `<p class='forecastTemps'>${tempMin} - ${tempMax}<span class="suffix"> °C</p>`);
    appendElement(`forecast${i}`, `<p class='forecastHumidity'>${humidityMin} - ${humidityMax}<span class="suffix"> %</p>`);
};
var renderDate = (week, date) => {
    var dateObj = new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2));
    var dayOfWeek = week.substr(0, 3);
    var month = dateObj.toLocaleDateString('en-US', { month: 'numeric' });
    var day = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
    var formattedDateString = dayOfWeek + ' ' + month + '/' + day;
    return formattedDateString;
};
var renderForcastIcon = (i, icon) => {
    var headerInfoRow = document.getElementById(`forecast${i}`);
    var iconImg = document.createElement("img");
    iconImg.className = "forcastIcon";
    iconImg.src = `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${icon}.png`;
    headerInfoRow.appendChild(iconImg);
};
var renderPSRIcon = (id, blockId, src, alt) => {
    var block = document.getElementById(blockId);
    var iconImg = document.createElement("img");
    iconImg.className = "PSRIcon";
    iconImg.id = id;
    iconImg.src = src;
    iconImg.alt = alt;
    block.appendChild(iconImg);
};

var renderNightMode = () => {
    var hour = new Date().getHours();
    var daytime = 7 <= hour && hour < 18;
    if (!daytime) {
        var x = document.getElementById("headerBlock").getElementsByTagName("div");
        var y = document.getElementById("headerBlock").getElementsByTagName("p");
        var title = document.getElementById("headerBlock").getElementsByClassName("blockTitle")[0];
        for (let i = 0; i < x.length; i++) {
        x[i].classList.toggle('night');
        }
        for (let j = 0; j < y.length; j++) {
        y[j].classList.toggle('night');
        }
        title.style.color = "white";
    }
}

const fetchData = async function() {
    const weatherUrl = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en";
    const currentWeather = fetch(weatherUrl).then(response => response.json());
    const forecastUrl = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en";
    const weatherForecast = fetch(forecastUrl).then(response => response.json());
    const aqhiUrl = "https://dashboard.data.gov.hk/api/aqhi-individual?format=json";
    const aqhi = fetch(aqhiUrl).then(response => response.json());
    const weatherStationUrl = "https://ogciopsi.blob.core.windows.net/dataset/weather-station/weather-station-info.json";
    const weatherStation = fetch(weatherStationUrl).then(response => response.json());
    const aqhiStation = fetch("data/aqhi-station-info.json").then(response => response.json());

    var lat, lon;
    const location = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
            ).then( (response) => {
                resolve(response.json());
            });
        });
    });

    return Promise.all([
        currentWeather,
        weatherForecast,
        aqhi,
        location,
        weatherStation,
        aqhiStation,
      ]).then((value) => {
        var ret = {
          WR: value[0],
          WF: value[1],
          aqhi: value[2],
          location: value[3],
          WS: value[4],
          aqhiS: value[5],
        };
        return ret;
    });
};

var appendElement = (blockID, content) => {
    var block = document.getElementById(blockID);
    block.innerHTML += content;
};


document.addEventListener("DOMContentLoaded", main);