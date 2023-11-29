import User from "../models/User";
import bcrypt from 'bcryptjs';
import {validationResult} from "express-validator";
import jwt from 'jsonwebtoken';
import {Request, Response} from "express";
import mongoose from "mongoose";
import {IUser} from "../types";

const secret = process.env.JWT_KEY || "";

const generateAccessToken = (id: mongoose.ObjectId) => {
    const payload = {
        id
    }

    return jwt.sign(payload, secret, {expiresIn: "24h"});
}

class authController{
    async registration(req: Request, res: Response){
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()){
                const errorsMsg = errors.array().map(error => error.msg);
                return res.status(400).json({message: "Error at registration", errors: errorsMsg});
            }

            const {username, password} = req.body;
            const candidate: IUser | null = await User.findOne({username});

            if (candidate){
                return res.status(400).json({message: "User with this name already exists"});
            }

            const hashPassword = bcrypt.hashSync(password, 7);

            const newUser = new User({username, password: hashPassword});
            await newUser.save();

            const user: IUser | null = await User.findOne({username});

            if (!user) return res.status(400);

            const token = generateAccessToken(user._id);
            return res.json({token, id: user._id});
        }
        catch(e){
            console.log(e);
            res.status(400).json({message: 'Registration error'});
        }
    }

    async login(req: Request, res: Response){
        try {
            const {username, password} = req.body;

            const user: IUser | null = await User.findOne({username});
            if (!user){
                return res.status(400).json({message: `Username or password is incorrect`});
            }

            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword){
                return res.status(400).json({message: "Username or password is incorrect"});
            }

            const token = generateAccessToken(user._id);

            return res.json({token, id: user._id});
        }
        catch(e){
            console.log(e);
            res.status(400).json({message: 'Login error'});
        }
    }
}

export default new authController();