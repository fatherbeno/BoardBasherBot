import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../typing-helpers/classes/CCommandHelper";

export const data = new SlashCommandBuilder()
    .setName("setcmdproperty")
    .setDescription("Sets a command property!")
    .addStringOption((option) => {
        return option
            .setName("command")
            .setDescription("The command to be changed.")
            .setRequired(true)
            .addChoices(
                { name: "getmembers", value: "getmembers" },
                { name: "makefile", value: "makefile" },
                { name: "ping", value: "ping" },
                { name: "reply", value: "reply" },
                { name: "setcmdproperty", value: "setcmdproperty" },
                { name: "verify", value: "verify" },
            )
    })
    .addStringOption((option) => {
        return option
            .setName("property")
            .setDescription("The property to set.")
            .setRequired(true)
            .addChoices(
                { name: "reply message", value: "replyMessage" },
                { name: "error message", value: "errorMessage" },
                { name: "extra message", value: "extraMessage" },
                { name: "ephemeral", value: "ephemeral" },
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
        cmdHelper.setCommandProperties(cmdHelper.getStringValue("command"), cmdHelper.getStringValue("property"), cmdHelper.getStringValue("value"))
    })
};