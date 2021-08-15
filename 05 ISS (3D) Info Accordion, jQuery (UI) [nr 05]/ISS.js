// Script for showing information about ISS
// DOM
let latitudeText = document.querySelector(".latitude");
let longitudeText = document.querySelector(".longitude");
let timeText = document.querySelector(".time");
let localTimeText = document.querySelector(".localTime");
let speedText = document.querySelector(".speed");
let altitudeText = document.querySelector(".altitude");
let visibilityText = document.querySelector(".visibility");
let currentRadiusText = document.querySelector(".currentRadius");
let currentRadius20degText = document.querySelector(".currentRadius20deg");
let sunPositionText = document.querySelector(".sunPosition");
let unixTime = document.querySelector(".unixTime");

// Setting the default latitude and longitude (here for Gdansk / PL) and zoomLevel
let lat = 54.352;
let long = 18.6466;
let zoomLevel = 4;

// Setting initial position of the Sun
let solar_lat = 0;
let solar_lon = 0;

// Setting the image as an icon of ISS
const icon = L.icon({
  iconUrl: "./Media/transparent-ISS.png",
  iconSize: [100, 40],
  iconAnchor: [50, 20],
});

// Creating the map
const map = L.map("mapDiv", {
  maxBounds: ([-90, -180], [90, 180]),
  maxBoundsViscosity: 1,
  worldCopyJump: true,
  zoomControl: true,
  scrollWheelZoom: false,
}).setView([lat, long], zoomLevel);
// Setting Up position of zomControl
map.zoomControl.setPosition("topright");

// Adding terminator feature to the map (from Jörg Dietrich) - updated every 1s
let terminator = L.terminator().addTo(map);
setInterval(function () {
  terminator.setTime();
}, 1000);

// Adding map tiles to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    'Map data &copy: <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  maxZoom: 18,
  tileSize: 512,
  zoomOffset: -1,
}).addTo(map);

// Adding the icon to the map
const marker = L.marker([lat, long], {icon: icon, title: "Current ISS Position"}).addTo(map);

// Adding the real ISS_size to the map (~radius: 50m)
let ISS_size = L.circle([lat, long], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 50,
  title: "Real ISS Size",
}).addTo(map);

// Creating Visibility Area of the ISS from the Earth with dynamic radius
let visibilityISS = L.circle([lat, long], {
  // radius: 2300000,                    //* Initial radius on the left, now radius is set dynamically
  color: "gold",
  opacity: 0.4,
})
  .bindPopup("ISS visibility area from the Earth")
  .openPopup()
  .addTo(map);

// Adding ISS visibility - altitude 20 deg over the horizon
let visibility20deg = L.circle([lat, long], {
  color: "lightYellow",
  fillColor: "lightYellow",
  fillOpacity: 0.1,
  // radius: 1134360,                    //* Initial radius on the left -> for 10 deg over horizon, now radius is set dynamically
  title: "ISS visibility 20° above the horizon",
})
  .bindPopup("ISS visibility 20° above the horizon", {className: "popupISS"})
  .openPopup()
  .addTo(map);

// Adding the scale to the map
L.control
  .scale({
    maxWidth: 100,
    metric: true,
    position: "topleft",
  })
  .addTo(map);

// Adding the trail of ISS
let trail = L.canvas({padding: 0.01});

