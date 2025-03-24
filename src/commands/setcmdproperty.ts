import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { CommandProperties } from "../helpers/CCommandPropertiesHelper";

export const data = new SlashCommandBuilder()
    .setName("setcmdproperty")
    .setDescription("Sets a command property!")
    .addStringOption((option) => {
        return option
            .setName("command")
            .setDescription("The command to be changed.")
            .setRequired(true)
            .setAutocomplete(true)
    })
    .addStringOption((option) => {
        return option
            .setName("property")
            .setDescription("The property to set.")
            .setRequired(true)
            .addChoices(
                { name: "reply message", value: "ReplyMessage" },
                { name: "error message", value: "ErrorMessage" },
                { name: "extra message", value: "ExtraMessage" },
                { name: "ephemeral", value: "Ephemeral" },
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
        await CommandProperties.setProperties(
            cmdHelper.getStringValue("command"),
            cmdHelper.getStringValue("property"),
            cmdHelper.getStringValue("value")
        );
    })
};