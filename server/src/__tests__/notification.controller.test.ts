import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController';

jest.mock('../models', () => ({
  Notification: {
    findAndCountAll: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

import { Notification } from '../models';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('notificationController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getNotifications', () => {
    it('should return notifications with pagination and unread count', async () => {
      const mockNotifications = [
        { id: 1, title: 'Test', isRead: false },
        { id: 2, title: 'Test 2', isRead: true },
      ];
      const req: any = { user: { userId: 1 }, query: { page: 1, limit: 20 } };
      const res = mockResponse();

      (Notification.findAndCountAll as jest.Mock).mockResolvedValue({ count: 2, rows: mockNotifications });
      (Notification.count as jest.Mock).mockResolvedValue(1);

      await getNotifications(req, res);

      expect(res.json).toHaveBeenCalledWith({
        notifications: mockNotifications,
        unreadCount: 1,
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
      });
    });

    it('should filter unread only when specified', async () => {
      const req: any = { user: { userId: 1 }, query: { unreadOnly: 'true', page: 1, limit: 20 } };
      const res = mockResponse();

      (Notification.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });
      (Notification.count as jest.Mock).mockResolvedValue(0);

      await getNotifications(req, res);

      expect(Notification.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1, isRead: false },
        }),
      );
    });

    it('should use default pagination', async () => {
      const req: any = { user: { userId: 1 }, query: {} };
      const res = mockResponse();

      (Notification.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });
      (Notification.count as jest.Mock).mockResolvedValue(0);

      await getNotifications(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({ page: 1, limit: 20 }),
        }),
      );
    });

    it('should return 500 on error', async () => {
      const req: any = { user: { userId: 1 }, query: {} };
      const res = mockResponse();

      (Notification.findAndCountAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      await getNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('markAsRead', () => {
    it('should return 404 if notification not found', async () => {
      const req: any = { user: { userId: 1 }, params: { id: '999' } };
      const res = mockResponse();

      (Notification.findOne as jest.Mock).mockResolvedValue(null);

      await markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });

    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 1,
        update: jest.fn().mockResolvedValue(true),
      };
      const req: any = { user: { userId: 1 }, params: { id: '1' } };
      const res = mockResponse();

      (Notification.findOne as jest.Mock).mockResolvedValue(mockNotification);

      await markAsRead(req, res);

      expect(mockNotification.update).toHaveBeenCalledWith(
        expect.objectContaining({ isRead: true, readAt: expect.any(Date) }),
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification marked as read' });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for the user', async () => {
      const req: any = { user: { userId: 1 } };
      const res = mockResponse();

      (Notification.update as jest.Mock).mockResolvedValue([5]);

      await markAllAsRead(req, res);

      expect(Notification.update).toHaveBeenCalledWith(
        expect.objectContaining({ isRead: true, readAt: expect.any(Date) }),
        { where: { userId: 1, isRead: false } },
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'All notifications marked as read' });
    });

    it('should return 500 on error', async () => {
      const req: any = { user: { userId: 1 } };
      const res = mockResponse();

      (Notification.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      await markAllAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteNotification', () => {
    it('should return 404 if notification not found', async () => {
      const req: any = { user: { userId: 1 }, params: { id: '999' } };
      const res = mockResponse();

      (Notification.destroy as jest.Mock).mockResolvedValue(0);

      await deleteNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });

    it('should delete notification successfully', async () => {
      const req: any = { user: { userId: 1 }, params: { id: '1' } };
      const res = mockResponse();

      (Notification.destroy as jest.Mock).mockResolvedValue(1);

      await deleteNotification(req, res);

      expect(Notification.destroy).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification deleted' });
    });
  });
});
