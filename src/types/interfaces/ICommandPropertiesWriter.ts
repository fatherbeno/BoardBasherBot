/**
 * Used to transform the data into a readable format.
 * @author Benjamin Gulliver (fatherbeno)
 */
export interface ICommandPropertiesWriter {
    ReplyMessage: string;
    ErrorMessage: string;
    ExtraMessage: string;
    Ephemeral: boolean;
}