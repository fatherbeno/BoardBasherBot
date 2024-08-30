import { ICommandInput } from "./ICommandInput";
import { GoogleSpreadsheetRow } from "google-spreadsheet";

export interface IUpdateDataInput<T extends Record<string, any>> {
    commandInput: ICommandInput;
    dataRow: GoogleSpreadsheetRow<T>;
}