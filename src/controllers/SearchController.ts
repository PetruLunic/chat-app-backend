import {Request, Response} from "express";
import User from "../models/User";
import {IUser} from "../types";

class SearchController{
    async users(req: Request, res: Response){
        try{
            const username = req.query.username;
            if (!username) return res.json([]);

            const reqUser: IUser | null = await User.findById(req.user?.id);
            if (!reqUser)
                return res.status(400).json({message: "User not found"});

            const contacts = reqUser.contacts;

            const users: IUser[] = await User.find({username: { $regex: username, $options: 'i' }});

            // getting users that are not in user's contacts, and it's not the same user
            const filteredUsers = users
                .filter((user) => !contacts.find((contact) => contact.username === user.username) && reqUser.username !== user.username)
                .map((user) => ({id: user._id, username: user.username}))

            return res.json(filteredUsers);
        } catch(e){
            console.log(e);
            res.status(500).json({message: "Error at search users"})
        }
    }
}

export default new SearchController();