# LogService Documentation

## Overview

The LogService provides comprehensive logging and audit trail functionality for the system. It tracks all important user actions and system events, storing them in the `LogHeThong` table.

## Features

- ✅ Create detailed log entries for all system actions
- ✅ Query logs with flexible filters (user, action, date range, table, etc.)
- ✅ Get audit trail for specific records
- ✅ Generate log statistics
- ✅ Automatic log maintenance (delete old logs)
- ✅ Support for multiple user types (Admin, DoanhNghiep, HaiQuan)

## API Endpoints

### 1. Create Log Entry
**POST** `/api/logs`

**Body:**
```json
{
  "loai_nguoi_dung": "DoanhNghiep",
  "id_nguoi_dung": 123,
  "hanh_dong": "CREATE",
  "bang_lien_quan": "HopDong",
  "id_ban_ghi": 456,
  "du_lieu_cu": null,
  "du_lieu_moi": { "so_hd": "HD001" },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "ghi_chu": "Tạo hợp đồng mới"
}
```

### 2. Query Logs
**GET** `/api/logs?page=1&limit=50&loai_nguoi_dung=DoanhNghiep&tu_ngay=2024-01-01&den_ngay=2024-12-31`

**Query Parameters:**
- `loai_nguoi_dung`: Filter by user type (Admin, DoanhNghiep, HaiQuan)
- `id_nguoi_dung`: Filter by user ID
- `hanh_dong`: Filter by action type
- `bang_lien_quan`: Filter by table name
- `id_ban_ghi`: Filter by record ID
- `tu_ngay`: Start date (YYYY-MM-DD)
- `den_ngay`: End date (YYYY-MM-DD)
- `ip_address`: Filter by IP address
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 50)
- `sortBy`: Sort field (default: ngay_tao)
- `sortOrder`: Sort order (ASC/DESC, default: DESC)

### 3. Get Log by ID
**GET** `/api/logs/:id_log`

### 4. Get Logs by User
**GET** `/api/logs/user/:loai_nguoi_dung/:id_nguoi_dung`

### 5. Get Logs by Action
**GET** `/api/logs/action/:hanh_dong`

### 6. Get Audit Trail
**GET** `/api/logs/audit/:bang_lien_quan/:id_ban_ghi`

### 7. Get Statistics
**GET** `/api/logs/stats/summary?tu_ngay=2024-01-01&den_ngay=2024-12-31`

### 8. Delete Old Logs (Admin only)
**DELETE** `/api/logs/old/:days`

## Service Methods

### log()
Create a new log entry.

```javascript
await logService.log(
  loai_nguoi_dung,  // 'Admin', 'DoanhNghiep', or 'HaiQuan'
  id_nguoi_dung,    // User ID
  hanh_dong,        // Action: CREATE, UPDATE, DELETE, LOGIN, etc.
  bang_lien_quan,   // Table name (optional)
  id_ban_ghi,       // Record ID (optional)
  du_lieu_cu,       // Old data (optional)
  du_lieu_moi,      // New data (optional)
  ip_address,       // IP address (optional)
  user_agent,       // User agent (optional)
  ghi_chu           // Notes (optional)
);
```

### query()
Query logs with filters.

```javascript
const result = await logService.query({
  loai_nguoi_dung: 'DoanhNghiep',
  tu_ngay: '2024-01-01',
  den_ngay: '2024-12-31',
  page: 1,
  limit: 50
});
```

### getById()
Get a single log entry by ID.

```javascript
const log = await logService.getById(123);
```

### getByUser()
Get logs for a specific user.

```javascript
const logs = await logService.getByUser('DoanhNghiep', 123, {
  page: 1,
  limit: 50
});
```

### getByAction()
Get logs for a specific action type.

```javascript
const logs = await logService.getByAction('DELETE', {
  page: 1,
  limit: 50
});
```

### getAuditTrail()
Get audit trail for a specific record.

```javascript
const trail = await logService.getAuditTrail('HopDong', 456, {
  page: 1,
  limit: 100
});
```

### getStatistics()
Get log statistics.

```javascript
const stats = await logService.getStatistics({
  tu_ngay: '2024-01-01',
  den_ngay: '2024-12-31'
});
```

### deleteOldLogs()
Delete logs older than specified days (minimum 30 days).

```javascript
const deletedCount = await logService.deleteOldLogs(365);
```

## Common Action Types

- `CREATE` - Creating a new record
- `UPDATE` - Updating an existing record
- `DELETE` - Deleting a record
- `LOGIN` - User login
- `LOGOUT` - User logout
- `EXPORT` - Exporting data
- `IMPORT` - Importing data
- `APPROVE` - Approving a record
- `REJECT` - Rejecting a record
- `SUBMIT` - Submitting a record
- `VIEW` - Viewing sensitive data

## User Types

- `Admin` - System administrators
- `DoanhNghiep` - Business users
- `HaiQuan` - Customs officials

## Best Practices

1. **Always log important actions**: CREATE, UPDATE, DELETE operations
2. **Include context**: Store old and new data for UPDATE operations
3. **Log authentication events**: LOGIN, LOGOUT, FAILED_LOGIN
4. **Use meaningful action names**: Be consistent with action naming
5. **Include IP and user agent**: Helps with security auditing
6. **Add notes for clarity**: Explain why an action was taken
7. **Regular maintenance**: Delete old logs periodically to manage database size

## Integration Example

```javascript
// In a service method
const hopdongService = {
  async create(userId, data, req) {
    try {
      // Create the record
      const hopDong = await db.HopDong.create(data);
      
      // Log the action
      await logService.log(
        'DoanhNghiep',
        userId,
        'CREATE',
        'HopDong',
        hopDong.id_hd,
        null,
        hopDong.toJSON(),
        req.ip,
        req.get('user-agent'),
        'Tạo hợp đồng mới'
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
        req.ip,
        req.get('user-agent'),
        'Lỗi khi tạo hợp đồng'
      );
      
      throw error;
    }
  }
};
```

## Security Considerations

- All log endpoints require authentication
- Query and statistics endpoints require admin role
- Logs cannot be modified or deleted individually (only bulk delete old logs)
- Sensitive data should be sanitized before logging
- IP addresses and user agents are logged for security auditing

## Performance Tips

- Use pagination when querying large log sets
- Add indexes on frequently queried fields (already in database schema)
- Schedule regular cleanup of old logs (e.g., monthly cron job)
- Consider archiving very old logs instead of deleting them

## Troubleshooting

### Issue: Logs not being created
- Check that LogHeThong model is properly initialized
- Verify database connection
- Check for validation errors in log data

### Issue: Query returns no results
- Verify filter parameters are correct
- Check date format (YYYY-MM-DD)
- Ensure user has proper permissions

### Issue: Performance issues
- Add database indexes if needed
- Reduce query limit
- Use more specific filters
- Consider archiving old logs

## Related Files

- **Service**: `Backend/src/services/log.service.js`
- **Controller**: `Backend/src/controllers/log.controller.js`
- **Routes**: `Backend/src/routes/log.routes.js`
- **Model**: `Backend/src/models/LogHeThong.js`
- **Examples**: `Backend/src/services/log.service.example.js`
