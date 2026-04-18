import React, { useState, useEffect } from "react";
import {
    Form,
    Select,
    DatePicker,
    Button,
    Table,
    InputNumber,
    Input,
    Typography,
    Popconfirm,
    Row,
    Col,
    Card,
    Space,
    Modal,
    Tag,
    Descriptions,
    Statistic,
    Divider,
    Tooltip,
    Badge,
} from "antd";
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    CloseSquareOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { getAllSanPham } from "../../services/sanpham.service";
import { 
    getAll,
    getById, 
    create, 
    update,
    remove 
} from "../../services/phieusanxuat.service";
import {
    showCreateSuccess,
    showUpdateSuccess,
    showDeleteSuccess,
    showLoadError,
    showSaveError,
    showError
} from "../../components/notification";
import { extractErrorMessage } from "../../utils/errorHandler";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Hàm format số theo kiểu Việt Nam (1.000.000)
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const PhieuSanXuat = () => {
    const [form] = Form.useForm();

    const [spList, setSpList] = useState([]);
    const [phieuList, setPhieuList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedPhieu, setSelectedPhieu] = useState(null);

    // Fetch danh sách phiếu sản xuất
    const fetchPhieuList = async () => {
        setLoading(true);
        try {
            const response = await getAll();
            const data = response?.data || response || [];
            setPhieuList(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError('danh sách phiếu sản xuất', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Fetch danh sách sản phẩm
    const fetchSanPham = async () => {
        try {
            const response = await getAllSanPham();
            const data = Array.isArray(response) ? response : (response?.data || response || []);
            setSpList(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError('danh sách sản phẩm', errorMsg);
        }
    };

    useEffect(() => {
        fetchPhieuList();
        fetchSanPham();
    }, []);

    // Mở modal tạo mới
    const handleCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            ngay_sx: dayjs(),
            trang_thai: 'KeHoach',
            so_luong_ke_hoach: 1
        });
        setModalVisible(true);
    };

    // Mở modal sửa
    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            ngay_sx: record.ngay_sx ? dayjs(record.ngay_sx) : null,
        });
        setModalVisible(true);
    };

    // Xem chi tiết
    const handleView = async (record) => {
        try {
            const response = await getById(record.id_sx);
            const data = response?.data || response;
            setSelectedPhieu(data);
            setViewModalVisible(true);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showError('Lỗi khi tải chi tiết', errorMsg);
        }
    };

    // Xóa phiếu
    const handleDelete = async (id) => {
        try {
            await remove(id);
            showDeleteSuccess('phiếu sản xuất');
            fetchPhieuList();
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showError('Lỗi khi xóa', errorMsg);
        }
    };

    // Submit form
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                ngay_sx: values.ngay_sx ? values.ngay_sx.format('YYYY-MM-DD') : null,
            };

            if (editingRecord) {
                await update(editingRecord.id_sx, payload);
                showUpdateSuccess('phiếu sản xuất');
            } else {
                await create(payload);
                showCreateSuccess('phiếu sản xuất');
            }

            setModalVisible(false);
            form.resetFields();
            fetchPhieuList();
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showSaveError('phiếu sản xuất', errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Render trạng thái với icon
    const renderTrangThai = (trangThai) => {
        const statusConfig = {
            'KeHoach': { 
                color: 'blue', 
                label: 'Kế hoạch',
                icon: <ClockCircleOutlined />
            },
            'DangSanXuat': { 
                color: 'orange', 
                label: 'Đang sản xuất',
                icon: <SyncOutlined spin />
            },
            'HoanThanh': { 
                color: 'green', 
                label: 'Hoàn thành',
                icon: <CheckCircleOutlined />
            },
            'Huy': { 
                color: 'red', 
                label: 'Hủy',
                icon: <CloseSquareOutlined />
            }
        };
        
        const config = statusConfig[trangThai] || statusConfig['KeHoach'];
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.label}
            </Tag>
        );
    };

    // Columns cho table với improved UI
    const columns = [
        {
            title: 'Số phiếu',
            dataIndex: 'so_phieu',
            key: 'so_phieu',
            width: '11%',
            render: (text) => (
                <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Ngày SX',
            dataIndex: 'ngay_sx',
            key: 'ngay_sx',
            width: '10%',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
            sorter: (a, b) => dayjs(a.ngay_sx).unix() - dayjs(b.ngay_sx).unix(),
        },
        {
            title: 'Ca kíp',
            dataIndex: 'ca_kip',
            key: 'ca_kip',
            width: '8%',
            render: (text) => text || '-',
        },
        {
            title: 'Sản phẩm',
            dataIndex: ['sanPham', 'ten_sp'],
            key: 'ten_sp',
            width: '18%',
            ellipsis: true,
            render: (text, record) => (
                <Tooltip title={text || record.id_sp}>
                    <Text>{text || record.id_sp}</Text>
                </Tooltip>
            ),
        },
        {
            title: 'SL Kế hoạch',
            dataIndex: 'so_luong_ke_hoach',
            key: 'so_luong_ke_hoach',
            width: '11%',
            align: 'right',
            render: (value) => (
                <Text type="secondary">{formatVNNumber(value)}</Text>
            ),
        },
        {
            title: 'SL Thực tế',
            dataIndex: 'so_luong_thuc_te',
            key: 'so_luong_thuc_te',
            width: '11%',
            align: 'right',
            render: (value, record) => {
                if (!value) return <Text type="secondary">-</Text>;
                const isComplete = value >= record.so_luong_ke_hoach;
                return (
                    <Text type={isComplete ? "success" : "warning"} strong>
                        {formatVNNumber(value)}
                    </Text>
                );
            },
        },
        {
            title: 'Tỷ lệ HT',
            dataIndex: 'ty_le_hoan_thanh',
            key: 'ty_le_hoan_thanh',
            width: '9%',
            align: 'center',
            render: (value) => {
                if (!value) return <Text type="secondary">-</Text>;
                let color = 'default';
                if (value >= 100) color = 'success';
                else if (value >= 80) color = 'processing';
                else if (value >= 50) color = 'warning';
                else color = 'error';
                
                return (
                    <Badge 
                        count={`${value}%`} 
                        style={{ 
                            backgroundColor: 
                                color === 'success' ? '#52c41a' :
                                color === 'processing' ? '#1890ff' :
                                color === 'warning' ? '#faad14' : '#ff4d4f'
                        }} 
                    />
                );
            },
            sorter: (a, b) => (a.ty_le_hoan_thanh || 0) - (b.ty_le_hoan_thanh || 0),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: '12%',
            filters: [
                { text: 'Kế hoạch', value: 'KeHoach' },
                { text: 'Đang sản xuất', value: 'DangSanXuat' },
                { text: 'Hoàn thành', value: 'HoanThanh' },
                { text: 'Hủy', value: 'Huy' },
            ],
            onFilter: (value, record) => record.trang_thai === value,
            render: renderTrangThai,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa phiếu này?"
                        onConfirm={() => handleDelete(record.id_sx)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng phiếu"
                            value={phieuList.length}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Kế hoạch"
                            value={phieuList.filter(p => p.trang_thai === 'KeHoach').length}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đang sản xuất"
                            value={phieuList.filter(p => p.trang_thai === 'DangSanXuat').length}
                            prefix={<SyncOutlined spin />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={phieuList.filter(p => p.trang_thai === 'HoanThanh').length}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Table Card */}
            <Card 
                title={
                    <Space>
                        <FileTextOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                        <Title level={4} style={{ margin: 0 }}>Quản lý Phiếu Sản Xuất</Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Tooltip title="Làm mới dữ liệu">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchPhieuList}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            size="large"
                        >
                            Tạo phiếu mới
                        </Button>
                    </Space>
                }
                bordered={false}
            >
                <Table
                    dataSource={phieuList}
                    columns={columns}
                    loading={loading}
                    rowKey="id_sx"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} phiếu`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    size="middle"
                />
            </Card>

            {/* Modal Tạo/Sửa với improved UI */}
            <Modal
                title={
                    <Space>
                        {editingRecord ? <EditOutlined /> : <PlusOutlined />}
                        <span>{editingRecord ? 'Cập nhật Phiếu Sản Xuất' : 'Tạo Phiếu Sản Xuất Mới'}</span>
                    </Space>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={900}
                destroyOnClose
            >
                <Divider style={{ margin: '16px 0' }} />
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Card 
                        title="Thông tin cơ bản" 
                        size="small" 
                        style={{ marginBottom: 16 }}
                        headStyle={{ background: '#fafafa' }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="so_phieu"
                                    label="Số phiếu"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số phiếu' },
                                        { min: 3, message: 'Số phiếu phải có ít nhất 3 ký tự' },
                                        { max: 50, message: 'Số phiếu không được vượt quá 50 ký tự' },
                                        { 
                                            pattern: /^[A-Za-z0-9\-_]+$/, 
                                            message: 'Số phiếu chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới' 
                                        }
                                    ]}
                                >
                                    <Input 
                                        placeholder="Nhập số phiếu (VD: PSX-2024-001)" 
                                        prefix={<FileTextOutlined />}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="ngay_sx"
                                    label="Ngày sản xuất"
                                    rules={[
                                        { required: true, message: 'Vui lòng chọn ngày sản xuất' },
                                        {
                                            validator: (_, value) => {
                                                if (!value) {
                                                    return Promise.resolve();
                                                }
                                                if (!value.isValid()) {
                                                    return Promise.reject(new Error('Ngày không hợp lệ'));
                                                }
                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày sản xuất"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="ca_kip"
                                    label="Ca kíp"
                                    rules={[
                                        { min: 2, message: 'Ca kíp phải có ít nhất 2 ký tự' },
                                        { max: 50, message: 'Ca kíp không được vượt quá 50 ký tự' }
                                    ]}
                                >
                                    <Input placeholder="Nhập ca kíp (VD: Ca 1, Ca 2, Ca 3)" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="id_sp"
                                    label="Sản phẩm"
                                    rules={[{ required: true, message: 'Vui lòng chọn sản phẩm cần sản xuất' }]}
                                >
                                    <Select
                                        placeholder="Chọn sản phẩm cần sản xuất"
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {spList.map(sp => (
                                            <Option key={sp.id_sp} value={sp.id_sp}>
                                                {sp.ten_sp}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Card 
                        title="Số lượng và tiến độ" 
                        size="small" 
                        style={{ marginBottom: 16 }}
                        headStyle={{ background: '#fafafa' }}
                    >
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="so_luong_ke_hoach"
                                    label="Số lượng kế hoạch"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số lượng kế hoạch' },
                                        { 
                                            type: 'number', 
                                            min: 0.001, 
                                            message: 'Số lượng phải lớn hơn 0' 
                                        },
                                        {
                                            validator: (_, value) => {
                                                if (value && value < 0) {
                                                    return Promise.reject(new Error('Số lượng không được âm'));
                                                }
                                                if (value && value > 999999999) {
                                                    return Promise.reject(new Error('Số lượng không được vượt quá 999,999,999'));
                                                }
                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="Nhập số lượng kế hoạch"
                                        min={0}
                                        step={0.001}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="so_luong_thuc_te"
                                    label="Số lượng thực tế"
                                    rules={[
                                        { 
                                            type: 'number', 
                                            min: 0, 
                                            message: 'Số lượng phải lớn hơn hoặc bằng 0' 
                                        },
                                        {
                                            validator: (_, value) => {
                                                if (value && value < 0) {
                                                    return Promise.reject(new Error('Số lượng không được âm'));
                                                }
                                                if (value && value > 999999999) {
                                                    return Promise.reject(new Error('Số lượng không được vượt quá 999,999,999'));
                                                }
                                                const soLuongKeHoach = form.getFieldValue('so_luong_ke_hoach');
                                                if (value && soLuongKeHoach && value > soLuongKeHoach * 1.5) {
                                                    return Promise.reject(new Error(`Số lượng thực tế vượt quá 150% kế hoạch (${formatVNNumber(soLuongKeHoach * 1.5)})`));
                                                }
                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="Nhập số lượng thực tế"
                                        min={0}
                                        step={0.001}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="ty_le_hoan_thanh"
                                    label="Tỷ lệ hoàn thành (%)"
                                    rules={[
                                        { 
                                            type: 'number', 
                                            min: 0, 
                                            max: 100, 
                                            message: 'Tỷ lệ phải từ 0 đến 100%' 
                                        },
                                        {
                                            validator: (_, value) => {
                                                if (value && value < 0) {
                                                    return Promise.reject(new Error('Tỷ lệ không được âm'));
                                                }
                                                if (value && value > 100) {
                                                    return Promise.reject(new Error('Tỷ lệ không được vượt quá 100%'));
                                                }
                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="Nhập tỷ lệ 0-100"
                                        min={0}
                                        max={100}
                                        step={0.01}
                                        formatter={value => `${value}%`}
                                        parser={value => value.replace('%', '')}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Card 
                        title="Trạng thái và người phụ trách" 
                        size="small" 
                        style={{ marginBottom: 16 }}
                        headStyle={{ background: '#fafafa' }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="trang_thai"
                                    label="Trạng thái"
                                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái phiếu' }]}
                                >
                                    <Select placeholder="Chọn trạng thái phiếu">
                                        <Option value="KeHoach">
                                            <Space>
                                                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                                Kế hoạch
                                            </Space>
                                        </Option>
                                        <Option value="DangSanXuat">
                                            <Space>
                                                <SyncOutlined style={{ color: '#faad14' }} />
                                                Đang sản xuất
                                            </Space>
                                        </Option>
                                        <Option value="HoanThanh">
                                            <Space>
                                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                Hoàn thành
                                            </Space>
                                        </Option>
                                        <Option value="Huy">
                                            <Space>
                                                <CloseSquareOutlined style={{ color: '#ff4d4f' }} />
                                                Hủy
                                            </Space>
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="nguoi_phu_trach"
                                    label="Người phụ trách"
                                    rules={[
                                        { min: 2, message: 'Tên người phụ trách phải có ít nhất 2 ký tự' },
                                        { max: 100, message: 'Tên người phụ trách không được vượt quá 100 ký tự' },
                                        {
                                            pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                                            message: 'Tên chỉ được chứa chữ cái và khoảng trắng'
                                        }
                                    ]}
                                >
                                    <Input placeholder="Nhập tên người phụ trách" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="ghi_chu"
                            label="Ghi chú"
                            rules={[
                                { max: 500, message: 'Ghi chú không được vượt quá 500 ký tự' }
                            ]}
                        >
                            <TextArea
                                rows={3}
                                placeholder="Nhập ghi chú về phiếu sản xuất..."
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </Card>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space size="middle">
                            <Button
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                }}
                                size="large"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={submitting}
                                size="large"
                            >
                                {editingRecord ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Xem Chi Tiết với improved UI */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined style={{ color: '#1890ff' }} />
                        <span>Chi tiết Phiếu Sản Xuất</span>
                    </Space>
                }
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button 
                        key="close" 
                        type="primary"
                        onClick={() => setViewModalVisible(false)}
                    >
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {selectedPhieu && (
                    <>
                        <Divider style={{ margin: '16px 0' }} />
                        <Descriptions 
                            bordered 
                            column={2}
                            size="middle"
                            labelStyle={{ fontWeight: 600, background: '#fafafa' }}
                        >
                            <Descriptions.Item label="Số phiếu" span={2}>
                                <Space>
                                    <FileTextOutlined style={{ color: '#1890ff' }} />
                                    <Text strong style={{ fontSize: '16px' }}>
                                        {selectedPhieu.so_phieu}
                                    </Text>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sản xuất">
                                {selectedPhieu.ngay_sx ? dayjs(selectedPhieu.ngay_sx).format('DD/MM/YYYY') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ca kíp">
                                {selectedPhieu.ca_kip || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sản phẩm" span={2}>
                                <Text strong>{selectedPhieu.sanPham?.ten_sp || selectedPhieu.id_sp}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số lượng kế hoạch">
                                <Text type="secondary" strong>
                                    {formatVNNumber(selectedPhieu.so_luong_ke_hoach)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số lượng thực tế">
                                {selectedPhieu.so_luong_thuc_te ? (
                                    <Text 
                                        type={selectedPhieu.so_luong_thuc_te >= selectedPhieu.so_luong_ke_hoach ? "success" : "warning"} 
                                        strong
                                    >
                                        {formatVNNumber(selectedPhieu.so_luong_thuc_te)}
                                    </Text>
                                ) : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tỷ lệ hoàn thành">
                                {selectedPhieu.ty_le_hoan_thanh ? (
                                    <Badge 
                                        count={`${selectedPhieu.ty_le_hoan_thanh}%`} 
                                        style={{ 
                                            backgroundColor: 
                                                selectedPhieu.ty_le_hoan_thanh >= 100 ? '#52c41a' :
                                                selectedPhieu.ty_le_hoan_thanh >= 80 ? '#1890ff' :
                                                selectedPhieu.ty_le_hoan_thanh >= 50 ? '#faad14' : '#ff4d4f'
                                        }} 
                                    />
                                ) : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {renderTrangThai(selectedPhieu.trang_thai)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người phụ trách" span={2}>
                                {selectedPhieu.nguoi_phu_trach || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú" span={2}>
                                <Text type="secondary">
                                    {selectedPhieu.ghi_chu || 'Không có ghi chú'}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default PhieuSanXuat;
