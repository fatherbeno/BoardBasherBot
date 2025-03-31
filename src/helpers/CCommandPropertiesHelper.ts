import { CCommandProperties } from "../types/classes/CCommandProperties";
import { FileSystem, GlobalProperties } from "./.helpers";
import { EFileTypeCategory } from "../types/enums/EFileTypeCategory";
import { getLogger} from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { ICommandPropertiesWriter } from "../types/interfaces/ICommandPropertiesWriter";
import { CommonConstants } from "./CCommonConstantsHelper";

/**
 * Helper class tasked with handling all things command properties.
 * @author Benjamin Gulliver (fatherbeno)
 */
export class CCommandPropertiesHelper {

    /* -------------------- CLASS STUFF -------------------- */

    constructor() {
        this.loadProperties().then(result => this._commandProperties = result);
    }

    /**
     * Constant loaded variable to reduce times the map is created.
     * @private
     */
    private _commandProperties: Map<string, CCommandProperties> = new Map<string, CCommandProperties>();

    /* -------------------- LOGGING STUFF -------------------- */

    private readonly logger = getLogger(ELoggerCategory.CommandProperties);

    /* -------------------- HELPER SPECIFIC STUFF -------------------- */

    /**
     * Loads command properties file and transforms it to a usable map format.
     * @return A command name/command properties map for every command.
     * @author Benjamin Gulliver (fatherbeno)
     */
    private async loadProperties(): Promise<Map<string, CCommandProperties>> {
        const commandPropertiesJson = await FileSystem.readFile(EFileTypeCategory.CommandProperties);
        this._commandProperties = new Map<string, CCommandProperties>(Object.entries(commandPropertiesJson));
        return this._commandProperties;
    }

    /**
     * Gets command properties from loaded data, file can be changed and changes will be reflected without rebuilding.
     * @param commandName Name of command to get the properties for.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public getProperties(commandName: string): CCommandProperties {
        const commandProperties = this._commandProperties.get(commandName);

        return commandProperties ? commandProperties : new CCommandProperties("", GlobalProperties.getProperties().CommandErrorMessage);
    }

    /**
     * Sets a property on a specific command in runtime and saves it to a json file (also reloads current properties).
     * @param commandName Name of command to set the property for.
     * @param property Name of property being set.
     * @param value Value of the changed property.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async setProperties(commandName: string, property: string, value: string) {
        this.logger.debug(`Attempting to change property: ${property} on command: /${commandName} with value: ${value}.`);

        const allCommandProperties = await this.loadProperties();
        const commandProperty = this.getProperties(commandName);

        const propertyKey = property as keyof typeof commandProperty;

        if (property !== CommonConstants.Ephemeral) {
            (commandProperty[propertyKey] as string) = value;
        } else {
            (commandProperty[propertyKey] as boolean) = JSON.parse(value);
        }

        allCommandProperties.set(commandName, commandProperty);
        const writableProperties = this.convertToReadableData(allCommandProperties)

        await FileSystem.writeFile(EFileTypeCategory.CommandProperties, Object.fromEntries(writableProperties));
        await this.loadProperties();

        this.logger.debug(`Property: ${property} on command: /${commandName} was successfully change to value: ${value}.`);
    }

    /**
     * Changing data into a readable format (this fixed a massive bug).
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private convertToReadableData(properties: Map<string, CCommandProperties>): Map<string, ICommandPropertiesWriter> {
        const readableData = new Map<string, ICommandPropertiesWriter>;

        properties.forEach((value, key) => {
            readableData.set(key, {
                ReplyMessage: value.ReplyMessage,
                ErrorMessage: value.ErrorMessage,
                ExtraMessage: value.ExtraMessage,
                Ephemeral: value.Ephemeral
            });
        });

        return readableData;
    }
}