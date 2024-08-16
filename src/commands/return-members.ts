import { ICommandInput } from "../interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";
import { validateTextChannel, validateGuildMembers} from "./command-helper";
import { promises } from "fs";

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
    
    let userData: string = '';
    let userRoles: string = '';
    members.forEach((member) => {
        member.roles.cache.forEach((role) => {
            userRoles += `[id: ${role.id}, name: ${role.name}], `;
        })
        userData += `id: ${member.id}, name: ${member.displayName}, roles: {${userRoles}} \n`;
        userRoles = '';
    });
    
    const filePath = "./src/generated-files/userdata.txt";
    await promises.writeFile(filePath, userData);
    await channel.send({files: [filePath]});
    
    return commandInput.interaction.reply("Members!!");
};