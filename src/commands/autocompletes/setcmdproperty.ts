import { AutocompleteInteraction } from "discord.js";
import { commands } from "../.commands";

export const respond = async (interaction: AutocompleteInteraction) => {
    const results = Object.keys(commands).map((key) => {
        return {
            name: key,
            value: key
        }
    });

    await interaction.respond(results)
}