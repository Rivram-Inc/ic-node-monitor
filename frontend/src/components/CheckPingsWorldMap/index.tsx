"use client";
import React, { useEffect } from "react";

const main = async (checkDetails) => {
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

  const nodeDCName = checkDetails.dcname;
  const nodeLatLon = { lat: checkDetails.lat, lng: checkDetails.long };
  const probeList = {};

  for (let log of checkDetails.result_logs) {
    if (probeList[log.probe.id] === undefined) {
      probeList[log.probe.id] = {
        id: log.probe.id,
        latlng: [log.probe.lat, log.probe.long],
        responsetime: log.responsetime,
        status: log.status,
        city: log.probe.city,
        country: log.probe.countryiso,
      };
    }
  }

  const probes = Object.values(probeList) || [];

  const pingServers = probes.map((probe: any) => {
    return {
      id: probe.id,
      latlng: [probe.latlng, [nodeLatLon.lat, nodeLatLon.lng]],
      responsetime: probe.responsetime,
      status: probe.status,
      city: probe.city,
      country: probe.country,
    };
  });

  // @ts-ignore
  const map = L.map("map").setView([nodeLatLon.lat, nodeLatLon.lng], 0);
  // @ts-ignore
  L.marker([nodeLatLon.lat, nodeLatLon.lng], { icon: locationIcon1 }).addTo(map)
    .bindPopup(`
      <div>
        <h4 style="font-weight: bold;">Name: ${checkDetails.name}</h4>
        <p>Hostname: ${checkDetails.hostname}</p>
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
        <p>Location: ${pingServer.city}, ${pingServer.country}</p>
        <p>Status: ${pingServer.status}</p>
      </div>
    `);
  }

  const bounds = polylines.reduce((bounds, polyline) => {
    return bounds.extend(polyline.getBounds());
    // @ts-ignore
  }, L.latLngBounds([]));

  map.fitBounds(bounds);
};

const CheckPingsWorldMap = ({
  checkID,
  checkDetails,
}: {
  checkID: string;
  checkDetails: any;
}) => {
  useEffect(() => {
    main(checkDetails);
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