// Fetching data from api: https://api.wheretheiss.at/v1/satellites/25544 (25544 -> NORAD catalog ID of ISS)
function getDataISS() {
  fetch("https://api.wheretheiss.at/v1/satellites/25544")
    .then((response) => response.json())
    .then((data) => {
      lat = data.latitude.toFixed(2);
      long = data.longitude.toFixed(2);
      // Converting Unix epoch time to human-readable date and time
      const unixTimestamp = data.timestamp;
      const milliseconds = unixTimestamp * 1000;
      const dateObject = new Date(milliseconds);
      const humanDateFormatLong = dateObject.toString("UTC");
      // Changing the name of Time Zone from long to short (e.g. to CEST)
      const stringTemp1 = humanDateFormatLong.split("(");
      const stringTemp2 = stringTemp1[1].slice(0, -1);
      const stringTemp3 = stringTemp2.split(" ");
      let stringTemp4 = "";
      for (let i = 0; i < stringTemp3.length; i++) {
        stringTemp4 = stringTemp4 + stringTemp3[i].charAt(0);
      }
      const humanDateFormat = stringTemp1[0] + stringTemp4;
      // Generating the UTC Time
      const humanDateFormatUTC = dateObject.toUTCString();
      // Setting other values
      const speed = data.velocity.toFixed(2);
      const altitude = data.altitude.toFixed(2);
      const visibility = data.visibility;
      let solar_lat = data.solar_lat.toFixed(2);
      let solar_lon = data.solar_lon.toFixed(2);
      // Calibrating the position of the Sun
      if (solar_lon > 180) {
        solar_lon = solar_lon - 360;
      }
      // Adding trail of ISS
      let trajectory = [];
      trajectory.push(lat, long);
      let latlngs = trajectory.map((elem) => parseFloat(elem));
      // Updating the drawISS() function
      drawISS(
        lat,
        long,
        humanDateFormatUTC,
        humanDateFormat,
        speed,
        altitude,
        visibility,
        solar_lat,
        solar_lon,
        latlngs,
        unixTimestamp
      );
      calculateRadius(altitude);
      calculateRadius20degrees(altitude);
      prepareArray(altitude);
      prepareDynamicMatrix(humanDateFormatUTC, speed, altitude, lat, long);
      // Adding a 15 seconds delay to drawISS3D function
      setTimeout(function () {
        drawISS3D(lat, long, altitude);
      }, 15000);
    })
    .catch((e) => console.log(e));
}

// Calculating current horizon radius of ISS visibility - > tangent to the Earth
function calculateRadius(altitude) {
  let earthRadius = 6371; // * [km]
  altitude = parseFloat(altitude);
  let radiusVisible = Math.sqrt((earthRadius + altitude) ** 2 - earthRadius ** 2);
  radiusVisible = radiusVisible * 1000; //* [m]
  radiusVisible = parseFloat(radiusVisible);
  visibilityISS.setRadius(radiusVisible);
  currentRadiusText.innerText = `${(radiusVisible / 1000).toFixed(2)} km`;
}

// Calculating current radius of ISS visibility 20 degrees over horizon - using -> //* The law of sines
function calculateRadius20degrees(altitude) {
  altitude = parseFloat(altitude);
  let earthRadius = 6371; // * km
  // Convert Degrees to Radians
  let degToRads = (deg) => (deg * Math.PI) / 180.0;
  // 110 degrees to radians (20 degrees over horizon)
  let angle20degRad = degToRads(110);
  // console.log("angle20degRad:", angle20degRad);
  // alpha angle
  let α = Math.asin((earthRadius * Math.sin(angle20degRad)) / (earthRadius + altitude));
  // beta angle
  let β = Math.PI - angle20degRad - α;
  // Radius of ISS visibility 20 degrees over horizon
  let radius20degOverHorizon = (Math.sin(β) * (earthRadius + altitude)) / Math.sin(angle20degRad); // * [km]
  let radius20degOverHorizon_m = radius20degOverHorizon * 1000; //* [m]
  visibility20deg.setRadius(radius20degOverHorizon_m); //* [m]
  radius20degOverHorizon = radius20degOverHorizon.toFixed(2); // * [km]
  currentRadius20degText.innerText = `${radius20degOverHorizon} km`;
  // console.log("radius20degOverHorizon:", radius20degOverHorizon);
}

// Creating the Sun's icon
let theSunIcon = L.icon({
  iconUrl: "./Media/theSun.png",
  iconSize: [125, 125],
  iconAnchor: [62.5, 62.5],
});

// Adding the Sun to the map (after 1s)
let theSun = L.marker([solar_lat, solar_lon], {
  icon: theSunIcon,
});
setTimeout(function () {
  theSun.addTo(map);
}, 1000);

// Adding the Equator to the map (green and red)
let equator = L.polyline(
  [
    [0, -180],
    [0, 180],
  ],
  {color: "green", weight: 2.0}
)
  .bindTooltip("the Equator")
  .addTo(map);
let equator2 = L.polyline(
  [
    [0, -360],
    [0, 360],
  ],
  {color: "red", weight: 0.5, dashArray: "10, 10", dashOffset: "10"}
)
  .bindTooltip("the Equator")
  .addTo(map);

