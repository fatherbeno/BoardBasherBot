import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { GlobalProperties } from "../helpers/CGlobalPropertiesHelper";

export const data = new SlashCommandBuilder()
    .setName("setbotreplychannel")
    .setDescription("Sets the designated channel in which the bot will send any dms it receives!")
    .addChannelOption((option) => {
        return option
            .setName("channel")
            .setDescription("New channel that is being set as the bot reply channel.")
            .setRequired(true);
    });

export const execute = async (cmdHelper: CCommandHelper) => {
    return await cmdHelper.executeCommand(async () => {
        await GlobalProperties.setProperties("BotReplyChannel", cmdHelper.getChannelValue("channel"));
    });
};