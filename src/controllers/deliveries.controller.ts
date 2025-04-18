import { Request, Response } from 'express';
import Delivery from './../models/delivery.model';
import { HTTP_STATUS } from '../types/http-status-codes';
import { Delivery as DeliveryType } from '../types/delivery';
import { userControllers } from "./user.controller";
import { v4 as uuidv4 } from 'uuid';
import xss from 'xss';

class deliveryController {
    async create(req: Request, res: Response) {
        try {
            const {
                assignedTo,
                pickupLocation,
                deliveryLocation,
                scheduledTime,
                productDetails
            }: Partial<DeliveryType> = req.body;

            const formattedScheduledTime = new Date(scheduledTime);

            const productWithId = {
                ...productDetails,
                productId: uuidv4()
            };

            const newDelivery = new Delivery({
                deliveryId: uuidv4(),
                assignedTo,
                status: "in-progress",
                route: "none",
                productDetails: productWithId,
                pickupLocation,
                deliveryLocation,
                scheduledTime: formattedScheduledTime,
                createdAt: new Date(),
                updatedAt: new Date(),
                deliveredAt: null
            });

            const savedDelivery = await newDelivery.save();

            res.status(HTTP_STATUS.SUCCESS).json(savedDelivery);
        } catch (err) {
            console.error('Error creating delivery:', err); 
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error creating delivery'), 
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const results = await Delivery.find({}).sort({ createdAt: -1 });
            const mapUsers = results.map(item => item.assignedTo);
            const users = await Promise.all(mapUsers.map(async userId => {
                return userControllers.getId(userId);
            }));

            res.status(HTTP_STATUS.SUCCESS).json({ deliveries: results, users: users });
        } catch (err) {
            console.error('Error fetching all deliveries:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('No deliveries found'), 
            });
        }
    }

    async getByDriver(req: Request, res: Response) {
        try {
            const assignedTo = req.query.driverId;
            const existingDelivery = await Delivery.find({ assignedTo }).sort({ createdAt: -1 });
            if (!existingDelivery.length) {
                throw new Error('Driver does not have deliveries');
            }

            const user = await userControllers.getId(assignedTo);

            res.status(HTTP_STATUS.SUCCESS).json({ delivery: existingDelivery, user: user });
        } catch (err) {
            console.error('Error fetching deliveries by driver:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching deliveries by driver'),
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const deliveryId = req.params.deliveryId;
            const existingDelivery = await Delivery.findOne({ deliveryId });
            if (!existingDelivery) {
                throw new Error('Delivery does not exist');
            }

            const sanitizedDelivery = {
                ...existingDelivery.toObject(),
                deliveryId: xss(existingDelivery.deliveryId),
                assignedTo: xss(existingDelivery.assignedTo),
                pickupLocation: xss(existingDelivery.pickupLocation),
                deliveryLocation: xss(existingDelivery.deliveryLocation),
                status: xss(existingDelivery.status),
            };

            res.status(HTTP_STATUS.SUCCESS).json(sanitizedDelivery);
        } catch (err) {
            console.error('Error fetching delivery by ID:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching delivery'), 
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const deliveryId = req.params.deliveryId;
            const updatedData = req.body;

            const existingDelivery = await Delivery.findOne({ deliveryId });

            if (!existingDelivery) {
                throw new Error('Delivery does not exist');
            }

            if (updatedData.scheduledTime && typeof updatedData.scheduledTime === 'string') {
                updatedData.scheduledTime = new Date(updatedData.scheduledTime);
            }

            if (updatedData.productDetails && !updatedData.productDetails.productId) {
                updatedData.productDetails.productId = existingDelivery.productDetails.productId;
            }

            if (updatedData.completed) {
                updatedData.status = "completed";
                updatedData.deliveredAt = new Date();
            }

            const mergedData = {
                ...existingDelivery.toObject(),
                ...updatedData,
                updatedAt: new Date()
            };

            const updatedDelivery = await Delivery.findOneAndUpdate(
                { deliveryId },
                mergedData,
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedDelivery);
        } catch (err) {
            console.error('Error updating delivery:', err); 
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error updating delivery'), 
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const deliveryId = req.params.deliveryId;
            const existingDelivery = await Delivery.findOne({ deliveryId });

            if (!existingDelivery) {
                throw new Error('Delivery does not exist');
            }

            const deletedDelivery = await Delivery.deleteOne({ deliveryId });

            res.status(HTTP_STATUS.SUCCESS).json(deletedDelivery);
        } catch (err) {
            console.error('Error deleting delivery:', err); 
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error deleting delivery'), 
            });
        }
    }

    async getAllActive(req: Request, res: Response) {
        try {
            const results = await Delivery.find({
                status: { $in: ["in-progress", "stopped", "pending"] }
            }).sort({ createdAt: -1 });
            const mapUsers = results.map(item => item.assignedTo);
            const users = await Promise.all(mapUsers.map(async userId => {
                return userControllers.getId(userId);
            }));
    
            res.status(HTTP_STATUS.SUCCESS).json({ deliveries: results, users: users });
        } catch (err) {
            console.error('Error getting delivery:', err); 
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error getting delivery'), 
            });
        }
    }
    
    async getByDate(req: Request, res: Response): Promise<void> {
        try {
            const { startDate, endDate } = req.body;
            if (!startDate || !endDate) {
                throw new Error('Start date and end date are required');
            }
    
            const start = new Date(startDate as string);
            const end = new Date(endDate as string);
    
            const results = await Delivery.find({
                scheduledTime: { $gte: start, $lte: end }
            }).sort({ scheduledTime: 1 });
    
            if (!results.length) {
                throw ('Deliveries not found: ' + HTTP_STATUS.NOT_FOUND);
            }
    
            const mapUsers = results.map(item => item.assignedTo);
            const users = await Promise.all(mapUsers.map(async userId => {
                return userControllers.getId(userId);
            }));
    
            res.status(HTTP_STATUS.SUCCESS).json({ deliveries: results, users: users });
        } catch (err) {
            console.error('Error getting delivery:', err); 
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error getting delivery'), 
            });
        }
    }

}

export const deliveryControllers = new deliveryController();