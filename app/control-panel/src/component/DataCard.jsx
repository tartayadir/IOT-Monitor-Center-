import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const DataCard = ({ data }) => {
    return (
        <Card style={{ width: '300px', margin: '20px auto' }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Current IoT Data
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1">Light Level</Typography>
                        <Typography>{data?.lightLevel || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1">Humidity Level</Typography>
                        <Typography>{data?.humidityLevel || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1">Noise Level</Typography>
                        <Typography>{data?.noiseLevel || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1">Air Quality</Typography>
                        <Typography>{data?.airQuality || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1">Temperature</Typography>
                        <Typography>{data?.temperature || 'N/A'}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default DataCard;