import dotenv from 'dotenv';
dotenv.config();
import {IMessage} from "./types";
import Router, {Express} from "express";
import ws from 'ws';
import express from 'express';
import http from 'http';
import mongoose from "mongoose";
import authRoute from "./routes/authRouter";
import userRoute from "./routes/userRouter";
import cors from 'cors';
import authMiddleware from "./middlewares/authMiddleware";

const router = Router();

const app: Express = express();
app.use(cors({
    origin: process.env.CLIENT_URL, // Allow requests from this origin
    methods: 'GET,POST,PUT,DELETE,PATCH', // Allow specific HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // Allow specific headers
}));

router.use(express.json());

router.use(authRoute);
router.use('/user', authMiddleware, userRoute);

app.use(`/.netlify/functions/api`, router)

const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;

(async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL || "");
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        })
    }catch(e){
        console.log(e);
    }
})()

const wss = new ws.WebSocket.Server({server: httpServer});

const clients: Map<string, ws> = new Map();

wss.on('connection', (ws, req) => {
    if (!req.url) return;

    // getting user id from URL query params
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const clientId = urlParams.get('id');

    if (!clientId) return;

    clients.set(clientId, ws);

    ws.on('message', (data, isBinary) => {
        if (isBinary) return;

        try{
            const message: IMessage = JSON.parse(data.toString());
            sendMessage(message);
        } catch(e){
            console.log(`Error at message event: ${e}`);
        }
    })

    ws.addEventListener('close', () => {
        console.log(`User ${clientId} was disconnected`)
    })
})

function sendMessage(message: IMessage){
    const client = clients.get(message.to);
    if (!client) return;

    if (client.readyState !== 1) return;

    client.send(JSON.stringify(message));
}