"use client";
// LineChart.js
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  Title,
  Filler,
  Legend,
  CategoryScale
);

// Define an array of colors for the lines
const lineColors = [
  "#70BCF9", // Blue
  "#FF6384", // Red
  "#FFCE56", // Yellow
  "#4BC0C0", // Teal
  "#9966FF", // Purple
  "#FF9F40", // Orange
];

const probeNameFormatter = (probeName: string) => {
  return capitalizeFirstLetter(
    probeName?.toLowerCase()?.replace(/_/g, " ") || ""
  );
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const LineChart = ({
  dataValues = {},
  loading,
}: {
  dataValues: {
    [probeName: string]: { label: string; responseTime: number }[];
  };
  loading: boolean;
}) => {
  // Extract the labels from the first probe's data (assuming all probes have the same labels)
  const labels = Object.values(dataValues)[0]?.map((value) => value.label) || [];

  // Create datasets for each probe
  const datasets = Object.keys(dataValues).map((probeName, index) => ({
    label: probeNameFormatter(probeName),
    data: dataValues[probeName].map((value) => value.responseTime),
    fill: {
      target: "origin",
      above: lineColors[index] + "33", // Add transparency to the fill color
    },
    backgroundColor: "transparent",
    borderColor: lineColors[index % lineColors.length], // Cycle through the colors
    borderWidth: 2,
    pointRadius: 0,
    tension: 0.4,
  }));

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, // Show legend to differentiate probes
        position: "top",
      },
      title: {
        display: false,
        text: "Check response time over time",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            return `Average response time`;
          },
          label: (tooltipItem) => {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw || 0;
            const datasetLabel = tooltipItem.dataset.label || "";
            return [`${datasetLabel} - ${label}`, `${value}ms`];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: "Date and time",
        },
        ticks: {
          font: {
            size: 10,
          },
          maxTicksLimit: 8,
        },
        grid: { display: false },
      },
      y: {
        min: 0,
        max:
          Math.max(
            ...Object.values(dataValues).flatMap((probeData) =>
              probeData.map((value) => value.responseTime)
            )
          ) + 50, // Calculate max value across all probes
        title: {
          display: false,
          text: "Average RTT (ms)",
        },
        ticks: {
          font: {
            size: 10,
          },
          maxTicksLimit: 6,
        },
        grid: { display: false },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle empty data
  if (!dataValues || Object.keys(dataValues).length === 0) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Chart Data Available
          </h3>
          <p className="text-gray-500">
            No response time data found for the selected duration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Line
      data={data}
      // @ts-ignore
      options={options}
    />
  );
};

export default LineChart;
