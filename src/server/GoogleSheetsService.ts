// GoogleSheetsService.ts
import { gapi } from 'gapi-script';

const CLIENT_ID = '341011933188-d07q8rjno0el8funhhno3bdbok91rm0j.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

const SHEET_ID = '1VE9YGWLLO9CrLd4hst794GCo69r8F4B95dEI7GqeZJ8';

export const initGoogleClient = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          if (!authInstance.isSignedIn.get()) {
            return authInstance.signIn(); // Ensure the user signs in with the correct scopes
          }
          resolve();
        })
        .catch((err: any) => reject(err));
    });
  });
};

export const addRowToSheet = async (rowData: { date: string; temperature: number | null }) => {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn(); // Ensure user is signed in
  }

  const values = [[rowData.date, rowData.temperature]];
  try {
    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:B',
      valueInputOption: 'RAW',
      resource: { values },
    });
  } catch (err) {
    console.error('Error adding row:', err);
  }
};

export const fetchSheetData = async (): Promise<{ date: string; temperature: number | null }[]> => {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn(); // Ensure user is signed in
  }

  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:B',
    });

    const rows = response.result.values || [];
    return rows.map(([date, temperature]: [string, string | null]) => ({
      date,
      temperature: temperature ? parseFloat(temperature) : null,
    }));
  } catch (err) {
    console.error('Error fetching data:', err);
    return [];
  }
};

// Method to delete a row by its index
export const deleteRowFromSheet = async (rowIndex: number) => {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn(); // Ensure user is signed in
  }

  try {
    // Specify the range to delete based on the row index (e.g., row 2 is 'A2:B2')
    const range = `Sheet1!A${rowIndex + 1}:B${rowIndex + 1}`;
    
    await gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: range,
    });
    console.log(`Row ${rowIndex + 1} deleted successfully.`);
  } catch (err) {
    console.error('Error deleting row:', err);
  }
};
