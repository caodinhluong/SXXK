/**
 * Service quản lý lịch sử thông báo với localStorage
 */

const STORAGE_KEY = 'user_notification_history';
const MAX_NOTIFICATIONS = 50; // Giới hạn số lượng thông báo lưu trữ

class NotificationHistoryService {
  /**
   * Lấy tất cả thông báo từ localStorage
   */
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error reading notification history:', error);
      return [];
    }
  }

  /**
   * Thêm thông báo mới vào lịch sử
   */
  add(notification) {
    try {
      const notifications = this.getAll();
      
      const newNotification = {
        id: Date.now() + Math.random(),
        ...notification,
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Thêm vào đầu mảng
      notifications.unshift(newNotification);

      // Giới hạn số lượng
      const limitedNotifications = notifications.slice(0, MAX_NOTIFICATIONS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedNotifications));
      
      // Dispatch custom event để các component khác cập nhật
      window.dispatchEvent(new CustomEvent('notificationAdded', { 
        detail: newNotification 
      }));

      return newNotification;
    } catch (error) {
      console.error('❌ Error adding notification:', error);
      return null;
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  markAsRead(notificationId) {
    try {
      const notifications = this.getAll();
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      window.dispatchEvent(new Event('notificationUpdated'));
      return true;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  markAllAsRead() {
    try {
      const notifications = this.getAll();
      const updated = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      window.dispatchEvent(new Event('notificationUpdated'));
      return true;
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      return false;
    }
  }

  /**
   * Xóa một thông báo
   */
  remove(notificationId) {
    try {
      const notifications = this.getAll();
      const filtered = notifications.filter(n => n.id !== notificationId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      
      window.dispatchEvent(new Event('notificationUpdated'));
      return true;
    } catch (error) {
      console.error('❌ Error removing notification:', error);
      return false;
    }
  }

  /**
   * Xóa tất cả thông báo
   */
  clearAll() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new Event('notificationUpdated'));
      return true;
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      return false;
    }
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount() {
    try {
      const notifications = this.getAll();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Lấy thông báo theo loại
   */
  getByType(type) {
    try {
      const notifications = this.getAll();
      return notifications.filter(n => n.type === type);
    } catch (error) {
      console.error('❌ Error getting notifications by type:', error);
      return [];
    }
  }

  /**
   * Lấy thông báo chưa đọc
   */
  getUnread() {
    try {
      const notifications = this.getAll();
      return notifications.filter(n => !n.read);
    } catch (error) {
      console.error('❌ Error getting unread notifications:', error);
      return [];
    }
  }
}

export default new NotificationHistoryService();
