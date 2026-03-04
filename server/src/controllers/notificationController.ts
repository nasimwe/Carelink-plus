import { Response } from 'express';
import { Notification } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const where: any = { userId: req.user?.userId };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user?.userId, isRead: false },
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const notification = await Notification.findOne({
      where: { id, userId: req.user?.userId },
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    await notification.update({ isRead: true, readAt: new Date() });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user?.userId, isRead: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const result = await Notification.destroy({
      where: { id, userId: req.user?.userId },
    });

    if (!result) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
