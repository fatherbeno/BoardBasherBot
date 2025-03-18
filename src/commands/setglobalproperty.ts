import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { setGlobalProperties } from "../helpers/global-properties-helper";

export const data = new SlashCommandBuilder()
    .setName("setglobalproperty")
    .setDescription("Sets a global property!")
    .addStringOption((option) => {
        return option
            .setName("property")
            .setDescription("The property to set.")
            .setRequired(true)
            .addChoices(
                { name: "reply operation prefix", value: "ReplyOperationPrefix" },
                { name: "command error message", value: "CommandErrorMessage" },
                { name: "max bot message length", value: "MaxBotMessageLength" },
                { name: "bot dm reply message", value: "BotDMReplyMessage" },
            )
    })
    .addStringOption((option) => {
        return option
            .setName("value")
            .setDescription("What to set the property to.")
            .setRequired(true)
    });

export const execute = async (cmdHelper: CCommandHelper) => {
    await cmdHelper.executeCommand(async () => {
        setGlobalProperties(cmdHelper.getStringValue("property"), cmdHelper.getStringValue("value"))
    })
};