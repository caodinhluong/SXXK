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
    Popconfirm,
} from 'antd';
import {
    ReloadOutlined,
    SearchOutlined,
    DeleteOutlined,
    EyeOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { getAll, remove } from '../../services/canhbao.service';
import { showLoadError, showDeleteSuccess } from '../../components/notification';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CanhBao = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

    useEffect(() => {
        fetchData();
    }, [pagination.current, pagination.pageSize]);

    const fetchData = async (params = {}) => {
        try {
            setLoading(true);
            const res = await getAll({
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters,
                ...params,
            });
            
            const dataList = res.data || res || [];
            setData(Array.isArray(dataList) ? dataList : []);
            if (res.total) setPagination(prev => ({ ...prev, total: res.total }));
        } catch (err) {
            showLoadError('danh sách cảnh báo');
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

    const handleDelete = async (id) => {
        try {
            await remove(id);
            showDeleteSuccess('cảnh báo');
            fetchData();
        } catch (err) {
            message.error('Không thể xóa cảnh báo');
        }
    };

    const handleViewDetail = (record) => {
        setSelectedRecord(record);
        setModalVisible(true);
    };

    const getLoaiCanhBaoColor = (loai) => {
        const colors = {
            'TonKhoAm': 'red',
            'ThatThoat': 'orange',
            'QuaHan': 'gold',
            'ViPham': 'purple',
            'CanhBao': 'blue',
        };
        return colors[loai] || 'default';
    };

    const getTrangThaiColor = (trangThai) => {
        const colors = {
            'Moi': 'blue',
            'DangXacMinh': 'orange',
            'DaXuLy': 'green',
            'DaDong': 'gray',
        };
        return colors[trangThai] || 'default';
    };

    const columns = [
        {
            title: 'Mã CB',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id) => `#${id}`,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'tieu_de',
            key: 'tieu_de',
            ellipsis: true,
        },
        {
            title: 'Loại cảnh báo',
            dataIndex: 'loai_canh_bao',
            key: 'loai_canh_bao',
            render: (loai) => <Tag color={getLoaiCanhBaoColor(loai)}>{loai}</Tag>,
        },
        {
            title: 'Mức độ',
            dataIndex: 'muc_do',
            key: 'muc_do',
            render: (mucDo) => (
                <Tag color={mucDo === 'Cao' ? 'red' : mucDo === 'TrungBinh' ? 'orange' : 'blue'}>
                    {mucDo}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            render: (tt) => <Tag color={getTrangThaiColor(tt)}>{tt}</Tag>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'ngay_tao',
            key: 'ngay_tao',
            width: 120,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetail(record)}>
                        Xem
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <BellOutlined style={{ marginRight: 8 }} />
                    Quản lý Cảnh báo
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
                            placeholder="Loại cảnh báo"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(val) => handleFilterChange('loai_canh_bao', val)}
                        >
                            <Option value="TonKhoAm">Tồn kho âm</Option>
                            <Option value="ThatThoat">Thất thoát</Option>
                            <Option value="QuaHan">Quá hạn</Option>
                            <Option value="ViPham">Vi phạm</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(val) => handleFilterChange('trang_thai', val)}
                        >
                            <Option value="Moi">Mới</Option>
                            <Option value="DangXacMinh">Đang xác minh</Option>
                            <Option value="DaXuLy">Đã xử lý</Option>
                            <Option value="DaDong">Đã đóng</Option>
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
                    scroll={{ x: 1000 }}
                />
            </Card>

            <Modal
                title="Chi tiết Cảnh báo"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={700}
            >
                {selectedRecord && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Mã cảnh báo">{selectedRecord.id}</Descriptions.Item>
                        <Descriptions.Item label="Loại">{selectedRecord.loai_canh_bao}</Descriptions.Item>
                        <Descriptions.Item label="Tiêu đề" span={2}>{selectedRecord.tieu_de}</Descriptions.Item>
                        <Descriptions.Item label="Nội dung" span={2}>{selectedRecord.noi_dung}</Descriptions.Item>
                        <Descriptions.Item label="Mức độ">{selectedRecord.muc_do}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">{selectedRecord.trang_thai}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{selectedRecord.ngay_tao}</Descriptions.Item>
                        <Descriptions.Item label="Ngày xử lý">{selectedRecord.ngay_xu_ly || '-'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default CanhBao;