import { Request, Response } from 'express';
import Incident from './../models/incident.model';
import { HTTP_STATUS } from '../types/http-status-codes';
import { Incident as IncidentType } from '../types/incident';
import {userControllers} from "./user.controller";
import { v4 as uuidv4 } from 'uuid';


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
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error creating incident';

            res.status(status).send({ message, error: err });
        }
    }


    async getAll(req: Request, res: Response) {
        try {
            const results = await Incident.find({}).sort({ createdAt: -1 });
            if (!results || results.length === 0) {
                throw ('There are no results: ' + HTTP_STATUS.NOT_FOUND);
            }
            const mapUsers = results.map(item => item.reportedBy);
            const users = await Promise.all(mapUsers.map(async userId => {
                return userControllers.getId(userId);
            }));

            res.send({ incident: results, user: users });
        } catch (err) {
            res.status(HTTP_STATUS.NOT_FOUND).send({ message: 'No incidents found' });
        }
    }

    async getByDriver(req: Request, res: Response) {
        try {
            const reportedBy = req.query.driverId;
            const existingIncidents = await Incident.find({ reportedBy }).sort({ createdAt: -1 });
            if (!existingIncidents || existingIncidents.length === 0) {
                throw ('Driver does not have incidents: ' + HTTP_STATUS.NOT_FOUND);
            }

            const user = await userControllers.getId(reportedBy);
            res.send({ incident: existingIncidents, user: user });
        } catch (err) {
            res.status(HTTP_STATUS.NOT_FOUND).send({ message: 'No incidents found' });
        }
    }

    async getOpenIncidents(req: Request, res: Response) {
        try {
            const results = await Incident.find({ status: "open" }).sort({ createdAt: -1 });
            if (!results || results.length === 0) {
                throw ('Deliveries not found: ' + HTTP_STATUS.NOT_FOUND);
            }
            const mapUsers = results.map(item => item.reportedBy);
            const users = await Promise.all(mapUsers.map(async userId => {
                return userControllers.getId(userId);
            }));

            res.send({ incident: results, user: users });
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error searching delivery';

            res.status(status).send({ message, error: err });
        }
    }



    async getById(req: Request, res: Response) {
        try {
            const incidentId = req.params.incidentId;
            //console.log(incidentId)
            const existingIncident = await Incident.findOne({ incidentId });
            if (!existingIncident) {
                throw ('Incident does not exist: ' + HTTP_STATUS.NOT_FOUND);
            }
            res.send(existingIncident);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error fetching incident';

            res.status(status).send({ message, error: err });
        }
    }


    async update(req: Request, res: Response) {
        try {
            const incidentId = req.params.incidentId;
            const updatedData = req.body;

            const existingIncident = await Incident.findOne({ incidentId });

            if (!existingIncident) {
                throw ('Incident does not exist: ' + HTTP_STATUS.NOT_FOUND);
            }

            const updatedIncident = await Incident.findOneAndUpdate(
                { incidentId },
                updatedData,
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedIncident);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error updating incident';

            res.status(status).send({ message, error: err });
        }
    }


    async delete(req: Request, res: Response) {
        try {
            const incidentId = req.params.incidentId;
            const existingIncident = await Incident.findOne({ incidentId });

            if (!existingIncident) {
                throw ('Incident does not exist: ' + HTTP_STATUS.NOT_FOUND);
            }

            const deletedIncident = await Incident.deleteOne({ incidentId });
            res.status(HTTP_STATUS.SUCCESS).json(deletedIncident);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error deleting incident';

            res.status(status).send({ message, error: err });
        }
    }
}

export const incidentControllers = new incidentController();
