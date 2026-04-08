import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication.
 * Redirects to login if user is not authenticated.
 * Validates token and user data before allowing access.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {Array<string>} props.requiredRoles - Optional array of roles required to access the route
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const location = useLocation();
    const [isValidating, setIsValidating] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasPermission, setHasPermission] = useState(true);

    useEffect(() => {
        validateAuth();
    }, []);

    const validateAuth = () => {
        try {
            // Check for access token
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                setIsAuthenticated(false);
                setIsValidating(false);
                return;
            }

            // Check for user data
            const userStr = localStorage.getItem('user');
            
            if (!userStr) {
                // Token exists but no user data - clear token and redirect
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setIsAuthenticated(false);
                setIsValidating(false);
                return;
            }

            // Parse user data
            let user;
            try {
                user = JSON.parse(userStr);
            } catch (parseError) {
                console.error('❌ Error parsing user data:', parseError);
                // Invalid user data - clear and redirect
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setIsValidating(false);
                return;
            }

            // Validate token expiry if available
            if (token) {
                try {
                    // Decode JWT token to check expiry (basic check)
                    const tokenParts = token.split('.');
                    if (tokenParts.length === 3) {
                        const payload = JSON.parse(atob(tokenParts[1]));
                        const currentTime = Math.floor(Date.now() / 1000);
                        
                        // If token is expired
                        if (payload.exp && payload.exp < currentTime) {
                            console.warn('⚠️ Token expired, clearing auth data');
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('user');
                            setIsAuthenticated(false);
                            setIsValidating(false);
                            return;
                        }
                    }
                } catch (tokenError) {
                    // If token parsing fails, continue anyway (backend will validate)
                    console.warn('⚠️ Could not parse token for expiry check:', tokenError);
                }
            }

            // Check role-based permissions if required
            if (requiredRoles.length > 0) {
                const userRole = user.role || user.vai_tro;
                
                if (!userRole || !requiredRoles.includes(userRole)) {
                    console.warn('⚠️ User does not have required role:', { userRole, requiredRoles });
                    setHasPermission(false);
                    setIsAuthenticated(true);
                    setIsValidating(false);
                    return;
                }
            }

            // All checks passed
            setIsAuthenticated(true);
            setHasPermission(true);
            setIsValidating(false);

        } catch (error) {
            console.error('❌ Error validating authentication:', error);
            // On any error, clear auth and redirect
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setIsValidating(false);
        }
    };

    // Show loading spinner while validating
    if (isValidating) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: '#f0f2f5'
            }}>
                <Spin size="large" tip="Đang xác thực..." />
            </div>
        );
    }

    // Not authenticated - redirect to login with return URL
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Authenticated but no permission - show 403 Forbidden
    if (!hasPermission) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: '#f0f2f5',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '72px', marginBottom: '20px' }}>🚫</div>
                <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#262626' }}>403 - Không có quyền truy cập</h1>
                <p style={{ fontSize: '16px', color: '#8c8c8c', marginBottom: '20px' }}>
                    Bạn không có quyền truy cập trang này.
                </p>
                <a href="/" style={{ 
                    padding: '10px 24px', 
                    background: '#1890ff', 
                    color: 'white', 
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '14px'
                }}>
                    Quay về trang chủ
                </a>
            </div>
        );
    }

    // Authenticated and has permission - render children
    return children;
};

export default ProtectedRoute;