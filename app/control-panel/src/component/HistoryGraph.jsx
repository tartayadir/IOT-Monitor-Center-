import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HistoryGraph = ({ dataHistory }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Light Level',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            },
        ],
    });

    useEffect(() => {
        if (dataHistory.length > 0) {
            const labels = dataHistory.map((item, index) => `Entry ${index + 1}`);
            const lightLevels = dataHistory.map((item) => item.lightLevel);

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Light Level',
                        data: lightLevels,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false,
                    },
                ],
            });
        }
    }, [dataHistory]);

    return (
        <div style={{ width: '80%', margin: '20px auto' }}>
            <Line data={chartData} />
        </div>
    );
};

export default HistoryGraph;