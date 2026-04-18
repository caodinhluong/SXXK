import React, { useState, useEffect, useMemo } from "react";
import {
    Form,
    Select,
    DatePicker,
    Button,
    Table,
    Input,
    InputNumber,
    Typography,
    Row,
    Col,
    Card,
    Space,
    Modal,
    Popconfirm,
    Descriptions,
    Tag,
    Divider,
    Statistic,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    SaveOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    DollarOutlined,
    PercentageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { getAll as getAllDoanhNghiep } from "../../services/doanhnghiep.service";
import { getAll as getAllSanPham } from "../../services/sanpham.service";
import { getAll as getAllNPL } from "../../services/nguyenphulieu.service";
import {
    getAll,
    getById,
    create,
    update,
    remove,
} from "../../services/hoadonnoidia.service";
import {
    showCreateSuccess,
    showUpdateSuccess,
    showDeleteSuccess,
    showLoadError,
    showSaveError,
} from "../../components/notification";
import { extractErrorMessage } from "../../utils/errorHandler";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Format số theo kiểu Việt Nam
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return "";
    return Number(value).toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const HoaDonNoiDia = () => {
    const [form] = Form.useForm();

    // State
    const [doanhNghiepList, setDoanhNghiepList] = useState([]);
    const [sanPhamList, setSanPhamList] = useState([]);
    const [nplList, setNplList] = useState([]);
    const [hoaDonList, setHoaDonList] = useState([]);
    const [chiTiets, setChiTiets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedHoaDon, setSelectedHoaDon] = useState(null);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
        fetchHoaDonList();
    }, []);

    const fetchData = async () => {
        try {
            const [dnRes, spRes, nplRes] = await Promise.all([
                getAllDoanhNghiep(),
                getAllSanPham(),
                getAllNPL(),
            ]);
            console.log('DN Res:', dnRes);
            console.log('SP Res:', spRes);
            console.log('NPL Res:', nplRes);
            const dnData = Array.isArray(dnRes) ? dnRes : (dnRes?.data || []);
            const spData = Array.isArray(spRes) ? spRes : (spRes?.data || []);
            const nplData = Array.isArray(nplRes) ? nplRes : (nplRes?.data || []);
            setDoanhNghiepList(Array.isArray(dnData) ? dnData : []);
            setSanPhamList(Array.isArray(spData) ? spData : []);
            setNplList(Array.isArray(nplData) ? nplData : []);
        } catch (error) {
            console.error('Fetch data error:', error);
            const errorMsg = extractErrorMessage(error);
            showLoadError("dữ liệu danh mục", errorMsg);
        }
    };

