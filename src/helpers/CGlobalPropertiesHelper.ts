import { CGlobalProperties } from "../types/classes/CGlobalProperties";
import { Channel } from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { FileSystem } from "./CFileSystemHelper";
import { EFileTypeCategory } from "../types/enums/EFileTypeCategory";

/**
 * Helper class tasked with handling all things global properties.
 * @author Benjamin Gulliver (fatherbeno)
 */
class CGlobalPropertiesHelper {

    /* -------------------- CLASS STUFF -------------------- */

    constructor() {
        this.loadProperties()
    }

    /**
     * Copy of loaded global properties data.
     * @private
     */
    private _globalPropertiesObject: CGlobalProperties = new CGlobalProperties();

    /**
     * Gets saved global properties data.
     */
    public getProperties(): CGlobalProperties {
        return this._globalPropertiesObject;
    }

    /* -------------------- LOGGING STUFF -------------------- */

    private logger = getLogger(ELoggerCategory.Core)

    /* -------------------- HELPER SPECIFIC STUFF -------------------- */

    /**
     * Json object to global properties' mapper. Transforms json into usable global properties without initialising a new class,
     * @param jsonObject Inputted json data.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private assignGlobalProperties(jsonObject: any) {
        Object.keys(jsonObject).forEach((key) => {
            this._globalPropertiesObject[key as keyof typeof this._globalPropertiesObject] = jsonObject[key];
        })
    }

    /**
     * Loads global properties from JSON file in runtime, file can be changed and changes will be reflected without rebuilding.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private async loadProperties() {
        const globalPropertiesJson = await FileSystem.readFile(EFileTypeCategory.GlobalProperties);

        if (!this._globalPropertiesObject) this._globalPropertiesObject = Object.assign(new CGlobalProperties(), globalPropertiesJson) as CGlobalProperties;
        if (this._globalPropertiesObject) this.assignGlobalProperties(globalPropertiesJson);

        return this._globalPropertiesObject;
    }

    /**
     * Sets global properties to JSON file in runtime, does not need to be rebuilt.
     * @param property property to change.
     * @param value value to set changing property to.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async setProperties(property: string, value: string | Channel) {
        this.logger.debug(`Attempting to change property: ${property} with value: ${value}.`)

        const globalProperties = this.getProperties();

        // @ts-ignore
        globalProperties[property as keyof typeof globalProperties] = value;

        await FileSystem.writeFile(EFileTypeCategory.GlobalProperties, globalProperties);
        await this.loadProperties();

        this.logger.debug(`Property: ${property} was successfully change to value: ${value}.`)
    }
}

/**
 * Copy of loaded global properties' data and system.
 */
export const GlobalProperties = new CGlobalPropertiesHelper();