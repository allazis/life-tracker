import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';

interface TemperatureChartProps {
  data: { date: string; temperature: number | null }[];
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Filter out null temperatures to calculate min and max
    const temperatures = data.filter((entry) => entry.temperature !== null).map((entry) => entry.temperature as number);
    const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
    const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;

  return (
    <Box
      sx={{
        width: '100%',
        mb: 2,
        p: 2,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

          {data.map((_entry, index) => (
            index % 2 === 0 && index < data.length - 1 ? (
              <ReferenceArea
                key={`bg-${index}`}
                x1={data[index].date}
                x2={data[index + 1].date}
                strokeOpacity={0.1}
                fill="#f0f0f0"
              />
            ) : null
          ))}

          <XAxis 
            dataKey="date"
            stroke={theme.palette.text.secondary}
            tick={{
              fontFamily: theme.typography.fontFamily,
              fontSize: isMobile ? '0.75rem' : theme.typography.body2.fontSize,
              fill: theme.palette.text.secondary,
            }}
            tickFormatter={(date) => format(new Date(date), 'MMM d')}
          />

          <YAxis 
            domain={[minTemp - 0.5, maxTemp + 0.5]} // Adjust Y-axis range based on min and max temperatures
            ticks={Array.from({ length: Math.ceil((maxTemp + 0.5 - (minTemp - 0.5)) / 0.1) }, (_, i) => (minTemp - 0.5 + i * 0.1).toFixed(1))}
            stroke={theme.palette.text.secondary}
            tick={{
              fontFamily: theme.typography.fontFamily,
              fontSize: isMobile ? '0.75rem' : theme.typography.body2.fontSize,
              fill: theme.palette.text.secondary,
            }}
            tickFormatter={(temp) => `${temp}°C`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              fontFamily: theme.typography.fontFamily,
            }}
            labelFormatter={(date) => `Datum: ${format(new Date(date), 'yyyy-MM-dd')}`}
            formatter={(value) => [`${value}°C`, 'Temperatur']}
            labelStyle={{
              color: theme.palette.text.secondary,
              fontFamily: theme.typography.fontFamily,
              fontSize: isMobile ? '0.75rem' : theme.typography.body2.fontSize,
            }}
            itemStyle={{
              color: theme.palette.text.primary,
              fontFamily: theme.typography.fontFamily,
              fontSize: isMobile ? '0.75rem' : theme.typography.body2.fontSize,
            }}
          />

          <Line 
            type="linear" 
            dataKey="temperature" 
            stroke="#3f51b5" 
            strokeWidth={2} 
            connectNulls={true} 
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TemperatureChart;
