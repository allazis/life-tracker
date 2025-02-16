import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import InputForm from './components/InputForm';
import TemperatureChart from './components/TemperatureChart';
import TemperatureList from './components/TemperatureList';
import { initGoogleClient, addRowToSheet, fetchSheetData, deleteRowFromSheet } from './server/GoogleSheetsService';
import { gapi } from 'gapi-script';

const SHEET_ID = '1VE9YGWLLO9CrLd4hst794GCo69r8F4B95dEI7GqeZJ8'; // Define SHEET_ID

interface TemperatureData {
  date: string;
  temperature: number | null;
}

const App: React.FC = () => {
  const [data, setData] = useState<TemperatureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Initialize Google Client and check the sign-in state
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);

      try {
        await initGoogleClient();
        const authInstance = gapi.auth2.getAuthInstance();
        setIsSignedIn(authInstance.isSignedIn.get());
      } catch (err) {
        setError('Failed to initialize Google Client');
        setOpenSnackbar(true);
        console.error('Error initializing Google Sheets client:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Fetch data only when signed in
  useEffect(() => {
    if (isSignedIn) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const sheetData = await fetchSheetData();
          setData(sheetData);
        } catch (err) {
          setError('Failed to fetch data');
          setOpenSnackbar(true);
          console.error('Error fetching sheet data:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isSignedIn]);

  // Handle adding new data
  const handleAddData = async (newEntry: { date: string; temperature: number }) => {
    setData((prevData) => {
      const newDataEntry: TemperatureData = {
        date: newEntry.date,
        temperature: newEntry.temperature,
      };

      const sortedData = [...prevData, newDataEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return sortedData;
    });
    await addRowToSheet(newEntry);
  };

  // Handle deleting data
  const handleDeleteData = async (date: string, temperature: number | null) => {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn(); // Ensure user is signed in
    }

    try {
      const sheetData = await fetchSheetData();
      const rowToDelete = sheetData.findIndex((row) => row.date === date && row.temperature === temperature);

      if (rowToDelete !== -1) {
        const range = `Sheet1!A${rowToDelete + 1}:B${rowToDelete + 1}`; // Note that row indexes start at 1 in Google Sheets
        await gapi.client.sheets.spreadsheets.values.clear({
          spreadsheetId: SHEET_ID,
          range: range,
        });

        // Update local state
        setData((prevData) => prevData.filter((row) => !(row.date === date && row.temperature === temperature)));
      } else {
        setError('Data not found for deletion');
        setOpenSnackbar(true);
      }
    } catch (err) {
      setError('Failed to delete data');
      setOpenSnackbar(true);
      console.error('Error deleting data:', err);
    }
  };

  // Handle sign-in
  const handleSignIn = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsSignedIn(true);
    } catch (err) {
      console.error('Sign-in failed:', err);
      setError('Sign-in failed');
      setOpenSnackbar(true);
    }
  };

  // Handle sign-out
  const handleSignOut = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut();
    setIsSignedIn(false);
    setData([]); // Clear data on sign-out
  };

  // Close error snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Generate date range for the chart
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

  // Process data for the chart
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
    <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom>Temperaturspårning</Typography>

      <Box style={{ marginBottom: '16px' }}>
        {/* Sign In/Out button */}
        <Button
          variant="contained"
          style={{
            backgroundColor: isSignedIn ? 'red' : 'green',
            color: 'white',
          }}
          onClick={isSignedIn ? handleSignOut : handleSignIn}
        >
          {isSignedIn ? 'Sign Out' : 'Sign In'}
        </Button>
      </Box>

      {/* Loader while loading */}
      {loading ? (
        <CircularProgress />
      ) : (
        isSignedIn && (
          <>
            <InputForm onAddData={handleAddData} />
            <TemperatureChart data={filledData} />
            <TemperatureList data={data} onDeleteData={handleDeleteData} />
          </>
        )
      )}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App;
