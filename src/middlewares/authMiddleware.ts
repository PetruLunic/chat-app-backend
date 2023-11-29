import {NextFunction, Request, Response} from "express";
import jwt from 'jsonwebtoken';
import {IUser} from "../types";

const secret = process.env.JWT_KEY || "";

export default (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === "OPTIONS") {
        next();
    }

    try{
        const token = req.headers.authorization != null
            ? req.headers.authorization.split(' ')[1]
            : undefined

        if (!token){
            res.status(401).json({message: "User is unauthorized"});
            return;
        }

        req.user = jwt.verify(token, secret) as IUser;
        next();
    } catch(e){
        console.log(e)
        res.status(401).json({message: "User is unauthorized"});
        return;
    }
}