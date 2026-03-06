import jwt from 'jsonwebtoken';
import { login, getProfile, changePassword } from '../controllers/authController';
import { UserRole } from '../types';

jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
  Facility: {},
}));

import { User } from '../models';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('should return 400 if email is missing', async () => {
      const req: any = { body: { password: 'pass' } };
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });

    it('should return 400 if password is missing', async () => {
      const req: any = { body: { email: 'test@test.com' } };
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });

    it('should return 401 if user not found', async () => {
      const req: any = { body: { email: 'unknown@test.com', password: 'pass' } };
      const res = mockResponse();

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 401 if account is deactivated', async () => {
      const req: any = { body: { email: 'test@test.com', password: 'pass' } };
      const res = mockResponse();

      (User.findOne as jest.Mock).mockResolvedValue({ isActive: false });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account is deactivated' });
    });

    it('should return 401 if password is invalid', async () => {
      const req: any = { body: { email: 'test@test.com', password: 'wrong' } };
      const res = mockResponse();

      (User.findOne as jest.Mock).mockResolvedValue({
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(false),
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return token and user on successful login', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CLINICIAN,
        specialty: 'General',
        facilityId: 1,
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockReturnValue({ id: 1, name: 'Test Facility' }),
      };
      const req: any = { body: { email: 'test@test.com', password: 'correct' } };
      const res = mockResponse();

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await login(req, res);

      expect(mockUser.validatePassword).toHaveBeenCalledWith('correct');
      expect(mockUser.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          token: expect.any(String),
          user: expect.objectContaining({
            id: 1,
            email: 'test@test.com',
            firstName: 'John',
            lastName: 'Doe',
            role: UserRole.CLINICIAN,
          }),
        }),
      );
    });

    it('should return 500 on unexpected error', async () => {
      const req: any = { body: { email: 'test@test.com', password: 'pass' } };
      const res = mockResponse();

      (User.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getProfile', () => {
    it('should return 404 if user not found', async () => {
      const req: any = { user: { userId: 999 } };
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return user profile successfully', async () => {
      const mockUser = { id: 1, email: 'test@test.com', firstName: 'John' };
      const req: any = { user: { userId: 1 } };
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 500 on unexpected error', async () => {
      const req: any = { user: { userId: 1 } };
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'));

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('changePassword', () => {
    it('should return 400 if currentPassword is missing', async () => {
      const req: any = { user: { userId: 1 }, body: { newPassword: 'new' } };
      const res = mockResponse();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Current and new password are required' });
    });

    it('should return 400 if newPassword is missing', async () => {
      const req: any = { user: { userId: 1 }, body: { currentPassword: 'old' } };
      const res = mockResponse();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not found', async () => {
      const req: any = { user: { userId: 999 }, body: { currentPassword: 'old', newPassword: 'new' } };
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 401 if current password is wrong', async () => {
      const req: any = { user: { userId: 1 }, body: { currentPassword: 'wrong', newPassword: 'new' } };
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockResolvedValue({
        validatePassword: jest.fn().mockResolvedValue(false),
      });

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Current password is incorrect' });
    });

    it('should change password successfully', async () => {
      const mockUser = {
        validatePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true),
      };
      const req: any = { user: { userId: 1 }, body: { currentPassword: 'old', newPassword: 'new' } };
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await changePassword(req, res);

      expect(mockUser.update).toHaveBeenCalledWith({ password: 'new' });
      expect(res.json).toHaveBeenCalledWith({ message: 'Password changed successfully' });
    });
  });
});
