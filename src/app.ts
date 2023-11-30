import Router from "express";
import express from "express";
import cors from "cors";
import authRoute from "./routes/authRouter";
import authMiddleware from "./middlewares/authMiddleware";
import userRoute from "./routes/userRouter";
import expressWs from "express-ws";
import {IMessage} from "./types";

// Connecting websockets to app
const { app, getWss} = expressWs(express());

// Configuring CORS
app.use(cors({
    origin: process.env.CLIENT_URL, // Allow requests from this origin
    methods: 'GET,POST,PUT,DELETE,PATCH', // Allow specific HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // Allow specific headers
}));

app.use(express.json());

app.use(authRoute);
app.use('/user', authMiddleware, userRoute);

// Getting type of WebSocket
const cl = getWss().clients;
type WebSocket = typeof cl extends Set<infer U> ? U : never;

// Creating an empty map of connected to web socket users
const clients: Map<string, WebSocket> = new Map();

app.ws('/:id', (ws, req, next) => {
    clients.set(req.params.id, ws);

    ws.on('message', (data, isBinary) => {
        if (isBinary)
            next();

        try{
            const message: IMessage = JSON.parse(data.toString());
            sendMessage(message);
        } catch(e){
            console.log(`Error at message event: ${e}`);
        }
    })
})

function sendMessage(message: IMessage){
    const client = clients.get(message.to);
    if (!client) return;

    if (client.readyState !== 1) return;

    client.send(JSON.stringify(message));
}

export default app;