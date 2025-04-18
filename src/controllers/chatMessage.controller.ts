import { Request, Response } from 'express';
import ChatMessage from './../models/chatMessage.model';
import { HTTP_STATUS } from '../types/http-status-codes';
import { ChatMessage as ChatMessageType } from '../types/chatMessage';
import mongoose from "mongoose";
import xss from 'xss';

class chatMessageController {
    async create(req: Request, res: Response) {
        try {
            const {
                messageId,
                fromUserId,
                toUserId,
                deliveryId,
                content,
                createdAt
            }: ChatMessageType = req.body;

            const existingMessage = await ChatMessage.findOne({ messageId });

            if (existingMessage) {
                throw new Error('Message already exists');
            }

            const newMessage = new ChatMessage({
                messageId,
                fromUserId,
                toUserId,
                deliveryId,
                content,
                createdAt
            });

            const savedMessage = await newMessage.save();
            res.status(HTTP_STATUS.SUCCESS).json(savedMessage);
        } catch (err) {
            console.error('Error creating chat message:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error creating chat message'),
            });
        }
    }

    async saveMessage(data: { fromUserId: string; toUserId: string; deliveryId: string; content: string; }) {
        try {
            const newMessage = new ChatMessage({
                messageId: new mongoose.Types.ObjectId().toString(),
                fromUserId: data.fromUserId,
                toUserId: data.toUserId,
                deliveryId: data.deliveryId,
                content: data.content,
            });

            const savedMessage = await newMessage.save();
            return savedMessage;
        } catch (err) {
            console.error('Error saving message:', err);
            throw new Error('Error saving message');
        }
    }

    async getMessagesByRoom(req: Request, res: Response) {
        try {
            const { roomName } = req.params;
            const messages = await ChatMessage.find({ deliveryId: roomName });
            res.status(HTTP_STATUS.SUCCESS).json(messages);
        } catch (err) {
            console.error('Error fetching messages by room:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error fetching messages'),
            });
        }
    }

    async getMessagesByRoomId(roomName: string) {
        try {
            return await ChatMessage.find({ deliveryId: roomName });
        } catch (err) {
            console.error('Error fetching messages for room:', err);
            throw new Error('Error fetching messages for room');
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const results = await ChatMessage.find({});
            res.send(results);
        } catch (err) {
            console.error('Error fetching all chat messages:', err); 
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('No chat messages found'), 
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const messageId = req.params.messageId;
            const existingMessage = await ChatMessage.findOne({ messageId });
            if (!existingMessage) {
                throw new Error('Chat message does not exist');
            }

            const sanitizedMessage = {
                ...existingMessage.toObject(),
                content: xss(existingMessage.content),
            };

            res.send(sanitizedMessage);
        } catch (err) {
            console.error('Error fetching chat message:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching chat message'), 
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const messageId = req.params.messageId;
            const updatedData = req.body;

            const existingMessage = await ChatMessage.findOne({ messageId });

            if (!existingMessage) {
                throw new Error('Chat message does not exist');
            }

            const updatedMessage = await ChatMessage.findOneAndUpdate(
                { messageId },
                updatedData,
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedMessage);
        } catch (err) {
            console.error('Error updating chat message:', err); 
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error updating chat message'), 
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const messageId = req.params.messageId;
            const existingMessage = await ChatMessage.findOne({ messageId });

            if (!existingMessage) {
                throw new Error('Chat message does not exist');
            }

            const deletedMessage = await ChatMessage.deleteOne({ messageId });
            res.status(HTTP_STATUS.SUCCESS).json(deletedMessage);
        } catch (err) {
            console.error('Error deleting chat message:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error deleting chat message'),
            });
        }
    }
}

export const chatMessageControllers = new chatMessageController();