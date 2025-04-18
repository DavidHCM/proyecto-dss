import { Request, Response } from 'express';
import User from './../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { HTTP_STATUS } from '../types/http-status-codes';
import { uploadFileToS3, getFileFromS3 } from '../service/file-upload.service';
import { User as UserType } from '../types/user';
import { rankingControllers } from "./ranking.controller";
import { config } from "dotenv";
import xss from 'xss';
config();

const secretKey = process.env.JWT_SECRET;

class userController {
    async getAll(req: Request, res: Response) {
        try {
            const results = await User.find({}, { password: 0 });
            if (!results || results.length === 0) {
                throw new Error('No users found');
            }
            res.status(HTTP_STATUS.SUCCESS).json(results);
        } catch (err) {
            console.error('Error fetching all users:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('No users found'),
            });
        }
    }

    async getDrivers(req: Request, res: Response) {
        try {
            const results = await User.find({ role: 'driver' }, { password: 0 });
            res.status(HTTP_STATUS.SUCCESS).json(results);
        } catch (err) {
            console.error('Error fetching drivers:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('No drivers found'),
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const existingUser = await User.findOne({ userId }, { password: 0 });
            if (!existingUser) {
                throw new Error('User does not exist');
            }

            const sanitizedUser = {
                ...existingUser.toObject(),
                userId: xss(existingUser.userId),
                name: xss(existingUser.name),
                email: xss(existingUser.email),
                role: xss(existingUser.role),
                status: xss(existingUser.status),
                profilePic: xss(existingUser.profilePic),
                createdAt: existingUser.createdAt,
            };

            res.status(HTTP_STATUS.SUCCESS).json(sanitizedUser);
        } catch (err) {
            console.error('Error fetching user by ID:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching user'),
            });
        }
    }

    async getId(user: any) {
        try {
            const userId = user;
            const existingUser = await User.findOne({ userId }, { password: 0 });
            if (!existingUser) {
                throw new Error('User does not exist');
            }
            return existingUser;
        } catch (err) {
            console.error('Error fetching user by ID:', err);
            throw new Error('Error fetching user');
        }
    }

    async update(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const updatedData = req.body;

            const existingUser = await User.findOne({ userId });

            if (!existingUser) {
                throw new Error('User does not exist');
            }

            const updatedUser = await User.findOneAndUpdate(
                { userId },
                updatedData,
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedUser);
        } catch (err) {
            console.error('Error updating user:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error updating user'),
            });
        }
    }

    async updatePassword(req: Request, res: Response) {
        try {
            const { token, newPassword } = req.body;
            if (!newPassword || !token) {
                throw new Error('No user or password provided');
            }

            const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { userId: string };
            const userId = decoded.userId;

            const existingUser = await User.findOne({ userId });
            if (!existingUser) {
                throw new Error('User does not exist');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await User.findOneAndUpdate(
                { userId },
                { password: hashedPassword },
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).send({ message: 'Password updated successfully' });
        } catch (err) {
            console.error('Error updating password:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error updating password'),
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const existingUser = await User.findOne({ userId });

            if (!existingUser) {
                throw new Error('User does not exist');
            }

            const deletedUser = await User.deleteOne({ userId });
            res.status(HTTP_STATUS.SUCCESS).json(deletedUser);
        } catch (err) {
            console.error('Error deleting user:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error deleting user'),
            });
        }
    }

    async register(req: Request, res: Response) {
        try {
            const { name, email, password, role, status }: UserType = req.body;
            if (!name || !email || !password || !role) {
                throw new Error('Missing required fields');
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newStatus = status || 'new';
            const userId = uuidv4();
            const createdAt = new Date().toISOString();

            const newUser = new User({
                userId,
                name,
                email,
                password: hashedPassword,
                role,
                status: newStatus,
                profilePic: '',
                createdAt,
                googleToken: ''
            });

            await newUser.save();

            if (role === 'driver') {
                try {
                    await rankingControllers.start({ userId });
                } catch (err) {
                    console.error('Error creating ranking for driver:', err);
                    throw new Error('Error creating ranking for driver');
                }
            }

            res.status(HTTP_STATUS.SUCCESS).send({ message: 'User registered successfully' });
        } catch (err) {
            console.error('Error registering user:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error registering user'),
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password }: UserType = req.body;
            if (!email || !password) {
                throw new Error('Missing required fields');
            }

            const expectedUser = await User.findOne({ email });
            if (!expectedUser) {
                throw new Error('User not found');
            }

            const forbiddenStatuses = ['inactive', 'deleted', 'archived'];

            if (forbiddenStatuses.includes(expectedUser.status || '')) {
                throw new Error('User account is not active');
            }

            const isPasswordValid = await bcrypt.compare(password, expectedUser.password);

            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            const token = jwt.sign({
                userId: expectedUser.userId,
                email: expectedUser.email,
                role: expectedUser.role,
                name: expectedUser.name
            }, secretKey as string);

            res.status(HTTP_STATUS.SUCCESS).send({ token, message: 'Login successful' });
        } catch (err) {
            console.error('Error logging in user:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error logging in user'),
            });
        }
    }

    async uploadUserProfilePic(req: Request, res: Response) {
        const { userId } = req.body;

        if (!req.file) {
            throw new Error('No file provided');
        }

        if (!userId) {
            throw new Error('User ID not provided');
        }

        try {
            const fileKey = await uploadFileToS3(req.file);

            const updatedUser = await User.findOneAndUpdate(
                { userId },
                { profilePic: fileKey },
                { new: true }
            );

            if (!updatedUser) {
                throw new Error('User does not exist');
            }

            res.status(HTTP_STATUS.SUCCESS).send({ message: 'Profile picture uploaded successfully' });
        } catch (err) {
            console.error('Error uploading profile picture:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error uploading profile picture'),
            });
        }
    }

    async getUserProfilePic(req: Request, res: Response) {
        const userId = req.params.key;

        try {
            const user = await User.findOne({ userId }, { profilePic: 1 });
            if (!user) {
                throw new Error('User does not exist');
            }

            if (!user.profilePic) {
                throw new Error('User profile picture does not exist');
            }

            const fileStream = await getFileFromS3(user.profilePic);

            res.setHeader('Content-Disposition', `inline; filename="${user.profilePic}"`);
            res.setHeader('Content-Type', 'image/jpeg');

            fileStream.pipe(res);
        } catch (err) {
            console.error('Error fetching profile picture:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error fetching profile picture'),
            });
        }
    }
}

export const userControllers = new userController();