// Adding the Prime Meridian to the map (blue)
let primeMeridian = L.polyline(
  [
    [90, 0],
    [-90, 0],
  ],
  {color: "blue", weight: 2.0}
)
  .bindTooltip("the Prime Meridian")
  .addTo(map);

// Function drawISS (+ updating the Sun position)
function drawISS(
  lat,
  long,
  humanDateFormatUTC,
  humanDateFormat,
  speed,
  altitude,
  visibility,
  solar_lat,
  solar_lon,
  latlngs,
  unixTimestamp
) {
  // Updating icon's and ISS_size position + real position of the Sun on the map
  marker.setLatLng([lat, long]);
  ISS_size.setLatLng([lat, long]);
  visibilityISS.setLatLng([lat, long]);
  visibility20deg.setLatLng([lat, long]);
  // Adding dynamic tooltip to the Sun icon
  theSun
    .bindTooltip(
      `<em>Current position of the Sun:</em><br><b>position: ${(solar_lat * 1).toFixed(2)}°; ${(solar_lon * 1).toFixed(2)}°`
    )
    .setLatLng([solar_lat, solar_lon]);
  // Drawing the trail of ISS
  L.circleMarker(latlngs, {
    renderer: trail,
    radius: 0.1,
    color: "blue",
  })
    .bindTooltip(
      `<em>the ISS trail:</em><br><b>position: ${lat}°; ${long}°<br>altitude: ${altitude} km<br> speed: ${(
        speed / 3600
      ).toFixed(2)} km/s<b/>`
    )
    .bindPopup(
      `<em>the ISS trail:</em><br><b>position: ${lat}°; ${long}°<br>altitude: ${altitude} km<br> speed: ${(
        speed / 3600
      ).toFixed(2)} km/s<b/>`
    )
    .openPopup()
    .addTo(map);
  // Updating map view according to icon's position
  // Converting coordinates from +/- to N/S and E/W
  map.setView([lat, long]);
  if (lat > 0) {
    latitudeText.innerText = lat + "° N";
  } else {
    latitudeText.innerText = -1 * lat + "° S";
  }
  if (long > 0) {
    longitudeText.innerText = long + "° E";
  } else {
    longitudeText.innerText = -1 * long + "° W";
  }
  // Updating other values about ISS
  unixTime.innerText = unixTimestamp;
  timeText.innerText = humanDateFormatUTC;
  localTimeText.innerText = humanDateFormat;
  speedText.innerText = `${speed} km/h [${(speed / 3600).toFixed(2)} km/s]`;
  altitudeText.innerText = `${altitude} km`;
  visibilityText.innerText = visibility.charAt(0).toUpperCase() + visibility.slice(1);
  sunPositionText.innerText = `Latitude: ${(solar_lat * 1).toFixed(2)}°, Longitude: ${(solar_lon * 1).toFixed(2)}°`; //Errors without "*1"
}

// Executing getDataISS() function
getDataISS();
//* Setting up interval for getDataISS - every 1 second
setInterval(getDataISS, 1000);

// Preparing array with dynamic content
let arrayAltitude = [];
function prepareArray(altitude) {
  arrayAltitude.push(parseFloat(altitude));
}

function prepareChart() {
  let i = 1;
  arrayAltitude[i - 1] = arrayAltitude[0];
  // console.log("arrayAltitude + length:", arrayAltitude, arrayAltitude.length);
  i = i + 1;
  if (arrayAltitude.length > 4) {
    arrayAltitude.shift();
  }
}
setInterval(prepareChart, 1000);

// Calculating the average altitude of ISS (last 5 seconds)
function averageAltitude() {
  let sum = 0;
  for (let i = 0; i < arrayAltitude.length; i++) {
    sum = sum + arrayAltitude[i];
  }
  let avgAltitude = (sum / arrayAltitude.length).toFixed(2);
  document.querySelector(".avgAlt").innerText = `${avgAltitude} km`;
}
averageAltitude();
setInterval(averageAltitude, 1000);

