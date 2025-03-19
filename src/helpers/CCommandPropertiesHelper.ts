import { CCommandProperties } from "../types/classes/CCommandProperties";
import { FileSystem } from "./CFileSystemHelper";
import { EFileTypeCategory } from "../types/enums/EFileTypeCategory";
import { GlobalProperties } from "./CGlobalPropertiesHelper";
import { getLogger} from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";

/**
 * Helper class tasked with handling all things command properties.
 */
class CCommandPropertiesHelper {

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
     */
    private loadProperties = async (): Promise<Map<string, CCommandProperties>> => {
        const commandPropertiesJson = await FileSystem.readFile(EFileTypeCategory.CommandProperties);
        this._commandProperties = new Map<string, CCommandProperties>(Object.entries(commandPropertiesJson));
        return this._commandProperties;
    }

    /**
     * Gets command properties from loaded data, file can be changed and changes will be reflected without rebuilding.
     * @param commandName Name of command to get the properties for.
     */
    public getProperties = (commandName: string): CCommandProperties => {
        const commandProperties = this._commandProperties.get(commandName);

        return commandProperties ? commandProperties : new CCommandProperties("", GlobalProperties.getProperties().CommandErrorMessage);
    }

    /**
     * Sets a property on a specific command in runtime and saves it to a json file. (also reloads current properties)
     * @param commandName Name of command to set the property for.
     * @param property Name of property being set.
     * @param value Value of the changed property.
     */
    public setProperties = async (commandName: string, property: string, value: string) => {
        this.logger.debug(`Attempting to change property: ${property} on command: /${commandName} with value: ${value}.`);

        const allCommandProperties = await this.loadProperties();
        const commandProperty = this.getProperties(commandName);

        const propertyKey = property as keyof typeof commandProperty;

        if (property !== "Ephemeral") {
            (commandProperty[propertyKey] as string) = value;
        } else {
            (commandProperty[propertyKey] as boolean) = JSON.parse(value);
        }

        allCommandProperties.set(commandName, commandProperty);

        await FileSystem.writeFile(EFileTypeCategory.CommandProperties, Object.fromEntries(allCommandProperties));
        await this.loadProperties();

        this.logger.debug(`Property: ${property} on command: /${commandName} was successfully change to value: ${value}.`);
    }
}

/**
 * Copy of command properties' loaded data.
 */
export const CommandProperties = new CCommandPropertiesHelper();