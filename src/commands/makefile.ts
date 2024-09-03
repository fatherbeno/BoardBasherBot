import { SlashCommandBuilder} from "discord.js";
import { CCommandHelper } from "../typing-helpers/classes/CCommandHelper";

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
        await cmdHelper.createFile("message.txt", cmdHelper.getStringValue("message"));
        await cmdHelper.sendFile({recipient: channel});
    });
};