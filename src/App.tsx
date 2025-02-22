import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import InputForm from './components/InputForm';
import TemperatureChart from './components/TemperatureChart';
import TemperatureTable from './components/TemperatureTable';
import { initGoogleClient } from './server/auth';
import { database, ref, set, get } from './server/firebase';
import { gapi } from 'gapi-script';
import { eachDayOfInterval, parseISO, format } from 'date-fns'; 

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

  // Function to fill missing dates
  const fillMissingDates = (data: TemperatureData[]): TemperatureData[] => {
    if (data.length === 0) return [];

    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find the minimum and maximum dates in the data
    const minDate = parseISO(sortedData[0].date);
    const maxDate = parseISO(sortedData[sortedData.length - 1].date);

    // Generate a list of all dates between minDate and maxDate
    const allDates = eachDayOfInterval({ start: minDate, end: maxDate }).map((date) => format(date, 'yyyy-MM-dd'));

    // Create a map of existing data for quick lookup
    const dataMap = new Map(sortedData.map((entry) => [entry.date, entry.temperature]));

    // Create a new array with all dates filled
    const filledData = allDates.map((date) => ({
      date,
      temperature: dataMap.get(date) ?? null, // Use existing temperature or null if missing
    }));

    return filledData;
  };

  // Initialize Google Client and check the sign-in state
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);
  
      try {
        await initGoogleClient();
        const authInstance = gapi.auth2.getAuthInstance();
  
        if (authInstance && authInstance.isSignedIn.get()) {
          setIsSignedIn(true);
        } else {
          setIsSignedIn(false); // Ensure user is not signed in initially
        }
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
      const fetchDataFromFirebase = async () => {
        setLoading(true);
        try {
          const snapshot = await get(ref(database, 'temperatures'));
          if (snapshot.exists()) {
            const dataFromDb = Object.values(snapshot.val()) as TemperatureData[];
            const filledData = fillMissingDates(dataFromDb);
            setData(filledData);
          } else {
            setError('No data available');
            setOpenSnackbar(true);
          }
        } catch (error) {
          setError('Failed to fetch data');
          setOpenSnackbar(true);
          console.error('Error fetching Firebase data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchDataFromFirebase();
    }
  }, [isSignedIn]);

  // Handle adding new data
  const handleAddData = async (newEntry: { date: string; temperature: number }) => {
    try {
      const newDataRef = ref(database, 'temperatures/' + newEntry.date);
      await set(newDataRef, {
        date: newEntry.date,
        temperature: newEntry.temperature,
      });

      setData((prevData) => {
        const newDataEntry: TemperatureData = {
          date: newEntry.date,
          temperature: newEntry.temperature,
        };

        const sortedData = [...prevData, newDataEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return fillMissingDates(sortedData); // Ensure dates are filled after adding new data
      });
    } catch (error) {
      console.error('Error adding data:', error);
      setError('Failed to add data');
      setOpenSnackbar(true);
    }
  };

  // Handle deleting data
  const handleDeleteData = async (date: string, temperature: number | null) => {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn(); // Ensure user is signed in
    }

    try {
      const dataRef = ref(database, 'temperatures/' + date);
      await set(dataRef, null); // Delete data

      setData((prevData) => {
        const updatedData = prevData.filter((row) => row.date !== date || row.temperature !== temperature);
        return fillMissingDates(updatedData); // Ensure dates are filled after deletion
      });
    } catch (error) {
      console.error('Error deleting data:', error);
      setError('Failed to delete data');
      setOpenSnackbar(true);
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

  return (
    <Box
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box 
        style={{
          display: 'flex',
          justifyContent: 'space-between', // Align items on opposite ends
          width: '100%',
          alignItems: 'center',
          marginBottom: '16px', // Add space below the header
        }}
      >
        <Typography variant="h4" gutterBottom color={'black'} style={{ fontSize: '2rem' }}>
          Temperaturspårning
        </Typography>
        <Button
          variant="contained"
          style={{
            backgroundColor: isSignedIn ? 'red' : 'green',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '1rem',
          }}
          onClick={isSignedIn ? handleSignOut : handleSignIn}
        >
          {isSignedIn ? 'Sign Out' : 'Sign In'}
        </Button>
      </Box>

      <Box style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        flexGrow: 1,
      }}>
        {/* Your input, chart, and list components */}
        {loading ? (
          <CircularProgress />
        ) : (
          isSignedIn && (
            <>
              <InputForm onAddData={handleAddData} />
              <TemperatureChart data={data} />
              <TemperatureTable data={data} onDeleteData={handleDeleteData} />
            </>
          )
        )}
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App;
