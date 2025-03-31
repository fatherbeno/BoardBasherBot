import { EmbedBuilder, GuildMember, Role, SlashCommandBuilder, TextChannel } from "discord.js";
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

        // gets the guild member whose roles are to be changed
        const memberID = cmdHelper.getStringValue("member");
        const affectedMember = <GuildMember>await cmdHelper.getGuildMembers(memberID);

        // get member who used the command
        const userMember = cmdHelper.getCommandUserMember();

        // get selected user type
        const userType = UserTypeRoles.convertStringToEUserType(cmdHelper.getStringValue("usertype"));

        // get the general logs channel
        const logChannel = await cmdHelper.getTextChannel(GlobalProperties.getProperties().BotGeneralLogsChannel);

        // execute command functionality
        await setUserType(affectedMember, userMember, userType, logChannel);
    });
}

/**
 * The functionality on this command has been extracted for use in the /verify command.
 * Sets a member's roles based on the inputted user type and sends a log message to the inputted channel.
 * @param affectedMember Member to change their roles.
 * @param userMember Member who used the command.
 * @param userType The user type to get the roles to assign to the affected user.
 * @param logChannel The channel to log the success message to.
 * @author Benjamin Gulliver (fatherbeno)
 */
export const setUserType = async (affectedMember: GuildMember, userMember: GuildMember, userType: EUserType, logChannel: TextChannel) => {
    // gets the user types corresponding roles
    const roles = await UserTypeRoles.getRoles(userType);

    // throw error if no roles have been added to specified user type
    if (roles.length === 0) throw new Error(`No roles have been added to the ${userType} user type, please add at least one role first.`);

    // logs the role change to a channel
    await logChannel.send({embeds: [buildSetUserTypeEmbed(affectedMember, userMember, userType, roles)]});

    // sets the member's roles based on the roles stored on the particular user type
    await affectedMember.roles.set(roles)
}

/**
 * Builds an embed based on the input data and the member's discord data.
 * @param affectedMember The member whose roles are to be changed.
 * @param userMember The member who used the command.
 * @param userType Inputted user type when command was executed.
 * @author Benjamin Gulliver (fatherbeno)
 */
const buildSetUserTypeEmbed = (affectedMember: GuildMember, userMember: GuildMember, userType: EUserType, roles: Role[]): EmbedBuilder => {
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

    // generate roles list
    let rolesList: string = "";
    roles.forEach((role) => {
        rolesList = `${rolesList} ${role}`;
    });

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
            { name: "set roles", value: rolesList, inline: true },
        );
}