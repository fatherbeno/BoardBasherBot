import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../typing-helpers/classes/CCommandHelper";

export const data = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Returns a row of data :)")
    .addStringOption((option) => {
        return option
            .setName("name")
            .setDescription("The name of the person you want to search")
            .setRequired(true)
})

export const execute = async (cmdHelper: CCommandHelper) => {
    await cmdHelper.executeCommand(async () => {
        // deferring reply as operation takes more than 3 seconds
        await cmdHelper.deferReply();

        // use name input to find a row with a unique, corresponding name
        const name = cmdHelper.getStringValue("name");
        const filteredRow = await cmdHelper.findRow((elt) => {
            return elt.get("name") === name;
        });

        // get roles to add to user from json file, and throw an error if there are no roles
        const roles = await cmdHelper.getVerifyRoles();
        if (roles.length === 0) throw new Error("No roles have been added to the verify roles, please add at least one role first.");

        // get the guild member who used the command
        const member = await cmdHelper.getCommandUserMember();

        // update filtered row on the sheet
        await cmdHelper.updateSheet(filteredRow, () => {
            filteredRow.set("verified", true);
            filteredRow.set("discordId", cmdHelper.interaction.user.id);
        });

        // finally add the role(s) to the user
        for (let role of roles) {
            await member.roles.add(role);
        }
    });
};