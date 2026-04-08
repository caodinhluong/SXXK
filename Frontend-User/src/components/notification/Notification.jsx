import { createRoot } from 'react-dom/client';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import notificationHistoryService from '../../services/notificationHistory.service';
import './styles.css';

let notificationContainer = null;
let notificationId = 0;
const notificationQueue = [];
const MAX_VISIBLE_NOTIFICATIONS = 5;
let activeNotifications = 0;

const createNotificationContainer = () => {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }
  return notificationContainer;
};

const NotificationItem = ({ type, message, description, onClose, duration, pausable = true }) => {
  const icons = {
    success: <CheckCircle size={24} />,
    error: <XCircle size={24} />,
    warning: <AlertTriangle size={24} />,
    info: <Info size={24} />
  };

  return (
    <div className={`notification notification-${type}`} data-pausable={pausable}>
      <div className="notification-icon">{icons[type]}</div>
      <div className="notification-content">
        <div className="notification-message">{message}</div>
        {description && <div className="notification-description">{description}</div>}
      </div>
      <button className="notification-close" onClick={onClose} aria-label="Đóng thông báo">
        <X size={20} />
      </button>
      {duration > 0 && <div className="notification-progress" style={{ animationDuration: `${duration}ms` }} />}
    </div>
  );
};

const processQueue = () => {
  if (notificationQueue.length === 0 || activeNotifications >= MAX_VISIBLE_NOTIFICATIONS) {
    return;
  }

  const notification = notificationQueue.shift();
  showNotificationImmediate(notification);
};

const showNotificationImmediate = ({ type, message, description, duration, pausable }) => {
  const container = createNotificationContainer();
  const id = ++notificationId;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'notification-wrapper';
  wrapper.id = `notification-${id}`;
  
  container.appendChild(wrapper);
  activeNotifications++;
  
  const root = createRoot(wrapper);
  
  let timeoutId = null;
  let isPaused = false;
  let remainingTime = duration;
  let startTime = Date.now();
  
  const handleClose = () => {
    if (timeoutId) clearTimeout(timeoutId);
    
    wrapper.classList.remove('notification-show');
    wrapper.classList.add('notification-exit');
    
    setTimeout(() => {
      root.unmount();
      wrapper.remove();
      activeNotifications--;
      processQueue(); // Process next notification in queue
    }, 300);
  };
  
  const startTimer = () => {
    if (duration > 0) {
      startTime = Date.now();
      timeoutId = setTimeout(handleClose, remainingTime);
    }
  };
  
  const pauseTimer = () => {
    if (pausable && timeoutId && !isPaused) {
      clearTimeout(timeoutId);
      remainingTime -= Date.now() - startTime;
      isPaused = true;
    }
  };
  
  const resumeTimer = () => {
    if (pausable && isPaused) {
      isPaused = false;
      startTimer();
    }
  };
  
  // Add hover listeners for pause/resume
  if (pausable && duration > 0) {
    wrapper.addEventListener('mouseenter', pauseTimer);
    wrapper.addEventListener('mouseleave', resumeTimer);
  }
  
  root.render(
    <NotificationItem 
      type={type} 
      message={message} 
      description={description}
      onClose={handleClose}
      duration={duration}
      pausable={pausable}
    />
  );
  
  setTimeout(() => {
    wrapper.classList.add('notification-show');
  }, 10);
  
  startTimer();
};

const showNotification = (type, message, description, options = {}) => {
  const {
    duration = 4000, // Default 4 seconds
    pausable = true,
    priority = false // High priority notifications skip queue
  } = options;

  // Lưu vào lịch sử
  notificationHistoryService.add({
    type,
    message,
    description,
  });

  const notification = { type, message, description, duration, pausable };

  if (priority || activeNotifications < MAX_VISIBLE_NOTIFICATIONS) {
    showNotificationImmediate(notification);
  } else {
    notificationQueue.push(notification);
  }
};

export const showSuccess = (message, description, options) => showNotification('success', message, description, options);
export const showError = (message, description, options) => showNotification('error', message, description, { ...options, duration: options?.duration || 5000 });
export const showWarning = (message, description, options) => showNotification('warning', message, description, options);
export const showInfo = (message, description, options) => showNotification('info', message, description, options);

export const showCreateSuccess = (itemName = 'dữ liệu') => {
  showSuccess('Thêm mới thành công', `${itemName} đã được thêm vào hệ thống`);
};

export const showUpdateSuccess = (itemName = 'dữ liệu') => {
  showSuccess('Cập nhật thành công', `${itemName} đã được cập nhật`);
};

export const showDeleteSuccess = (itemName = 'dữ liệu') => {
  showSuccess('Xóa thành công', `${itemName} đã được xóa khỏi hệ thống`);
};

