"use client";
import React, { useEffect } from "react";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in kilometers
  const toRadians = (angle: number) => (angle * Math.PI) / 180; // Helper function to convert degrees to radians

  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

const camelCaseName = (name: string) => {
  return name
    ?.toLowerCase()
    .replace("_", " ")
    .replace(/^./, function (str) {
      return str.toUpperCase();
    });
};

function generateConeShapedArcPoints(
  startLat: number,
  startLng: number,
  minRadiusLat: number,
  maxRadiusLat: number,
  minRadiusLng: number,
  maxRadiusLng: number,
  totalPoints: number,
  tiltFactor = 0.5
) {
  let arcPoints = [];

  const halfPoints = Math.floor(totalPoints / 2);

  // Generate points for the upward arc, making the curve wider at the top
  for (let i = 0; i <= halfPoints; i++) {
    let t = (i / halfPoints) * Math.PI; // Parameter t goes from 0 to π

    // Radius should gradually increase towards the top and decrease as we move back
    let currentRadiusLat =
      minRadiusLat + (maxRadiusLat - minRadiusLat) * Math.sin(t) ** 2;
    let currentRadiusLng =
      minRadiusLng + (maxRadiusLng - minRadiusLng) * Math.sin(t) ** 2;

    // Apply the tilt by adding an offset to the longitude
    let newLat = startLat + currentRadiusLat * Math.sin(t);
    let newLng =
      startLng + currentRadiusLng * Math.cos(t) + tiltFactor * Math.sin(t); // Add tilt factor here

    if (Math.abs(newLat - startLat) < 2 && Math.abs(newLng - startLng) < 2)
      continue;

    arcPoints.push([newLat, newLng]);
  }
  arcPoints.push([startLat, startLng]);

  const length = arcPoints.length - 1;

  // Mirror the points to complete the cone-shaped arc by reflecting across the starting latitude
  for (let i = length; i >= 0; i--) {
    arcPoints.push([arcPoints[i][0], arcPoints[i][1]]);
  }

  arcPoints.push([startLat, startLng]);

  return arcPoints;
}