// Showing current your position on the Map
function showPosition() {
  fetch("https://ipwhois.app/json/?objects=city,latitude,longitude")
    .then((response) => response.json())
    .then((data) => {
      let currentLat = parseFloat(data.latitude).toFixed(2);
      let currentLong = parseFloat(data.longitude).toFixed(2);
      let currentCity = data.city;
      // Adding position marker - the main map
      let markerHome = L.marker([currentLat, currentLong]).addTo(map);
      markerHome
        .bindPopup(`<em>You are here: </em><br><b>${currentLat}°, ${currentLong}°<br>in: <u>${currentCity}</u></b>`)
        .openPopup();
      // Adding position to the 3D Map
      showPosition3D(currentLat, currentLong, currentCity);
      // Showing Local Solar Time
      localSolarTime(currentLat, currentLong);
    })
    .catch(console.error);
}
setTimeout(function () {
  showPosition();
}, 500);

// Accordion content
// Printing dynamic chart - Altitude (content 1)
window.onload = function () {
  var dps = [];
  var chart = new CanvasJS.Chart("chartDynamicAltitude", {
    exportEnabled: true,
    backgroundColor: "#F5F5F5",
    title: {
      text: "Dynamic chart of current ISS altitude",
      fontSize: 20,
    },
    legend: {
      fontSize: 18,
    },
    toolTip: {
      backgroundColor: "#ffffe0",
      borderColor: "#9400d3",
      fontSize: 14,
      fontWeight: "bold",
      cornerRadius: 8,
    },
    axisY: {
      title: "ISS altitude",
      interlacedColor: "#F8F1E4",
      tickLength: 10,
      minimum: 410,
      maximum: 450,
      lineThickness: 3,
      lineColor: "green",
      interval: 5,
      suffix: " km",
      labelFontSize: 13,
      valueFormatString: "###.0",
    },
    axisX: {
      title: "The number of seconds since the page was loaded",
      lineThickness: 3,
      lineColor: "blue",
      interval: 5,
      suffix: " seconds ago",
      labelFontSize: 13,
    },
    data: [
      {
        type: "spline",
        markerSize: 10,
        dataPoints: dps,
        indexLabel: " {y}",
        indexLabelPlacement: "outside",
        indexLabelOrientation: "vertical",
        name: "Current altitude of ISS",
        showInLegend: true,
        lineColor: "#9400d3",
        color: "#9400d3",
        indexLabelFontSize: 13,
        markerType: "circle",
        legendMarkerType: "circle",
        markerColor: "green",
        legendMarkerColor: "green",
        indexLabelFormatter: function (e) {
          return e.dataPoint.y.toFixed(2);
        },
      },
    ],
  });
  var xVal = 0;
  var yVal = arrayAltitude[3];
  var updateInterval = 1000;
  var dataLength = 60; // number of dataPoints visible at any point

  var updateChart = function (count) {
    count = count || 1;
    // count is number of times loop runs to generate random dataPoints.
    for (var j = 0; j < count; j++) {
      yVal = arrayAltitude[3];
      dps.push({
        x: xVal,
        y: yVal,
      });
      xVal++;
    }
    if (dps.length > dataLength) {
      dps.shift();
    }
    chart.render();
  };

  updateChart(dataLength);
  setInterval(function () {
    updateChart();
  }, updateInterval);
};

// Content 2 - Dynamic table
// Matrix 5x5 for dynamic table
let dynamicMatrixTemp1 = [];
let dynamicMatrixTemp2 = [];
let dynamicMatrixTemp3 = [];
let dynamicMatrixTemp4 = [];
let dynamicMatrixTemp5 = [];
let dynamicMatrix = [dynamicMatrixTemp1, dynamicMatrixTemp2, dynamicMatrixTemp3, dynamicMatrixTemp4, dynamicMatrixTemp5];

// Preparing dynamic Matrix
function prepareDynamicMatrix(humanDateFormatUTC, speed, altitude, lat, long) {
  dynamicMatrixTemp1.push(humanDateFormatUTC);
  if (dynamicMatrixTemp1.length > 5) {
    dynamicMatrixTemp1.shift();
  }
  dynamicMatrixTemp2.push(parseFloat(speed).toFixed(2));
  if (dynamicMatrixTemp2.length > 5) {
    dynamicMatrixTemp2.shift();
  }
  dynamicMatrixTemp3.push(parseFloat(altitude).toFixed(2));
  if (dynamicMatrixTemp3.length > 5) {
    dynamicMatrixTemp3.shift();
  }
  dynamicMatrixTemp4.push(parseFloat(lat).toFixed(2));
  if (dynamicMatrixTemp4.length > 5) {
    dynamicMatrixTemp4.shift();
  }
  dynamicMatrixTemp5.push(parseFloat(long).toFixed(2));
  if (dynamicMatrixTemp5.length > 5) {
    dynamicMatrixTemp5.shift();
  }
}

