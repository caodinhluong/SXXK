import { useState } from 'react';
import { Button, Tag, Space, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import DataTable from './DataTable';
import dayjs from 'dayjs';

/**
 * DataTable Usage Examples
 * This file demonstrates various ways to use the DataTable component
 */

const DataTableExample = () => {
    const [loading, setLoading] = useState(false);

    // Sample data
    const sampleData = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            phone: '0901234567',
            status: 'active',
            role: 'Admin',
            createdAt: '2024-01-15',
            department: { name: 'IT', code: 'IT001' }
        },
        {
            id: 2,
            name: 'Trần Thị B',
            email: 'tranthib@example.com',
            phone: '0912345678',
            status: 'inactive',
            role: 'User',
            createdAt: '2024-02-20',
            department: { name: 'HR', code: 'HR001' }
        },
        {
            id: 3,
            name: 'Lê Văn C',
            email: 'levanc@example.com',
            phone: '0923456789',
            status: 'active',
            role: 'Manager',
            createdAt: '2024-03-10',
            department: { name: 'Sales', code: 'SA001' }
        },
    ];

    // Define table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Họ và Tên',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            ellipsis: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 130,
        },
        {
            title: 'Phòng ban',
            dataIndex: ['department', 'name'],
            key: 'department',
            width: 120,
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 100,
            filters: [
                { text: 'Admin', value: 'Admin' },
                { text: 'Manager', value: 'Manager' },
                { text: 'User', value: 'User' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: 'active' },
                { text: 'Không hoạt động', value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Tooltip title="Xóa">
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
        console.log('View:', record);
    };

    const handleEdit = (record) => {
        console.log('Edit:', record);
    };

    const handleDelete = (id) => {
        console.log('Delete:', id);
    };

    const handleAdd = () => {
        console.log('Add new record');
    };

    const handleRefresh = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            console.log('Data refreshed');
        }, 1000);
    };

    const handleExport = () => {
        console.log('Export data');
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>DataTable Component Examples</h2>

            {/* Example 1: Basic table with search */}
            <div style={{ marginBottom: 48 }}>
                <h3>Example 1: Basic Table with Search</h3>
                <DataTable
                    dataSource={sampleData}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    searchFields={['name', 'email', 'phone']}
                    searchPlaceholder="Tìm theo tên, email, hoặc số điện thoại..."
                    onRefresh={handleRefresh}
                    extraActions={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm mới
                        </Button>
                    }
                />
            </div>

            {/* Example 2: Table with nested field search */}
            <div style={{ marginBottom: 48 }}>
                <h3>Example 2: Table with Nested Field Search</h3>
                <DataTable
                    dataSource={sampleData}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    searchFields={['name', 'department.name', 'department.code']}
                    searchPlaceholder="Tìm theo tên hoặc phòng ban..."
                    onRefresh={handleRefresh}
                />
            </div>

            {/* Example 3: Table without search */}
            <div style={{ marginBottom: 48 }}>
                <h3>Example 3: Table without Search</h3>
                <DataTable
                    dataSource={sampleData}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    showSearch={false}
                    onRefresh={handleRefresh}
                    extraActions={
                        <Space>
                            <Button onClick={handleExport}>
                                Xuất Excel
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                            >
                                Thêm mới
                            </Button>
                        </Space>
                    }
                />
            </div>

            {/* Example 4: Table with custom pagination */}
            <div style={{ marginBottom: 48 }}>
                <h3>Example 4: Table with Custom Pagination</h3>
                <DataTable
                    dataSource={sampleData}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    searchFields={['name', 'email']}
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: false,
                        showQuickJumper: false,
                    }}
                />
            </div>

            {/* Example 5: Table without pagination */}
            <div style={{ marginBottom: 48 }}>
                <h3>Example 5: Table without Pagination</h3>
                <DataTable
                    dataSource={sampleData}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    searchFields={['name']}
                    pagination={false}
                />
            </div>

            {/* Example 6: Clickable rows */}
            <div style={{ marginBottom: 48 }}>
                <h3>Example 6: Clickable Rows</h3>
                <DataTable
                    dataSource={sampleData}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    searchFields={['name', 'email']}
                    onRow={(record) => ({
                        onClick: () => {
                            console.log('Row clicked:', record);
                        },
                        className: 'clickable-row',
                    })}
                />
            </div>
        </div>
    );
};

export default DataTableExample;
