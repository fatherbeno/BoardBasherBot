import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { CommandProperties, UserTypeRoles } from "../helpers/.helpers";
import { CommonConstants } from "../helpers/CCommonConstantsHelper";
import { getUserTypeDisplayName } from "../helpers/OtherUtilitiesHelper";

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
                { name: "add role", value: CommonConstants.AddRole },
                { name: "remove role", value: CommonConstants.RemoveRole },
                { name: "view roles", value: CommonConstants.ViewRoles },
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
        if (operation !== CommonConstants.ViewRoles && !role) {
            throw new Error("Attempted to modify a user type without a selected role.");
        }

        // checking to see if selected role has admin perms, throw error if it does.
        if (operation !== CommonConstants.ViewRoles && role.permissions.has("Administrator", true)) {
            throw new Error("Attempted to modify a user type with an admin role. This is not allowed.");
        }

        switch (operation) {
            case CommonConstants.AddRole: {
                await UserTypeRoles.addRole(userType, role);
                break;
            }
            case CommonConstants.RemoveRole: {
                await UserTypeRoles.removeRole(userType, role);
                break;
            }
            case CommonConstants.ViewRoles: {
                await viewRoles(cmdHelper, userType);
                break;
            }
            default: {
                break;
            }
        }
    });
};

const viewRoles = async (cmdHelper: CCommandHelper, inUserType: string) => {
    const channel = await cmdHelper.getTextChannel();
    const userType = UserTypeRoles.convertStringToEUserType(inUserType)
    const roles = await UserTypeRoles.getRoles(userType);
    let rolesList: string = "";

    roles.forEach((role) => {
        rolesList = `${rolesList} ${role}`;
    });

    if (!rolesList) { rolesList = CommandProperties.getProperties(cmdHelper.commandName).ExtraMessage; }

    const message = `**'${getUserTypeDisplayName(userType)}' user type grants the following roles to a member:** \n${rolesList}`;

    await channel.send({content: message});
}