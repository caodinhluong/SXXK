import { useState, useMemo } from 'react';
import { Table, Input, Space, Button, Row, Col, Empty } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import './DataTable.css';

const { Search } = Input;

/**
 * DataTable - Reusable table component with built-in pagination, search, filter, and sort
 * 
 * @param {Array} dataSource - Array of data objects to display
 * @param {Array} columns - Ant Design table columns configuration
 * @param {boolean} loading - Loading state
 * @param {string} rowKey - Unique key for each row (default: 'id')
 * @param {boolean} showSearch - Show search bar (default: true)
 * @param {string} searchPlaceholder - Search input placeholder
 * @param {Array} searchFields - Array of field names to search in (e.g., ['name', 'email'])
 * @param {Object} pagination - Pagination config or false to disable
 * @param {Function} onRefresh - Callback when refresh button is clicked
 * @param {ReactNode} extraActions - Additional action buttons to show in toolbar
 * @param {Object} tableProps - Additional props to pass to Ant Design Table
 * @param {string} emptyText - Text to show when no data
 * @param {Function} onRow - Row event handlers
 * @param {Object} scroll - Table scroll configuration
 */
const DataTable = ({
    dataSource = [],
    columns = [],
    loading = false,
    rowKey = 'id',
    showSearch = true,
    searchPlaceholder = 'Tìm kiếm...',
    searchFields = [],
    pagination = true,
    onRefresh,
    extraActions,
    tableProps = {},
    emptyText = 'Không có dữ liệu',
    onRow,
    scroll,
}) => {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filter data based on search text
    const filteredData = useMemo(() => {
        if (!searchText || searchFields.length === 0) {
            return dataSource;
        }

        const lowerSearchText = searchText.toLowerCase();
        
        return dataSource.filter(item => {
            return searchFields.some(field => {
                // Handle nested fields (e.g., 'user.name')
                const value = field.split('.').reduce((obj, key) => obj?.[key], item);
                
                if (value === null || value === undefined) {
                    return false;
                }
                
                return String(value).toLowerCase().includes(lowerSearchText);
            });
        });
    }, [dataSource, searchText, searchFields]);

    // Handle search
    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Handle table changes (pagination, filters, sorters)
    const handleTableChange = (paginationConfig, filters, sorter) => {
        setCurrentPage(paginationConfig.current);
        setPageSize(paginationConfig.pageSize);
        
        // Note: Filters and sorters are handled by Ant Design's Table component
        // If you need custom filter/sort logic, you can access them here:
        // - filters: object with filter values for each column
        // - sorter: object with sort field and order
    };

    // Handle refresh
    const handleRefresh = () => {
        setSearchText('');
        setCurrentPage(1);
        if (onRefresh) {
            onRefresh();
        }
    };

    // Pagination configuration
    const paginationConfig = pagination === false ? false : {
        current: currentPage,
        pageSize: pageSize,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
        pageSizeOptions: ['10', '20', '50', '100'],
        ...(typeof pagination === 'object' ? pagination : {}),
    };

    return (
        <div className="data-table-wrapper">
            {/* Toolbar */}
            {(showSearch || onRefresh || extraActions) && (
                <Row 
                    gutter={[16, 16]} 
                    justify="space-between" 
                    align="middle"
                    className="data-table-toolbar"
                    style={{ marginBottom: 16 }}
                >
                    <Col xs={24} sm={12} md={showSearch ? 12 : 0}>
                        {showSearch && searchFields.length > 0 && (
                            <Search
                                placeholder={searchPlaceholder}
                                allowClear
                                enterButton={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                                onSearch={handleSearch}
                                style={{ width: '100%', maxWidth: 400 }}
                            />
                        )}
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Space style={{ float: 'right' }}>
                            {extraActions}
                            {onRefresh && (
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                    loading={loading}
                                >
                                    Làm mới
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
            )}

            {/* Table */}
            <Table
                dataSource={filteredData}
                columns={columns}
                loading={loading}
                rowKey={rowKey}
                pagination={paginationConfig}
                onChange={handleTableChange}
                onRow={onRow}
                scroll={scroll || { x: 'max-content' }}
                locale={{
                    emptyText: <Empty description={emptyText} />
                }}
                {...tableProps}
            />
        </div>
    );
};

DataTable.propTypes = {
    dataSource: PropTypes.array,
    columns: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    rowKey: PropTypes.string,
    showSearch: PropTypes.bool,
    searchPlaceholder: PropTypes.string,
    searchFields: PropTypes.arrayOf(PropTypes.string),
    pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    onRefresh: PropTypes.func,
    extraActions: PropTypes.node,
    tableProps: PropTypes.object,
    emptyText: PropTypes.string,
    onRow: PropTypes.func,
    scroll: PropTypes.object,
};

export default DataTable;
