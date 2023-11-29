import {Document} from "mongoose";

export interface IUser extends Document{
    id: string;
    username: string;
    password: string;
    contacts: IContact[];
    requestsIn: IContact[];
    requestsOut: IContact[];
}

export interface IMessage extends Document{
    date: Date;
    from: string;
    to: string;
    text: string;
}

export type IContact = Pick<IUser, "id" | "username">;

declare global {
    namespace Express {
        export interface Request {
            user?: IUser;
        }
    }
}