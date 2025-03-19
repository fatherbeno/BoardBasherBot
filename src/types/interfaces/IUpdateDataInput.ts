import { ICommandInput } from "./ICommandInput";
import { GoogleSpreadsheetRow } from "google-spreadsheet";

/**
 * Required information to facilitate updating a row on a Google sheet.
 * @author Benjamin Gulliver (fatherbeno)
 */
export interface IUpdateDataInput<T extends Record<string, any>> {
    commandInput: ICommandInput;
    dataRow: GoogleSpreadsheetRow<T>;
}