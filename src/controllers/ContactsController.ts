import {Request, Response} from "express";
import User from "../models/User";
import Message from "../models/Message";
import {IUser} from "../types";


class ContactsController{
    async get(req: Request, res: Response){
        try{
            const user: IUser | null = await User.findById(req.user?.id);
            if (!user) return res.status(400).json({message: "User not found"});

            return res.json(user.contacts);
        } catch(e){
            console.log(e);
            return res.status(500).json({message: "Error at get contacts"});
        }
    }

    async add(req: Request, res: Response){
        try{
            const user: IUser | null = await User.findById(req.user?.id);
            if (!user) return res.status(400).json({message: "User not found"});

            const candidateId = req.body?.id;

            // If contact id is the same as user's id
            if (req.user?.id === candidateId)
                return res.status(400).json({message: "You can not add yourself to contacts"});

            // If user has already this contact
            if (user.contacts.some((contact: any) => contact.id === candidateId))
                return res.status(400).json({message: "You have already this contact"});

            // If user wasn't requested to be contact
            if(!user.requestsIn.find((contact: any) => contact.id === candidateId))
                return res.status(400).json({message: "You was not requested to be contact"});

            const candidate: IUser | null = await User.findById(candidateId)
            if (!candidate) return res.status(400).json({message: "User with this id not found"});

            // Adding contacts to both users
            user.contacts.push({username: candidate.username, id: candidate._id});
            candidate.contacts.push({username: user.username, id: user._id});

            // Deleting requests from both users
            user.requestsIn = user.requestsIn.filter((cand: any) => cand.id != candidate._id);
            candidate.requestsOut = candidate.requestsOut.filter((cand: any) => cand.id != user._id);

            await user.save();
            await candidate.save();

            return res.json({});
        } catch(e: any){
            console.log(e);
            return res.status(500).json({message: "Error at add contact"});
        }
    }

    async delete(req: Request, res: Response){
        try{
            const user: IUser | null = await User.findById(req.user?.id);
            if (!user) return res.status(400).json({message: "User not found"});

            const contactId = req.params.contactId;

            const contact: IUser | null = await User.findById(contactId)
            if (!contact) return res.status(400).json({message: "Contact with this id not found"});

            // Deleting contacts for both users
            user.contacts = user.contacts.filter((contact: any) => contact.id != contactId);
            contact.contacts = contact.contacts.filter((contact: any) => contact.id != user._id);

            await user.save();
            await contact.save();

            // Deleting messages if there is 'message' in query params
            if ('messages' in req.query){
                await Message.deleteMany({
                    $or: [
                        {from: user._id, to: contactId},
                        {from: contactId, to: user._id}
                    ]
                })
            }

            return res.json({});
        } catch(e: any){
            console.log(e);
            return res.status(500).json({message: "Error at delete contact"});
        }
    }
}

export default new ContactsController();