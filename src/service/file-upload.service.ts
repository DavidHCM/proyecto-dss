import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {Readable} from "node:stream";
import {config} from "dotenv";
config();

const accessKey = process.env.S3_ACCESS_KEY;
const secretKey = process.env.S3_SECRET_KEY;
const region = process.env.S3_REGION;
const bucketName = process.env.S3_BUCKET_NAME;


const s3Client = new S3Client({
    region: region || 'us-east-1',
    credentials: {
        accessKeyId: accessKey || '',
        secretAccessKey: secretKey || '',
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isValid = file.mimetype.startsWith('image/');
    cb(null, isValid);
};

const uploadS3 = multer({
    fileFilter,
    storage: multer.memoryStorage()
});


const uploadFileToS3 = async (file: Express.Multer.File): Promise<string> => {
    const key = `${uuidv4()}-${file.originalname}`;
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        return key;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('Error uploading file');
    }
};

const getFileFromS3 = async (key: string): Promise<Readable> => {
    const params = {
        Bucket: bucketName,
        Key: key,
    };

    try {
        const response = await s3Client.send(new GetObjectCommand(params));
        if (!response.Body) {
            throw new Error('File not found or empty');
        }
        return response.Body as Readable;
    } catch (error) {
        console.error('Error retrieving file from S3:', error);
        throw new Error('Error retrieving file');
    }
};

export { uploadS3, uploadFileToS3, getFileFromS3 };
