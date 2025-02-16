import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import InputForm from './Components/InputForm';
import TemperatureChart from './Components/TemperatureChart';
import TemperatureList from './Components/TemperatureList';
import { initGoogleClient, addRowToSheet, fetchSheetData, deleteRowFromSheet } from './server/GoogleSheetsService';
import { gapi } from 'gapi-script';

interface TemperatureData {
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
      setError(null); // Reset error before fetching

      try {
        await initGoogleClient();
        const sheetData = await fetchSheetData();
        setData(sheetData);
      } catch (err) {
        setError('Failed to fetch data');
        setOpenSnackbar(true); // Show snackbar when there's an error
        console.error('Error initializing Google Sheets client:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []); // Empty dependency array, run once on mount

  const handleAddData = async (newEntry: TemperatureData) => {
    setData((prevData) =>
      [...prevData, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
    await addRowToSheet(newEntry);
  };

  const handleDeleteData = async (index: number) => {
    const rowIndex = index + 1; // Google Sheets row index is 1-based, so we add 1

    try {
      // First, delete from Google Sheets
      await deleteRowFromSheet(rowIndex);
      
      // Then, update the state to remove the row from the local data
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
      return existingEntry || { date, temperature: null };
    });
  })();

  const handleSignOut = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut();
    setData([]);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close the snackbar when user clicks on it
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

      {/* Show loading spinner while data is being fetched */}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <InputForm onAddData={handleAddData} />
          <TemperatureChart data={filledData} />
          <TemperatureList data={data} onDeleteData={handleDeleteData} />
        </>
      )}

      {/* Show error message if there was an issue fetching data */}
      <Snackbar
        open={openSnackbar} // Open the Snackbar based on openSnackbar state
        autoHideDuration={6000} // Auto-hide the snackbar after 6 seconds
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
