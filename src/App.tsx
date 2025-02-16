import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import InputForm from './Components/InputForm';
import TemperatureChart from './Components/TemperatureChart';
import TemperatureList from './Components/TemperatureList';
import { initGoogleClient, addRowToSheet, fetchSheetData } from './server/GoogleSheetsService';
import { gapi } from 'gapi-script';

interface TemperatureData {
  date: string;
  temperature: number | null;
}

const App: React.FC = () => {
  const [data, setData] = useState<TemperatureData[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initGoogleClient();
        const sheetData = await fetchSheetData();
        setData(sheetData);
      } catch (err) {
        console.error('Error initializing Google Sheets client:', err);
      }
    };

    initialize();
  }, []);

  const handleAddData = async (newEntry: TemperatureData) => {
    setData((prevData) =>
      [...prevData, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
    await addRowToSheet(newEntry);
  };

  const handleDeleteData = (index: number) => {
    // Deleting from a Google Sheet requires more complex logic like row lookup and deletion.
    // For simplicity, we'll just remove it locally in this example.
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

  const handleSignOut = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut();
  };

  return (
    <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom>Temperaturspårning</Typography>
      <Button
        variant="contained"
        color="secondary"
        style={{ marginBottom: '16px' }}
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
      <InputForm onAddData={handleAddData} />
      <TemperatureChart data={filledData} />
      <TemperatureList data={data} onDeleteData={handleDeleteData} />
    </Box>
  );
};

export default App;
