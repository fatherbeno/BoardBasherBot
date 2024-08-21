import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { Collection, GuildMember, SlashCommandBuilder } from "discord.js";
import { validateTextChannel, validateGuildMembers, createFile, sendFile, sendReply } from "./command-helper";

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
    const members = await validateGuildMembers(commandInput);
    if (!members) {
        return;
    }
    
    const channel = await validateTextChannel(commandInput);
    if (!channel) {
        return;
    }
    
    await generateCsvFile(members);
    await sendFile(channel);
    return sendReply(commandInput, "Members!!");
};