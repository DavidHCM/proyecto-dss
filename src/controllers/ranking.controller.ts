import { Request, Response } from 'express';
import Ranking from './../models/ranking.model';
import { HTTP_STATUS } from '../types/http-status-codes';
import { Ranking as RankingType } from '../types/ranking';
import {userControllers} from "./user.controller";

class rankingController {
    async create(req: Request, res: Response) {
        try {
            const {
                userId,
                points,
                rank
            }: RankingType = req.body;

            const existingRanking = await Ranking.findOne({ userId });

            if (existingRanking) {
                throw ('Ranking for this user already exists: ' + HTTP_STATUS.CONFLICT);
            }

            const newRanking = new Ranking({
                userId,
                points,
                rank
            });

            const savedRanking = await newRanking.save();
            res.status(HTTP_STATUS.SUCCESS).json(savedRanking);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error creating ranking';

            res.status(status).send({ message, error: err });
        }
    }

    async start(user: any) {
        try {
            const { userId, points = 0, rank = 0 } = user;

            const existingRanking = await Ranking.findOne({ userId });

            if (existingRanking) {
                throw 'Ranking for this user already exists: ' + HTTP_STATUS.CONFLICT;
            }

            const newRanking = new Ranking({
                userId,
                points,
                rank,
            });

            const savedRanking = await newRanking.save();
            return savedRanking;
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error creating ranking';

            throw { status, message, error: err };
        }
    }


    async getAll(req: Request, res: Response) {
        try {
            const results = await Ranking.find({}).sort({ points: -1 });
            const mapUsers = results.map(item => item.userId);

            const users = await Promise.all(mapUsers.map(async userId => {
                return userControllers.getId(userId);
            }));

            res.send({rankings: results, users: users});
        } catch (err) {
            res.status(HTTP_STATUS.NOT_FOUND).send({ message: 'No rankings found' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const userId = req.params.rankingId;
            const existingRanking = await Ranking.findOne({ userId });
            if (!existingRanking) {
                throw ('Ranking does not exist for this user: ' + HTTP_STATUS.NOT_FOUND);
            }
            res.send(existingRanking);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error fetching ranking';

            res.status(status).send({ message, error: err });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const userId = req.params.rankingId;
            const updatedData = req.body;

            const existingRanking = await Ranking.findOne({ userId });

            if (!existingRanking) {
                throw ('Ranking does not exist for this user: ' + HTTP_STATUS.CONFLICT);
            }

            const updatedRanking = await Ranking.findOneAndUpdate(
                { userId },
                updatedData,
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedRanking);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error updating ranking';

            res.status(status).send({ message, error: err });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const userId = req.params.rankingId;
            const existingRanking = await Ranking.findOne({ userId });

            if (!existingRanking) {
                throw ('Ranking does not exist for this user: ' + HTTP_STATUS.CONFLICT);
            }

            const deletedRanking = await Ranking.deleteOne({ userId });
            res.status(HTTP_STATUS.SUCCESS).json(deletedRanking);
        } catch (err) {
            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.BAD_REQUEST;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error deleting ranking';

            res.status(status).send({ message, error: err });
        }
    }
}

export const rankingControllers = new rankingController();
