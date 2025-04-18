import { Request, Response } from 'express';
import axios from 'axios';
import RouteSuggestion from './../models/routeSuggestion.model';
import { HTTP_STATUS } from '../types/http-status-codes';
import { RouteSuggestion as RouteType } from "../types/routeSuggestion";
import xss from 'xss';

class routeSuggestionController {
    async create(req: Request, res: Response) {
        try {
            const {
                routeSuggestionId,
                deliveryId,
                suggestedRoute,
                estimatedTime,
                createdAt
            }: RouteType = req.body;

            const existingRouteSuggestion = await RouteSuggestion.findOne({ routeSuggestionId });

            if (existingRouteSuggestion) {
                throw new Error('Route suggestion already exists');
            }

            const newRouteSuggestion = new RouteSuggestion({
                routeSuggestionId,
                deliveryId,
                suggestedRoute,
                estimatedTime,
                createdAt
            });

            const savedRouteSuggestion = await newRouteSuggestion.save();
            res.status(HTTP_STATUS.SUCCESS).json(savedRouteSuggestion);
        } catch (err) {
            console.error('Error creating route suggestion:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error creating route suggestion'),
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const results = await RouteSuggestion.find({});
            res.status(HTTP_STATUS.SUCCESS).json(results);
        } catch (err) {
            console.error('Error fetching all route suggestions:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('No route suggestions found'),
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const routeSuggestionId = req.params.routeSuggestionId;
            const existingRouteSuggestion = await RouteSuggestion.findOne({ routeSuggestionId });
            if (!existingRouteSuggestion) {
                throw new Error('Route suggestion does not exist');
            }

            const sanitizedRouteSuggestion = {
                ...existingRouteSuggestion.toObject(),
                routeSuggestionId: xss(existingRouteSuggestion.routeSuggestionId),
                deliveryId: xss(existingRouteSuggestion.deliveryId),
                suggestedRoute: xss(existingRouteSuggestion.suggestedRoute),
                estimatedTime: existingRouteSuggestion.estimatedTime,
                createdAt: existingRouteSuggestion.createdAt,
            };

            res.status(HTTP_STATUS.SUCCESS).json(sanitizedRouteSuggestion);
        } catch (err) {
            console.error('Error fetching route suggestion by ID:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching route suggestion'),
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const routeSuggestionId = req.params.routeSuggestionId;
            const updatedData = req.body;

            const existingRouteSuggestion = await RouteSuggestion.findOne({ routeSuggestionId });

            if (!existingRouteSuggestion) {
                throw new Error('Route suggestion does not exist');
            }

            const updatedRouteSuggestion = await RouteSuggestion.findOneAndUpdate(
                { routeSuggestionId },
                updatedData,
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedRouteSuggestion);
        } catch (err) {
            console.error('Error updating route suggestion:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error updating route suggestion'),
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const routeSuggestionId = req.params.routeSuggestionId;
            const existingRouteSuggestion = await RouteSuggestion.findOne({ routeSuggestionId });

            if (!existingRouteSuggestion) {
                throw new Error('Route suggestion does not exist');
            }

            const deletedRouteSuggestion = await RouteSuggestion.deleteOne({ routeSuggestionId });
            res.status(HTTP_STATUS.SUCCESS).json(deletedRouteSuggestion);
        } catch (err) {
            console.error('Error deleting route suggestion:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error deleting route suggestion'),
            });
        }
    }

    async routeFromMap(req: Request, res: Response): Promise<void> {
        try {
            const { start, end } = req.body;

            if (!start || !end) {
                throw new Error('Start and end locations are required');
            }

            const apiKey = process.env.GRASS;

            if (!apiKey) {
                throw new Error('API key is missing');
            }

            const graphhopperUrl = `https://graphhopper.com/api/1/route?point=${start[1]},${start[0]}&point=${end[1]},${end[0]}&profile=car&locale=es&points_encoded=false&key=${apiKey}`;

            const response = await axios.get(graphhopperUrl);

            const routeData = response.data;

            res.status(HTTP_STATUS.SUCCESS).json(routeData);
        } catch (err) {
            console.error('Error fetching route from map:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error fetching route from map'),
            });
        }
    }
}

export const routeSuggestionControllers = new routeSuggestionController();