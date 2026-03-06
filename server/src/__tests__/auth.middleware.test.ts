import jwt from 'jsonwebtoken';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';
import { UserRole } from '../types';

// Mock the User model
jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

import { User } from '../models';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('authenticateToken middleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    const req = { headers: {} } as AuthRequest;
    const res = mockResponse();

    await authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access token required' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header has no token', async () => {
    const req = { headers: { authorization: 'Bearer ' } } as AuthRequest;
    const res = mockResponse();

    await authenticateToken(req, res, mockNext);

    // 'Bearer '.split(' ')[1] is '' which is falsy
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', async () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } } as AuthRequest;
    const res = mockResponse();

    await authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if user not found', async () => {
    const token = jwt.sign(
      { userId: 999, email: 'test@test.com', role: UserRole.CLINICIAN, facilityId: 1 },
      JWT_SECRET,
    );
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const res = mockResponse();

    (User.findByPk as jest.Mock).mockResolvedValue(null);

    await authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or inactive user' });
  });

  it('should return 401 if user is inactive', async () => {
    const token = jwt.sign(
      { userId: 1, email: 'test@test.com', role: UserRole.CLINICIAN, facilityId: 1 },
      JWT_SECRET,
    );
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const res = mockResponse();

    (User.findByPk as jest.Mock).mockResolvedValue({ isActive: false });

    await authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or inactive user' });
  });

  it('should call next and set req.user for valid token and active user', async () => {
    const payload = { userId: 1, email: 'test@test.com', role: UserRole.CLINICIAN, facilityId: 1 };
    const token = jwt.sign(payload, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const res = mockResponse();

    (User.findByPk as jest.Mock).mockResolvedValue({ isActive: true });

    await authenticateToken(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user?.userId).toBe(1);
    expect(req.user?.email).toBe('test@test.com');
    expect(req.user?.role).toBe(UserRole.CLINICIAN);
  });
});

describe('authorizeRoles middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if req.user is not set', () => {
    const req = {} as AuthRequest;
    const res = mockResponse();
    const middleware = authorizeRoles(UserRole.SPECIALIST);

    middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
  });

  it('should return 403 if user role is not in allowed roles', () => {
    const req = {
      user: { userId: 1, email: 'a@b.com', role: UserRole.CLINICIAN, facilityId: 1 },
    } as AuthRequest;
    const res = mockResponse();
    const middleware = authorizeRoles(UserRole.SPECIALIST, UserRole.ADMINISTRATOR);

    middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
  });

  it('should call next if user role is in allowed roles', () => {
    const req = {
      user: { userId: 1, email: 'a@b.com', role: UserRole.SPECIALIST, facilityId: 1 },
    } as AuthRequest;
    const res = mockResponse();
    const middleware = authorizeRoles(UserRole.SPECIALIST, UserRole.ADMINISTRATOR);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should work with a single role', () => {
    const req = {
      user: { userId: 1, email: 'a@b.com', role: UserRole.ADMINISTRATOR, facilityId: 1 },
    } as AuthRequest;
    const res = mockResponse();
    const middleware = authorizeRoles(UserRole.ADMINISTRATOR);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
