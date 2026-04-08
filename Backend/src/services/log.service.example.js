/**
 * LogService Usage Examples
 * 
 * This file demonstrates how to use the LogService in your application
 * to track user actions and maintain an audit trail.
 */

const logService = require('./log.service');

// ========== Example 1: Log a CREATE action ==========
async function exampleCreateLog() {
  try {
    await logService.log(
      'DoanhNghiep',           // User type
      123,                      // User ID
      'CREATE',                 // Action
      'HopDong',                // Related table
      456,                      // Record ID
      null,                     // Old data (null for CREATE)
      { so_hd: 'HD001', ten_hd: 'Hợp đồng mẫu' }, // New data
      '192.168.1.1',           // IP address
      'Mozilla/5.0...',        // User agent
      'Tạo hợp đồng mới'       // Notes
    );
    console.log('✅ Log created successfully');
  } catch (error) {
    console.error('❌ Error creating log:', error.message);
  }
}

// ========== Example 2: Log an UPDATE action ==========
async function exampleUpdateLog() {
  try {
    await logService.log(
      'Admin',
      1,
      'UPDATE',
      'ToKhaiNhap',
      789,
      { trang_thai: 'ChoXuLy' },           // Old data
      { trang_thai: 'ThongQuan' },         // New data
      '192.168.1.2',
      'Mozilla/5.0...',
      'Cập nhật trạng thái tờ khai'
    );
    console.log('✅ Update log created');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ========== Example 3: Log a DELETE action ==========
async function exampleDeleteLog() {
  try {
    await logService.log(
      'HaiQuan',
      5,
      'DELETE',
      'SanPham',
      101,
      { id_sp: 101, ten_sp: 'Sản phẩm cũ' }, // Old data
      null,                                    // New data (null for DELETE)
      '192.168.1.3',
      'Mozilla/5.0...'
    );
    console.log('✅ Delete log created');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ========== Example 4: Log a LOGIN action ==========
async function exampleLoginLog() {
  try {
    await logService.log(
      'DoanhNghiep',
      123,
      'LOGIN',
      null,                    // No related table
      null,                    // No record ID
      null,                    // No old data
      { success: true },       // Login result
      '192.168.1.1',
      'Mozilla/5.0...',
      'Đăng nhập thành công'
    );
    console.log('✅ Login log created');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ========== Example 5: Query logs with filters ==========
async function exampleQueryLogs() {
  try {
    // Get all logs for a specific user
    const userLogs = await logService.query({
      loai_nguoi_dung: 'DoanhNghiep',
      id_nguoi_dung: 123,
      page: 1,
      limit: 20
    });
    console.log('✅ User logs:', userLogs.data.length, 'records');

    // Get logs for a specific date range
    const dateLogs = await logService.query({
      tu_ngay: '2024-01-01',
      den_ngay: '2024-12-31',
      page: 1,
      limit: 50
    });
    console.log('✅ Date range logs:', dateLogs.data.length, 'records');

    // Get logs for a specific action
    const actionLogs = await logService.query({
      hanh_dong: 'DELETE',
      page: 1,
      limit: 10
    });
    console.log('✅ Delete action logs:', actionLogs.data.length, 'records');
  } catch (error) {
    console.error('❌ Error querying logs:', error.message);
  }
}

// ========== Example 6: Get audit trail for a record ==========
async function exampleAuditTrail() {
  try {
    const auditTrail = await logService.getAuditTrail(
      'HopDong',  // Table name
      456,        // Record ID
      { page: 1, limit: 100 }
    );
    
    console.log('✅ Audit trail for HopDong #456:');
    auditTrail.data.forEach(log => {
      console.log(`  - ${log.ngay_tao}: ${log.hanh_dong} by ${log.loai_nguoi_dung} #${log.id_nguoi_dung}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ========== Example 7: Get statistics ==========
async function exampleStatistics() {
  try {
    const stats = await logService.getStatistics({
      tu_ngay: '2024-01-01',
      den_ngay: '2024-12-31'
    });
    
    console.log('✅ Log statistics:');
    console.log('  Total logs:', stats.totalLogs);
    console.log('  By user type:', stats.byUserType);
    console.log('  Top actions:', stats.byAction);
    console.log('  Top tables:', stats.byTable);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ========== Example 8: Integration with Express middleware ==========
/**
 * Example middleware to automatically log all requests
 */
function createLogMiddleware(req, res, next) {
  // Store original send function
  const originalSend = res.send;
  
  // Override send function to log after response
  res.send = function(data) {
    // Only log successful operations (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Extract user info from JWT token (assuming it's in req.user)
      const user = req.user;
      
      if (user) {
        // Determine action based on HTTP method
        const actionMap = {
          'POST': 'CREATE',
          'PUT': 'UPDATE',
          'PATCH': 'UPDATE',
          'DELETE': 'DELETE',
          'GET': 'READ'
        };
        
        const hanh_dong = actionMap[req.method] || req.method;
        
        // Log asynchronously (don't wait for it)
        logService.log(
          user.role === 'admin' ? 'Admin' : 'DoanhNghiep',
          user.id,
          hanh_dong,
          null,  // Could extract table name from route
          null,  // Could extract record ID from params
          null,
          null,
          req.ip,
          req.get('user-agent'),
          `${req.method} ${req.originalUrl}`
        ).catch(err => {
          console.error('Failed to create log:', err);
        });
      }
    }
    
    // Call original send
    return originalSend.call(this, data);
  };
  
  next();
}

// ========== Example 9: Log in a service method ==========
/**
 * Example of logging within a service method
 */
async function exampleServiceWithLogging(userId, hopDongData) {
  try {
    // Create the record
    const hopDong = await db.HopDong.create(hopDongData);
    
    // Log the action
    await logService.log(
      'DoanhNghiep',
      userId,
      'CREATE',
      'HopDong',
      hopDong.id_hd,
      null,
      hopDong.toJSON(),
      null,  // IP will be added by controller
      null,  // User agent will be added by controller
      'Tạo hợp đồng mới qua service'
    );
    
    return hopDong;
  } catch (error) {
    // Log the error
    await logService.log(
      'DoanhNghiep',
      userId,
      'CREATE_FAILED',
      'HopDong',
      null,
      null,
      { error: error.message },
      null,
      null,
      'Lỗi khi tạo hợp đồng'
    );
    
    throw error;
  }
}

// ========== Example 10: Maintenance - Delete old logs ==========
async function exampleDeleteOldLogs() {
  try {
    // Delete logs older than 365 days
    const deletedCount = await logService.deleteOldLogs(365);
    console.log(`✅ Deleted ${deletedCount} old logs`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Export examples for testing
module.exports = {
  exampleCreateLog,
  exampleUpdateLog,
  exampleDeleteLog,
  exampleLoginLog,
  exampleQueryLogs,
  exampleAuditTrail,
  exampleStatistics,
  createLogMiddleware,
  exampleServiceWithLogging,
  exampleDeleteOldLogs
};
