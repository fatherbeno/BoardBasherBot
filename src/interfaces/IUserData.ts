import {GuildMemberRoleManager} from "discord.js";

export interface IUserData {
    id: string;
    name: string;
    roles: GuildMemberRoleManager;
}