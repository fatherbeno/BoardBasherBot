import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { GlobalProperties } from "../helpers/.helpers";

export const data = new SlashCommandBuilder()
    .setName("setcountdownproperties")
    .setDescription("Sets a property for the countdown!")
    .addStringOption((option) => {
        return option
            .setName("countdownoption")
            .setDescription("Which property to set.")
            .setRequired(true)
            .addChoices(
                { name: "countdown date", value: "CountdownDate"},
                { name: "countdown message", value: "CountdownMessage"},
                { name: "countdown completion message", value: "CountdownCompletionMessage"},
            )
    })
    .addStringOption((option) => {
        return option
            .setName("value")
            .setDescription("What to set the property to.")
            .setRequired(true)
    });

export const execute = async (cmdHelper: CCommandHelper) => {
    return await cmdHelper.executeCommand(async () => {
        await GlobalProperties.setProperties(cmdHelper.getStringValue("countdownoption"), cmdHelper.getStringValue("value"));
    });
};