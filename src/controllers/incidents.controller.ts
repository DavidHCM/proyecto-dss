import { Request, Response } from 'express';
import Incident from './../models/incident.model';
import { HTTP_STATUS } from '../types/http-status-codes';
import { Incident as IncidentType } from '../types/incident';
import { userControllers } from "./user.controller";
import { v4 as uuidv4 } from 'uuid';
import xss from 'xss';

class incidentController {
    async create(req: Request, res: Response) {
        try {
            const {
                reportedBy,
                deliveryId,
                type,
                description,
                status,
                location
            }: Partial<IncidentType> = req.body;

            const newIncident = new Incident({
                incidentId: uuidv4(),
                reportedBy,
                deliveryId,
                type,
                description,
                status: status || "open",
                location,
                createdAt: new Date(),
                resolvedAt: null
            });

            const savedIncident = await newIncident.save();

            res.status(HTTP_STATUS.SUCCESS).json(savedIncident);
        } catch (err) {
            console.error('Error creating incident:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error creating incident'),
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const results = await Incident.find({}).sort({ createdAt: -1 });
            if (!results || results.length === 0) {
                throw new Error('There are no results');
            }
            const mapUsers = results.map(item => item.reportedBy);
            const users = await Promise.all(mapUsers.map(async userId => {
                return userControllers.getId(userId);
            }));

            res.status(HTTP_STATUS.SUCCESS).json({ incident: results, user: users });
        } catch (err) {
            console.error('Error fetching all incidents:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('No incidents found'),
            });
        }
    }

    async getByDriver(req: Request, res: Response) {
        try {
            const reportedBy = req.query.driverId;
            const existingIncidents = await Incident.find({ reportedBy }).sort({ createdAt: -1 });
            if (!existingIncidents || existingIncidents.length === 0) {
                throw new Error('Driver does not have incidents');
            }

            const user = await userControllers.getId(reportedBy);
            res.status(HTTP_STATUS.SUCCESS).json({ incident: existingIncidents, user: user });
        } catch (err) {
            console.error('Error fetching incidents by driver:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('No incidents found'),
            });
        }
    }

    async getOpenIncidents(req: Request, res: Response) {
        try {
            const results = await Incident.find({ status: "open" }).sort({ createdAt: -1 });
            if (!results || results.length === 0) {
                throw new Error('No open incidents found');
            }
            const mapUsers = results.map(item => item.reportedBy);
            const users = await Promise.all(mapUsers.map(async userId => {
                return userControllers.getId(userId);
            }));

            res.status(HTTP_STATUS.SUCCESS).json({ incident: results, user: users });
        } catch (err) {
            console.error('Error fetching open incidents:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching open incidents'),
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const incidentId = req.params.incidentId;
            const existingIncident = await Incident.findOne({ incidentId });
            if (!existingIncident) {
                throw new Error('Incident does not exist');
            }

            const sanitizedIncident = {
                ...existingIncident.toObject(),
                incidentId: xss(existingIncident.incidentId),
                reportedBy: xss(existingIncident.reportedBy),
                deliveryId: xss(existingIncident.deliveryId),
                type: xss(existingIncident.type),
                description: xss(existingIncident.description),
                status: xss(existingIncident.status),
                location: xss(existingIncident.location),
            };

            res.status(HTTP_STATUS.SUCCESS).json(sanitizedIncident);
        } catch (err) {
            console.error('Error fetching incident by ID:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching incident'),
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const incidentId = req.params.incidentId;
            const updatedData = req.body;

            const existingIncident = await Incident.findOne({ incidentId });

            if (!existingIncident) {
                throw new Error('Incident does not exist');
            }

            const updatedIncident = await Incident.findOneAndUpdate(
                { incidentId },
                updatedData,
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedIncident);
        } catch (err) {
            console.error('Error updating incident:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error updating incident'),
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const incidentId = req.params.incidentId;
            const existingIncident = await Incident.findOne({ incidentId });

            if (!existingIncident) {
                throw new Error('Incident does not exist');
            }

            const deletedIncident = await Incident.deleteOne({ incidentId });
            res.status(HTTP_STATUS.SUCCESS).json(deletedIncident);
        } catch (err) {
            console.error('Error deleting incident:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error deleting incident'),
            });
        }
    }
}

export const incidentControllers = new incidentController();