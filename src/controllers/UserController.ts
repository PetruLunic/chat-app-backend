import User from "../models/User";
import {Request, Response} from "express";
import {IUser} from "../types";


class UserController{
    async getUser(req: Request, res: Response){
        try{
            const user: IUser | null = await User.findById(req.user?.id);
            if (!user) return res.status(400).json({message: "User not found"});

            return res.json({id: user._id, username: user.username});
        } catch(e){
            console.log(e);
            return res.status(500).json({message: "Error at get user"});
        }
    }
}

export default new UserController();