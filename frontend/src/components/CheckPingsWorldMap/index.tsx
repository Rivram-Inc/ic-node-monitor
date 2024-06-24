"use client";
import React from "react";
import Script from "next/script";
import countriesList from "../../../public/utils/country-codes-lat-long.json";

const CheckPingsWorldMap = ({
  checkID,
  checkDetails,
}: {
  checkID: string;
  checkDetails: any;
}) => {
  return (
    <div className="flex w-full">
      <Script
        src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://unpkg.com/leaflet.markerplayer@latest"
        strategy="beforeInteractive"
      />
      <div
        id="map"
        className="flex w-screen h-full"
        style={{
          width: "100%",
          minWidth: "100%",
          height: "40vh",
        }}
      ></div>
      <Script
        src="/utils/map.script.js"
        data-checkid={checkID}
        data-checkdetails={JSON.stringify(checkDetails)}
        data-countrieslist={JSON.stringify(countriesList.ref_country_codes)}
        strategy="afterInteractive"
      />
    </div>
  );
};

export default CheckPingsWorldMap;
