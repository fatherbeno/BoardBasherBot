import { FileSystem } from "./.helpers";
import { EFileTypeCategory } from "../types/enums/EFileTypeCategory";
import { getLogger} from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";
import { EUserType } from "../types/enums/EUserType";
import { Client, Role, Guild} from "discord.js";
import config from "../config"

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

        return userTypeRoles;
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
     * @param role Role to save to user type.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async removeRole(inUserType: string, role: Role) {
        const userType = this.convertStringToEUserType(inUserType);
        const userTypeRoles = await this.getRoles(userType);
        const roleIndex = userTypeRoles.indexOf(role)

        if (roleIndex < 0) throw new Error("Role is not present, no need to try and remove it.");
        else if (roleIndex > 0) userTypeRoles.splice(roleIndex, roleIndex);
        else if (roleIndex === 0) userTypeRoles.shift();

        await this.saveRoles(userType, userTypeRoles);
    }

    /**
     * Add a role on a user type in runtime and saves it to a json file (also reloads current properties).
     * @param userType Name of user type to set the property for.
     * @param roles Value of the roles to change for the user type.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private async saveRoles(userType: EUserType, roles: Role[]) {
        this.logger.debug(`Attempting to change user type: ${userType} with roles: ${roles}.`);

        const allUserTypesRoles = await this.loadUserTypesRoles();

        allUserTypesRoles.set(userType, roles.map((role) => { return role.id }))

        await FileSystem.writeFile(EFileTypeCategory.UserTypeRoles, Object.fromEntries(allUserTypesRoles));
        await this.loadUserTypesRoles();

        this.logger.debug(`User type: ${userType} successfully now has the roles: ${roles}.`);
    }

    private convertStringToEUserType(input: string): EUserType {
        return (Object.values(EUserType) as string[]).includes(input) ? (input as EUserType) : EUserType[input as keyof typeof EUserType];
    }
}