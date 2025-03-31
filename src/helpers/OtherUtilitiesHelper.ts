import { EUserType } from "../types/enums/EUserType";
import { HexColorString } from "discord.js";

/**
 * Gets a certain colour based on a user type.
 * @param userType Type of user.
 * @author Benjamin Gulliver (fatherbeno)
 */
export const getColourBasedOnUserType = (userType: EUserType): HexColorString => {
    if (userType === EUserType.CrewCoordinator)
        return "#7A5fAC";
    if (userType === EUserType.Moderator)
        return "#00386B";
    if (userType === EUserType.Staff)
        return "#F7BB3C";
    if (userType === EUserType.Alumni)
        return "#00ABC7";
    if (userType === EUserType.MaidStaff || userType === EUserType.CurrentMaidCrew || userType === EUserType.MaidCrew)
        return "#FCAFCB";
    if (userType === EUserType.CurrentCrew || userType === EUserType.Crew)
        return "#F94F8E";

    return "#000000"
}

/**
 * Compares two sorted arrays and returns whether they are the same or not.
 * @param arr1 Array 1.
 * @param arr2 Array 2.
 * @return True/False based on if the arrays are the same/not the same.
 */
export const areArraysEqual = <Type>(arr1: Type[], arr2: Type[]): boolean => {
    if (arr1 === arr2) return true;
    if (arr1.length <= 0 || arr2.length <= 0) return false;
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }

    return true;
}

/**
 * Creates a name/value object to display input options created from the EUserType enum.
 * @author Benjamin Gulliver (fatherbeno)
 */
export const getUserTypeOptions = (): { name: string, value: string }[] => {
    const userTypeOptions: { name: string, value: string}[] = [];

    Object.entries(EUserType).forEach((value) => {
        if (value[1] !== EUserType.Error) {
            userTypeOptions.push({
                name: value[0].replace(/([A-Z])/g, ' $1').trim(),
                value: value[1]
            });
        }
    });

    return userTypeOptions;
}

/**
 * Gets the display name of a user type.
 * @param type User type to get display name of.
 * @return Display name of user type.
 * @author Benjamin Gulliver (fatherbeno)
 */
export const getUserTypeDisplayName = (type: EUserType): string => {
    return getUserTypeOptions().filter((option) => { return option.value === type })[0].name;
}