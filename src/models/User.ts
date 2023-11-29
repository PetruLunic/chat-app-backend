import {Schema, model, Document} from 'mongoose';
import {IUser} from "../types";

const User: Schema = new Schema({
    username: {type: String, unique:true, required: true},
    password: {type: String, required: true},
    contacts: [
        {
            id: String,
            username: String
        }
    ],
    requestsIn: [
        {
            id: String,
            username: String
        }
    ],
    requestsOut: [
        {
            id: String,
            username: String
        }
    ]
})

export default model('User', User);