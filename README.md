# ISS Tracker (3D)

An application that provides a lot of information about the ISS.

[Link to the application.](https://test-proj-gda5.web.app/)

## Description

The application gets ISS data from the API: https://wheretheiss.at/. The large OSM / Leaflet map shows the current movement
parameters (like speed, altitude, position, etc.). The positions of the ISS and sun icons are real and updated every 1s. The
ISS visibility circles are generated on an ongoing basis: over the horizon and 20 degrees above the horizon.

Below is accordion (written in jQuery).

The first tab is the ISS Dynamic Height Plot - Actual Data (CanvasJS library used).

The second tab is the dynamic table of ISS values ​​(last 5 seconds).

The third tab is:

1. Determining geolocation - https://ipwhois.io/,
2. Showing current weather conditions - https://openweathermap.org/,
3. Rendering the OSM map with your current position,
4. Table showing the visible ISS transitions at a given location, at least 20 degrees above the horizon for the next 72
   hours.

The fourth tab is TLE of ISS.

Below is the ISS 3D path around the Earth (CesiumJS library used) and actual data such as sunrise / sunset, moonrise /
moonset and local solar noon taken from https://api.met.no/weatherapi/.

And more... :smiley:.

## Built With

- [OpenStreetMap](https://www.openstreetmap.org/) - The map,
- [LeafletJS](https://leafletjs.com/) - Rendering the 2D maps,
- [CesiumJS](https://cesium.com/) - Rendering the 3D Earth,
- [jQuery](https://jquery.com/) - To build the accordion,
- [CanvasJS v1.7](https://canvasjs.com/) - To render dynamic chart,

## License

[MIT](https://choosealicense.com/licenses/mit/)
