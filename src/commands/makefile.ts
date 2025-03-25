import { SlashCommandBuilder} from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { FileSystem } from "../helpers/.helpers";

export const data = new SlashCommandBuilder()
    .setName("makefile")
    .setDescription("Generates a text file")
    .addStringOption((option) => {
        return option
            .setName("message")
            .setDescription("This will be the message in the file")
            .setRequired(true);
    });

export const execute = async (cmdHelper: CCommandHelper) => {
    await cmdHelper.executeCommand(async () => {
        // get channel command was used in
        const channel = await cmdHelper.getTextChannel();
        
        // generate, then send file to channel
        const filePath = await FileSystem.createFile("message.txt", cmdHelper.getStringValue("message"));
        await FileSystem.sendFile({recipient: channel, filePath: filePath});
    });
};