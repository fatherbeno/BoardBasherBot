import { AutocompleteInteraction } from "discord.js";
import { getUserTypeOptions } from "../../helpers/OtherUtilitiesHelper";

export const respond = async (interaction: AutocompleteInteraction) => {
    if (interaction.options.get("usertype")) {
        await interaction.respond(getUserTypeOptions());
        return;
    }
}