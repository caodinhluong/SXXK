import React, { useState } from 'react';
import { Card, Button, Space, Divider, InputNumber, Switch, Typography, Row, Col } from 'antd';
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showCreateSuccess,
  showUpdateSuccess,
  showDeleteSuccess,
  showLoadError,
  showSaveError,
  showValidationError,
  showForbiddenError,
  showNotFoundError,
  showServerError,
  showNetworkError,
} from './Notification';

const { Title, Paragraph, Text } = Typography;

const NotificationDemo = () => {
  const [duration, setDuration] = useState(4000);
  const [pausable, setPausable] = useState(true);
  const [priority, setPriority] = useState(false);

  const options = { duration, pausable, priority };

  const handleBasicNotifications = (type) => {
    const messages = {
      success: ['Thành công!', 'Thao tác đã được thực hiện thành công'],
      error: ['Có lỗi xảy ra!', 'Không thể hoàn thành thao tác. Vui lòng thử lại.'],
      warning: ['Cảnh báo!', 'Bạn nên kiểm tra lại thông tin trước khi tiếp tục'],
      info: ['Thông tin', 'Hệ thống sẽ bảo trì vào 2h sáng ngày mai'],
    };

    const [message, description] = messages[type];
    
    switch (type) {
      case 'success':
        showSuccess(message, description, options);
        break;
      case 'error':
        showError(message, description, options);
        break;
      case 'warning':
        showWarning(message, description, options);
        break;
      case 'info':
        showInfo(message, description, options);
        break;
      default:
        break;
    }
  };

  const handleMultipleNotifications = () => {
    // Test queue system
    for (let i = 1; i <= 8; i++) {
      setTimeout(() => {
        showInfo(`Thông báo ${i}`, `Đây là thông báo số ${i} để test queue system`);
      }, i * 200);
    }
  };

  const handleLongMessage = () => {
    showError(
      'Lỗi validation',
      'Email không hợp lệ\nSố điện thoại phải có 10 số\nMật khẩu phải có ít nhất 8 ký tự\nTên không được để trống',
      { duration: 8000 }
    );
  };

  const handleNoDismiss = () => {
    showError(
      'Lỗi nghiêm trọng',
      'Không thể kết nối đến database. Vui lòng liên hệ IT ngay.',
      { duration: 0, priority: true }
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🔔 Notification System Demo</Title>
      <Paragraph>
        Test và demo các tính năng của hệ thống thông báo được cải tiến.
      </Paragraph>

      <Divider />

      {/* Configuration */}
      <Card title="⚙️ Cấu hình" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Duration (ms)</Text>
              <InputNumber
                value={duration}
                onChange={setDuration}
                min={0}
                max={10000}
                step={1000}
                style={{ width: '100%' }}
              />
              <Text type="secondary">0 = không tự động đóng</Text>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical">
              <Text strong>Pausable</Text>
              <Switch checked={pausable} onChange={setPausable} />
              <Text type="secondary">Pause khi hover</Text>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical">
              <Text strong>Priority</Text>
              <Switch checked={priority} onChange={setPriority} />
              <Text type="secondary">Bỏ qua queue</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Basic Notifications */}
      <Card title="🎨 Basic Notifications" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button type="primary" onClick={() => handleBasicNotifications('success')}>
            Success
          </Button>
          <Button danger onClick={() => handleBasicNotifications('error')}>
            Error
          </Button>
          <Button style={{ background: '#faad14', color: 'white' }} onClick={() => handleBasicNotifications('warning')}>
            Warning
          </Button>
          <Button type="default" onClick={() => handleBasicNotifications('info')}>
            Info
          </Button>
        </Space>
      </Card>

      {/* Helper Functions */}
      <Card title="🛠️ Helper Functions" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button onClick={() => showCreateSuccess('Kho')}>Create Success</Button>
          <Button onClick={() => showUpdateSuccess('Sản phẩm')}>Update Success</Button>
          <Button onClick={() => showDeleteSuccess('Tờ khai')}>Delete Success</Button>
          <Button onClick={() => showLoadError('danh sách')}>Load Error</Button>
          <Button onClick={() => showSaveError('phiếu nhập', 'Số lượng không hợp lệ')}>
            Save Error
          </Button>
        </Space>
      </Card>

      {/* HTTP Error Handlers */}
      <Card title="🌐 HTTP Error Handlers" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button onClick={() => showValidationError({ email: 'Email không hợp lệ', phone: 'SĐT phải 10 số' })}>
            Validation Error
          </Button>
          <Button onClick={() => showForbiddenError('xóa dữ liệu này')}>
            403 Forbidden
          </Button>
          <Button onClick={() => showNotFoundError('Hợp đồng')}>
            404 Not Found
          </Button>
          <Button onClick={() => showServerError()}>
            500 Server Error
          </Button>
          <Button onClick={() => showNetworkError()}>
            Network Error (Priority)
          </Button>
        </Space>
      </Card>

      {/* Special Cases */}
      <Card title="🎯 Special Cases" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button onClick={handleMultipleNotifications}>
            Multiple Notifications (Test Queue)
          </Button>
          <Button onClick={handleLongMessage}>
            Long Message (8s)
          </Button>
          <Button danger onClick={handleNoDismiss}>
            No Auto-dismiss (Critical)
          </Button>
        </Space>
      </Card>

      {/* Features */}
      <Card title="✨ Features" style={{ marginBottom: 24 }}>
        <ul>
          <li>✅ <strong>Queue Management:</strong> Tối đa 5 thông báo hiển thị cùng lúc</li>
          <li>✅ <strong>Auto-dismiss:</strong> Tự động đóng sau thời gian cấu hình</li>
          <li>✅ <strong>Pause on Hover:</strong> Tạm dừng countdown khi hover (nếu pausable=true)</li>
          <li>✅ <strong>Progress Bar:</strong> Hiển thị thời gian còn lại</li>
          <li>✅ <strong>Priority:</strong> Thông báo ưu tiên bỏ qua queue</li>
          <li>✅ <strong>Smooth Animations:</strong> Slide in/out với scale effect</li>
          <li>✅ <strong>Responsive:</strong> Khác biệt animation trên mobile</li>
          <li>✅ <strong>Dark Mode:</strong> Tự động adapt theo system preference</li>
          <li>✅ <strong>Accessibility:</strong> Reduced motion support</li>
        </ul>
      </Card>

      {/* Usage Tips */}
      <Card title="💡 Usage Tips">
        <ul>
          <li><strong>Success:</strong> 4s duration (default)</li>
          <li><strong>Error:</strong> 5s duration (longer to read)</li>
          <li><strong>Critical errors:</strong> duration=0, priority=true</li>
          <li><strong>Network errors:</strong> Always use priority=true</li>
          <li><strong>Validation errors:</strong> 6s duration for multiple fields</li>
          <li><strong>Queue:</strong> Max 5 visible, others wait in queue</li>
          <li><strong>Hover:</strong> Pause countdown để đọc kỹ</li>
        </ul>
      </Card>
    </div>
  );
};

export default NotificationDemo;
