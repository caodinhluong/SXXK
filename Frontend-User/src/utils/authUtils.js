export const getUserIdFromToken = () => {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            return parsed?.id_dn || parsed?.id;
        }
        
        const token = localStorage.getItem('accessToken');
        if (token) {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                return payload?.id_dn || payload?.id;
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting user ID from token:', error);
        return null;
    }
};

export const getUserRoleFromToken = () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                return payload?.role;
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting user role from token:', error);
        return null;
    }
};

export default { getUserIdFromToken, getUserRoleFromToken };
