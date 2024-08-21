import { ICommandInput } from "../typing-helpers/interfaces/ICommandInput";
import { SlashCommandBuilder } from "discord.js";
import { sendReply } from "./command-helper";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export const execute = async (commandInput: ICommandInput) => {
    return sendReply(commandInput, "Pong!");
};