const fetchHoaDonList = async () => {
        setLoading(true);
        try {
            const response = await getAll();
            console.log('HoaDon Response:', response);
            const data = response?.success ? response.data : (response || []);
            console.log('HoaDon Data:', data);
            setHoaDonList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('HoaDon Error:', error);
            const errorMsg = extractErrorMessage(error);
            showLoadError("danh sách hóa đơn nội địa", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 AUTOMATIC TAX CALCULATION - Tính toán thuế tự động
    const calculatedTotals = useMemo(() => {
        let tong_tien = 0;
        let thue_gtgt = 0;

        chiTiets.forEach((item) => {
            const thanh_tien = (item.so_luong || 0) * (item.don_gia || 0);
            const thue_suat = item.thue_suat || 0;

            tong_tien += thanh_tien;
            thue_gtgt += (thanh_tien * thue_suat) / 100;
        });

        const tong_thanh_toan = tong_tien + thue_gtgt;

        return {
            tong_tien: parseFloat(tong_tien.toFixed(2)),
            thue_gtgt: parseFloat(thue_gtgt.toFixed(2)),
            tong_thanh_toan: parseFloat(tong_thanh_toan.toFixed(2)),
        };
    }, [chiTiets]);

    // Handle create
    const handleCreate = () => {
        setEditingItem(null);
        form.resetFields();
        form.setFieldsValue({
            ngay_hd: dayjs(),
            trang_thai: "ChuaThanhToan",
        });
        setChiTiets([]);
        setModalVisible(true);
    };

    // Handle edit
    const handleEdit = async (record) => {
        try {
            const response = await getById(record.id_hd_nd);
            const data = response?.data || response;

            setEditingItem(data);
            form.setFieldsValue({
                id_dn: data.id_dn,
                so_hd: data.so_hd,
                ngay_hd: data.ngay_hd ? dayjs(data.ngay_hd) : null,
                khach_hang: data.khach_hang,
                dia_chi: data.dia_chi,
                ma_so_thue: data.ma_so_thue,
                trang_thai: data.trang_thai,
                ghi_chu: data.ghi_chu,
            });

            // Load chi tiết
            const chiTietData = (data.chiTiets || []).map((item, index) => ({
                key: index + 1,
                id_sp: item.id_sp,
                id_npl: item.id_npl,
                so_luong: item.so_luong,
                don_gia: item.don_gia,
                thue_suat: item.thue_suat || 0,
                thanh_tien: item.thanh_tien,
            }));

            setChiTiets(chiTietData);
            setModalVisible(true);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("chi tiết hóa đơn", errorMsg);
        }
    };

    // Handle view
    const handleView = async (record) => {
        try {
            const response = await getById(record.id_hd_nd);
            const data = response?.data || response;
            setSelectedHoaDon(data);
            setViewModalVisible(true);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("chi tiết hóa đơn", errorMsg);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            await remove(id);
            showDeleteSuccess("hóa đơn nội địa");
            fetchHoaDonList();
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showSaveError("xóa hóa đơn", errorMsg);
        }
    };

    // Handle submit
    const handleSubmit = async (values) => {
        if (chiTiets.length === 0) {
            showSaveError("hóa đơn", "Vui lòng thêm ít nhất một chi tiết hóa đơn");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                id_dn: values.id_dn,
                so_hd: values.so_hd,
                ngay_hd: values.ngay_hd ? values.ngay_hd.format("YYYY-MM-DD") : null,
                khach_hang: values.khach_hang,
                dia_chi: values.dia_chi,
                ma_so_thue: values.ma_so_thue,
                trang_thai: values.trang_thai,
                ghi_chu: values.ghi_chu,
                chiTiets: chiTiets.map((item) => ({
                    id_sp: item.id_sp || null,
                    id_npl: item.id_npl || null,
                    so_luong: item.so_luong,
                    don_gia: item.don_gia,
                    thue_suat: item.thue_suat || 0,
                })),
            };

            if (editingItem) {
                await update(editingItem.id_hd_nd, payload);
                showUpdateSuccess("hóa đơn nội địa");
            } else {
                await create(payload);
                showCreateSuccess("hóa đơn nội địa");
            }

            setModalVisible(false);
            form.resetFields();
            setChiTiets([]);
            fetchHoaDonList();
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showSaveError("hóa đơn nội địa", errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Chi tiết handlers
    const handleAddChiTiet = () => {
        const newKey = chiTiets.length > 0 ? Math.max(...chiTiets.map((c) => c.key)) + 1 : 1;
        setChiTiets([
            ...chiTiets,
            {
                key: newKey,
                id_sp: null,
                id_npl: null,
                so_luong: 1,
                don_gia: 0,
                thue_suat: 10, // Default 10% VAT
                thanh_tien: 0,
            },
        ]);
    };

    const handleRemoveChiTiet = (key) => {
        setChiTiets(chiTiets.filter((item) => item.key !== key));
    };

    const handleChiTietChange = (key, field, value) => {
        setChiTiets((prev) =>
            prev.map((item) => {
                if (item.key === key) {
                    const updated = { ...item, [field]: value };

                    // Auto-calculate thanh_tien when so_luong or don_gia changes
                    if (field === "so_luong" || field === "don_gia") {
                        updated.thanh_tien = (updated.so_luong || 0) * (updated.don_gia || 0);
                    }

                    // Clear the other field when selecting SP or NPL
                    if (field === "id_sp" && value) {
                        updated.id_npl = null;
                    } else if (field === "id_npl" && value) {
                        updated.id_sp = null;
                    }

                    return updated;
                }
                return item;
            })
        );
    };

    // Render trạng thái
    const renderTrangThai = (trangThai) => {
        const config = {
            ChuaThanhToan: { color: "warning", label: "Chưa thanh toán" },
            DaThanhToan: { color: "success", label: "Đã thanh toán" },
            Huy: { color: "error", label: "Đã hủy" },
        };
        const item = config[trangThai] || config["ChuaThanhToan"];
        return <Tag color={item.color}>{item.label}</Tag>;
    };

    // Table columns
    const columns = [
        {
            title: "Mã HĐ",
            dataIndex: "id_hd_nd",
            key: "id_hd_nd",
            width: 100,
            render: (text) => <Text strong>HD-{String(text).padStart(5, "0")}</Text>,
        },
        {
            title: "Số hóa đơn",
            dataIndex: "so_hd",
            key: "so_hd",
            width: 150,
        },
        {
            title: "Ngày hóa đơn",
            dataIndex: "ngay_hd",
            key: "ngay_hd",
            width: 130,
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
            sorter: (a, b) => dayjs(a.ngay_hd).unix() - dayjs(b.ngay_hd).unix(),
        },
        {
            title: "Khách hàng",
            dataIndex: "khach_hang",
            key: "khach_hang",
            width: 200,
            ellipsis: true,
        },
        {
            title: "Doanh nghiệp",
            dataIndex: ["doanhNghiep", "ten_dn"],
            key: "ten_dn",
            width: 200,
            ellipsis: true,
        },
        {
            title: "Tổng tiền",
            dataIndex: "tong_tien",
            key: "tong_tien",
            width: 130,
            align: "right",
            render: (value) => <Text strong>{formatVNNumber(value)}</Text>,
        },
        {
            title: "Thuế GTGT",
            dataIndex: "thue_gtgt",
            key: "thue_gtgt",
            width: 130,
            align: "right",
            render: (value) => <Text type="warning">{formatVNNumber(value)}</Text>,
        },
        {
            title: "Tổng thanh toán",
            dataIndex: "tong_thanh_toan",
            key: "tong_thanh_toan",
            width: 150,
            align: "right",
            render: (value) => (
                <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                    {formatVNNumber(value)}
                </Text>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            width: 150,
            filters: [
                { text: "Chưa thanh toán", value: "ChuaThanhToan" },
                { text: "Đã thanh toán", value: "DaThanhToan" },
                { text: "Đã hủy", value: "Huy" },
            ],
            onFilter: (value, record) => record.trang_thai === value,
            render: renderTrangThai,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            fixed: "right",
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
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa hóa đơn này?"
                        onConfirm={() => handleDelete(record.id_hd_nd)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Chi tiết columns for modal
    const chiTietColumns = [
        {
            title: "Sản phẩm",
            dataIndex: "id_sp",
            key: "id_sp",
            width: 200,
            render: (value, record) => (
                <Select
                    placeholder="Chọn sản phẩm"
                    style={{ width: "100%" }}
                    value={value}
                    onChange={(val) => handleChiTietChange(record.key, "id_sp", val)}
                    showSearch
                    optionFilterProp="children"
                    disabled={!!record.id_npl}
                >
                    {sanPhamList.map((sp) => (
                        <Option key={sp.id_sp} value={sp.id_sp}>
                            {sp.ten_sp}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Nguyên phụ liệu",
            dataIndex: "id_npl",
            key: "id_npl",
            width: 200,
            render: (value, record) => (
                <Select
                    placeholder="Chọn NPL"
                    style={{ width: "100%" }}
                    value={value}
                    onChange={(val) => handleChiTietChange(record.key, "id_npl", val)}
                    showSearch
                    optionFilterProp="children"
                    disabled={!!record.id_sp}
                >
                    {nplList.map((npl) => (
                        <Option key={npl.id_npl} value={npl.id_npl}>
                            {npl.ten_npl}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Số lượng",
            dataIndex: "so_luong",
            key: "so_luong",
            width: 120,
            render: (value, record) => (
                <InputNumber
                    min={0.01}
                    value={value}
                    onChange={(val) => handleChiTietChange(record.key, "so_luong", val)}
                    style={{ width: "100%" }}
                    placeholder="Số lượng"
                />
            ),
        },
        {
            title: "Đơn giá",
            dataIndex: "don_gia",
            key: "don_gia",
            width: 130,
            render: (value, record) => (
                <InputNumber
                    min={0}
                    value={value}
                    onChange={(val) => handleChiTietChange(record.key, "don_gia", val)}
                    style={{ width: "100%" }}
                    placeholder="Đơn giá"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
            ),
        },
        {
            title: "Thuế suất (%)",
            dataIndex: "thue_suat",
            key: "thue_suat",
            width: 120,
            render: (value, record) => (
                <InputNumber
                    min={0}
                    max={100}
                    value={value}
                    onChange={(val) => handleChiTietChange(record.key, "thue_suat", val)}
                    style={{ width: "100%" }}
                    placeholder="Thuế %"
                />
            ),
        },
        {
            title: "Thành tiền",
            dataIndex: "thanh_tien",
            key: "thanh_tien",
            width: 130,
            align: "right",
            render: (value, record) => {
                const thanh_tien = (record.so_luong || 0) * (record.don_gia || 0);
                return <Text strong>{formatVNNumber(thanh_tien)}</Text>;
            },
        },
        {
            title: "Thao tác",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveChiTiet(record.key)}
                    size="small"
                />
            ),
        },
    ];

    return (
        <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng hóa đơn"
                            value={hoaDonList.length}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chưa thanh toán"
                            value={hoaDonList.filter((h) => h.trang_thai === "ChuaThanhToan").length}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã thanh toán"
                            value={hoaDonList.filter((h) => h.trang_thai === "DaThanhToan").length}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
<Statistic
    title="Tổng doanh thu"
    value={hoaDonList
        .filter((h) => h.trang_thai === "DaThanhToan")
        .reduce((sum, h) => {
            const val = parseFloat(h.tong_thanh_toan);
            return sum + (isNaN(val) ? 0 : val);
        }, 0)}
    prefix={<DollarOutlined />}
    valueStyle={{ color: "#52c41a" }}
    formatter={(value) => formatVNNumber(value)}
/>
                    </Card>
                </Col>
            </Row>

            {/* Main Table Card */}
            <Card
                title={
                    <Space>
                        <FileTextOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
                        <Title level={4} style={{ margin: 0 }}>
                            Quản Lý Hóa Đơn Nội Địa
                        </Title>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
                        Tạo hóa đơn mới
                    </Button>
                }
                bordered={false}
            >
                <Table
                    dataSource={hoaDonList}
                    columns={columns}
                    loading={loading}
                    rowKey="id_hd_nd"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} hóa đơn`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    scroll={{ x: 1800 }}
                    size="middle"
                />
            </Card>

            {/* Modal Tạo/Sửa hóa đơn */}
            <Modal
                title={
                    <Space>
                        {editingItem ? <EditOutlined /> : <PlusOutlined />}
                        <span>{editingItem ? "Cập nhật" : "Tạo"} Hóa Đơn Nội Địa</span>
                    </Space>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setChiTiets([]);
                }}
                footer={null}
                width={1200}
                destroyOnClose
            >
                <Divider style={{ margin: "16px 0" }} />
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="id_dn"
                                label="Doanh nghiệp"
                                rules={[{ required: true, message: "Vui lòng chọn doanh nghiệp" }]}
                            >
                                <Select placeholder="Chọn doanh nghiệp" showSearch optionFilterProp="children">
                                    {doanhNghiepList.map((dn) => (
                                        <Option key={dn.id_dn} value={dn.id_dn}>
                                            {dn.ten_dn}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="so_hd"
                                label="Số hóa đơn"
                                rules={[
                                    { required: true, message: "Vui lòng nhập số hóa đơn" },
                                    { min: 2, message: "Số hóa đơn phải có ít nhất 2 ký tự" },
                                ]}
                            >
                                <Input placeholder="Nhập số hóa đơn" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="ngay_hd"
                                label="Ngày hóa đơn"
                                rules={[{ required: true, message: "Vui lòng chọn ngày hóa đơn" }]}
                            >
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="khach_hang"
                                label="Khách hàng"
                                rules={[
                                    { required: true, message: "Vui lòng nhập tên khách hàng" },
                                    { min: 2, message: "Tên khách hàng phải có ít nhất 2 ký tự" },
                                ]}
                            >
                                <Input placeholder="Nhập tên khách hàng" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="ma_so_thue" label="Mã số thuế">
                                <Input placeholder="Nhập mã số thuế" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item name="dia_chi" label="Địa chỉ">
                                <Input placeholder="Nhập địa chỉ khách hàng" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="trang_thai"
                                label="Trạng thái"
                                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="ChuaThanhToan">Chưa thanh toán</Option>
                                    <Option value="DaThanhToan">Đã thanh toán</Option>
                                    <Option value="Huy">Đã hủy</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" maxLength={500} showCount />
                    </Form.Item>

                    <Divider>Chi tiết hóa đơn</Divider>

                    <Button type="dashed" onClick={handleAddChiTiet} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                        Thêm chi tiết
                    </Button>

                    <Table
                        dataSource={chiTiets}
                        columns={chiTietColumns}
                        pagination={false}
                        rowKey="key"
                        size="small"
                        scroll={{ x: 1000 }}
                        locale={{ emptyText: "Chưa có chi tiết hóa đơn" }}
                    />

                    {/* 🔥 AUTOMATIC TAX CALCULATION DISPLAY - Hiển thị tính toán thuế tự động */}
                    {chiTiets.length > 0 && (
                        <Card style={{ marginTop: 16, background: "#fafafa" }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng tiền hàng"
                                        value={calculatedTotals.tong_tien}
                                        precision={2}
                                        valueStyle={{ color: "#1890ff" }}
                                        formatter={(value) => formatVNNumber(value)}
                                        prefix={<DollarOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Thuế GTGT (tự động)"
                                        value={calculatedTotals.thue_gtgt}
                                        precision={2}
                                        valueStyle={{ color: "#faad14" }}
                                        formatter={(value) => formatVNNumber(value)}
                                        prefix={<PercentageOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng thanh toán"
                                        value={calculatedTotals.tong_thanh_toan}
                                        precision={2}
                                        valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
                                        formatter={(value) => formatVNNumber(value)}
                                        prefix={<DollarOutlined />}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    )}

                    <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
                        <Space size="middle">
                            <Button
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                    setChiTiets([]);
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
                                disabled={chiTiets.length === 0}
                            >
                                {editingItem ? "Cập nhật" : "Tạo"} hóa đơn
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Xem Chi Tiết */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined style={{ color: "#1890ff" }} />
                        <span>Chi tiết Hóa Đơn Nội Địa</span>
                    </Space>
                }
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setViewModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={1000}
            >
                {selectedHoaDon && (
                    <>
                        <Divider style={{ margin: "16px 0" }} />

                        {/* Thông tin cơ bản */}
                        <Card title="Thông tin hóa đơn" size="small" style={{ marginBottom: 16 }}>
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Mã hóa đơn" span={2}>
                                    <Text strong style={{ fontSize: "16px" }}>
                                        HD-{String(selectedHoaDon.id_hd_nd).padStart(5, "0")}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số hóa đơn">
                                    <Text strong>{selectedHoaDon.so_hd}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày hóa đơn">
                                    {selectedHoaDon.ngay_hd ? dayjs(selectedHoaDon.ngay_hd).format("DD/MM/YYYY") : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Doanh nghiệp">
                                    {selectedHoaDon.doanhNghiep?.ten_dn || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Khách hàng">
                                    <Text strong>{selectedHoaDon.khach_hang}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ" span={2}>
                                    {selectedHoaDon.dia_chi || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mã số thuế">
                                    {selectedHoaDon.ma_so_thue || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {renderTrangThai(selectedHoaDon.trang_thai)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ghi chú" span={2}>
                                    {selectedHoaDon.ghi_chu || "-"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Chi tiết hóa đơn */}
                        <Card title="Chi tiết hóa đơn" size="small" style={{ marginBottom: 16 }}>
                            <Table
                                dataSource={selectedHoaDon.chiTiets || []}
                                pagination={false}
                                size="small"
                                rowKey={(record) => record.id_ct || record.id_sp || record.id_npl}
                                columns={[
                                    {
                                        title: "Mặt hàng",
                                        key: "mat_hang",
                                        render: (_, record) => (
                                            <Text>
                                                {record.sanPham?.ten_sp || record.nguyenPhuLieu?.ten_npl || "-"}
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: "Loại",
                                        key: "loai",
                                        width: 100,
                                        render: (_, record) => (
                                            <Tag color={record.id_sp ? "blue" : "green"}>
                                                {record.id_sp ? "Sản phẩm" : "NPL"}
                                            </Tag>
                                        ),
                                    },
                                    {
                                        title: "Số lượng",
                                        dataIndex: "so_luong",
                                        key: "so_luong",
                                        width: 100,
                                        align: "right",
                                        render: (value) => formatVNNumber(value),
                                    },
                                    {
                                        title: "Đơn giá",
                                        dataIndex: "don_gia",
                                        key: "don_gia",
                                        width: 120,
                                        align: "right",
                                        render: (value) => formatVNNumber(value),
                                    },
                                    {
                                        title: "Thuế suất",
                                        dataIndex: "thue_suat",
                                        key: "thue_suat",
                                        width: 100,
                                        align: "center",
                                        render: (value) => `${value || 0}%`,
                                    },
                                    {
                                        title: "Thành tiền",
                                        dataIndex: "thanh_tien",
                                        key: "thanh_tien",
                                        width: 130,
                                        align: "right",
                                        render: (value) => <Text strong>{formatVNNumber(value)}</Text>,
                                    },
                                ]}
                                summary={(pageData) => {
                                    let totalAmount = 0;
                                    pageData.forEach(({ thanh_tien }) => {
                                        totalAmount += thanh_tien || 0;
                                    });
                                    return (
                                        <Table.Summary.Row style={{ background: "#fafafa" }}>
                                            <Table.Summary.Cell colSpan={5} align="right">
                                                <Text strong>Tổng cộng:</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                                                    {formatVNNumber(totalAmount)}
                                                </Text>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    );
                                }}
                            />
                        </Card>

                        {/* Tổng kết thanh toán */}
                        <Card style={{ background: "#f0f5ff" }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng tiền hàng"
                                        value={selectedHoaDon.tong_tien}
                                        precision={2}
                                        valueStyle={{ color: "#1890ff" }}
                                        formatter={(value) => formatVNNumber(value)}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Thuế GTGT"
                                        value={selectedHoaDon.thue_gtgt}
                                        precision={2}
                                        valueStyle={{ color: "#faad14" }}
                                        formatter={(value) => formatVNNumber(value)}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng thanh toán"
                                        value={selectedHoaDon.tong_thanh_toan}
                                        precision={2}
                                        valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
                                        formatter={(value) => formatVNNumber(value)}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default HoaDonNoiDia;
