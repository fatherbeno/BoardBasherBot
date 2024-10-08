export type TRowData = TUserRowData

export type TUserRowData = {
    id: number;
    name: string;
    phone: number;
    verified?: boolean;
    discordId?: string;
}