export const showLoadError = (itemName = 'dữ liệu', errorDetail = null) => {
  const description = errorDetail 
    ? `Đã xảy ra lỗi khi tải ${itemName}: ${errorDetail}` 
    : `Đã xảy ra lỗi khi tải ${itemName}. Vui lòng thử lại.`;
  showError('Không thể tải dữ liệu', description);
};

export const showSaveError = (itemName = 'dữ liệu', errorDetail = null) => {
  const description = errorDetail 
    ? `Đã xảy ra lỗi khi lưu ${itemName}: ${errorDetail}` 
    : `Đã xảy ra lỗi khi lưu ${itemName}. Vui lòng kiểm tra lại thông tin.`;
  showError('Không thể lưu', description);
};

export const showDeleteError = (itemName = 'dữ liệu', errorDetail = null) => {
  const description = errorDetail 
    ? `Đã xảy ra lỗi khi xóa ${itemName}: ${errorDetail}` 
    : `Đã xảy ra lỗi khi xóa ${itemName}. Vui lòng thử lại.`;
  showError('Không thể xóa', description);
};

export const showApproveSuccess = (itemName = 'doanh nghiệp') => {
  showSuccess('Duyệt thành công', `${itemName} đã được phê duyệt`);
};

export const showRejectSuccess = (itemName = 'doanh nghiệp') => {
  showWarning('Đã từ chối', `${itemName} đã bị từ chối`);
};

export const showUploadSuccess = (fileName = 'file') => {
  showSuccess('Upload thành công', `${fileName} đã được tải lên`);
};

export const showUploadError = () => {
  showError('Upload thất bại', 'Không thể tải file lên. Vui lòng kiểm tra định dạng và kích thước file.');
};

// HTTP Error Handlers
export const showValidationError = (errors) => {
  if (typeof errors === 'string') {
    showError('Dữ liệu không hợp lệ', errors, { duration: 6000 });
  } else if (Array.isArray(errors)) {
    const errorList = errors.map(err => `• ${err}`).join('\n');
    showError('Dữ liệu không hợp lệ', errorList, { duration: 6000 });
  } else if (typeof errors === 'object') {
    const errorList = Object.entries(errors)
      .map(([field, message]) => `• ${field}: ${message}`)
      .join('\n');
    showError('Dữ liệu không hợp lệ', errorList, { duration: 6000 });
  } else {
    showError('Dữ liệu không hợp lệ', 'Vui lòng kiểm tra lại thông tin đã nhập');
  }
};

export const showForbiddenError = (action = 'thực hiện thao tác này') => {
  showError('Không có quyền truy cập', `Bạn không có quyền ${action}. Vui lòng liên hệ quản trị viên.`, { duration: 5000 });
};

export const showNotFoundError = (itemName = 'dữ liệu') => {
  showError('Không tìm thấy', `${itemName} không tồn tại hoặc đã bị xóa.`);
};

export const showServerError = () => {
  showError('Lỗi máy chủ', 'Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.', { duration: 6000 });
};

export const showNetworkError = () => {
  showError('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.', { duration: 6000, priority: true });
};

// Generic API Error Handler
export const showApiError = (error, defaultMessage = 'Đã xảy ra lỗi') => {
  if (!error) {
    showError(defaultMessage, 'Vui lòng thử lại sau.');
    return;
  }

  const status = error.status || error.response?.status;
  const errorData = error.response?.data || error.data || error;
  const errorMessage = errorData.message || errorData.error || error.message;

  switch (status) {
    case 400:
      // Validation errors
      if (errorData.errors) {
        showValidationError(errorData.errors);
      } else {
        showError('Dữ liệu không hợp lệ', errorMessage || 'Vui lòng kiểm tra lại thông tin đã nhập');
      }
      break;
    
    case 401:
      // Handled by interceptor, but show message if needed
      showWarning('Phiên làm việc hết hạn', 'Vui lòng đăng nhập lại', { priority: true });
      break;
    
    case 403:
      showForbiddenError();
      break;
    
    case 404:
      showNotFoundError();
      break;
    
    case 409:
      // Conflict - e.g., duplicate entry
      showError('Xung đột dữ liệu', errorMessage || 'Dữ liệu đã tồn tại trong hệ thống');
      break;
    
    case 422:
      // Unprocessable Entity - validation error
      if (errorData.errors) {
        showValidationError(errorData.errors);
      } else {
        showError('Không thể xử lý', errorMessage || 'Dữ liệu không đúng định dạng');
      }
      break;
    
    case 500:
    case 502:
    case 503:
      showServerError();
      break;
    
    default:
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        showNetworkError();
      } else {
        showError(defaultMessage, errorMessage || 'Vui lòng thử lại sau.');
      }
  }
};