// Creating dynamic Table
dynamicTableBody = document.querySelector("#dynamicTableBody");
function createTable() {
  dynamicTableBody.innerHTML = "";
  for (let i = 0; i < dynamicMatrix.length; i++) {
    let row = document.createElement("tr");
    dynamicTableBody.appendChild(row);

    for (let j = 0; j < dynamicMatrix[0].length; j++) {
      let cell = document.createElement("td");
      row.appendChild(cell);
      let content = document.createTextNode("");
      cell.appendChild(content);
      content.textContent = dynamicMatrix[j][i];
    }
  }
}
// Delay to create dynamic table
setTimeout(function () {
  setInterval(createTable, 1000);
}, 500);

// Functions for Div.infoContent3
// Fetching data from: https://ipwhois.app in XML format and displaying position info
function fetchingData() {
  fetch("https://ipwhois.app/xml/?objects=ip,country,region,city,latitude,longitude,timezone,timezone_name")
    .then((response) => response.text())
    .then((data) => {
      // console.log(`XML_data: ${data}`);
      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "application/xml");
      // console.log("XML:", xml);
      showPositionInfo(xml);
      let positionArray = [parseFloat(xml.all[5].textContent).toFixed(2), parseFloat(xml.all[6].textContent).toFixed(2)];
      setUpMap2(positionArray);
      showPassesISS(positionArray);
      showWeather(positionArray);
    })
    .catch(console.error);
}

// Load ISS passes data and disable the button
function LoadData() {
  setTimeout(function () {
    fetchingData();
    document.querySelector("#LoadData").disabled = "true";
  }, 800);
}
document.querySelector("#LoadData").addEventListener("click", LoadData);

function showPositionInfo(xml) {
  document.querySelector(".ipHome>span").innerText = xml.all[1].textContent;
  document.querySelector(".countryHome>span").innerText = xml.all[2].textContent;
  document.querySelector(".regionHome>span").innerText = xml.all[3].textContent;
  document.querySelector(".cityHome>span").innerText = xml.all[4].textContent;
  document.querySelector(".latitudeHome>span").innerText = parseFloat(xml.all[5].textContent).toFixed(2) + "°";
  document.querySelector(".longitudeHome>span").innerText = parseFloat(xml.all[6].textContent).toFixed(2) + "°";
  document.querySelector(".timezoneHome>span").innerText = xml.all[7].textContent;
  document.querySelector(".timezoneNameHome>span").innerText = xml.all[8].textContent;
}

// Setting up the map2
function setUpMap2(positionArray) {
  let homeLat = parseFloat(positionArray[0]);
  let homeLong = parseFloat(positionArray[1]);
  // console.log("homeLat:", homeLat, "homeLong:", homeLong);
  let map2 = L.map("map2").setView([homeLat, homeLong], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy: <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    maxZoom: 18,
    tileSize: 512,
    zoomOffset: -1,
    scrollWheelZoom: false,
  }).addTo(map2);

  // Adding position marker - Map2
  let markerHome2 = L.marker([homeLat, homeLong]).addTo(map2);
  markerHome2.bindPopup(`<em>You are here: </em><br><b>${homeLat}°, ${homeLong}°</b>`).openPopup();
}

// Showing visible ISS passes in the user's location
function showPassesISS(positionArray) {
  let homeLat = parseFloat(positionArray[0]);
  let homeLong = parseFloat(positionArray[1]);
  fetch(`https://api.g7vrd.co.uk/v1/satellite-passes/25544/${homeLat}/${homeLong}.json?minelevation=20&hours=72`)
    .then((response) => response.json())
    .then((data) => {
      let passes = data.passes;
      // console.log("ISS passes:", passes, passes.length);
      let tableBodyPassesISS = document.querySelector("#tableISS_passes");
      tableBodyPassesISS.innerHTML = "";
      if (passes.length === 0) {
        let noPasses = document.querySelector("#noPasses");
        noPasses.innerHTML = "No visible ISS passes in the next 3 days";
      }
      for (let i = 0; i < passes.length; i++) {
        let row = document.createElement("tr");
        tableBodyPassesISS.appendChild(row);
        for (let j = 0; j <= Object.keys(passes[0]).length; j++) {
          let cell = document.createElement("td");
          row.appendChild(cell);
          let content = document.createTextNode("");
          cell.appendChild(content);
          content.textContent = Object.values(passes[i])[j - 1];
          if (j === 0) {
            cell.textContent = i + 1;
          }
          if (j === 1 || j === 2 || j === 3) {
            cell.textContent = new Date(cell.textContent).toLocaleString();
          }
        }
      }
    });
}

