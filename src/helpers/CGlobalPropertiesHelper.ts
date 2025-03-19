import { CGlobalProperties } from "../types/classes/CGlobalProperties";
import { Channel } from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { FileSystem } from "./CFileSystemHelper";
import { EFileTypeCategory } from "../types/enums/EFileTypeCategory";

class CGlobalPropertiesHelper {

    constructor() {
        this.loadProperties()
    }

    private logger = getLogger(ELoggerCategory.Core)

    private _globalPropertiesObject: CGlobalProperties = new CGlobalProperties();

    private assignGlobalProperties(jsonObject: any) {
        Object.keys(jsonObject).forEach((key) => {
            this._globalPropertiesObject[key as keyof typeof this._globalPropertiesObject] = jsonObject[key];
        })
    }

    /**
     * Loads global properties from JSON file in runtime, file can be changed and changes will be reflected without rebuilding.
     * @private
     */
    private loadProperties() {
        const globalPropertiesJson = FileSystem.readFile(EFileTypeCategory.GlobalProperties);

        if (!this._globalPropertiesObject) this._globalPropertiesObject = Object.assign(new CGlobalProperties(), globalPropertiesJson) as CGlobalProperties;
        if (this._globalPropertiesObject) this.assignGlobalProperties(globalPropertiesJson);

        return this._globalPropertiesObject;
    }

    /**
     * Gets saved global properties data.
     */
    public getProperties(): CGlobalProperties {
        return this._globalPropertiesObject;
    }

    /**
     * Sets global properties to JSON file in runtime, does not need to be rebuilt.
     * @param property property to change.
     * @param value value to set changing property to.
     */
    public async setProperties(property: string, value: string | Channel) {
        this.logger.debug(`Attempting to change property: ${property} with value: ${value}.`)

        const globalProperties = this.getProperties();

        // @ts-ignore
        globalProperties[property as keyof typeof globalProperties] = value;

        await FileSystem.writeFile(EFileTypeCategory.GlobalProperties, globalProperties);
        this.loadProperties();

        this.logger.debug(`Property: ${property} was successfully change to value: ${value}.`)
    }
}

export const GlobalProperties = new CGlobalPropertiesHelper();