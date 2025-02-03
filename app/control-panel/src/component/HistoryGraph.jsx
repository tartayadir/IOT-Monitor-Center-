import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register necessary components for Chart.js
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HistoryGraph = ({ dataHistory }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        if (dataHistory.length > 0) {
            // Extract labels (e.g., Entry 1, Entry 2, etc.)
            const labels = dataHistory.map((item, index) => `Entry ${index + 1}`);

            // Define the metrics to display
            const metrics = ['lightLevel', 'humidityLevel', 'noiseLevel', 'airQuality', 'temperature'];

            // Create datasets for each metric
            const datasets = metrics.map((metric) => ({
                label: metric.replace(/([A-Z])/g, ' $1').trim(), // Format label (e.g., "Light Level")
                data: dataHistory.map((item) => item[metric]),
                borderColor: getRandomColor(), // Assign a random color for each metric
                fill: false,
            }));

            // Update the chart data state
            setChartData({
                labels,
                datasets,
            });
        }
    }, [dataHistory]);

    // Helper function to generate random colors for each dataset
    const getRandomColor = () => {
        return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256
        )}, ${Math.floor(Math.random() * 256)}, 0.8)`;
    };

    return (
        <div style={{ width: '80%', margin: '20px auto' }}>
            <Line
                data={chartData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Historical Metrics',
                        },
                    },
                }}
            />
        </div>
    );
};

export default HistoryGraph;