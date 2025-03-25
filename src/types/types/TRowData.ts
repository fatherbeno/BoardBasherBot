export type TRowData = TUserData

/**
 * Specific information that is saved to a row on a Google sheet.
 * @author Benjamin Gulliver (fatherbeno)
 */
export type TUserData = {
    id: number;
    name: string;
    phone: number;
    verified?: boolean;
    discordId?: string;
}