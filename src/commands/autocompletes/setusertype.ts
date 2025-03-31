import { AutocompleteInteraction } from "discord.js";
import { getUserTypeOptions } from "../../helpers/OtherUtilitiesHelper";

export const respond = async (interaction: AutocompleteInteraction) => {
    if (interaction.options.get("usertype")) {
        await interaction.respond(getUserTypeOptions());
        return;
    }

    if (interaction.options.get("member")) {
        await interaction.respond(await getMemberOptions(interaction));
        return;
    }
}

/**
 * Gets a list of members on the guild (except any members with administrator permissions). Filters the members based on the command user's input.
 * @param interaction Created autocomplete action when this command requires it.
 * @return A name/value pair object, with name being a member's display name and the value being their ID.
 */
const getMemberOptions = async (interaction: AutocompleteInteraction): Promise<{ name: string, value: string }[]> => {
    const members = await interaction.guild?.members.fetch()
    const memberDataArray: { name: string, value: string }[] = []

    if (!members) return memberDataArray;

    const focusedValue = interaction.options.getFocused()

    members.forEach((member) => {
        if (member.permissions.has("Administrator")) return;
        else if (member.displayName.toLowerCase().startsWith(focusedValue.toLowerCase()))
            memberDataArray.push({ name: member.displayName, value: member.id })
    })

    return memberDataArray;
}