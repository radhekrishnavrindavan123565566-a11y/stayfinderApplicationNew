// Shared data store for admin API endpoints
// This is a simple in-memory store that persists across requests in the same server instance

interface Banner {
  _id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  isActive?: boolean;
  displayOrder?: number;
  impressions?: number;
  clicks?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Notification {
  _id?: string;
  title: string;
  message: string;
  channels: ('sms' | 'whatsapp' | 'push' | 'email')[];
  targetAudience: 'all' | 'owners' | 'tenants';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentCount?: number;
  scheduledAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Initialize with default data
const banners: Banner[] = [
  {
    _id: '1',
    title: 'Welcome to SST Home Solutions',
    description: 'Find your perfect home today',
    imageUrl: 'https://via.placeholder.com/1200x400?text=Welcome+Banner',
    link: '/',
    isActive: true,
    displayOrder: 1,
    impressions: 245,
    clicks: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const notifications: Notification[] = [];

// Export methods to interact with the store
export const adminStore = {
  // Banner operations
  getBanners: () => banners,
  addBanner: (banner: Banner) => {
    banners.push(banner);
    return banner;
  },
  updateBanner: (id: string, updates: Partial<Banner>) => {
    const index = banners.findIndex((b) => b._id === id);
    if (index === -1) return null;
    banners[index] = { ...banners[index], ...updates, updatedAt: new Date() };
    return banners[index];
  },
  deleteBanner: (id: string) => {
    const index = banners.findIndex((b) => b._id === id);
    if (index === -1) return null;
    const deleted = banners.splice(index, 1);
    return deleted[0];
  },

  // Notification operations
  getNotifications: () => notifications,
  addNotification: (notification: Notification) => {
    notifications.push(notification);
    return notification;
  },
  updateNotification: (id: string, updates: Partial<Notification>) => {
    const index = notifications.findIndex((n) => n._id === id);
    if (index === -1) return null;
    notifications[index] = { ...notifications[index], ...updates, updatedAt: new Date() };
    return notifications[index];
  },
  deleteNotification: (id: string) => {
    const index = notifications.findIndex((n) => n._id === id);
    if (index === -1) return null;
    const deleted = notifications.splice(index, 1);
    return deleted[0];
  },
};
