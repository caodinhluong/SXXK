/**
 * Service xuất dữ liệu thông báo
 */

import notificationHistoryService from './notificationHistory.service';

class NotificationExportService {
  /**
   * Xuất thông báo ra JSON file
   */
  exportToJSON() {
    try {
      const notifications = notificationHistoryService.getAll();
      const dataStr = JSON.stringify(notifications, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notifications_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('❌ Error exporting to JSON:', error);
      return false;
    }
  }

  /**
   * Xuất thông báo ra CSV file
   */
  exportToCSV() {
    try {
      const notifications = notificationHistoryService.getAll();
      
      // CSV header
      let csv = 'ID,Loại,Tiêu đề,Mô tả,Thời gian,Trạng thái\n';
      
      // CSV rows
      notifications.forEach(n => {
        const row = [
          n.id,
          n.type,
          `"${n.message.replace(/"/g, '""')}"`,
          `"${(n.description || '').replace(/"/g, '""')}"`,
          new Date(n.timestamp).toLocaleString('vi-VN'),
          n.read ? 'Đã đọc' : 'Chưa đọc',
        ].join(',');
        csv += row + '\n';
      });
      
      // Add BOM for UTF-8
      const BOM = '\uFEFF';
      const dataBlob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notifications_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('❌ Error exporting to CSV:', error);
      return false;
    }
  }

  /**
   * Xuất thông báo ra Text file
   */
  exportToText() {
    try {
      const notifications = notificationHistoryService.getAll();
      
      let text = '=== LỊCH SỬ THÔNG BÁO ===\n\n';
      
      notifications.forEach((n, index) => {
        text += `${index + 1}. [${n.type.toUpperCase()}] ${n.message}\n`;
        if (n.description) {
          text += `   ${n.description}\n`;
        }
        text += `   Thời gian: ${new Date(n.timestamp).toLocaleString('vi-VN')}\n`;
        text += `   Trạng thái: ${n.read ? 'Đã đọc' : 'Chưa đọc'}\n\n`;
      });
      
      const dataBlob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notifications_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('❌ Error exporting to text:', error);
      return false;
    }
  }

  /**
   * Import thông báo từ JSON file
   */
  async importFromJSON(file) {
    try {
      const text = await file.text();
      const notifications = JSON.parse(text);
      
      if (!Array.isArray(notifications)) {
        throw new Error('Invalid format');
      }
      
      // Validate and import
      notifications.forEach(n => {
        if (n.type && n.message) {
          notificationHistoryService.add({
            type: n.type,
            message: n.message,
            description: n.description,
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error importing from JSON:', error);
      return false;
    }
  }

  /**
   * Lấy thống kê thông báo
   */
  getStatistics() {
    try {
      const notifications = notificationHistoryService.getAll();
      
      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        read: notifications.filter(n => n.read).length,
        byType: {
          success: notifications.filter(n => n.type === 'success').length,
          error: notifications.filter(n => n.type === 'error').length,
          warning: notifications.filter(n => n.type === 'warning').length,
          info: notifications.filter(n => n.type === 'info').length,
        },
        today: notifications.filter(n => {
          const date = new Date(n.timestamp);
          const today = new Date();
          return date.toDateString() === today.toDateString();
        }).length,
        thisWeek: notifications.filter(n => {
          const date = new Date(n.timestamp);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date >= weekAgo;
        }).length,
      };
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      return {
        total: 0,
        unread: 0,
        read: 0,
        byType: { success: 0, error: 0, warning: 0, info: 0 },
        today: 0,
        thisWeek: 0,
      };
    }
  }
}

export default new NotificationExportService();
