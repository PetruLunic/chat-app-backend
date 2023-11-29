import {Schema, model} from "mongoose";

const Message = new Schema({
    date: {type: Date, required: true},
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    text: String
})

export default model('Message', Message);