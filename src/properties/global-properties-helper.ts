import { readFileSync, writeFileSync } from "fs";
import { CGlobalProperties } from "../typing-helpers/classes/CGlobalProperties";
import { Channel } from "discord.js";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../typing-helpers/enums/ELoggerCategory";

const logger = getLogger(ELoggerCategory.Core)

/**
 * File location of the global properties file.
 */
const __globalPropertiesFile = "./src/properties/global-properties.json";

const readGlobalProperties = () => {
    const globalPropertiesFile = readFileSync(__globalPropertiesFile, "utf-8");
    return JSON.parse(globalPropertiesFile);
}

/**
 * Loads global properties from JSON file in runtime, file can be changed and changes will be reflected without rebuilding.
 */
export const getGlobalProperties = () => {
    const globalPropertiesJson = readGlobalProperties();

    return Object.assign(new CGlobalProperties(), globalPropertiesJson) as CGlobalProperties
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
    writeFileSync(__globalPropertiesFile, data);

    logger.debug(`Property: ${property} was successfully change to value: ${value}.`)
}
