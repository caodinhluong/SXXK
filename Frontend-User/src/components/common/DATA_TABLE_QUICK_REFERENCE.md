# DataTable Quick Reference

## Import
```javascript
import { DataTable } from '../../components/common';
```

## Minimal Example
```javascript
<DataTable
    dataSource={data}
    columns={columns}
    searchFields={['name', 'email']}
/>
```

## Common Props

| Prop | Example | Description |
|------|---------|-------------|
| `dataSource` | `[{id: 1, name: 'John'}]` | Your data array |
| `columns` | `[{title: 'Name', dataIndex: 'name'}]` | Column config |
| `searchFields` | `['name', 'email']` | Fields to search |
| `loading` | `true/false` | Show loading spinner |
| `onRefresh` | `() => fetchData()` | Refresh button handler |
| `pagination` | `false` or `{pageSize: 20}` | Pagination config |

## Quick Recipes

### 1. Basic Table with Search
```javascript
<DataTable
    dataSource={users}
    columns={columns}
    searchFields={['name', 'email']}
/>
```

### 2. With Refresh Button
```javascript
<DataTable
    dataSource={users}
    columns={columns}
    searchFields={['name']}
    onRefresh={fetchUsers}
    loading={loading}
/>
```

### 3. With Add Button
```javascript
<DataTable
    dataSource={users}
    columns={columns}
    searchFields={['name']}
    extraActions={
        <Button type="primary" onClick={handleAdd}>
            Add New
        </Button>
    }
/>
```

### 4. No Search, Just Table
```javascript
<DataTable
    dataSource={users}
    columns={columns}
    showSearch={false}
/>
```

### 5. No Pagination
```javascript
<DataTable
    dataSource={users}
    columns={columns}
    searchFields={['name']}
    pagination={false}
/>
```

### 6. Clickable Rows
```javascript
<DataTable
    dataSource={users}
    columns={columns}
    searchFields={['name']}
    onRow={(record) => ({
        onClick: () => navigate(`/users/${record.id}`),
        className: 'clickable-row'
    })}
/>
```

### 7. Nested Field Search
```javascript
<DataTable
    dataSource={users}
    columns={columns}
    searchFields={['name', 'department.name', 'manager.email']}
/>
```

## Column Configuration

### Sortable Column
```javascript
{
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name)
}
```

### Filterable Column
```javascript
{
    title: 'Status',
    dataIndex: 'status',
    filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
    ],
    onFilter: (value, record) => record.status === value
}
```

### Date Column
```javascript
{
    title: 'Created',
    dataIndex: 'createdAt',
    render: (date) => dayjs(date).format('DD/MM/YYYY'),
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
}
```

### Tag Column
```javascript
{
    title: 'Status',
    dataIndex: 'status',
    render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
            {status}
        </Tag>
    )
}
```

### Action Column
```javascript
{
    title: 'Actions',
    key: 'action',
    fixed: 'right',
    width: 150,
    render: (_, record) => (
        <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
                Edit
            </Button>
            <Popconfirm
                title="Delete?"
                onConfirm={() => handleDelete(record.id)}
            >
                <Button type="link" danger>Delete</Button>
            </Popconfirm>
        </Space>
    )
}
```

## Common Patterns

### Loading State
```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);

const fetchData = async () => {
    setLoading(true);
    try {
        const result = await api.getAll();
        setData(result);
    } finally {
        setLoading(false);
    }
};

<DataTable
    dataSource={data}
    columns={columns}
    loading={loading}
    onRefresh={fetchData}
/>
```

### With Multiple Actions
```javascript
<DataTable
    dataSource={data}
    columns={columns}
    searchFields={['name']}
    extraActions={
        <Space>
            <Button onClick={handleExport}>Export</Button>
            <Button onClick={handleImport}>Import</Button>
            <Button type="primary" onClick={handleAdd}>Add</Button>
        </Space>
    }
/>
```

### Custom Pagination
```javascript
<DataTable
    dataSource={data}
    columns={columns}
    pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: false,
        pageSizeOptions: ['20', '50', '100']
    }}
/>
```

## Styling

### Add Custom Class
```javascript
<DataTable
    tableProps={{
        className: 'my-custom-table'
    }}
/>
```

### Compact Size
```javascript
<DataTable
    tableProps={{
        size: 'small'
    }}
/>
```

### With Border
```javascript
<DataTable
    tableProps={{
        bordered: true
    }}
/>
```

## Tips

✅ **DO:**
- Always provide `searchFields` when using search
- Use meaningful `rowKey` (default is 'id')
- Add `sorter` to important columns
- Use `filters` for categorical data
- Implement `onRefresh` for dynamic data
- Add `loading` state for better UX

❌ **DON'T:**
- Don't forget to provide `searchFields` array
- Don't use search without specifying fields
- Don't put too many columns (use ellipsis)
- Don't forget to handle errors in `onRefresh`

## Need More Help?

📖 See `DATA_TABLE_GUIDE.md` for complete documentation
💡 See `DataTableExample.jsx` for working examples
