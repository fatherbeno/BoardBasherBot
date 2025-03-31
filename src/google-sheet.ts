import config from './config'
import * as botsheets from '../boardbasherbot-googleauth.json'
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { getLogger } from "./logging-config";
import { ELoggerCategory } from "./types/enums/ELoggerCategory";
import { ESheetType } from "./types/enums/ESheetType";

const logger = getLogger(ELoggerCategory.GoogleSheets);

const serviceAccountAuth = new JWT({
    email: botsheets.client_email,
    keyId: botsheets.private_key_id,
    key: botsheets.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/drive'],
});

const crewDoc = new GoogleSpreadsheet(config.CREW_GOOGLE_SHEET_ID, serviceAccountAuth);
const staffDoc = new GoogleSpreadsheet(config.STAFF_GOOGLE_SHEET_ID, serviceAccountAuth);

let crewSheet: GoogleSpreadsheetWorksheet;
let staffSheet: GoogleSpreadsheetWorksheet;

/**
 * Attempts to load all the cells from the first sheet on the specific file.
 * @param whichSheet Which sheet gets loaded.
 */
const loadData = async (whichSheet: ESheetType): Promise<GoogleSpreadsheetWorksheet> => {
    logger.debug("Attempting to fetch Google Sheets information.")

    let loadedSheet: GoogleSpreadsheetWorksheet;

    if (whichSheet === ESheetType.Crew) {
        await crewDoc.loadInfo();
        crewSheet = crewDoc.sheetsByIndex[0];
        await crewSheet.loadCells();
        loadedSheet = crewSheet;
    } else {
        await staffDoc.loadInfo();
        staffSheet = staffDoc.sheetsByIndex[0];
        await staffSheet.loadCells();
        loadedSheet = staffSheet;
    }
    
    logger.debug("Google Sheets information successfully fetched.")
    return loadedSheet;
}

/**
 * Returns the loaded sheet from the Google Sheets document.
 */
export const getSheet = async (whichSheet: ESheetType): Promise<GoogleSpreadsheetWorksheet> => {
    const sheet = whichSheet === ESheetType.Staff ? staffSheet : crewSheet;
    return sheet ? sheet : await loadData(whichSheet);
}

loadData(ESheetType.Crew)
loadData(ESheetType.Staff)