import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Box } from '@mui/material';

interface TemperatureChartProps {
  data: { date: string; temperature: number | null }[];
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
  return (
    <Box style={{ width: '100%', maxWidth: '800px', height: '400px', marginBottom: '16px' }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="temperature" stroke="#8884d8" strokeWidth={2} connectNulls={true} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TemperatureChart;
