import { readFileSync, writeFileSync } from "fs";
import { CGlobalProperties } from "../types/classes/CGlobalProperties";
import { Channel } from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";

const logger = getLogger(ELoggerCategory.Core)

let _globalPropertiesObject: CGlobalProperties;

/**
 * File location of the global properties file.
 */
const _globalPropertiesFile = "./src/properties/global-properties.json";

const readGlobalProperties = () => {
    const globalPropertiesFile = readFileSync(_globalPropertiesFile, "utf-8");
    return JSON.parse(globalPropertiesFile);
}

const assignGlobalProperties = (jsonObject: any) => {
    Object.keys(jsonObject).forEach((key) => {
        _globalPropertiesObject[key as keyof typeof _globalPropertiesObject] = jsonObject[key];
    })
}

/**
 * Loads global properties from JSON file in runtime, file can be changed and changes will be reflected without rebuilding.
 */
export const getGlobalProperties = () => {
    const globalPropertiesJson = readGlobalProperties();

    if (!_globalPropertiesObject) _globalPropertiesObject = Object.assign(new CGlobalProperties(), globalPropertiesJson) as CGlobalProperties;
    if (_globalPropertiesObject) assignGlobalProperties(globalPropertiesJson);

    return _globalPropertiesObject;
}

/**
 * Sets global properties to JSON file in runtime, does not need to be rebuilt.
 * @param property property to change.
 * @param value value to set changing property to.
 */
export const setGlobalProperties = (property: string, value: string | Channel) => {
    logger.debug(`Attempting to change property: ${property} with value: ${value}.`)

    const globalProperties = getGlobalProperties();

    // @ts-ignore
    globalProperties[property as keyof typeof globalProperties] = value;

    const data = JSON.stringify(globalProperties, null, 2);
    writeFileSync(_globalPropertiesFile, data);

    logger.debug(`Property: ${property} was successfully change to value: ${value}.`)
}
