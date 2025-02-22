import React, { useState } from "react";
import { Box, Card, CardContent, Button, TextField, Slider, Typography } from "@mui/material";

interface InputFormProps {
  onAddData: (newEntry: { date: string; temperature: number }) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onAddData }) => {
  const [temperature, setTemperature] = useState<number>(37.0); // Default temperature
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]); // Default to today's date

  const handleAddData = () => {
    if (!temperature || isNaN(Number(temperature))) {
      alert("Vänligen ange en giltig temperatur.");
      return;
    }

    if (!date) {
      alert("Datum är obligatoriskt.");
      return;
    }

    onAddData({
      date,
      temperature,
    });

    // Reset form
    setTemperature(37.0); // Reset to default temperature
    setDate(new Date().toISOString().split("T")[0]); // Reset to today's date
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setTemperature(parseFloat(value.toFixed(1))); // Ensures one decimal place
    }
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: '100%',
        marginBottom: '16px',
        padding: '16px',
      }}
    >
      <CardContent>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Temperature Selection Section */}
          <Typography variant="h6" style={{ fontSize: '1rem', textAlign: 'center' }}>Ange temperatur</Typography>
          <Slider
            value={temperature}
            min={36.0}
            max={40.0}
            step={0.1} // Set step to 0.1
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => value.toFixed(1)} // Display value with one decimal place
            onChange={(_, newValue) => setTemperature(parseFloat((newValue as number).toFixed(1)))} // Ensure one decimal place
            marks={[
              { value: 36.0, label: '36°C' },
              { value: 37.0, label: '37°C' },
              { value: 38.0, label: '38°C' },
              { value: 39.0, label: '39°C' },
              { value: 40.0, label: '40°C' },
            ]}
            sx={{
              width: '100%',
              maxWidth: '100%',
              paddingBottom: '8px',
            }}
          />
          <TextField
            type="number"
            label="Manuell temperatur"
            value={temperature.toFixed(1)} // Format to one decimal place
            onChange={handleTemperatureChange}
            inputProps={{
              step: 0.1, // Allow one decimal step
              min: 36.0,
              max: 40.0,
            }}
            fullWidth
            variant="outlined"
          />
          <TextField
            type="date"
            label="Ange datum"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            required
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
