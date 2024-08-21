import config from './config'
import * as botsheets from '../boardbasherbot-googleauth.json'
import {GoogleSpreadsheet, GoogleSpreadsheetWorksheet} from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
    email: botsheets.client_email,
    keyId: botsheets.private_key_id,
    key: botsheets.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/drive'],
});

export const doc = new GoogleSpreadsheet(config.GOOGLE_SHEET_ID, serviceAccountAuth);

export const dbData = async (): Promise<GoogleSpreadsheetWorksheet> => {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadCells();
    await sheet.getRows();
    
    return sheet;
}