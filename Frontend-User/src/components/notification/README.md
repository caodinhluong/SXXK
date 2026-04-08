# Hệ Thống Thông Báo - Notification System

Hệ thống thông báo chuyên nghiệp với lưu trữ lịch sử vào localStorage, queue management, và auto-dismiss với pause on hover.

## Tính Năng

✅ **Thông báo toast** - Hiển thị thông báo tạm thời trên màn hình với animation mượt mà
✅ **Notification Queue** - Quản lý hàng đợi thông báo, tối đa 5 thông báo hiển thị cùng lúc
✅ **Auto-dismiss** - Tự động đóng sau thời gian cấu hình (mặc định 4s)
✅ **Pause on hover** - Tạm dừng auto-dismiss khi hover chuột
✅ **Progress bar** - Hiển thị thời gian còn lại trước khi đóng
✅ **Priority notifications** - Thông báo ưu tiên bỏ qua hàng đợi
✅ **Lịch sử thông báo** - Lưu trữ và hiển thị lịch sử trong dropdown
✅ **LocalStorage** - Tự động lưu vào localStorage
✅ **Đánh dấu đã đọc** - Quản lý trạng thái đọc/chưa đọc
✅ **Xóa thông báo** - Xóa từng thông báo hoặc xóa tất cả
✅ **Real-time update** - Cập nhật tự động khi có thông báo mới
✅ **Responsive** - Tương thích mobile với animation khác biệt
✅ **Dark mode** - Hỗ trợ dark mode tự động
✅ **Accessibility** - Hỗ trợ reduced motion và keyboard navigation

## Sử Dụng

### 1. Hiển thị thông báo toast cơ bản

```javascript
import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo 
} from '@/components/notification/Notification';

// Thông báo thành công (4s)
showSuccess('Thành công', 'Dữ liệu đã được lưu');

// Thông báo lỗi (5s - lâu hơn để đọc)
showError('Lỗi', 'Không thể kết nối đến server');

// Thông báo cảnh báo (4s)
showWarning('Cảnh báo', 'Dữ liệu chưa được lưu');

// Thông báo thông tin (4s)
showInfo('Thông tin', 'Hệ thống sẽ bảo trì vào 2h sáng');
```

### 2. Thông báo với options tùy chỉnh

```javascript
// Thông báo với thời gian tùy chỉnh
showSuccess('Thành công', 'Đã lưu', { duration: 2000 }); // 2 giây

// Thông báo không tự động đóng
showError('Lỗi nghiêm trọng', 'Cần xử lý ngay', { duration: 0 });

// Thông báo không pause được (luôn đóng sau duration)
showInfo('Đang xử lý...', null, { pausable: false });

// Thông báo ưu tiên (bỏ qua queue, hiển thị ngay)
showError('Mất kết nối', 'Kiểm tra internet', { 
  duration: 6000, 
  priority: true 
});
```

### 3. Sử dụng các helper functions

```javascript
import {
  showCreateSuccess,
  showUpdateSuccess,
  showDeleteSuccess,
  showLoadError,
  showSaveError,
  showDeleteError,
  showApproveSuccess,
  showRejectSuccess,
  showUploadSuccess,
  showUploadError,
  showValidationError,
  showForbiddenError,
  showNotFoundError,
  showServerError,
  showNetworkError,
  showApiError,
} from '@/components/notification/Notification';

// CRUD operations
showCreateSuccess('Kho');
showUpdateSuccess('Sản phẩm');
showDeleteSuccess('Tờ khai');

// Error handling
showLoadError('danh sách kho');
showSaveError('phiếu nhập', 'Số lượng không hợp lệ');
showDeleteError('hợp đồng');

// Approval workflow
showApproveSuccess('Doanh nghiệp ABC');
showRejectSuccess('Đơn hàng #123');

// Upload
showUploadSuccess('document.pdf');
showUploadError();

// HTTP errors
showValidationError({ 
  email: 'Email không hợp lệ',
  phone: 'Số điện thoại phải có 10 số'
});
showForbiddenError('xóa dữ liệu này');
showNotFoundError('Hợp đồng');
showServerError();
showNetworkError(); // Priority notification

// Generic API error handler
try {
  await api.post('/data', payload);
} catch (error) {
  showApiError(error, 'Không thể lưu dữ liệu');
}
```

### 4. Quản lý lịch sử thông báo

```javascript
import notificationHistoryService from '@/services/notificationHistory.service';

// Lấy tất cả thông báo
const allNotifications = notificationHistoryService.getAll();

// Lấy số lượng chưa đọc
const unreadCount = notificationHistoryService.getUnreadCount();

// Lấy thông báo chưa đọc
const unreadNotifications = notificationHistoryService.getUnread();

// Lấy theo loại
const errorNotifications = notificationHistoryService.getByType('error');

// Đánh dấu đã đọc
notificationHistoryService.markAsRead(notificationId);

// Đánh dấu tất cả đã đọc
notificationHistoryService.markAllAsRead();

// Xóa một thông báo
notificationHistoryService.remove(notificationId);

// Xóa tất cả
notificationHistoryService.clearAll();
```

### 5. Sử dụng Custom Hook

```javascript
import useNotification from '@/hooks/useNotification';

function MyComponent() {
  const { notifications, unreadCount, refresh } = useNotification();

  return (
    <div>
      <p>Bạn có {unreadCount} thông báo chưa đọc</p>
      <button onClick={refresh}>Làm mới</button>
    </div>
  );
}
```

### 6. Component NotificationCenter

Component này đã được tích hợp sẵn vào Header. Nó hiển thị:
- Badge với số lượng thông báo chưa đọc
- Dropdown với danh sách thông báo
- Các nút hành động (đánh dấu đã đọc, xóa)

