import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../typing-helpers/classes/CCommandHelper";

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!");

export const execute = async (cmdHelper: CCommandHelper) => {
    return await cmdHelper.executeCommand();
};