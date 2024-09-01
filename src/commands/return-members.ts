import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { Collection, GuildMember, SlashCommandBuilder } from "discord.js";
import {
    getGuildMembers,
    createFile,
    sendFile,
    sendReply,
    logCommandError,
    deferReply
} from "./.command-helper";

const generateCsvFile = async (members: Collection<string, GuildMember>) => {
    
    let userRoles: string = '';
    let userData: string = members.reduce((acc, member) => {
        member.roles.cache.forEach((role) => {
            userRoles += `"${role.name}" `;
        })
        userRoles.trimEnd();
        acc += `${member.id}, ${member.displayName}, ${userRoles}` + "\n";
        userRoles = '';
        return acc;
    }, "id, name, roles" + "\n");
    
    await createFile("userdata.csv", userData);
}

export const data = new SlashCommandBuilder()
  .setName("getmembers")
  .setDescription("Returns all members on the server!");

export const execute = async (commandInput: ICommandInput) => {
    try {
        // defer the reply as operation may take longer then 3 seconds
        await deferReply(commandInput);
        
        // get all server members
        const members = await getGuildMembers(commandInput);

        // generate, then send file
        await generateCsvFile(members);
        await sendFile({recipient: commandInput.interaction.user, message: "Here is the data of the users of the Discord server."});

        // send reply to command
        return sendReply(commandInput, "Check your DMs for the file you requested.");
    } catch (error) {
        // log caught error
        await logCommandError(commandInput, error);
    }
};