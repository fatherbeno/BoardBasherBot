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

export const doc = new GoogleSpreadsheet(config.GOOGLE_SHEET_ID, serviceAccountAuth);

export const dbData = async (): Promise<GoogleSpreadsheetWorksheet> => {
    try {
        logger.debug("Attempting to fetch Google Sheets information.")
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        await sheet.loadCells();
        await sheet.getRows();
        logger.debug("Google Sheets information successfully fetched.")
        return sheet;
    } catch (error) {
        logger.error("Google Sheets information failed to fetch.", error)
        throw new Error;
    }
}