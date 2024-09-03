import { Collection, GuildMember, SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../typing-helpers/classes/CCommandHelper";

const generateCsvFileString = (members: Collection<string, GuildMember>): string => {
    let userRoles: string = '';
    return members.reduce((acc, member) => {
        member.roles.cache.forEach((role) => {
            userRoles += `"${role.name}" `;
        })
        userRoles.trimEnd();
        acc += `${member.id}, ${member.displayName}, ${userRoles}` + "\n";
        userRoles = '';
        return acc;
    }, "id, name, roles" + "\n");
}

export const data = new SlashCommandBuilder()
    .setName("getmembers")
    .setDescription("Returns all members on the server!");

export const execute = async (cmdHelper: CCommandHelper) => {
    await cmdHelper.executeCommand(async () => {
        // defer the reply as operation may take longer then 3 seconds
        await cmdHelper.deferReply();
        
        // get all server members
        const members = await cmdHelper.getGuildMembers();

        // generate, then send file
        await cmdHelper.createFile("userdata.csv", generateCsvFileString(members));
        await cmdHelper.sendFile({recipient: cmdHelper.interaction.user, message: cmdHelper.getCommandProperties().extraMessage});
    });
};