// Fetching local weather data
function showWeather(positionArray) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${positionArray[0]}&lon=${positionArray[1]}&appid=9c0712c6ba48fef8bbec4e49e235efdb&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log("Weather:", data);
      let descriptionTxt = data.weather[0].description;
      let temperatureTxt = data.main.temp.toFixed(1);
      let tempMaxTxt = data.main.temp_max.toFixed(1);
      let tempMinTxt = data.main.temp_min.toFixed(1);
      let pressureTxt = data.main.pressure;
      let humidityTxt = data.main.humidity;
      let visibilityTxt = data.visibility / 1000;
      let windSpeedTxt = data.wind.speed;
      let directionTxt = data.wind.deg;
      let cloudinessTxt = data.clouds.all;
      let sunriseTxt = new Date(data.sys.sunrise * 1000).toLocaleString();
      let sunsetTxt = new Date(data.sys.sunset * 1000).toLocaleString();
      document.querySelector(".description").innerHTML = descriptionTxt;
      document.querySelector(".description").innerHTML = descriptionTxt;
      document.querySelector(".cloudiness").innerHTML = cloudinessTxt + "%";
      document.querySelector(".currentTemp").innerHTML = temperatureTxt + "°C";
      document.querySelector(".tempMax").innerHTML = tempMaxTxt + "°C";
      document.querySelector(".tempMin").innerHTML = tempMinTxt + "°C";
      document.querySelector(".pressure").innerHTML = pressureTxt + "hPa";
      document.querySelector(".humidity").innerHTML = humidityTxt + "%";
      document.querySelector(".visibilityKm").innerHTML = visibilityTxt + " km";
      document.querySelector(".windSpeed").innerHTML = windSpeedTxt + " km/s";
      document.querySelector(".direction").innerHTML = directionTxt + "°";
      document.querySelector(".sunrise").innerHTML = sunriseTxt;
      document.querySelector(".sunset").innerHTML = sunsetTxt;
    });
}

// Function that fetches TLE for ISS and put them into the document (jQuery)
$(document).ready(function () {
  $.getJSON("https://tle.ivanstanojevic.me/api/tle/25544", function (data) {
    // console.log("ISS TLE:", data);
    $("#satelliteID").text(data.satelliteId);
    $("#satelliteName").text(data.name);
    $("#satelliteDate").text(data.date);
    $("#line1").text(data.line1);
    $("#line2").text(data.line2);
  });
});

// Initializing the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer("cesiumContainer", {
  imageryProvider: new Cesium.TileMapServiceImageryProvider({
    url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
  }),
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  navigationHelpButton: false,
  sceneModePicker: false,
});
// Adding day and night
viewer.scene.globe.enableLighting = true;
//* Disabling zoom
//  viewer.scene.screenSpaceCameraController.enableZoom = false;   //* Zoom is disabled!

// Drawing the 3D ISS path - every 1 second
function drawISS3D(lat, long, altitude) {
  // console.log("Date.now()/1000:", (Date.now() / 1000).toFixed(0));
  viewer.entities.add({
    // Setting up the ISS position and altitude
    position: Cesium.Cartesian3.fromDegrees(long, lat, parseFloat(altitude) * 1000),
    // ISS is rendered as a gold point
    point: {pixelSize: 6, color: Cesium.Color.GOLD},
  });
}

// Setting Up the default view towards ISS every 10 seconds
setInterval(function () {
  viewer.scene.camera.setView({
    //default altitude: 15000 km
    destination: Cesium.Cartesian3.fromDegrees(long, lat, 15000000),
  });
}, 10000);

