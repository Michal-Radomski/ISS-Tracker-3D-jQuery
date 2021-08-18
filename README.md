# Live ISS Tracker (3D) + Info Accordion

An application that provides a lot of live information about the ISS.

Link to the application: [https://test-proj-gda5.web.app/](https://test-proj-gda5.web.app/)

## Description

The application gets ISS data from the API: <https://wheretheiss.at/>. The large OSM / Leaflet map shows the current movement
parameters (like speed, altitude, position, etc.). The positions of the ISS and sun icons are real and updated every 1s. The
ISS visibility circles are generated on an ongoing basis: over the horizon and 20 degrees above the horizon.

Below is accordion (written in jQuery).

The first tab is the ISS dynamic height plot - actual data (CanvasJS library used).

The second tab is the dynamic table of ISS values ​​(last 5 seconds).

The third tab is:

1. Determining geolocation - <https://ipwhois.io/>,
2. Showing current weather conditions - <https://openweathermap.org/>,
3. Rendering the OSM map with your current position,
4. Table showing the visible ISS transitions at a given location, at least 20 degrees above the horizon for the next 72
   hours.

The fourth tab is TLE of ISS.

Below is the ISS 3D path around the Earth (CesiumJS library used) and actual data such as sunrise / sunset, moonrise /
moonset and local solar noon taken from <https://api.met.no/weatherapi/>.

And more... :smiley:.

## Notes/ ToDo List/ Issues

1. The API key for OpenWeather.com is not hosted on GitHub.com.
2. The application works great in Firefox. Chrome does not render a 3D Globe and a dynamic table.

## ScreenShots

<img alt="ISS 2D map" src="./Readme.md_pics/ISS_2D_map.png">
<img alt="Dynamic chart" src="./Readme.md_pics/Dynamic_Chart.png">
<img alt="Dynamic table" src="./Readme.md_pics/Dynamic_Table.png">
<img alt="Visible passes" src="./Readme.md_pics/Visible_Passes.png">
<img alt="3D ISS path" src="./Readme.md_pics/3D_ISS_path.png">

## Built With

- [OpenStreetMap](https://www.openstreetmap.org/) - The map,
- [LeafletJS](https://leafletjs.com/) - Rendering the 2D maps,
- [CesiumJS](https://cesium.com/) - Rendering the 3D Earth,
- [jQuery](https://jquery.com/) - To build the accordion,
- [jQuery UI](https://jqueryui.com/) - To build some UI elements and effects,
- [CanvasJS v1.7](https://canvasjs.com/) - To render dynamic chart.

## License

[MIT](https://choosealicense.com/licenses/mit/)
