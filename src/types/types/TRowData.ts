import { EUserType } from "../enums/EUserType";

export type TRowData = TUserData | TDiscordUserData

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

/**
 * Data to be used to verify users on the discord from a Google sheet.
 * @author Benjamin Gulliver (fatherbeno)
 */
export type TDiscordUserData = {
    /**
     * Simple numerical ID.
     */
    id: number;
    /**
     * User's first name.
     */
    firstName: string;
    /**
     * User's last name.
     */
    lastName: string;
    /**
     * Type of user they are.
     */
    type: EUserType;
    /**
     * User's email.
     */
    email: string;
    /**
     * User's date of verification.
     */
    verifiedDate?: string;
    /**
     * User's discord ID.
     */
    discordID?: string;
}