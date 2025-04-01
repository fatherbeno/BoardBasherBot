import { FileSystem } from "./.helpers";
import { EFileTypeCategory } from "../types/enums/EFileTypeCategory";
import { getLogger} from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { EUserType } from "../types/enums/EUserType";
import { Client, Role, Guild} from "discord.js";
import config from "../config"
import { areArraysEqual } from "./OtherUtilitiesHelper";
import { CommonConstants } from "./CCommonConstantsHelper";

/**
 * Helper class tasked with handling all things user type roles.
 * @author Benjamin Gulliver (fatherbeno)
 */
export class CUserTypeRolesHelper {

    /* -------------------- CLASS STUFF -------------------- */

    constructor(client: Client) {
        client.guilds.fetch(config.GUILD_ID).then((result) => this._guild = result);
        this.loadUserTypesRoles().then(result => this._userTypeRoles = result);
    }

    // @ts-ignore
    private _guild: Guild;

    /**
     * Constant loaded variable to reduce times the map is created.
     * @private
     */
    private _userTypeRoles: Map<EUserType, string[]> = new Map<EUserType, string[]>();

    /* -------------------- LOGGING STUFF -------------------- */

    private readonly logger = getLogger(ELoggerCategory.UserTypeRoles);

    /* -------------------- HELPER SPECIFIC STUFF -------------------- */

    /**
     * Loads user type roles file and transforms it to a usable map format.
     * @return A user type/roles id map for every user role.
     * @author Benjamin Gulliver (fatherbeno)
     */
    private async loadUserTypesRoles(): Promise<Map<EUserType, string[]>> {
        const userTypeRolesJson = await FileSystem.readFile(EFileTypeCategory.UserTypeRoles);

        const tempStringMap = new Map<string, string[]>(Object.entries(userTypeRolesJson));
        const tempEnumMap = new Map<EUserType, string[]>();

        tempStringMap.forEach((value, key) =>  {
            tempEnumMap.set(this.convertStringToEUserType(key), value);
        })

        this._userTypeRoles = tempEnumMap;

        return this._userTypeRoles;
    }

    /**
     * Gets user type roles from loaded data, file can be changed and changes will be reflected without rebuilding.
     * @param inUserType Name of user type to get the roles for.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async getRoles(inUserType: EUserType | string): Promise<Role[]> {
        const userType: EUserType = typeof inUserType === "string" ? this.convertStringToEUserType(inUserType) : inUserType;
        const userTypeRoleIDs = this._userTypeRoles.get(userType);
        const userTypeRoles: Role[] = [];
        let fetchedRole: Role | null;

        if (userTypeRoleIDs) {
            for (let i = 0; i < userTypeRoleIDs.length; i++) {
                if (userTypeRoleIDs[i]) {
                    fetchedRole = await this._guild.roles.fetch(userTypeRoleIDs[i]);
                    if (fetchedRole) userTypeRoles.push(fetchedRole);
                }
            }
        }

        return this.sortRolesByPosition(userTypeRoles);
    }

    /**
     * Adds a role to a specific user type and saves it to a file.
     * @param inUserType Name of user type to set the roles for.
     * @param role Role to save to user type.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async addRole(inUserType: string, role: Role) {
        const userType = this.convertStringToEUserType(inUserType);
        const userTypeRoles = await this.getRoles(userType);

        if (userTypeRoles.indexOf(role) > 0) {
            throw new Error("Role is already present, no need to add it again.");
        }

        userTypeRoles.push(role);
        await this.saveRoles(userType, userTypeRoles);
    }

    /**
     * Removes a role to a specific user type and saves it to a file.
     * @param inUserType Name of user type to remove the roles for.
     * @param inRole Role to remove from user type.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async removeRole(inUserType: string, inRole: Role) {
        const userType = this.convertStringToEUserType(inUserType);
        let userTypeRoles = await this.getRoles(userType);
        const roleIndex = userTypeRoles.indexOf(inRole)

        if (roleIndex < 0) throw new Error("Role is not present, no need to try and remove it.");
        else if (roleIndex >= 0) userTypeRoles = userTypeRoles.filter((role) => { return inRole !== role });

        await this.saveRoles(userType, userTypeRoles);
    }

    /**
     * Add a role on a user type in runtime and saves it to a json file (also reloads current properties).
     * Also sorts the roles to save them in order of highest position first.
     * @param userType Name of user type to set the property for.
     * @param roles Value of the roles to change for the user type.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private async saveRoles(userType: EUserType, roles: Role[]) {
        this.logger.debug(`Attempting to change user type: ${userType} with roles:${roles.map((role) => { return " " + role.name; })}.`);

        const allUserTypesRoles = await this.loadUserTypesRoles();
        const sortedRoles = this.sortRolesByPosition(roles);

        allUserTypesRoles.set(userType, sortedRoles.map((role) => { return role.id; }))

        await FileSystem.writeFile(EFileTypeCategory.UserTypeRoles, Object.fromEntries(allUserTypesRoles));
        await this.loadUserTypesRoles();

        this.logger.debug(`User type: ${userType} successfully now has the roles:${sortedRoles.map((role) => { return " " + role.name; })}.`);
    }

    /**
     * Converts a string to a usable user type enum.
     * @param input String to convert.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public convertStringToEUserType(input: string): EUserType {
        return (Object.values(EUserType) as string[]).includes(input) ? (input as EUserType) : EUserType[input as keyof typeof EUserType];
    }

    /**
     * Using the inputted roles, it will try to find a user type which has the same roles stored in it.
     * @param roles Input roles to compare with a stored user type's roles.
     * @return Gets a user type that has the same matching roles as the inputted types, returns the ERROR user type if a match was not found.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public getUserTypeBasedOnRoles(roles: Role[]): EUserType {
        let foundUserType = EUserType.Error;
        const sortedRoles = this.sortRolesByPosition(roles);


        // converts sorted array into role ids
        const sortedRoleIDS: string[] = sortedRoles.map((role) => {
            return role.id
        });

        // compare inputted roles with stored roles on a user type, return user type if highest position role are the same on both lists
        this._userTypeRoles.forEach((userTypeRoleIDs, key) => {
            // userTypeRoleIDs are saved in sorted order, so no need to sort again
            if (userTypeRoleIDs[0] === sortedRoleIDS[0]) foundUserType = key;
        })

        return foundUserType;
    }

    /**
     * Sorts the roles array by position, higher position comes first, lower position comes last
     * @param roles Input roles list to output a sorted copy.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private sortRolesByPosition(roles: Role[]): Role[] {
        roles.sort((roleA, roleB) => {
            return roleB.position - roleA.position;
        });
        return roles;
    }
}