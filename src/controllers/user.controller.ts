import { Request, Response } from 'express';
import User from './../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { HTTP_STATUS } from '../types/http-status-codes';
import { uploadFileToS3, getFileFromS3 } from '../service/file-upload.service';
import { User as UserType } from '../types/user';
import {rankingControllers} from "./ranking.controller";
import {config} from "dotenv";
config();

const secretKey = process.env.JWT_SECRET;



class userController {
    async getAll(req: Request, res: Response) {
        try {
            const results = await User.find({}, {password: 0});
            if (!results || results.length === 0) {
                throw ('User not exist: ' + HTTP_STATUS.NOT_FOUND);
            }
            res.send(results);
        } catch (err) {
            res.status(HTTP_STATUS.NOT_FOUND).send({message: 'No users found'});
        }
    }

    async getDrivers(req: Request, res: Response) {
        try {
            const results = await User.find({role: 'driver'}, {password: 0});
            res.send(results);
        } catch (err) {
            res.status(HTTP_STATUS.NOT_FOUND).send({message: 'No drivers found'});
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const existingUser = await User.findOne({userId}, {password: 0});
            if (!existingUser) {
                throw ('User does not exist: ' + HTTP_STATUS.NOT_FOUND);
            }
            res.send(existingUser);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error fetching user';

            res.status(status).send({message, error: err});
        }
    }

    async getId(user: any) {
        try {
            const userId = user;
            const existingUser = await User.findOne({userId}, {password: 0});
            if (!existingUser) {
                throw ('User does not exist: ' + HTTP_STATUS.NOT_FOUND);
            }
            return existingUser

        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error fetching user';

            return {message, error: err}
        }
    };

    async update(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const updatedData = req.body;

            const existingUser = await User.findOne({userId});

            if (!existingUser) {
                throw ('User does not exist: ' + HTTP_STATUS.CONFLICT);
            }

            const updatedUser = await User.findOneAndUpdate(
                {userId},
                updatedData,
                {new: true, runValidators: true}
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedUser);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error updating user';

            res.status(status).send({message, error: err});
        }
    }

    async updatePassword(req: Request, res: Response){
        try {
            const { token, newPassword } = req.body;
            if (!newPassword || !token) {
                throw ('No user or password provided: ' + HTTP_STATUS.NOT_FOUND);
            }

            const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { userId: string };
            const userId = decoded.userId;

            const existingUser = await User.findOne({userId});
            if (!existingUser) {
                throw ('User does not exist: ' + HTTP_STATUS.NOT_FOUND);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatedUser = await User.findOneAndUpdate(
                { userId },
                { password: hashedPassword },
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).send({message: 'User updated successfully'});

        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error fetching user';

            res.status(status).send({message, error: err});
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const existingUser = await User.findOne({userId});

            if (!existingUser) {
                throw ('User does not exist: ' + HTTP_STATUS.CONFLICT);
            }

            const deletedUser = await User.deleteOne({userId});
            res.status(HTTP_STATUS.SUCCESS).json(deletedUser);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error deleting user';

            res.status(status).send({message, error: err});
        }
    }

    async register(req: Request, res: Response) {
        try {
            const {name, email, password, role, status}: UserType = req.body;
            if (!name || !email || !password || !role) {
                throw 'Missing required fields: ' + HTTP_STATUS.BAD_REQUEST;
            }

            const existingUser = await User.findOne({email});
            if (existingUser) {
                throw 'User already exists: ' + HTTP_STATUS.CONFLICT;
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
                googleToken:''
            });

            await newUser.save();

            if (role === 'driver') {
                try {
                    await rankingControllers.start({ userId });
                } catch (err) {
                    console.error('Error creating ranking for driver:', err);
                    throw 'Error creating ranking for driver: ' + HTTP_STATUS.SERVER_ERROR;
                }
            }

            res.status(HTTP_STATUS.SUCCESS).send({message: 'User registered successfully'});

        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error registering user';

            res.status(status).send({message, error: err});
        }
    };

    async login(req: Request, res: Response) {
        try {
            const {email, password}: UserType = req.body;
            if (!email || !password) {
                throw 'Missing required fields: ' + HTTP_STATUS.BAD_REQUEST;
            }

            const expectedUser = await User.findOne({email});
            if (!expectedUser) {
                throw 'User not found: ' + HTTP_STATUS.NOT_FOUND;
            }

            const forbiddenStatuses = ['inactive', 'deleted', 'archived'];

            if (forbiddenStatuses.includes(expectedUser.status || '')) {
                throw 'User account is not active: ' + HTTP_STATUS.AUTH_ERROR;
            }

            const isPasswordValid = await bcrypt.compare(password, expectedUser.password);

            if (!isPasswordValid) {
                throw 'Invalid credentials: ' + HTTP_STATUS.AUTH_ERROR;
            }

            const token = jwt.sign({
                userId: expectedUser.userId,
                email: expectedUser.email,
                role: expectedUser.role,
                name: expectedUser.name
            }, secretKey as string);

            res.status(HTTP_STATUS.SUCCESS).send({token, message: 'Login successful'});

        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error logging in user';
            res.status(status).send({message, error: err});
        }
    };

    async uploadUserProfilePic(req: Request, res: Response) {
        const { userId } = req.body;

        if (!req.file) {
            throw ('User does not exist: ' + HTTP_STATUS.BAD_REQUEST)
        }

        if (!userId) {
            throw ('User does not exist: ' + HTTP_STATUS.NOT_FOUND)
        }

        try {
            const fileKey = await uploadFileToS3(req.file);

            const updatedUser = await User.findOneAndUpdate(
                { userId },
                { profilePic: fileKey },
                { new: true }
            );

            if (!updatedUser) {
                throw ('User does not exist: ' + HTTP_STATUS.NOT_FOUND)
            }

            res.status(HTTP_STATUS.SUCCESS).send({ message: 'Imagen subida correctamente'});
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error uploading picture';

            res.status(status).send({message, error: err});
        }
    };

    async getUserProfilePic(req: Request, res: Response) {
        const userId = req.params.key;

        try {
            const user = await User.findOne({ userId }, { profilePic: 1 });
            if (!user) {
                throw ('User does not exist: ' + HTTP_STATUS.NOT_FOUND)
            }

            if (!user.profilePic) {
                throw ('User picture does not exist: ' + HTTP_STATUS.NOT_FOUND)
            }

            const fileStream = await getFileFromS3(user.profilePic);

            res.setHeader('Content-Disposition', `inline; filename="${user.profilePic}"`);
            res.setHeader('Content-Type', 'image/jpeg');

            fileStream.pipe(res);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error getting picture';

            res.status(status).send({message, error: err});
        }
    }
}

export const userControllers = new userController();
