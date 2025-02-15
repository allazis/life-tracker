import React, { useState } from 'react';
import { Box, Card, CardContent, Button, TextField } from '@mui/material';

interface InputFormProps {
  onAddData: (newEntry: { date: string; temperature: number }) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onAddData }) => {
  const [temperature, setTemperature] = useState<string>('');
  const [date, setDate] = useState<string>('');

  const handleAddData = () => {
    if (temperature && !isNaN(Number(temperature))) {
      onAddData({
        date: date || new Date().toISOString().split('T')[0],
        temperature: Number(temperature),
      });
      setTemperature('');
      setDate('');
    } else {
      alert('Vänligen ange en giltig temperatur.');
    }
  };

  return (
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
          <Button variant="contained" color="primary" onClick={handleAddData} fullWidth>
            Lägg till
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InputForm;
