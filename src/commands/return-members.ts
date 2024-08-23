import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { Collection, GuildMember, SlashCommandBuilder } from "discord.js";
import {getTextChannel, getGuildMembers, createFile, sendFile, sendReply, logCommandError} from "./.command-helper";

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
        // get all server members
        const members = await getGuildMembers(commandInput);

        // get text channel
        const channel = await getTextChannel(commandInput);

        // generate, then send file
        await generateCsvFile(members);
        await sendFile(channel);

        // send reply to command
        return sendReply(commandInput, "Members!!");
    } catch (error) {
        // log caught error
        logCommandError(commandInput, error);
    }
};