const main = async () => {
  const currentScript = document.currentScript;
  // icons
  const dotIcon = L.icon({
    iconUrl: "/blue-dot.svg",
    iconSize: [10, 10],
    iconAnchor: [3, 3],
  });

  // location icon for ping servers (probes)
  const locationIcon = L.icon({
    iconUrl: "/location1.svg",
    iconSize: [25, 41], // Size of the icon (standard Leaflet icon size)
    iconAnchor: [12, 41], // Anchor the icon at the bottom center
  });

  // location icon for node
  const locationIcon1 = L.icon({
    iconUrl: "/location.svg",
    iconSize: [25, 41], // Size of the icon (standard Leaflet icon size)
    iconAnchor: [12, 41], // Anchor the icon at the bottom center
  });

  // Access the data-test attribute
  const checkDetails = JSON.parse(
    currentScript.getAttribute("data-checkdetails")
  );
  const countriesList = JSON.parse(
    currentScript.getAttribute("data-countrieslist")
  );

  const nodeDCName = checkDetails.dcname;
  const nodeRegion = checkDetails.region;
  const countryName = nodeRegion.split(",")[1]?.trim();
  const found = countriesList.find(
    (c) => c.alpha2 === countryName || c.alpha3 === countryName
  );

  if (!found) {
    console.error(`Country not found: ${countryName}`);
    return;
  }
  const nodeLatLon = {};

  nodeLatLon.lat = parseFloat(found.latitude);
  nodeLatLon.lng = parseFloat(found.longitude);

  const probeList = {};

  const fetched = [];
  for (let log of checkDetails.result_logs) {
    if (
      probeList[log.probe.id] === undefined &&
      fetched.includes(log.probe.id) === false
    ) {
      fetched.push(log.probe.id);
      const coordinates = await geocodeCityCountry(
        log.probe.city,
        log.probe.countryiso
      );
      if (coordinates) {
        probeList[log.probe.id] = {
          id: log.probe.id,
          latlng: [coordinates.lat, coordinates.lng],
          responsetime: log.responsetime,
          status: log.status,
          city: log.probe.city,
          country: log.probe.countryiso,
        };
      }
    }
  }

  const probes = Object.values(probeList) || [];

  // Function to geocode city and country using Nominatim API
  async function geocodeCityCountry(city, country) {
    const found = countriesList.find(
      (c) => c.alpha2 === country || c.alpha3 === country
    );

    if (!found) {
      console.error(`Country not found: ${country}`);
      return null;
    }

    return {
      lat: parseFloat(found.latitude),
      lng: parseFloat(found.longitude),
    };
  }

  const pingServers = probes.map((probe) => {
    return {
      id: probe.id,
      latlng: [probe.latlng, [nodeLatLon.lat, nodeLatLon.lng]],
      responsetime: probe.responsetime,
      status: probe.status,
      city: probe.city,
      country: probe.country,
    };
  });

  const map = L.map("map").setView([nodeLatLon.lat, nodeLatLon.lng], 13);
  map.setZoom(5);
  // mark the node location
  L.marker([nodeLatLon.lat, nodeLatLon.lng], { icon: locationIcon1 }).addTo(map)
    .bindPopup(`
      <div>
        <h4 style="font-weight: bold;">Name: ${checkDetails.name}</h4>
        <p>Hostname: ${checkDetails.hostname}</p>
        <p>Datacenter Name: ${nodeDCName}</p>
      </div>
     `);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  for (let pingServer of pingServers) {
    // Geocode city and country to get latitude and longitude
    const polyline = L.polyline(pingServer.latlng, { color: "#5197e8" }).addTo(
      map
    );

    map.fitBounds(polyline.getBounds());

    //create markerplayer
    const points = pingServer.latlng.map((v, i) => {
      return { id: i, latlng: v };
    });
    const animMarker = L.markerPlayer(points, 4000, {
      icon: dotIcon,
    }).addTo(map);

    animMarker.start();

    animMarker.on("end", (e) => {
      animMarker.start();
    });

    // Add location icon markers at both ends of the polyline
    const startMarker = L.marker(pingServer.latlng[0], {
      icon: locationIcon,
    }).addTo(map).bindPopup(`
          <div>
            <h4 style="font-weight: bold;">Response time: ${pingServer.responsetime} ms</h4>
            <p>Location: ${pingServer.city}, ${pingServer.country}</p>
            <p>Status: ${pingServer.status}</p>
          </div>
        `);
  }
};

main();
