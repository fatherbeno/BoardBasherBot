import { readFileSync, writeFileSync } from "fs";
import { CGlobalProperties } from "../types/classes/CGlobalProperties";
import { Channel } from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";

class CGlobalPropertiesHelper {

    private logger = getLogger(ELoggerCategory.Core)

    private _globalPropertiesObject: CGlobalProperties = new CGlobalProperties();

    /**
     * File location of the global properties file.
     */
    private _globalPropertiesFile = "./src/properties/global-properties.json";

    private readGlobalProperties() {
        const globalPropertiesFile = readFileSync(this._globalPropertiesFile, "utf-8");
        return JSON.parse(globalPropertiesFile);
    }

    private assignGlobalProperties(jsonObject: any) {
        Object.keys(jsonObject).forEach((key) => {
            this._globalPropertiesObject[key as keyof typeof this._globalPropertiesObject] = jsonObject[key];
        })
    }

    /**
     * Loads global properties from JSON file in runtime, file can be changed and changes will be reflected without rebuilding.
     */
    public getProperties() {
        const globalPropertiesJson = this.readGlobalProperties();

        if (!this._globalPropertiesObject) this._globalPropertiesObject = Object.assign(new CGlobalProperties(), globalPropertiesJson) as CGlobalProperties;
        if (this._globalPropertiesObject) this.assignGlobalProperties(globalPropertiesJson);

        return this._globalPropertiesObject;
    }


    /**
     * Sets global properties to JSON file in runtime, does not need to be rebuilt.
     * @param property property to change.
     * @param value value to set changing property to.
     */
    public setProperties(property: string, value: string | Channel) {
        this.logger.debug(`Attempting to change property: ${property} with value: ${value}.`)

        const globalProperties = this.getProperties();

        // @ts-ignore
        globalProperties[property as keyof typeof globalProperties] = value;

        const data = JSON.stringify(globalProperties, null, 2);
        writeFileSync(this._globalPropertiesFile, data);

        this.logger.debug(`Property: ${property} was successfully change to value: ${value}.`)
    }
}

export const GlobalProperties = new CGlobalPropertiesHelper();