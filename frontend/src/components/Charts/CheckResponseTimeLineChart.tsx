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

const LineChart = ({
  dataValues,
  loading,
}: {
  dataValues: {
    label: string;
    responseTime: number;
  }[];
  loading: boolean;
}) => {
  const data = {
    labels: dataValues.map((value) => value.label),
    datasets: [
      {
        label: "",
        data: dataValues.map((value) => value.responseTime),
        fill: {
          target: "origin", // 3. Set the fill options
          above: "#DEEDF6",
        },
        backgroundColor: "transparent", // Background color for the filled area
        borderColor: "#70BCF9",
        borderWidth: 2, // Width of the line
        pointRadius: 0, // Remove the dots on the line
        tension: 0.4, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: "top", // Use one of the valid predefined values
      },
      title: {
        display: false,
        text: "Check response time over time",
      },
      tooltip: {
        mode: "index", // Show tooltip for the nearest items on the x-axis
        intersect: false, // To display tooltips on entire curve
        callbacks: {
          title: (tooltipItems) => {
            return `Average response time`;
          },
          label: (tooltipItem) => {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw || 0;
            return [`${label}`, `${value}ms`];
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
          maxTicksLimit: 8, // Show only 8 ticks on y-axis
        },
        grid: { display: false },
      },
      y: {
        min: 0,
        max:
          dataValues
            .map((value) => value.responseTime)
            .reduce((a, b) => Math.max(a, b), 0) + 50, // Set the max value of y-axis (response time + 100ms
        title: {
          display: false,
          text: "Average RTT (ms)",
        },
        ticks: {
          font: {
            size: 10,
          },
          maxTicksLimit: 6, // Show only 5 ticks on y-axis
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

  return (
    <Line
      data={data}
      // @ts-ignore
      options={options}
    />
  );
};

export default LineChart;
