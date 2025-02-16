import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import InputForm from './components/InputForm';
import TemperatureChart from './components/TemperatureChart';
import TemperatureList from './components/TemperatureList';
import { initGoogleClient, addRowToSheet, fetchSheetData, deleteRowFromSheet } from './server/GoogleSheetsService';
import { gapi } from 'gapi-script';

interface TemperatureData {
  index: number;
  date: string;
  temperature: number | null;
}

const App: React.FC = () => {
  const [data, setData] = useState<TemperatureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);

      try {
        await initGoogleClient();
        const sheetData = await fetchSheetData();
        setData(sheetData);
      } catch (err) {
        setError('Failed to fetch data');
        setOpenSnackbar(true);
        console.error('Error initializing Google Sheets client:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleAddData = async (newEntry: { date: string; temperature: number }) => {
    // Add the new entry with index (the index will be the next available index in the list)
    setData((prevData) => {
      const newIndex = prevData.length > 0 ? prevData[prevData.length - 1].index + 1 : 1;
      const newDataEntry: TemperatureData = {
        index: newIndex,
        date: newEntry.date,
        temperature: newEntry.temperature,
      };

      const sortedData = [...prevData, newDataEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return sortedData;
    });
    await addRowToSheet(newEntry);
  };

  const handleDeleteData = async (index: number) => {
    const rowIndex = index + 1; // Adjust for 1-based index in Google Sheets

    try {
      await deleteRowFromSheet(rowIndex);
      setData((prevData) => prevData.filter((_, i) => i !== index));
    } catch (err) {
      setError('Failed to delete data');
      setOpenSnackbar(true);
      console.error('Error deleting data:', err);
    }
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
      return existingEntry || { date, temperature: null, index: -1 };
    });
  })();

  const handleSignOut = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut();
    setData([]);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <InputForm onAddData={handleAddData} />
          <TemperatureChart data={filledData} />
          <TemperatureList data={data} onDeleteData={handleDeleteData} />
        </>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App;
