import { Role, SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { CommandProperties } from "../helpers/CCommandPropertiesHelper";

export const data = new SlashCommandBuilder()
    .setName("verifyroles")
    .setDescription("View, add or remove roles from the verify command which get allocated to users when they verify.")
    .addStringOption((option) => {
        return option
            .setName("operation")
            .setDescription("Whether you want to add or remove a role from the verify command, or view which roles are added.")
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
        let roles = await cmdHelper.getVerifyRoles();
        let role = cmdHelper.getRoleValue("role");

        // depending on operation chosen, different functionality is executed.
        let operation = cmdHelper.getStringValue("operation");
        switch (operation) {
            case "ADD_ROLE": {
                await addRole(cmdHelper, roles, role);
                break;
            }
            case "REMOVE_ROLE": {
                await removeRole(cmdHelper, roles, role);
                break;
            }
            case "VIEW_ROLES": {
                await viewRoles(cmdHelper, roles);
                break;
            }
            default: {
                break;
            }
        }
    });
};

const addRole = async (cmdHelper: CCommandHelper, roles: Role[], role: Role) => {
    if (!verifyRoleIsPresentInRoles(roles, role)) {
        roles.push(role)
        await cmdHelper.setVerifyRoles(roles);
    } else {
        throw new Error("Role is already present, no need to add it again.");
    }
}

const removeRole = async (cmdHelper: CCommandHelper, roles: Role[], role: Role) => {
    if (verifyRoleIsPresentInRoles(roles, role)) {
        let roleToRemove = roles.indexOf(role);
        if (roleToRemove > 0) roles.splice(roleToRemove, roleToRemove);
        if (roleToRemove === 0) roles.shift();
        await cmdHelper.setVerifyRoles(roles);
    } else {
        throw new Error("Role is not present, no need to try and remove it.");
    }
}

const verifyRoleIsPresentInRoles = (roles: Role[], role: Role): boolean => {
    const roleIndex = roles.indexOf(role);
    return roleIndex >= 0;
}

const viewRoles = async (cmdHelper: CCommandHelper, roles: Role[]) => {
    const channel = await cmdHelper.getTextChannel();
    let rolesList: string = "";

    for (let i = 0; i < roles.length; i++) {
        rolesList = `${rolesList} ${roles[i]}`;
    }

    if (!rolesList) { rolesList = CommandProperties.getProperties(cmdHelper.commandName).ExtraMessage; }

    const message = `**/verify grants the following roles to a user:** \n${rolesList}`;

    await channel.send({content: message});
}