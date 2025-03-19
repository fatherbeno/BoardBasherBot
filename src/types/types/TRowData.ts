export type TRowData = TUserRowData

/**
 * Specific information that is saved to a row on a Google sheet.
 * @author Benjamin Gulliver (fatherbeno)
 */
export type TUserRowData = {
    id: number;
    name: string;
    phone: number;
    verified?: boolean;
    discordId?: string;
}