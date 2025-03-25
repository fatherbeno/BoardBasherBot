import { AutocompleteInteraction } from "discord.js";
import { EUserType } from "../../types/enums/EUserType";

export const respond = async (interaction: AutocompleteInteraction) => {
    if (interaction.options.get("usertype")) {
        await interaction.respond(getUserTypeOptions());
        return;
    }
}

const getUserTypeOptions = (): { name: string, value: string }[] => {
    return Object.entries(EUserType).map((key, value) => {
        return {
            name: key[0].replace(/([A-Z])/g, ' $1').trim(),
            value: key[1]
        }
    });
}