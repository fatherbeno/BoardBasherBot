import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../typing-helpers/classes/CCommandHelper";

export const data = new SlashCommandBuilder()
    .setName("reply")
    .setDescription("Replies your specific message yippie!")
    .addStringOption((option) => {
        return option
            .setName("message")
            .setDescription("This is the message it will say back to you :)")
            .setRequired(true);
});

export const execute = async (cmdHelper: CCommandHelper) => {
    await cmdHelper.executeCommand(async () => {
        // get text channel
        const channel = await cmdHelper.getTextChannel();

        // get command user
        const { user } = cmdHelper.interaction;

        // get string value from command
        const message = cmdHelper.getStringValue("message");

        // send message to channel
        await channel.send(`Hello ${user}! ${message}.`);
    });
};