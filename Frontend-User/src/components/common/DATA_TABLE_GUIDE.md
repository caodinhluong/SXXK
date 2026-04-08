# DataTable Component Guide

## Overview

`DataTable` is a reusable table component built on top of Ant Design's Table component. It provides built-in functionality for:
- **Pagination** - Automatic pagination with customizable page sizes
- **Search** - Client-side search across multiple fields
- **Filter** - Column-based filtering (via Ant Design's built-in filters)
- **Sort** - Column sorting (via Ant Design's built-in sorters)
- **Refresh** - Optional refresh button
- **Toolbar** - Customizable toolbar with search and action buttons

## Installation

The component is already available in the common components directory:

```javascript
import { DataTable } from '../../components/common';
// or
import DataTable from '../../components/common/DataTable';
```

## Basic Usage

```javascript
import { DataTable } from '../../components/common';

const MyComponent = () => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
    ];

    const data = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ];

    return (
        <DataTable
            dataSource={data}
            columns={columns}
            rowKey="id"
            searchFields={['name', 'email']}
            searchPlaceholder="Search by name or email..."
        />
    );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataSource` | Array | `[]` | Array of data objects to display |
| `columns` | Array | `[]` | Ant Design table columns configuration (required) |
| `loading` | Boolean | `false` | Loading state |
| `rowKey` | String | `'id'` | Unique key for each row |
| `showSearch` | Boolean | `true` | Show/hide search bar |
| `searchPlaceholder` | String | `'Tìm kiếm...'` | Search input placeholder |
| `searchFields` | Array | `[]` | Array of field names to search in |
| `pagination` | Boolean/Object | `true` | Pagination config or false to disable |
| `onRefresh` | Function | `undefined` | Callback when refresh button is clicked |
| `extraActions` | ReactNode | `undefined` | Additional action buttons in toolbar |
| `tableProps` | Object | `{}` | Additional props to pass to Ant Design Table |
| `emptyText` | String | `'Không có dữ liệu'` | Text to show when no data |
| `onRow` | Function | `undefined` | Row event handlers |
| `scroll` | Object | `{ x: 'max-content' }` | Table scroll configuration |

## Features

### 1. Search Functionality

Search across multiple fields (including nested fields):

```javascript
<DataTable
    dataSource={data}
    columns={columns}
    searchFields={['name', 'email', 'department.name']}
    searchPlaceholder="Search by name, email, or department..."
/>
```

**Nested Field Search:**
```javascript
// Data structure
const data = [
    {
        id: 1,
        name: 'John',
        department: { name: 'IT', code: 'IT001' }
    }
];

// Search in nested fields
<DataTable
    searchFields={['name', 'department.name', 'department.code']}
/>
```

### 2. Pagination

**Default Pagination:**
```javascript
<DataTable
    dataSource={data}
    columns={columns}
    // Pagination enabled by default with these settings:
    // - Page size: 10
    // - Show size changer: true
    // - Show quick jumper: true
    // - Page size options: [10, 20, 50, 100]
/>
```

**Custom Pagination:**
```javascript
<DataTable
    dataSource={data}
    columns={columns}
    pagination={{
        pageSize: 20,
        showSizeChanger: false,
        showQuickJumper: false,
        pageSizeOptions: ['20', '50'],
    }}
/>
```

**Disable Pagination:**
```javascript
<DataTable
    dataSource={data}
    columns={columns}
    pagination={false}
/>
```

### 3. Sorting

Use Ant Design's built-in sorter in column configuration:

```javascript
const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        sorter: (a, b) => a.age - b.age,
    },
    {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
];
```

### 4. Filtering

Use Ant Design's built-in filters in column configuration:

```javascript
const columns = [
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        filters: [
            { text: 'Active', value: 'active' },
            { text: 'Inactive', value: 'inactive' },
        ],
        onFilter: (value, record) => record.status === value,
    },
];
```

### 5. Refresh Button

Add a refresh button to reload data:

```javascript
const handleRefresh = async () => {
    setLoading(true);
    try {
        const data = await fetchData();
        setData(data);
    } finally {
        setLoading(false);
    }
};

<DataTable
    dataSource={data}
    columns={columns}
    loading={loading}
    onRefresh={handleRefresh}
/>
```

### 6. Extra Actions

Add custom action buttons to the toolbar:

```javascript
<DataTable
    dataSource={data}
    columns={columns}
    extraActions={
        <Space>
            <Button onClick={handleExport}>
                Export Excel
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add New
            </Button>
        </Space>
    }
/>
```

### 7. Clickable Rows

Make rows clickable:

```javascript
<DataTable
    dataSource={data}
    columns={columns}
    onRow={(record) => ({
        onClick: () => {
            console.log('Row clicked:', record);
            // Navigate or show modal
        },
        className: 'clickable-row', // Adds hover effect
    })}
/>
```

### 8. Custom Row Styling

Add custom row classes (e.g., for unread notifications):

```javascript
<DataTable
    dataSource={data}
    columns={columns}
    onRow={(record) => ({
        className: record.isUnread ? 'unread-row' : '',
    })}
/>
```

## Complete Example

```javascript
import { useState, useEffect } from 'react';
import { Button, Space, Tag, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { DataTable } from '../../components/common';
import dayjs from 'dayjs';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch data
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAll();
            setUsers(response.data);
        } catch (error) {
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Define columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            filters: [
                { text: 'Admin', value: 'admin' },
                { text: 'User', value: 'user' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Active' : 'Inactive'}
                </Tag>
            ),
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Actions',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Action handlers
    const handleView = (record) => {
        // Show view modal
    };

    const handleEdit = (record) => {
        // Show edit modal
    };

    const handleDelete = async (id) => {
        try {
            await userService.delete(id);
            message.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            message.error('Failed to delete user');
        }
    };

    const handleAdd = () => {
        // Show add modal
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>User Management</h2>
            <DataTable
                dataSource={users}
                columns={columns}
                loading={loading}
                rowKey="id"
                searchFields={['name', 'email']}
                searchPlaceholder="Search by name or email..."
                onRefresh={fetchUsers}
                extraActions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Add User
                    </Button>
                }
            />
        </div>
    );
};

export default UserManagement;
```

## Styling

The component includes default styles in `DataTable.css`. You can customize by:

1. **Override CSS classes:**
```css
/* In your component's CSS file */
.data-table-wrapper .ant-table-thead > tr > th {
    background-color: #f0f0f0;
}
```

2. **Use tableProps:**
```javascript
<DataTable
    tableProps={{
        size: 'small', // or 'middle', 'large'
        bordered: true,
    }}
/>
```

3. **Add custom className:**
```javascript
<DataTable
    tableProps={{
        className: 'my-custom-table',
    }}
/>
```

## Best Practices

1. **Always provide searchFields** when enabling search
2. **Use meaningful rowKey** (default is 'id')
3. **Add sorter to important columns** for better UX
4. **Use filters for categorical data** (status, role, etc.)
5. **Implement onRefresh** for data that changes frequently
6. **Add loading state** for better user feedback
7. **Use ellipsis for long text columns**
8. **Fix action column to right** for better accessibility

## Troubleshooting

**Search not working:**
- Make sure `searchFields` prop is provided
- Check that field names match your data structure
- For nested fields, use dot notation: `'user.name'`

**Pagination not showing:**
- Check if `pagination` prop is not set to `false`
- Ensure dataSource has more items than pageSize

**Columns not sorting:**
- Add `sorter` function to column configuration
- Make sure data types are consistent

**Performance issues with large datasets:**
- Consider server-side pagination
- Use `pagination={{ pageSize: 20 }}` to reduce items per page
- Implement virtual scrolling for very large lists

## Migration from Ant Design Table

If you're migrating from direct Ant Design Table usage:

```javascript
// Before
<Table
    dataSource={data}
    columns={columns}
    loading={loading}
    pagination={{ pageSize: 10 }}
/>

// After
<DataTable
    dataSource={data}
    columns={columns}
    loading={loading}
    searchFields={['name', 'email']} // Add search functionality
    onRefresh={fetchData} // Add refresh button
/>
```

All Ant Design Table props are still supported via `tableProps`.
