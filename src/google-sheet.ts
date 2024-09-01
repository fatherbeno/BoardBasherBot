import config from './config'
import * as botsheets from '../boardbasherbot-googleauth.json'
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { getLogger } from "./logging-config";
import { ELoggerCategory } from "./typing-helpers/enums/ELoggerCategory";

const logger = getLogger(ELoggerCategory.GoogleSheets);

const serviceAccountAuth = new JWT({
    email: botsheets.client_email,
    keyId: botsheets.private_key_id,
    key: botsheets.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/drive'],
});

const doc = new GoogleSpreadsheet(config.GOOGLE_SHEET_ID, serviceAccountAuth);

let sheet: GoogleSpreadsheetWorksheet;

/**
 * Attempts to load all the cells from the first sheet on the specific file.
 */
const loadData = async (): Promise<GoogleSpreadsheetWorksheet> => {
    logger.debug("Attempting to fetch Google Sheets information.")
    
    await doc.loadInfo();
    sheet = doc.sheetsByIndex[0];
    await sheet.loadCells();
    
    logger.debug("Google Sheets information successfully fetched.")
    return sheet;
}

/**
 * Returns the loaded sheet from the Google Sheets document.
 */
export const getSheet = async (): Promise<GoogleSpreadsheetWorksheet> => {
    return sheet ? sheet : await loadData();
}

loadData();