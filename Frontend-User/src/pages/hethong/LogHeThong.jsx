import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Card,
    Tag,
    Space,
    Input,
    Select,
    DatePicker,
    Row,
    Col,
    Typography,
    Modal,
    Descriptions,
    message,
} from 'antd';
import {
    ReloadOutlined,
    SearchOutlined,
    EyeOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { getAll, getByUser, getByAction, getAuditTrail } from '../../services/log.service';
import { showLoadError } from '../../components/notification';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const LogHeThong = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchData();
    }, [pagination.current, pagination.pageSize]);

    const fetchData = async (params = {}) => {
        try {
            setLoading(true);
            let res;
            
            if (activeTab === 'user' && filters.id_nguoi_dung) {
                res = await getByUser(filters.loai_nguoi_dung || 'DoanhNghiep', filters.id_nguoi_dung, {
                    page: pagination.current,
                    limit: pagination.pageSize,
                    ...params,
                });
            } else if (activeTab === 'action' && filters.hanh_dong) {
                res = await getByAction(filters.hanh_dong, {
                    page: pagination.current,
                    limit: pagination.pageSize,
                    ...params,
                });
            } else {
                res = await getAll({
                    page: pagination.current,
                    limit: pagination.pageSize,
                    ...filters,
                    ...params,
                });
            }
            
            const dataList = res.data || res || [];
            setData(Array.isArray(dataList) ? dataList : []);
            if (res.total) setPagination(prev => ({ ...prev, total: res.total }));
        } catch (err) {
            showLoadError('danh sách log');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchData({ search: value, page: 1 });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchData({ [key]: value, page: 1 });
    };

    const handleDateChange = (dates) => {
        if (dates) {
            handleFilterChange('tu_ngay', dates[0].format('YYYY-MM-DD'));
            handleFilterChange('den_ngay', dates[1].format('YYYY-MM-DD'));
        } else {
            handleFilterChange('tu_ngay', null);
            handleFilterChange('den_ngay', null);
        }
    };

    const handleViewDetail = async (record) => {
        try {
            if (record.bang_lien_quan && record.id_ban_ghi) {
                const auditRes = await getAuditTrail(record.bang_lien_quan, record.id_ban_ghi);
                setSelectedRecord({ ...record, auditTrail: auditRes.data || auditRes || [] });
            } else {
                setSelectedRecord(record);
            }
            setModalVisible(true);
        } catch (err) {
            setSelectedRecord(record);
            setModalVisible(true);
        }
    };

    const getHanhDongColor = (hanhDong) => {
        const colors = {
            'CREATE': 'green',
            'UPDATE': 'blue',
            'DELETE': 'red',
            'LOGIN': 'purple',
            'LOGOUT': 'orange',
            'EXPORT': 'cyan',
            'IMPORT': 'geekblue',
        };
        return colors[hanhDong] || 'default';
    };

    const getLoaiNguoiDungColor = (loai) => {
        const colors = {
            'Admin': 'red',
            'DoanhNghiep': 'blue',
            'HaiQuan': 'green',
        };
        return colors[loai] || 'default';
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            render: (id) => `#${id}`,
        },
        {
            title: 'Hành động',
            dataIndex: 'hanh_dong',
            key: 'hanh_dong',
            render: (hd) => <Tag color={getHanhDongColor(hd)}>{hd}</Tag>,
        },
        {
            title: 'Loại người dùng',
            dataIndex: 'loai_nguoi_dung',
            key: 'loai_nguoi_dung',
            render: (loai) => <Tag color={getLoaiNguoiDungColor(loai)}>{loai}</Tag>,
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'ten_nguoi_dung',
            key: 'ten_nguoi_dung',
        },
        {
            title: 'Bảng liên quan',
            dataIndex: 'bang_lien_quan',
            key: 'bang_lien_quan',
        },
        {
            title: 'IP',
            dataIndex: 'dia_chi_ip',
            key: 'dia_chi_ip',
            width: 120,
        },
        {
            title: 'Thời gian',
            dataIndex: 'thoi_gian',
            key: 'thoi_gian',
            width: 180,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Button 
                    icon={<EyeOutlined />} 
                    size="small" 
                    onClick={() => handleViewDetail(record)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    const tabItems = [
        { key: 'all', label: 'Tất cả' },
        { key: 'user', label: 'Theo người dùng' },
        { key: 'action', label: 'Theo hành động' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <HistoryOutlined style={{ marginRight: 8 }} />
                    Lịch sử Hệ thống (Logs)
                </Title>
                <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                    Tải lại
                </Button>
            </div>

            <Card bordered={false} style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Input
                            placeholder="Tìm kiếm..."
                            prefix={<SearchOutlined />}
                            onPressEnter={(e) => handleSearch(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Hành động"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(val) => handleFilterChange('hanh_dong', val)}
                        >
                            <Option value="CREATE">Tạo mới</Option>
                            <Option value="UPDATE">Cập nhật</Option>
                            <Option value="DELETE">Xóa</Option>
                            <Option value="LOGIN">Đăng nhập</Option>
                            <Option value="LOGOUT">Đăng xuất</Option>
                            <Option value="EXPORT">Xuất dữ liệu</Option>
                            <Option value="IMPORT">Nhập dữ liệu</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Loại người dùng"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(val) => handleFilterChange('loai_nguoi_dung', val)}
                        >
                            <Option value="Admin">Admin</Option>
                            <Option value="DoanhNghiep">Doanh nghiệp</Option>
                            <Option value="HaiQuan">Hải quan</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <RangePicker
                            style={{ width: '100%' }}
                            onChange={handleDateChange}
                        />
                    </Col>
                </Row>
            </Card>

            <Card bordered={false}>
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize })),
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <Modal
                title="Chi tiết Log"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={800}
            >
                {selectedRecord && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="ID">{selectedRecord.id}</Descriptions.Item>
                        <Descriptions.Item label="Hành động">
                            <Tag color={getHanhDongColor(selectedRecord.hanh_dong)}>{selectedRecord.hanh_dong}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại người dùng">
                            <Tag color={getLoaiNguoiDungColor(selectedRecord.loai_nguoi_dung)}>{selectedRecord.loai_nguoi_dung}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Người thực hiện">{selectedRecord.ten_nguoi_dung}</Descriptions.Item>
                        <Descriptions.Item label="Bảng">{selectedRecord.bang_lien_quan}</Descriptions.Item>
                        <Descriptions.Item label="ID bản ghi">{selectedRecord.id_ban_ghi}</Descriptions.Item>
                        <Descriptions.Item label="IP">{selectedRecord.dia_chi_ip}</Descriptions.Item>
                        <Descriptions.Item label="Thời gian">{selectedRecord.thoi_gian}</Descriptions.Item>
                        <Descriptions.Item label="Chi tiết thay đổi" span={2}>
                            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: 200, overflow: 'auto' }}>
                                {JSON.stringify(selectedRecord.chi_tiet_thay_doi || selectedRecord.noi_dung, null, 2)}
                            </pre>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default LogHeThong;