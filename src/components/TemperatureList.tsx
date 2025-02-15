import React from 'react';
import { Card, CardContent, List, ListItem, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface TemperatureListProps {
  data: { date: string; temperature: number | null }[];
  onDeleteData: (index: number) => void;
}

const TemperatureList: React.FC<TemperatureListProps> = ({ data, onDeleteData }) => {
  return (
    <Card style={{ width: '100%', maxWidth: '800px', maxHeight: '200px', overflowY: 'auto' }}>
      <CardContent>
        <List>
          {data.map((entry, index) => (
            <ListItem key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>{`${entry.date}: ${entry.temperature}°C`}</Typography>
              <IconButton edge="end" aria-label="delete" onClick={() => onDeleteData(index)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TemperatureList;