// Entity2 - Tooltip with the cursor position over the globe
// Declaring entity for Tooltip label for the Earth
let entity2 = viewer.entities.add({
  label: {
    show: true,
    showBackground: true,
    font: "14px Open Sans sans-serif",
    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    pixelOffset: new Cesium.Cartesian2(15, 0),
  },
});
// Mouse over the globe to see the cartographic position
let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (movement) {
  let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
  if (cartesian) {
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
    entity2.position = cartesian;
    entity2.label.show = true;
    entity2.label.text = `Position of the cursor:\nLongitude: ${longitudeString.slice(
      -7
    )}°,\nLatitude: ${latitudeString.slice(-7)}°`;
  } else {
    entity2.label.show = false;
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Adding current position of the user to the 3D Map - entity3
function showPosition3D(currentLat, currentLong, currentCity) {
  // console.log("currentLat, currentLong, currentCity:", currentLat, currentLong, currentCity);
  let entity3 = viewer.entities.add({
    label: {
      show: true,
      showBackground: true,
      font: "15px Open Sans sans-serif",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      pixelOffset: new Cesium.Cartesian2(15, 0),
      backgroundColor: Cesium.Color.WHITESMOKE,
      fillColor: Cesium.Color.PURPLE,
      style: Cesium.LabelStyle.FILL,
    },
    position: Cesium.Cartesian3.fromDegrees(currentLong, currentLat),
    point: {pixelSize: 8, color: Cesium.Color.RED},
  });
  entity3.label.show = true;
  entity3.label.text = `You are here in: ${currentCity}`;
}

// Showing Local Solar Time and the Sun/ the Moon information
function localSolarTime(currentLat, currentLong) {
  // Finding current date
  let todayDay = new Date();
  let year = todayDay.getFullYear();
  let month = todayDay.getMonth() + 1;
  let day = todayDay.getDate();
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  let today = `${year}-${month}-${day}`;
  // console.log("todayDay:", todayDay, "today:", today);
  // Finding offset to the GMT time
  let offset = new Date().getTimezoneOffset();
  offset = offset / -60;
  if (offset > -10 && offset < 0) {
    offset = "-0" + offset;
  } else if (offset >= 0 && offset < 10) {
    offset = "+0" + offset;
  } else {
    offset = offset;
  }
  offset = offset + ":00";
  // console.log("currentLat, currentLong, offset:", currentLat, currentLong, offset);
  fetch(
    `https://api.met.no/weatherapi/sunrise/2.0/.json?lat=${currentLat}&lon=${currentLong}&date=${today}&offset=${offset}`
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log("solar, lunar data:", data);
      let moonriseTime = new Date(data.location.time[0].moonrise.time).toLocaleString();
      let moonsetTime = new Date(data.location.time[0].moonset.time).toLocaleString();
      let moonHighElevation = parseFloat(data.location.time[0].high_moon.elevation).toFixed(2);
      let moonHighTime = new Date(data.location.time[0].high_moon.time).toLocaleString();
      let sunRiseTime = new Date(data.location.time[0].sunrise.time).toLocaleString();
      let sunSetTime = new Date(data.location.time[0].sunset.time).toLocaleString();
      let solarNoonTime = new Date(data.location.time[0].solarnoon.time).toLocaleString();
      let solarNoonElevation = parseFloat(data.location.time[0].solarnoon.elevation).toFixed(2);
      let solarMidnightTime = new Date(data.location.time[0].solarmidnight.time).toLocaleString();
      let solarMidnightElevation = parseFloat(data.location.time[0].solarmidnight.elevation).toFixed(2);
      // DOM for displaying the Sun/ the Moon info
      document.querySelector(".moonriseTimeText > span").innerHTML = moonriseTime;
      document.querySelector(".moonsetTimeText > span").innerHTML = moonsetTime;
      document.querySelector(".moonHighElevationText > span").innerHTML = moonHighElevation + "°";
      document.querySelector(".moonHighTimeText > span").innerHTML = moonHighTime;
      document.querySelector(".sunRiseTimeText > span").innerHTML = sunRiseTime;
      document.querySelector(".sunSetTimeText > span").innerHTML = sunSetTime;
      document.querySelector(".solarNoonTimeText > span").innerHTML = solarNoonTime;
      document.querySelector(".solarNoonElevationText > span").innerHTML = solarNoonElevation + "°";
      document.querySelector(".solarMidnightTimeText > span").innerHTML = solarMidnightTime;
      document.querySelector(".solarMidnightElevationText > span").innerHTML = solarMidnightElevation + "°";
    });
}
