import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import InputForm from './Components/InputForm';
import TemperatureChart from './Components/TemperatureChart';
import TemperatureList from './Components/TemperatureList';

interface TemperatureData {
  date: string;
  temperature: number | null;
}

const App: React.FC = () => {
  const [data, setData] = useState<TemperatureData[]>([]);

  const handleAddData = (newEntry: TemperatureData) => {
    setData((prevData) =>
      [...prevData, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  };

  const handleDeleteData = (index: number) => {
    setData((prevData) => prevData.filter((_, i) => i !== index));
  };

  const generateDateRange = (start: string, end: string) => {
    const dateArray: string[] = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);

    while (currentDate <= endDate) {
      dateArray.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  const filledData = (() => {
    if (data.length === 0) return [];

    const minDate = data[0].date;
    const maxDate = data[data.length - 1].date;
    const dateRange = generateDateRange(minDate, maxDate);

    return dateRange.map((date) => {
      const existingEntry = data.find((entry) => entry.date === date);
      return existingEntry || { date, temperature: null };
    });
  })();

  return (
    <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom>Temperaturspårning</Typography>
      <InputForm onAddData={handleAddData} />
      <TemperatureChart data={filledData} />
      <TemperatureList data={data} onDeleteData={handleDeleteData} />
    </Box>
  );
};

export default App;
