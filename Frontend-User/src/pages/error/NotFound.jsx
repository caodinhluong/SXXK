import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * NotFound Component (404 Page)
 * 
 * Displays a user-friendly 404 error page when users navigate to non-existent routes.
 * Provides a button to navigate back to the home page.
 */
const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            background: '#f0f2f5',
            padding: '20px'
        }}>
            <Result
                status="404"
                title="404"
                subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
                extra={
                    <Button 
                        type="primary" 
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        Quay về trang chủ
                    </Button>
                }
            />
        </div>
    );
};

export default NotFound;
