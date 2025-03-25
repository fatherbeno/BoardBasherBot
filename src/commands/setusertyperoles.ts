import { Role, SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { CommandProperties, UserTypeRoles } from "../helpers/.helpers";
import { EUserType } from "../types/enums/EUserType";

export const data = new SlashCommandBuilder()
    .setName("setusertyperoles")
    .setDescription("View, add or remove roles from a user type.")
    .addStringOption((option) => {
        return option
            .setName("usertype")
            .setDescription("User type to modify or view the roles for.")
            .setRequired(true)
            .setAutocomplete(true)
    })
    .addStringOption((option) => {
        return option
            .setName("operation")
            .setDescription("Whether you want to add or remove a role from a user type, or view which roles have been added.")
            .setRequired(true)
            .addChoices(
                { name: "add role", value: "ADD_ROLE" },
                { name: "remove role", value: "REMOVE_ROLE" },
                { name: "view roles", value: "VIEW_ROLES" },
            );
    })
    .addRoleOption(role => {
        return role
            .setName("role")
            .setDescription("(REQUIRED WHEN ADDING OR REMOVING) Add or remove role from the verify command.")
    });

export const execute = async (cmdHelper: CCommandHelper) => {
    return await cmdHelper.executeCommand(async () => {
        const userType = cmdHelper.getStringValue("usertype");
        const role = cmdHelper.getRoleValue("role");

        // depending on operation chosen, different functionality is executed.
        const operation = cmdHelper.getStringValue("operation");

        // checking to see if a role was selected for the add/remove role operation, throws error if no role was selected.
        if (operation !== "VIEW_ROLES" && !role) {
            throw new Error("Attempted to modify a user type without a selected role.");
        }

        // checking to see if selected role has admin perms, throw error if it does.
        if (operation !== "VIEW_ROLES" && role.permissions.has("Administrator", true)) {
            throw new Error("Attempted to modify a user type with an admin role. This is not allowed.");
        }

        switch (operation) {
            case "ADD_ROLE": {
                await UserTypeRoles.addRole(userType, role);
                break;
            }
            case "REMOVE_ROLE": {
                await UserTypeRoles.removeRole(userType, role);
                break;
            }
            case "VIEW_ROLES": {
                await viewRoles(cmdHelper, userType);
                break;
            }
            default: {
                break;
            }
        }
    });
};

const viewRoles = async (cmdHelper: CCommandHelper, userType: string) => {
    const channel = await cmdHelper.getTextChannel();
    const roles = await UserTypeRoles.getRoles(userType);
    let rolesList: string = "";

    roles.forEach((role) => {
        rolesList = `${rolesList} ${role}`;
    })

    if (!rolesList) { rolesList = CommandProperties.getProperties(cmdHelper.commandName).ExtraMessage; }

    const message = `**'${getUserTypeEnumDisplayName(userType)}' user type grants the following roles to a member:** \n${rolesList}`;

    await channel.send({content: message});
}

const getUserTypeEnumDisplayName = (userType: string): string => {
    let displayName: string = "";

    Object.entries(EUserType).forEach((key, value) => {
        if (userType === key[1]) displayName = key[0].replace(/([A-Z])/g, ' $1').trim();
    })

    return displayName;
}