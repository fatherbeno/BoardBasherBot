import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../typing-helpers/classes/CCommandHelper";
import { setGlobalProperties } from "../properties/global-properties-helper";

export const data = new SlashCommandBuilder()
    .setName("setglobalproperty")
    .setDescription("Sets a global property!")
    .addStringOption((option) => {
        return option
            .setName("property")
            .setDescription("The property to set.")
            .setRequired(true)
            .addChoices(
                { name: "reply operation prefix", value: "replyOperationPrefix" },
                { name: "command error message", value: "commandErrorMessage" },
                { name: "max bot message length", value: "maxBotMessageLength" },
                { name: "bot dm reply message", value: "botDMReplyMessage" },
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