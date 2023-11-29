import {Request, Response} from "express";
import User from "../models/User";
import Message from "../models/Message";
import {IMessage, IUser} from "../types";
import {validationResult} from "express-validator";

class MessageController{
    async get(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            const contactId = req.params.contactId;

            const user: IUser | null = await User.findById(userId);
            if (!user) return res.status(400).json({message: "User not found"});

            // checking if there is contact with such id
            const contact = user.contacts.filter((contact: any) => contact._id == contactId);
            if (!contact) return res.status(400).json({message: "Contact not found"});

            const messages: IMessage[] = await Message.find({
                $or: [
                    {from: userId, to: contactId},
                    {from: contactId, to: userId}
                ]
            })

            return res.json(messages);
        } catch(e){
            console.log(e);
            res.status(500).json({message: "Error at get messages"});
        }

    }

    async add(req: Request, res: Response){
        try{
            const errors = validationResult(req);

            if (!errors.isEmpty()){
                const errorsMsg = errors.array().map(error => error.msg);
                return res.status(400).json({message: "Error at adding message", errors: errorsMsg});
            }

            const messageReq: IMessage = req.body.message;

            const user: IUser | null = await User.findById(messageReq.from);

            if (!user) return res.status(400).json({message: "Users with such id wasn't found"});

            // checking if there are such id in db
            if (!await User.findById(messageReq.to) && !await User.findById(messageReq.from))
                return res.status(400).json({message: "User with such id wasn't found"});

            if (!user.contacts.find((contact) => contact.id == messageReq.to))
                return res.status(400).json({message: "You can not send message to an unrelated user"});

            const message = new Message(messageReq);
            await message.save();

            return res.json(message)

        } catch(e){
            console.log(e);
            res.status(500).json({message: "Error at get messages"});
        }

    }

    async edit(req: Request, res: Response){
        try{
            const errors = validationResult(req);

            if (!errors.isEmpty()){
                const errorsMsg = errors.array().map(error => error.msg);
                return res.status(400).json({message: "Error at editing message", errors: errorsMsg});
            }

            const message: IMessage | null = await Message.findById(req.params.messageId);
            if (!message) return res.status(400).json({message: "Message not found"});

            if (message.from != req.user?.id)
                return res.status(400).json({message: "You can not edit this message"});

            message.text = req.body.text;
            await message.save();

            return res.json({})
        } catch(e){
            console.log(e);
            res.status(500).json({message: "Error at edit message"});
        }
    }

    async delete(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            const messageId = req.params.messageId;

            const message: IMessage | null = await Message.findById(messageId);
            if (!message)
                return res.status(400).json({message: "Message not found"});

            if (message.from != userId)
                return res.status(400).json({message: "You can not delete this message"});

            await message.deleteOne();

            return res.json({});
        } catch(e){
            console.log(e);
            res.status(500).json({message: "Error at get messages"});
        }

    }
}

export default new MessageController();