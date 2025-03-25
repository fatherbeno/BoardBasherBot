import { AutocompleteInteraction } from "discord.js";
import { EUserType } from "../../types/enums/EUserType";

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

const getUserTypeOptions = (): { name: string, value: string }[] => {
    return Object.entries(EUserType).map((key, value) => {
        return {
            name: key[0].replace(/([A-Z])/g, ' $1').trim(),
            value: key[1]
        }
    });
}