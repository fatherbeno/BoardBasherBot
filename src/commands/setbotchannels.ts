import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { GlobalProperties } from "../helpers/.helpers";

export const data = new SlashCommandBuilder()
    .setName("setbotchannels")
    .setDescription("Sets the designated channel in for the features in this bot!")
    .addStringOption((option) => {
        return option
            .setName("botchanneloption")
            .setDescription("The channel option to be changed.")
            .setRequired(true)
            .addChoices(
                { name: "bot reply channel", value: "BotReplyChannel" },
                { name: "bot verification channel", value: "BotVerificationChannel" },
                { name: "bot welcome channel", value: "BotWelcomeChannel" },
                { name: "bot verify logs channel", value: "BotVerifyLogsChannel" },
                { name: "bot error logs channel", value: "BotErrorLogsChannel" },
                { name: "bot general logs channel", value: "BotGeneralLogsChannel" },
                { name: "countdown channel", value: "CountdownChannel" },
            )
    })
    .addChannelOption((option) => {
        return option
            .setName("channel")
            .setDescription("New channel that is being set as the selected channel option.")
            .setRequired(true);
    });

export const execute = async (cmdHelper: CCommandHelper) => {
    return await cmdHelper.executeCommand(async () => {
        await GlobalProperties.setProperties(cmdHelper.getStringValue("botchanneloption"), cmdHelper.getChannelValue("channel"));
    });
};