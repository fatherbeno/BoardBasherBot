import { SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { GlobalProperties } from "../helpers/CGlobalPropertiesHelper";
import { TUserData } from "../types/types/TRowData";
import { CGoogleSheetsHelper } from "../helpers/CGoogleSheetsHelper";

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

        // creating google sheets helper object to CRUD data from connected sheet
        const googleSheet = new CGoogleSheetsHelper<TUserData>();

        // use name input to find a row with a unique, corresponding name
        const name = cmdHelper.getStringValue("name");
        const filteredRow = await googleSheet.findRow((data) => {
            //"name" is the title of a column in the sheet
            return data.get("name") === name;
        });

        // get roles to add to user from json file, and throw an error if there are no roles
        const roles = await cmdHelper.getVerifyRoles();
        if (roles.length === 0) throw new Error("No roles have been added to the verify roles, please add at least one role first.");

        // get the guild member who used the command
        const member = cmdHelper.getCommandUserMember();

        // update filtered row on the sheet
        await googleSheet.updateSheet(filteredRow, () => {
            filteredRow.set("verified", true);
            filteredRow.set("discordId", cmdHelper.interaction.user.id);
        });

        // finally add the role(s) to the user
        for (let role of roles) {
            await member.roles.add(role);
        }

        // welcome message
        const welcomeChannel = await cmdHelper.getTextChannel(GlobalProperties.getProperties().BotWelcomeChannel);
        await welcomeChannel.send({content: `Welcome ${member} to the SMASH! Crew Community.`});

        // log message
        const logChannel = await cmdHelper.getTextChannel(GlobalProperties.getProperties().BotVerifyLogsChannel);
        await logChannel.send({content: `User ${member} has successfully verified.`}); // change to diff payload
    });
};