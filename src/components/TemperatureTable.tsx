import React from 'react';
import { Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface TemperatureTableProps {
  data: { date: string; temperature: number | null }[];
  onDeleteData: (date: string, temperature: number | null) => void;
}

const TemperatureTable: React.FC<TemperatureTableProps> = ({ data, onDeleteData }) => {
  return (
    <Card style={{ width: '100%', maxWidth: '100%', overflowY: 'auto', marginBottom: '16px' }}>
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">Datum</TableCell>
                <TableCell align="center">Temperatur</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((entry, index) => {
                // Determine if the row should have a light grey background (alternating rows)
                const isAlternatingRow = index % 2 !== 0;

                // Determine if the data is missing (temperature is null)
                const isMissingData = entry.temperature === null;

                return (
                  <TableRow
                    key={index}
                    style={{
                      backgroundColor: isAlternatingRow ? '#f5f5f5' : 'transparent', // Light grey for alternating rows
                      opacity: isMissingData ? 0.6 : 1, // Grey out rows with missing data
                    }}
                  >
                    <TableCell style={{ color: isMissingData ? '#9e9e9e' : 'inherit' }}>
                      {entry.date}
                    </TableCell>
                    <TableCell align="center" style={{ color: isMissingData ? '#9e9e9e' : 'inherit' }}>
                      {entry.temperature !== null ? `${entry.temperature}°C` : 'Data saknas'}
                    </TableCell>
                    <TableCell align="right">
                      {/* Only show delete button if data is not missing */}
                      {!isMissingData && (
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => onDeleteData(entry.date, entry.temperature)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TemperatureTable;
