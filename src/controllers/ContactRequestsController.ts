import {Request, Response} from "express";
import User from "../models/User";
import {IUser} from "../types";


class ContactRequestsController{
    async getIn(req: Request, res: Response){
        try{
            const user: IUser | null = await User.findById(req.user?.id);
            if (!user) return res.status(400).json({message: "User not found"});

            const query = (req.query.name as string)?.toLowerCase();

            const result = query
                ? user.requestsIn.filter((request) => request.username.toLowerCase().includes(query))
                : user.requestsIn

            return res.json(result);
        } catch(e){
            console.log(e);
            return res.status(500).json({message: "Error at get requests in"});
        }
    }

    async getOut(req: Request, res: Response){
        try{
            const user: IUser | null = await User.findById(req.user?.id);
            if (!user) return res.status(400).json({message: "User not found"});

            const query = (req.query.name as string)?.toLowerCase();

            const result = query
                ? user.requestsOut.filter((request) => request.username.toLowerCase().includes(query))
                : user.requestsOut

            return res.json(result);
        } catch(e){
            console.log(e);
            return res.status(500).json({message: "Error at get requests out"});
        }
    }

    async add(req: Request, res: Response){
        try{
            const user: IUser | null = await User.findById(req.user?.id);
            if (!user) return res.status(400).json({message: "User not found"});

            // If contact id is the same as user's id
            if (req.user?.id === req.body?.id)
                return res.status(400).json({message: "You can not request yourself to contacts"});

            // If user has already this contact
            if (user.contacts.some((contact: any) => contact.id === req.body?.id))
                return res.status(400).json({message: "You have already this contact"});

            // If user has already request to this user
            if (user.requestsOut.some((cand: any) => cand.id === req.body?.id))
                return res.status(400).json({message: "You have already request to this user"});

            // If user was requested by this user
            if (user.requestsIn.some((cand: any) => cand.id === req.body?.id))
                return res.status(400).json({message: "You was already requested by this user"});

            const candidate: IUser | null = await User.findById(req.body?.id);
            if (!candidate) return res.status(400).json({message: "User with this id not found"});

            user.requestsOut.push({id: candidate._id, username: candidate.username});
            candidate.requestsIn.push({id: user._id, username: user.username});

            await user.save();
            await candidate.save();

            return res.json({})
        } catch(e){
            console.log(e);
            return res.status(500).json({message: "Error at get requests in"});
        }
    }

    async delete(req: Request, res: Response){
        try{
            const user: IUser | null = await User.findById(req.user?.id);
            if (!user) return res.status(400).json({message: "User not found"});

            const contactId = req.params.contactId;

            const candidate: IUser | null = await User.findById(contactId);
            if (!candidate) return res.status(400).json({message: "Candidate with this id not found"});

            //getting new array without deleted requested contact
            user.requestsOut = user.requestsOut.filter((cand: any) => cand.id != candidate._id);
            user.requestsIn = user.requestsIn.filter((cand: any) => cand.id != candidate._id);
            candidate.requestsIn = candidate.requestsIn.filter((cand: any) => cand.id != user._id);
            candidate.requestsOut = candidate.requestsOut.filter((cand: any) => cand.id != user._id);

            await user.save();
            await candidate.save();

            return res.json({});
        } catch(e: any){
            console.log(e);
            return res.status(500).json({message: "Error at delete requested contact"});
        }
    }

}

export default new ContactRequestsController();