"use client";
import React, { useEffect } from "react";

const main = async (nodeDetails: any) => {
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

  const nodeDCName = nodeDetails.dcname;
  const nodeLatLon = { lat: nodeDetails.lat, lng: nodeDetails.long };
  const probeList = {};

  for (let probe of nodeDetails.probes) {
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
    // @ts-ignore
    const polyline = L.polyline(pingServer.latlng, { color: "#5197e8" }).addTo(
      map
    );
    polylines.push(polyline);

    const points = pingServer.latlng.map((v, i) => {
      return { id: i, latlng: v };
    });

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
        <h4 style="font-weight: bold;">Response time: ${pingServer.responsetime} ms</h4>
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

const CheckPingsWorldMap = ({ nodeDetails }: { nodeDetails: any }) => {
  useEffect(() => {
    main(nodeDetails);
  }, []);

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
