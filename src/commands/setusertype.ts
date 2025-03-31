import { EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { CCommandHelper } from "../helpers/CCommandHelper";
import { GlobalProperties, UserTypeRoles } from "../helpers/.helpers";
import { getColourBasedOnUserType, getUserTypeDisplayName } from "../helpers/OtherUtilitiesHelper";
import { EUserType } from "../types/enums/EUserType";

export const data = new SlashCommandBuilder()
    .setName("setusertype")
    .setDescription("Changes a member's roles based on a user type!")
    .addStringOption((option) => {
        return option
            .setName("member")
            .setDescription("Member to change the roles of.")
            .setRequired(true)
            .setAutocomplete(true);
    })
    .addStringOption((option) => {
        return option
            .setName("usertype")
            .setDescription("Roles to grant member based on the user type.")
            .setRequired(true)
            .setAutocomplete(true);
    })

export const execute = async (cmdHelper: CCommandHelper) => {
    await cmdHelper.executeCommand(async () => {
        await cmdHelper.deferReply()
        await setUserType(cmdHelper);
    });
}

/**
 * The functionality on this command has been extracted for use in the /verify command
 * @param cmdHelper The generated CCommandHelper object when the command was executed.
 * @author Benjamin Gulliver (fatherbeno)
 */
export const setUserType = async (cmdHelper: CCommandHelper) => {
    // gets the guild member whose roles are to be changed
    const memberID = cmdHelper.getStringValue("member");
    const member = <GuildMember>await cmdHelper.getGuildMembers(memberID);

    // gets the user type, and its corresponding roles
    const userType = UserTypeRoles.convertStringToEUserType(cmdHelper.getStringValue("usertype"))
    const roles = await UserTypeRoles.getRoles(userType);

    // logs the role change to the general logs channel
    const logChannel = await cmdHelper.getTextChannel(GlobalProperties.getProperties().BotGeneralLogsChannel);
    await logChannel.send({embeds: [buildSetUserTypeEmbed(member, cmdHelper, userType)]});

    // sets the member's roles based on the roles stored on the particular user type
    await member.roles.set(roles)
}

/**
 * Builds an embed based on the input data and the member's discord data.
 * @param affectedMember The member whose roles are to be changed.
 * @param cmdHelper Generated CCommandHelper data when command was executed.
 * @param userType Inputted user type when command was executed.
 * @author Benjamin Gulliver (fatherbeno)
 */
const buildSetUserTypeEmbed = (affectedMember: GuildMember, cmdHelper: CCommandHelper, userType: EUserType): EmbedBuilder => {
    // get member who used command
    const userMember = cmdHelper.getCommandUserMember()
    // gets a display name for the found EUserType.
    const newUserTypeDisplay = getUserTypeDisplayName(userType);

    // get the display name of the found user type based on the existing roles the affected member has
    const oldUserType = UserTypeRoles.getUserTypeBasedOnRoles(affectedMember.roles.cache.map((value) => { return value; }))
    const oldUserTypeDisplay = oldUserType !== EUserType.Error ? getUserTypeDisplayName(oldUserType) : "None";

    // gets a colour based on the new User Type
    const colour = getColourBasedOnUserType(userType);

    // get the author avatar
    const foundAvatar = userMember.user.avatarURL();
    const userMemberAvatar = foundAvatar ? foundAvatar : undefined

    // construct the embed
    return new EmbedBuilder()
        .setAuthor({ name: userMember.displayName, iconURL: userMemberAvatar })
        .setTitle(`"${affectedMember.nickname}"\nhas had their roles changed.`)
        .setThumbnail(affectedMember.user.avatarURL())
        .setFooter({text: `Role Change - ${new Date().toLocaleString()}`})
        .setColor(colour)
        .addFields(
            { name: "username", value: affectedMember.user.username, inline: true },
            { name: "id", value: affectedMember.user.id, inline: true },
            { name: "old type", value: oldUserTypeDisplay, inline: true },
            { name: "new type", value: newUserTypeDisplay, inline: true },
        );
}