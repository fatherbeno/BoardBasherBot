import { EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { TDiscordUserData } from "../types/types/TRowData";
import { CGoogleSheetsHelper } from "../helpers/CGoogleSheetsHelper";
import { EUserType } from "../types/enums/EUserType";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { GlobalProperties, UserTypeRoles } from "../helpers/.helpers";
import { ESheetType } from "../types/enums/ESheetType";
import { getColourBasedOnUserType, getUserTypeDisplayName } from "../helpers/OtherUtilitiesHelper";
import { CommonConstants } from "../helpers/CCommonConstantsHelper";
import { setUserType } from "./setusertype";

export const data = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Please enter your email to verify your account for the SMASH! Community.")
    .addStringOption((option) => {
        return option
            .setName("email")
            .setDescription("The email you applied to volunteer with.")
            .setRequired(true)
    })

export const execute = async (cmdHelper: CCommandHelper) => {
    await cmdHelper.executeCommand(async () => {
        // deferring reply as operation takes more than 3 seconds
        await cmdHelper.deferReply();

        // creating google sheets helper object to CRUD data from connected sheet
        const googleSheet = new CGoogleSheetsHelper<TDiscordUserData>();

        // use name input to find a row with a unique, corresponding name
        const email = cmdHelper.getStringValue("email");
        const whichSheet = whichSheetBasedOnEmail(email);
        const filteredRow = await googleSheet.findRow(whichSheet, (data) => {
            //"email" is the title of a column in the sheet
            return data.get("email") === email;
        });

        // convert google sheets data into type data
        const foundData = getRowData(filteredRow);

        // checking to see if the type data is not an error
        if (foundData.type === EUserType.Error) throw new Error("Found data in 'type' was not an acceptable value, please fix this member's data.")

        // get roles to check the amount of roles associated with the found user type is not zero, throw an errow if so
        const roles = await UserTypeRoles.getRoles(foundData.type);
        if (roles.length === 0) throw new Error(`No roles have been added to the ${foundData.type} user type, please add at least one role first.`);

        // get the guild member who used the command
        const member = cmdHelper.getCommandUserMember();

        // update found data object
        foundData.verifiedDate = new Date().toLocaleString();
        foundData.discordID = cmdHelper.interaction.user.id;

        // update filtered row on the sheet
        await googleSheet.updateSheet(filteredRow, () => {
            filteredRow.set("verifiedDate", foundData.verifiedDate);
            filteredRow.set("discordID", foundData.discordID);
        });

        // change member's name (skips if type has anything to do with maid).
        if (!(foundData.type === EUserType.CurrentMaidCrew || foundData.type === EUserType.MaidCrew || foundData.type === EUserType.MaidStaff)) {
            await member.setNickname(`${foundData.firstName} ${foundData.lastName[0]}`);
        }

        // send a welcome message
        const welcomeChannel = await cmdHelper.getTextChannel(GlobalProperties.getProperties().BotWelcomeChannel);
        await welcomeChannel.send({content: `Welcome ${member} to the SMASH! Crew Community.`});

        // send a log message
        const logChannel = await cmdHelper.getTextChannel(GlobalProperties.getProperties().BotVerifyLogsChannel);
        await logChannel.send({embeds: [buildVerifyLogEmbed(member, foundData)]});

        // finally add the role(s) to the member
        await setUserType(member, member, foundData.type, logChannel)
    });
}

/**
 * Checks to see if the input email is for staff/crew.
 * @param email Input email.
 * @return Staff/Crew enum.
 * @author Benjamin Gulliver (fatherbeno)
 */
const whichSheetBasedOnEmail = (email: string): ESheetType => {
    const emailDomain = email.split("@")[1];
    return emailDomain.toLowerCase() === CommonConstants.StaffDomain ? ESheetType.Staff : ESheetType.Crew;
}

/**
 * Converts GoogleSpreadsheetRow into the direct type on what that row is based on (TDiscordUserData).
 * If the found type value doesn't equal an entry in the EUserType enum, it will convert it to the Error entry in said enum.
 * @param inputData Found GoogleSpreadsheetRow data that we want to convert.
 * @return Plain TDiscordUserData object.
 * @author Benjamin Gulliver (fatherbeno)
 */
const getRowData = (inputData: GoogleSpreadsheetRow<TDiscordUserData>): TDiscordUserData => {
    const foundUserType: EUserType = EUserType[inputData.get("type") as keyof typeof EUserType]
    const userType: EUserType = foundUserType ? foundUserType : EUserType.Error

    return {
        id: inputData.get("id"), firstName: inputData.get("firstName"),
        lastName: inputData.get("lastName"), type: userType,
        email: inputData.get("email"), verifiedDate: inputData.get("verifiedDate"),
        discordID: inputData.get("discordID")
    }
}

/**
 * Builds an embed based on the input data and the member's discord data.
 * @param member Guild member who has verified.
 * @param foundData Data linked to member on a Google sheet.
 * @return A newly created embed.
 * @author Benjamin Gulliver (fatherbeno)
 */
const buildVerifyLogEmbed = (member: GuildMember, foundData: TDiscordUserData): EmbedBuilder => {
    // gets a display name for the found EUserType.
    const userTypeDisplayName = getUserTypeDisplayName(foundData.type);
    // gets a colour based on the User Type.
    const colour = getColourBasedOnUserType(foundData.type);

    // construct the embed
    return new EmbedBuilder()
        .setTitle(`"${member.nickname}"\nHas Successfully Verified.`)
        .setThumbnail(member.user.avatarURL())
        .setFooter({text: `Verified - ${new Date().toLocaleString()}`})
        .setColor(colour)
        .addFields(
            { name: "username", value: member.user.username, inline: true },
            { name: "id", value: member.user.id, inline: true },
            { name: "email", value: foundData.email, inline: true },
            { name: "type", value: userTypeDisplayName, inline: true },
        );
}