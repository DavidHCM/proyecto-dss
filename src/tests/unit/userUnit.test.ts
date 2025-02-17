import { userControllers } from '../../controllers';
import User from '../../models/user.model';
import { HTTP_STATUS } from '../../types/http-status-codes';
import bcrypt from 'bcrypt';

jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        connect: jest.fn().mockResolvedValue(null),
        disconnect: jest.fn().mockResolvedValue(null),
        Schema: class MockSchema {
            constructor(schemaDefinition: any) {
                Object.assign(this, schemaDefinition);
            }
        },
        SchemaTypes: {
            String: 'String',
            Date: 'Date',
        },
        model: jest.fn().mockImplementation((name: string, schema: any) => {
            return {
                name,
                schema,
                find: jest.fn(),
                findOne: jest.fn(),
                findOneAndUpdate: jest.fn(),
                deleteOne: jest.fn(),
                save: jest.fn(),
            };
        }),
    };
});

jest.mock('../../models/user.model', () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    save: jest.fn(),
}));

describe('User Controller - getAll', () => {
    it('should return all users', async () => {
        const mockUsers = [{ name: 'Test User', email: 'test@example.com' }];
        (User.find as jest.Mock).mockResolvedValueOnce(mockUsers);

        const req = {} as any;
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as any;

        await userControllers.getAll(req, res);

        expect(res.send).toHaveBeenCalledWith(mockUsers);
    });

    it('should return a 404 error if no users exist', async () => {
        (User.find as jest.Mock).mockResolvedValueOnce([]);

        const req = {} as any;
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as any;

        await userControllers.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(res.send).toHaveBeenCalledWith({ message: 'No users found' });
    });
});

describe('User Controller - getDrivers', () => {
    it('should return all drivers', async () => {
        const mockDrivers = [
            { name: 'Driver One', email: 'driver1@example.com', role: 'driver' },
            { name: 'Driver Two', email: 'driver2@example.com', role: 'driver' }
        ];
        (User.find as jest.Mock).mockResolvedValueOnce(mockDrivers);

        const req = {} as any;
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as any;

        await userControllers.getDrivers(req, res);

        expect(res.send).toHaveBeenCalledWith(mockDrivers);
        expect(res.status).not.toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });
});

describe('User Controller - getById', () => {
    it('should return a user by ID successfully', async () => {
        const req = { params: { userId: '123' } } as any;
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as any;

        const mockUser = {
            userId: '123',
            name: 'John Doe',
            email: 'john.doe@example.com',
        };

        (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

        await userControllers.getById(req, res);

        expect(res.status).not.toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it('should return an error if user does not exist', async () => {
        const req = { params: { userId: 'nonexistent' } } as any;
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as any;

        (User.findOne as jest.Mock).mockResolvedValueOnce(null);

        await userControllers.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error fetching user',
        }));
    });
});

describe('User Controller - delete', () => {
    it('should delete a user successfully', async () => {
        const req = { params: { userId: '123' } } as any;
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as any;

        const mockDeletedUser = { acknowledged: true, deletedCount: 1 };

        (User.findOne as jest.Mock).mockResolvedValueOnce({ userId: '123' });
        (User.deleteOne as jest.Mock).mockResolvedValueOnce(mockDeletedUser);

        await userControllers.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.SUCCESS);
        expect(res.json).toHaveBeenCalledWith(mockDeletedUser);
    });

    it('should return an error if user does not exist', async () => {
        const req = { params: { userId: 'nonexistent' } } as any;
        const res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as any;

        (User.findOne as jest.Mock).mockResolvedValueOnce(null);

        await userControllers.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error deleting user',
        }));
    });
});



// Prueba unitaria para register
jest.mock('../../models/user.model');
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password123'),
    compare: jest.fn().mockImplementation(async (plain: string, hashed: string) => {
        return plain === 'password123' && hashed === 'hashed_password123';
    }),
}));






// Prueba unitaria para login

describe('User Controller - login', () => {
    it('should log in a user successfully', async () => {
        const req = { body: { email: 'john.doe@example.com', password: 'password123' } } as any;
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

        (User.findOne as jest.Mock).mockResolvedValueOnce({
            email: 'john.doe@example.com',
            password: 'hashed_password123',
            status: 'active',
            userId: '12345',
            role: 'user',
            name: 'John Doe',
        });

        await userControllers.login(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.SUCCESS);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            token: expect.any(String),
            message: 'Login successful',
        }));
    });
});


// Prueba unitaria para update

describe('User Controller - update', () => {
    it('should update a user successfully', async () => {
        const req = {
            params: { userId: '12345' },
            body: { name: 'Updated Name' },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        (User.findOne as jest.Mock).mockResolvedValueOnce({ userId: '12345' });
        (User.findOneAndUpdate as jest.Mock).mockResolvedValueOnce({
            userId: '12345',
            name: 'Updated Name',
        });

        await userControllers.update(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.SUCCESS);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            userId: '12345',
            name: 'Updated Name',
        }));
    });

    it('should return an error if user does not exist', async () => {
        const req = {
            params: { userId: 'nonexistent' },
            body: { name: 'Updated Name' },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as any;

        (User.findOne as jest.Mock).mockResolvedValueOnce(null);

        await userControllers.update(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error updating user',
        }));
    });
});
