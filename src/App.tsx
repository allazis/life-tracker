import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Button, TextField, Typography, List, ListItem, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface TemperatureData {
  date: string;
  temperature: number | null;
}

const App: React.FC = () => {
  const [temperature, setTemperature] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [data, setData] = useState<TemperatureData[]>([]);

  const handleAddData = () => {
    if (temperature && !isNaN(Number(temperature))) {
      const newEntry: TemperatureData = {
        date: date || new Date().toISOString().split('T')[0], // Använd valt datum eller dagens datum
        temperature: Number(temperature),
      };
      setData((prevData) => [...prevData, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setTemperature('');
      setDate('');
    } else {
      alert('Vänligen ange en giltig temperatur.');
    }
  };

  const handleDeleteData = (index: number) => {
    setData((prevData) => prevData.filter((_, i) => i !== index));
  };

  // Fyll ut saknade datum
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

      {/* Input Section */}
      <Card style={{ width: '100%', maxWidth: '800px', marginBottom: '16px' }}>
        <CardContent>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              type="number"
              label="Ange temperatur"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              type="date"
              label="Ange datum (valfritt)"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" color="primary" onClick={handleAddData} fullWidth>Lägg till</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Box style={{ width: '100%', maxWidth: '800px', height: '400px', marginBottom: '16px' }}>
        <ResponsiveContainer>
          <LineChart data={filledData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temperature" stroke="#8884d8" strokeWidth={2} connectNulls={true} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Scrollable Table Section */}
      <Card style={{ width: '100%', maxWidth: '800px', maxHeight: '200px', overflowY: 'auto' }}>
        <CardContent>
          <List>
            {data.map((entry, index) => (
              <ListItem key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>{`${entry.date}: ${entry.temperature}°C`}</Typography>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteData(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default App;
