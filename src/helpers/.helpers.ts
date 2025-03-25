import { CCommandPropertiesHelper } from "./CCommandPropertiesHelper";
import { CFileSystemHelper } from "./CFileSystemHelper";
import { CGlobalPropertiesHelper } from "./CGlobalPropertiesHelper";
import { CLogErrorMessageHelper } from "./CLogErrorMessageHelper";
import { CUserTypeRolesHelper } from "./CUserTypeRolesHelper";
import { Client } from "discord.js";

export let CommandProperties: CCommandPropertiesHelper;
export let FileSystem: CFileSystemHelper;
export let GlobalProperties: CGlobalPropertiesHelper;
export let LogErrorMessage: CLogErrorMessageHelper;
export let UserTypeRoles: CUserTypeRolesHelper;

export const initHelpers = (client: Client) => {
    FileSystem = new CFileSystemHelper();
    CommandProperties = new CCommandPropertiesHelper();
    GlobalProperties = new CGlobalPropertiesHelper();
    LogErrorMessage = new CLogErrorMessageHelper(client);
    UserTypeRoles = new CUserTypeRolesHelper(client);
}