import { Collection, GuildMember, SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { FileSystem, CommandProperties } from "../helpers/.helpers";

/**
 * Takes a collection of guild members and transforms it into a csv compatible string.
 * @param members Collection of guild members to change into a string.
 */
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
        const members = <Collection<string, GuildMember>>await cmdHelper.getGuildMembers();

        // generate, then send file
        const filePath = await FileSystem.createFile("userdata.csv", generateCsvFileString(members));
        await FileSystem.sendFile({
            recipient: cmdHelper.interaction.user,
            filePath: filePath, message: CommandProperties.getProperties(cmdHelper.commandName).ExtraMessage
        });
    });
};