import {TRowData} from "../types/types/TRowData";
import {GoogleSpreadsheetRow} from "google-spreadsheet";
import {getSheet} from "../google-sheet";
import {IUpdateDataInput} from "../types/interfaces/IUpdateDataInput";
import {getLogger} from "../logging-config";
import {ELoggerCategory} from "../types/enums/ELoggerCategory";

export class CGoogleSheetsHelper<Type extends TRowData> {

    private readonly googleLogger = getLogger(ELoggerCategory.GoogleSheets);

    /* -------------------- GOOGLE SHEETS STUFF -------------------- */

    /**
     * Attempts to find a single row on a Google sheet using a filter made using a callback function.
     * Throws an error if one single result was not found.
     * @param filter The callback function used for the filter.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async findRow(filter: (value: GoogleSpreadsheetRow<Type>, index: number, array: GoogleSpreadsheetRow<TRowData>[]) => boolean): Promise<GoogleSpreadsheetRow<Type>> {
        const data = await getSheet();
        const rows = await data.getRows<Type>();

        this.googleLogger.debug("Attempting to filter rows for a single result.");
        const filteredRows = rows.filter(filter);

        if (filteredRows.length !== 1) {
            throw new Error("Filter did not find a unique row, please try again");
        }

        this.googleLogger.debug("Successfully filtered rows for a single result.");
        return filteredRows[0];
    }

    /**
     * Attempts to update the data on a found row using a callback function. Callback function sets the data of the cells and this function saves those changes.
     * @param row The found row to save the changes to.
     * @param func The callback function that is used to update the cells that is then saved.
     * @param dataInput Data input that is used to set the data to save to the cells.
     * @return True or false depending on if the data was successfully saved or not
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async updateSheet(row: GoogleSpreadsheetRow, func: (a: IUpdateDataInput<Type> | undefined) => void, dataInput?: IUpdateDataInput<Type>): Promise<boolean> {
        try {
            this.googleLogger.debug("Attempting to update data in sheet.");

            func(dataInput);
            await row.save();

            this.googleLogger.debug("Successfully updated data in sheet.");
            return true;
        } catch (error) {
            this.googleLogger.error("Failed to update data in sheet", error);
            return false;
        }
    }
}