const main = async (nodeDetails: any) => {
  if (!nodeDetails) return;
  // icons
  // @ts-ignore
  const dotIcon = L.icon({
    iconUrl: "/blue-dot.svg",
    iconSize: [10, 10],
    iconAnchor: [3, 3],
  });

  // @ts-ignore
  const locationIcon = L.icon({
    iconUrl: "/location1.svg",
    iconSize: [25, 41], // Size of the icon (standard Leaflet icon size)
    iconAnchor: [12, 41], // Anchor the icon at the bottom center
  });

  // @ts-ignore
  const locationIcon1 = L.icon({
    iconUrl: "/location.svg",
    iconSize: [25, 41], // Size of the icon (standard Leaflet icon size)
    iconAnchor: [12, 41], // Anchor the icon at the bottom center
  });

  const nodeDCName = nodeDetails?.dcname;
  const nodeLatLon = { lat: nodeDetails?.lat, lng: nodeDetails?.long };
  const probeList = {};

  for (let probe of nodeDetails?.probes || []) {
    if (probeList[probe.probe_name] === undefined) {
      probeList[probe.probe_name] = {
        name: probe.probe_name,
        latlng: [probe.lat, probe.long],
        responsetime: probe.avg_rtt,
        // status: probe.status,
        // city: probe.probe.city,
        // country: probe.probe.countryiso,
      };
    }
  }

  const probes = Object.values(probeList) || [];

  const pingServers = probes.map((probe: any) => {
    return {
      id: probe.id,
      latlng: [probe.latlng, [nodeLatLon.lat, nodeLatLon.lng]],
      responsetime: probe.responsetime,
      name: camelCaseName(probe.name),
      // status: probe.status,
      // city: probe.city,
      // country: probe.country,
    };
  });

  // @ts-ignore
  const map = L.map("map").setView([nodeLatLon.lat, nodeLatLon.lng], 0);
  // @ts-ignore
  L.marker([nodeLatLon.lat, nodeLatLon.lng], { icon: locationIcon1 }).addTo(map)
    .bindPopup(`
      <div>
        <h4 style="font-weight: bold;">Name: ${nodeDetails.name}</h4>
        <p>Hostname: ${nodeDetails.hostname}</p>
        <p>Datacenter Name: ${nodeDCName}</p>
      </div>
     `);

  // @ts-ignore
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 6,
    minZoom: 2,
  }).addTo(map);

  const polylines = [];

  for (let pingServer of pingServers) {
    let extraCurvePoints = [];
    // Calculate the distance
    const distanceKm = haversine(
      parseFloat(pingServer.latlng[0][0]),
      parseFloat(pingServer.latlng[0][1]),
      parseFloat(pingServer.latlng[1][0]),
      parseFloat(pingServer.latlng[1][1])
    );

    if (distanceKm < 20) {
      // console.log("The datacenter and probe are in the same city");

      let startLat = parseFloat(pingServer.latlng[0][0]); // Starting Latitude
      let startLng = parseFloat(pingServer.latlng[0][1]); // Starting Longitude
      let minRadiusLat = 2; // Small vertical radius near the start and end points
      let maxRadiusLat = 20; // Maximum vertical radius at the top of the arc
      let minRadiusLng = 1; // Small horizontal radius near the start and end points
      let maxRadiusLng = 8; // Maximum horizontal radius at the top of the arc
      let totalPoints = 300; // Total number of points for smoothness
      let tiltFactor = -1; // Tilt factor for the arc

      extraCurvePoints = generateConeShapedArcPoints(
        startLat,
        startLng,
        minRadiusLat,
        maxRadiusLat,
        minRadiusLng,
        maxRadiusLng,
        totalPoints,
        tiltFactor
      );
    }

    if (extraCurvePoints.length > 0) {
      // @ts-ignore
      const polyline = L.polyline(extraCurvePoints, { color: "#5197e8" }).addTo(
        map
      );
      polylines.push(polyline);
    } else {
      // @ts-ignore
      const polyline = L.polyline(pingServer.latlng, {
        color: "#5197e8",
      }).addTo(map);
      polylines.push(polyline);
    }

    let points = pingServer.latlng.map((v, i) => {
      return { id: i, latlng: v };
    });

    if (extraCurvePoints.length > 0) {
      // take only half of the extraCurvePoints
      extraCurvePoints = extraCurvePoints.slice(
        0,
        Math.floor(extraCurvePoints.length / 2)
      );
      points = extraCurvePoints.map((v, i) => {
        return { id: i, latlng: v };
      });
    }

    const createAndStartAnimMarker = () => {
      // @ts-ignore
      const animMarker = L.markerPlayer(points, 4000, {
        icon: dotIcon,
      }).addTo(map);

      animMarker.start();

      animMarker.on("end", () => {
        map.removeLayer(animMarker);
        createAndStartAnimMarker();
      });
    };

    createAndStartAnimMarker();

    // @ts-ignore
    L.marker(pingServer.latlng[0], {
      icon: locationIcon,
    }).addTo(map).bindPopup(`
      <div>
        <h2><span style="font-weight: bold; padding-right: .3rem">Probe:</span> ${pingServer.name}</h2>
        <h2><span style="font-weight: bold; padding-right: .3rem">Response time:</span> ${pingServer.responsetime} ms</h2>
      </div>
    `);
  }
  // <p>Location: ${pingServer.city}, ${pingServer.country}</p>
  // <p>Status: ${pingServer.status}</p>

  const bounds = polylines.reduce((bounds, polyline) => {
    return bounds.extend(polyline.getBounds());
    // @ts-ignore
  }, L.latLngBounds([]));

  map.fitBounds(bounds);
};

const CheckPingsWorldMap = ({
  nodeDetails,
  fetching,
}: {
  nodeDetails: any;
  fetching: boolean;
}) => {
  useEffect(() => {
    main(nodeDetails);
  }, []);

  if (!fetching && !nodeDetails) return null;

  return (
    <div className="flex w-full">
      <div
        id="map"
        className="flex w-screen h-full"
        style={{
          width: "100%",
          minWidth: "100%",
          height: "40vh",
        }}
      ></div>
    </div>
  );
};

export default CheckPingsWorldMap;