## Cấu Trúc Dữ Liệu

### Notification Object

```javascript
{
  id: 1234567890.123,           // Unique ID
  type: 'success',               // 'success' | 'error' | 'warning' | 'info'
  message: 'Thành công',         // Tiêu đề
  description: 'Đã lưu dữ liệu', // Mô tả (optional)
  timestamp: '2025-12-20T...',   // ISO timestamp
  read: false                    // Trạng thái đọc
}
```

### Options Object

```javascript
{
  duration: 4000,    // Thời gian hiển thị (ms), 0 = không tự động đóng
  pausable: true,    // Cho phép pause khi hover
  priority: false    // Ưu tiên hiển thị ngay, bỏ qua queue
}
```

## Queue Management

- **Max visible**: 5 thông báo cùng lúc
- **Queue behavior**: Thông báo mới được thêm vào queue nếu đã đủ 5
- **Auto-process**: Khi một thông báo đóng, thông báo tiếp theo trong queue tự động hiển thị
- **Priority**: Thông báo có `priority: true` bỏ qua queue và hiển thị ngay

## Auto-dismiss Behavior

- **Default duration**: 
  - Success: 4s
  - Error: 5s (lâu hơn để đọc thông tin lỗi)
  - Warning: 4s
  - Info: 4s
- **Pause on hover**: Tự động tạm dừng khi di chuột vào
- **Resume on leave**: Tiếp tục đếm ngược khi di chuột ra
- **Progress bar**: Hiển thị thời gian còn lại
- **Manual close**: Luôn có thể đóng bằng nút X

## LocalStorage

- **Key**: `user_notification_history`
- **Giới hạn**: 50 thông báo gần nhất
- **Format**: JSON array

## Events

Hệ thống dispatch các custom events:

- `notificationAdded` - Khi có thông báo mới
- `notificationUpdated` - Khi thông báo được cập nhật

## Styling

Các file CSS:
- `styles.css` - Toast notification styles với animations, progress bar, dark mode

### CSS Variables

```css
--bg-card: Background color của notification
--text-primary: Màu text chính
--text-secondary: Màu text phụ
```

### Animations

- **Slide in**: Từ phải sang trái với scale effect
- **Slide out**: Từ trái sang phải với fade
- **Hover**: Lift effect với shadow
- **Mobile**: Slide từ trên xuống
- **Progress bar**: Linear countdown animation

## Accessibility

- **Keyboard**: Có thể đóng bằng phím Escape (nếu focus)
- **ARIA labels**: Nút đóng có aria-label
- **Reduced motion**: Tự động giảm animation nếu user bật reduced motion
- **Color contrast**: Đảm bảo contrast ratio đạt WCAG AA
- **Screen reader**: Thông báo được announce

## Best Practices

1. **Sử dụng helper functions** thay vì gọi trực tiếp `showNotification`
2. **Cung cấp mô tả rõ ràng** để người dùng hiểu ngữ cảnh
3. **Không spam thông báo** - Chỉ hiển thị khi cần thiết
4. **Sử dụng đúng loại** - success/error/warning/info
5. **Error messages**: Dài hơn (5-6s) để user có thời gian đọc
6. **Critical errors**: Sử dụng `priority: true` và `duration: 0` (không tự động đóng)
7. **Network errors**: Luôn dùng priority để thông báo ngay
8. **Validation errors**: Hiển thị chi tiết từng field
9. **Test trên mobile** - Đảm bảo responsive
10. **Test dark mode** - Kiểm tra contrast

## Ví Dụ Thực Tế

### CRUD Operations

```javascript
// Trong component Kho.jsx
import { 
  showCreateSuccess, 
  showSaveError,
  showApiError 
} from '@/components/notification/Notification';

const handleCreate = async (values) => {
  try {
    await api.post('/kho', values);
    showCreateSuccess('Kho');
    fetchData();
  } catch (error) {
    showApiError(error, 'Không thể tạo kho');
  }
};
```

### Form Validation

```javascript
const handleSubmit = async (values) => {
  try {
    await api.post('/data', values);
    showSuccess('Đã lưu', 'Dữ liệu đã được cập nhật');
  } catch (error) {
    if (error.status === 400 && error.errors) {
      showValidationError(error.errors);
    } else {
      showApiError(error);
    }
  }
};
```

### Critical Error

```javascript
const handleCriticalOperation = async () => {
  try {
    await api.delete('/important-data');
  } catch (error) {
    showError(
      'Lỗi nghiêm trọng', 
      'Không thể xóa dữ liệu. Vui lòng liên hệ IT ngay.',
      { duration: 0, priority: true } // Không tự động đóng
    );
  }
};
```

### Loading State

```javascript
const handleLongOperation = async () => {
  showInfo('Đang xử lý...', 'Vui lòng đợi', { 
    duration: 0, 
    pausable: false 
  });
  
  try {
    await longRunningOperation();
    showSuccess('Hoàn thành', 'Đã xử lý xong');
  } catch (error) {
    showApiError(error);
  }
};
```

## Troubleshooting

### Thông báo không hiển thị
- Kiểm tra z-index của các element khác
- Đảm bảo CSS được import
- Kiểm tra console có lỗi không

### Thông báo bị chồng lên nhau
- Đã được xử lý bởi queue system
- Max 5 notifications cùng lúc

### Animation không mượt
- Kiểm tra performance của browser
- Reduced motion có thể đang bật

### Dark mode không hoạt động
- Đảm bảo CSS variables được định nghĩa
- Kiểm tra `prefers-color-scheme` media query

