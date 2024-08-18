import { ICommandInput } from "../interfaces/ICommandInput";
import { Collection, GuildMember, SlashCommandBuilder } from "discord.js";
import { validateTextChannel, validateGuildMembers} from "./command-helper";
import { promises } from "fs";

const generateCsvFile = async (members: Collection<string, GuildMember>, filePath: string) => {
    
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
    
    await promises.writeFile(filePath, userData);
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
    
    const filePath = "./src/generated-files/userdata.csv";
    
    await generateCsvFile(members, filePath);
    await channel.send({files: [filePath]});
    return commandInput.interaction.reply("Members!!");
};