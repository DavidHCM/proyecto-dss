import { Request, Response } from 'express';
import Ranking from './../models/ranking.model';
import { HTTP_STATUS } from '../types/http-status-codes';
import { Ranking as RankingType } from '../types/ranking';
import { userControllers } from "./user.controller";
import xss from 'xss';

class rankingController {
    async create(req: Request, res: Response) {
        try {
            const { userId, points, rank }: RankingType = req.body;

            const existingRanking = await Ranking.findOne({ userId });

            if (existingRanking) {
                throw new Error('Ranking for this user already exists');
            }

            const newRanking = new Ranking({
                userId,
                points,
                rank
            });

            const savedRanking = await newRanking.save();
            res.status(HTTP_STATUS.SUCCESS).json(savedRanking);
        } catch (err) {
            console.error('Error creating ranking:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error creating ranking'),
            });
        }
    }

    async start(user: any) {
        try {
            const { userId, points = 0, rank = 0 } = user;

            const existingRanking = await Ranking.findOne({ userId });

            if (existingRanking) {
                throw new Error('Ranking for this user already exists');
            }

            const newRanking = new Ranking({
                userId,
                points,
                rank,
            });

            const savedRanking = await newRanking.save();
            return savedRanking;
        } catch (err) {
            console.error('Error starting ranking:', err);
            throw new Error('Error starting ranking');
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const results = await Ranking.find({}).sort({ points: -1 });
            const mapUsers = results.map(item => item.userId);

            const users = await Promise.all(mapUsers.map(async userId => {
                return userControllers.getId(userId);
            }));

            res.status(HTTP_STATUS.SUCCESS).json({ rankings: results, users: users });
        } catch (err) {
            console.error('Error fetching all rankings:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('No rankings found'),
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const userId = req.params.rankingId;
            const existingRanking = await Ranking.findOne({ userId });
            if (!existingRanking) {
                throw new Error('Ranking does not exist for this user');
            }

            const sanitizedRanking = {
                ...existingRanking.toObject(),
                userId: xss(existingRanking.userId),
                points: existingRanking.points,
                rank: existingRanking.rank,
            };

            res.status(HTTP_STATUS.SUCCESS).json(sanitizedRanking);
        } catch (err) {
            console.error('Error fetching ranking by ID:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching ranking'),
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const userId = req.params.rankingId;
            const updatedData = req.body;

            const existingRanking = await Ranking.findOne({ userId });

            if (!existingRanking) {
                throw new Error('Ranking does not exist for this user');
            }

            const updatedRanking = await Ranking.findOneAndUpdate(
                { userId },
                updatedData,
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedRanking);
        } catch (err) {
            console.error('Error updating ranking:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error updating ranking'),
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const userId = req.params.rankingId;
            const existingRanking = await Ranking.findOne({ userId });

            if (!existingRanking) {
                throw new Error('Ranking does not exist for this user');
            }

            const deletedRanking = await Ranking.deleteOne({ userId });
            res.status(HTTP_STATUS.SUCCESS).json(deletedRanking);
        } catch (err) {
            console.error('Error deleting ranking:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error deleting ranking'),
            });
        }
    }
}

export const rankingControllers = new rankingController();