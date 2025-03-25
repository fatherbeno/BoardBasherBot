import { GuildMember, SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { UserTypeRoles } from "../helpers/.helpers";

export const data = new SlashCommandBuilder()
    .setName("setusertype")
    .setDescription("Changes a member's roles based on a user type!")
    .addStringOption((option) => {
        return option
            .setName("member")
            .setDescription("Member to change the roles of.")
            .setRequired(true)
            .setAutocomplete(true);
    })
    .addStringOption((option) => {
        return option
            .setName("usertype")
            .setDescription("Roles to grant member based on the user type.")
            .setRequired(true)
            .setAutocomplete(true);
    })

export const execute = async (cmdHelper: CCommandHelper) => {
    await cmdHelper.executeCommand(async () => {
        await cmdHelper.deferReply()
        const memberID = cmdHelper.getStringValue("member");
        const member = <GuildMember>await cmdHelper.getGuildMembers(memberID);
        const roles = await UserTypeRoles.getRoles(cmdHelper.getStringValue("usertype"));
        await member.roles.set(roles)
    });
};