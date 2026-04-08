import React, { useState, useEffect, useCallback } from "react";
import {
    Form,
    Select,
    DatePicker,
    Button,
    Table,
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
    Alert,
    Progress,
} from "antd";
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    SwapOutlined,
    FilterOutlined,
    BarChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { getAllSanPham } from "../../services/sanpham.service";
import {
    getAllDinhMuc,
    getDinhMucById,
    createDinhMuc,
    removeDinhMuc,
} from "../../services/doisoat.service";
import {
    showCreateSuccess,
    showDeleteSuccess,
    showLoadError,
    showSaveError,
    showError,
} from "../../components/notification";
import { extractErrorMessage } from "../../utils/errorHandler";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Format số theo kiểu Việt Nam
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return "";
    return Number(value).toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    });
};

const DoiSoatDinhMuc = () => {
    const [form] = Form.useForm();

    const [sanPhamList, setSanPhamList] = useState([]);
    const [doiSoatList, setDoiSoatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedDoiSoat, setSelectedDoiSoat] = useState(null);
    const [filterResult, setFilterResult] = useState(null);

    // Fetch danh sách đối soát định mức
    const fetchDoiSoatList = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (filterResult) filters.ket_luan = filterResult;

            const response = await getAllDinhMuc(filters);
            const data = response?.data || response || [];
            setDoiSoatList(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("danh sách đối soát định mức", errorMsg);
        } finally {
            setLoading(false);
        }
    }, [filterResult]);

    // Fetch danh sách sản phẩm
    const fetchSanPham = async () => {
        try {
            const response = await getAllSanPham();
            const data = Array.isArray(response)
                ? response
                : response?.data || response || [];
            setSanPhamList(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("danh sách sản phẩm", errorMsg);
        }
    };

    useEffect(() => {
        fetchDoiSoatList();
        fetchSanPham();
    }, [fetchDoiSoatList]);

    // Mở modal tạo mới
    const handleCreate = () => {
        form.resetFields();
        form.setFieldsValue({
            ngay_doi_soat: dayjs(),
        });
        setModalVisible(true);
    };

    // Xem chi tiết
    const handleView = async (record) => {
        try {
            const response = await getDinhMucById(record.id_ds);
            const data = response?.data || response;
            setSelectedDoiSoat(data);
            setViewModalVisible(true);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showError("Lỗi khi tải chi tiết", errorMsg);
        }
    };

    // Xóa đối soát
    const handleDelete = async (id) => {
        try {
            await removeDinhMuc(id);
            showDeleteSuccess("đối soát định mức");
            fetchDoiSoatList();
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showError("Lỗi khi xóa", errorMsg);
        }
    };

    // Submit form
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                id_dn: values.id_dn,
                id_sp: values.id_sp,
                tu_ngay: values.date_range
                    ? values.date_range[0].format("YYYY-MM-DD")
                    : null,
                den_ngay: values.date_range
                    ? values.date_range[1].format("YYYY-MM-DD")
                    : null,
                nguoi_doi_soat: values.nguoi_doi_soat,
                ngay_doi_soat: values.ngay_doi_soat
                    ? values.ngay_doi_soat.format("YYYY-MM-DD")
                    : null,
            };

            await createDinhMuc(payload);
            showCreateSuccess("đối soát định mức");

            setModalVisible(false);
            form.resetFields();
            fetchDoiSoatList();
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showSaveError("đối soát định mức", errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Render kết luận
    const renderKetLuan = (ketLuan) => {
        const config = {
            DatDinhMuc: {
                color: "success",
                label: "Đạt định mức",
                icon: <CheckCircleOutlined />,
            },
            VuotDinhMuc: {
                color: "error",
                label: "Vượt định mức",
                icon: <ExclamationCircleOutlined />,
            },
            DuoiDinhMuc: {
                color: "warning",
                label: "Dưới định mức",
                icon: <WarningOutlined />,
            },
        };

        const item = config[ketLuan] || config["DatDinhMuc"];
        return (
            <Tag color={item.color} icon={item.icon}>
                {item.label}
            </Tag>
        );
    };

    // Columns cho table
    const columns = [
        {
            title: "Mã đối soát",
            dataIndex: "id_ds",
            key: "id_ds",
            width: 120,
            fixed: "left",
            render: (text) => (
                <Space>
                    <BarChartOutlined style={{ color: "#1890ff" }} />
                    <Text strong>DM-{String(text).padStart(5, "0")}</Text>
                </Space>
            ),
        },
        {
            title: "Ngày đối soát",
            dataIndex: "ngay_doi_soat",
            key: "ngay_doi_soat",
            width: 130,
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
            sorter: (a, b) =>
                dayjs(a.ngay_doi_soat).unix() - dayjs(b.ngay_doi_soat).unix(),
        },
        {
            title: "Sản phẩm",
            dataIndex: ["sanPham", "ten_sp"],
            key: "ten_sp",
            width: 200,
            render: (text, record) => (
                <Tooltip title={`ID: ${record.id_sp}`}>
                    <Text strong>{text || `SP-${record.id_sp}`}</Text>
                </Tooltip>
            ),
        },
        {
            title: "Kỳ đối soát",
            key: "ky_doi_soat",
            width: 200,
            render: (_, record) => (
                <Text>
                    {record.tu_ngay && record.den_ngay
                        ? `${dayjs(record.tu_ngay).format("DD/MM/YYYY")} - ${dayjs(
                              record.den_ngay
                          ).format("DD/MM/YYYY")}`
                        : "-"}
                </Text>
            ),
        },
        {
            title: "Kết luận",
            dataIndex: "ket_luan",
            key: "ket_luan",
            width: 150,
            filters: [
                { text: "Đạt định mức", value: "DatDinhMuc" },
                { text: "Vượt định mức", value: "VuotDinhMuc" },
                { text: "Dưới định mức", value: "DuoiDinhMuc" },
            ],
            onFilter: (value, record) => record.ket_luan === value,
            render: renderKetLuan,
        },
        {
            title: "Tỷ lệ sai lệch",
            dataIndex: "ty_le_sai_lech",
            key: "ty_le_sai_lech",
            width: 140,
            align: "right",
            render: (value) => {
                if (!value || value === 0) {
                    return <Text type="success">0%</Text>;
                }
                return (
                    <Text type={value > 5 ? "danger" : "warning"} strong>
                        {formatVNNumber(value)}%
                    </Text>
                );
            },
        },
        {
            title: "Người đối soát",
            dataIndex: "nguoi_doi_soat",
            key: "nguoi_doi_soat",
            width: 150,
            ellipsis: true,
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
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa đối soát này?"
                        onConfirm={() => handleDelete(record.id_ds)}
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

    // Statistics
    const stats = {
        total: doiSoatList.length,
        datDinhMuc: doiSoatList.filter((d) => d.ket_luan === "DatDinhMuc").length,
        vuotDinhMuc: doiSoatList.filter((d) => d.ket_luan === "VuotDinhMuc").length,
        duoiDinhMuc: doiSoatList.filter((d) => d.ket_luan === "DuoiDinhMuc").length,
    };

    return (
        <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng đối soát"
                            value={stats.total}
                            prefix={<BarChartOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đạt định mức"
                            value={stats.datDinhMuc}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Vượt định mức"
                            value={stats.vuotDinhMuc}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Dưới định mức"
                            value={stats.duoiDinhMuc}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Table Card */}
            <Card
                title={
                    <Space>
                        <BarChartOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
                        <Title level={4} style={{ margin: 0 }}>
                            Đối Soát Định Mức (Định mức vs Thực tế sử dụng)
                        </Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Select
                            placeholder="Lọc theo kết luận"
                            style={{ width: 150 }}
                            allowClear
                            onChange={setFilterResult}
                            value={filterResult}
                        >
                            <Option value="DatDinhMuc">Đạt định mức</Option>
                            <Option value="VuotDinhMuc">Vượt định mức</Option>
                            <Option value="DuoiDinhMuc">Dưới định mức</Option>
                        </Select>
                        <Tooltip title="Làm mới dữ liệu">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchDoiSoatList}
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
                            Tạo đối soát mới
                        </Button>
                    </Space>
                }
                bordered={false}
            >
                <Table
                    dataSource={doiSoatList}
                    columns={columns}
                    loading={loading}
                    rowKey="id_ds"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} đối soát`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    scroll={{ x: 1600 }}
                    size="middle"
                />
            </Card>

            {/* Modal Tạo đối soát */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined />
                        <span>Tạo Đối Soát Định Mức Mới</span>
                    </Space>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Divider style={{ margin: "16px 0" }} />
                <Alert
                    message="Hướng dẫn"
                    description="Chọn sản phẩm và khoảng thời gian để so sánh định mức nguyên liệu với thực tế sử dụng trong sản xuất. Hệ thống sẽ tự động tính toán và phát hiện sai lệch."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="id_sp"
                                label="Sản phẩm"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn sản phẩm",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn sản phẩm"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                >
                                    {sanPhamList.map((sp) => (
                                        <Option key={sp.id_sp} value={sp.id_sp}>
                                            {sp.ten_sp || `SP-${sp.id_sp}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="date_range"
                                label="Kỳ đối soát (Từ ngày - Đến ngày)"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn kỳ đối soát",
                                    },
                                ]}
                            >
                                <RangePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    placeholder={["Từ ngày", "Đến ngày"]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="nguoi_doi_soat"
                                label="Người đối soát"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên người đối soát",
                                    },
                                    {
                                        min: 2,
                                        message: "Tên phải có ít nhất 2 ký tự",
                                    },
                                    {
                                        max: 100,
                                        message: "Tên không được vượt quá 100 ký tự",
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập tên người đối soát" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ngay_doi_soat"
                                label="Ngày đối soát"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày đối soát",
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày đối soát"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
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
                                Tạo đối soát
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Xem Chi Tiết - HIỂN THỊ SO SÁNH ĐỊNH MỨC VS THỰC TẾ RÕ RÀNG */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined style={{ color: "#1890ff" }} />
                        <span>Chi tiết Đối Soát Định Mức</span>
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
                    </Button>,
                ]}
                width={1200}
            >
                {selectedDoiSoat && (
                    <>
                        <Divider style={{ margin: "16px 0" }} />

                        {/* Kết luận tổng quan */}
                        <Alert
                            message={
                                <Space>
                                    <Text strong style={{ fontSize: "16px" }}>
                                        Kết luận:
                                    </Text>
                                    {renderKetLuan(selectedDoiSoat.ket_luan)}
                                </Space>
                            }
                            description={
                                selectedDoiSoat.ghi_chu || 
                                (selectedDoiSoat.ket_luan === "DatDinhMuc" 
                                    ? "Sử dụng nguyên liệu đúng định mức" 
                                    : "Có sai lệch giữa định mức và thực tế sử dụng")
                            }
                            type={
                                selectedDoiSoat.ket_luan === "DatDinhMuc"
                                    ? "success"
                                    : selectedDoiSoat.ket_luan === "VuotDinhMuc"
                                    ? "error"
                                    : "warning"
                            }
                            showIcon
                            style={{ marginBottom: 24 }}
                        />

                        {/* Thông tin cơ bản */}
                        <Card
                            title="Thông tin đối soát"
                            size="small"
                            style={{ marginBottom: 16 }}
                        >
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Mã đối soát" span={2}>
                                    <Text strong style={{ fontSize: "16px" }}>
                                        DM-{String(selectedDoiSoat.id_ds).padStart(5, "0")}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày đối soát">
                                    {selectedDoiSoat.ngay_doi_soat
                                        ? dayjs(selectedDoiSoat.ngay_doi_soat).format(
                                              "DD/MM/YYYY"
                                          )
                                        : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Người đối soát">
                                    {selectedDoiSoat.nguoi_doi_soat || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Sản phẩm" span={2}>
                                    <Text strong>
                                        {selectedDoiSoat.sanPham?.ten_sp ||
                                            `SP-${selectedDoiSoat.id_sp}`}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Kỳ đối soát" span={2}>
                                    {selectedDoiSoat.tu_ngay && selectedDoiSoat.den_ngay
                                        ? `${dayjs(selectedDoiSoat.tu_ngay).format(
                                              "DD/MM/YYYY"
                                          )} - ${dayjs(selectedDoiSoat.den_ngay).format(
                                              "DD/MM/YYYY"
                                          )}`
                                        : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Kết luận">
                                    {renderKetLuan(selectedDoiSoat.ket_luan)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tỷ lệ sai lệch">
                                    <Text
                                        strong
                                        type={
                                            selectedDoiSoat.ty_le_sai_lech > 5
                                                ? "danger"
                                                : selectedDoiSoat.ty_le_sai_lech > 0
                                                ? "warning"
                                                : "success"
                                        }
                                    >
                                        {formatVNNumber(selectedDoiSoat.ty_le_sai_lech || 0)}%
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Tổng hợp sản xuất */}
                        <Card
                            title={
                                <Space>
                                    <BarChartOutlined style={{ color: "#1890ff" }} />
                                    <span>Tổng hợp sản xuất</span>
                                </Space>
                            }
                            size="small"
                            style={{ marginBottom: 16 }}
                        >
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng số lượng sản xuất"
                                        value={selectedDoiSoat.tong_sl_san_xuat || 0}
                                        precision={3}
                                        valueStyle={{ color: "#1890ff" }}
                                        suffix="đơn vị"
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng NPL theo định mức"
                                        value={selectedDoiSoat.tong_npl_dinh_muc || 0}
                                        precision={3}
                                        valueStyle={{ color: "#52c41a" }}
                                        suffix="đơn vị"
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng NPL thực tế sử dụng"
                                        value={selectedDoiSoat.tong_npl_thuc_te || 0}
                                        precision={3}
                                        valueStyle={{
                                            color:
                                                selectedDoiSoat.tong_npl_thuc_te >
                                                selectedDoiSoat.tong_npl_dinh_muc
                                                    ? "#ff4d4f"
                                                    : "#52c41a",
                                        }}
                                        suffix="đơn vị"
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Chi tiết so sánh từng NPL - HIỂN THỊ RÕ RÀNG */}
                        <Card
                            title={
                                <Space>
                                    <FileTextOutlined style={{ color: "#1890ff" }} />
                                    <span>Chi tiết so sánh định mức vs thực tế từng nguyên liệu</span>
                                </Space>
                            }
                            size="small"
                        >
                            <Table
                                dataSource={selectedDoiSoat.chiTiets || []}
                                rowKey="id_ct"
                                pagination={false}
                                size="small"
                                scroll={{ x: 1000 }}
                                columns={[
                                    {
                                        title: "Nguyên phụ liệu",
                                        dataIndex: ["nguyenPhuLieu", "ten_npl"],
                                        key: "ten_npl",
                                        width: 200,
                                        fixed: "left",
                                        render: (text, record) => (
                                            <Tooltip
                                                title={`Mã NPL: ${record.id_npl}`}
                                            >
                                                <Text strong>
                                                    {text || `NPL-${record.id_npl}`}
                                                </Text>
                                            </Tooltip>
                                        ),
                                    },
                                    {
                                        title: "Định mức/SP",
                                        dataIndex: "dinh_muc_per_unit",
                                        key: "dinh_muc_per_unit",
                                        width: 130,
                                        align: "right",
                                        render: (value) => (
                                            <Text type="secondary">
                                                {formatVNNumber(value)}
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: "SL Sản xuất",
                                        dataIndex: "sl_san_xuat",
                                        key: "sl_san_xuat",
                                        width: 130,
                                        align: "right",
                                        render: (value) => (
                                            <Text type="secondary">
                                                {formatVNNumber(value)}
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: "SL Theo định mức",
                                        dataIndex: "sl_dinh_muc",
                                        key: "sl_dinh_muc",
                                        width: 150,
                                        align: "right",
                                        render: (value) => (
                                            <Text strong style={{ color: "#52c41a" }}>
                                                {formatVNNumber(value)}
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: "SL Thực tế",
                                        dataIndex: "sl_thuc_te",
                                        key: "sl_thuc_te",
                                        width: 130,
                                        align: "right",
                                        render: (value, record) => (
                                            <Text
                                                strong
                                                style={{
                                                    color:
                                                        value > record.sl_dinh_muc
                                                            ? "#ff4d4f"
                                                            : value < record.sl_dinh_muc
                                                            ? "#faad14"
                                                            : "#52c41a",
                                                }}
                                            >
                                                {formatVNNumber(value)}
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: "Chênh lệch",
                                        dataIndex: "chenh_lech",
                                        key: "chenh_lech",
                                        width: 130,
                                        align: "right",
                                        render: (value) => {
                                            if (!value || Math.abs(value) < 0.001) {
                                                return (
                                                    <Tag
                                                        color="success"
                                                        icon={<CheckCircleOutlined />}
                                                    >
                                                        Đúng
                                                    </Tag>
                                                );
                                            }
                                            return (
                                                <Text
                                                    type={value > 0 ? "danger" : "warning"}
                                                    strong
                                                    style={{ fontSize: "14px" }}
                                                >
                                                    {value > 0 ? "+" : ""}
                                                    {formatVNNumber(value)}
                                                </Text>
                                            );
                                        },
                                    },
                                    {
                                        title: "Tỷ lệ sai lệch",
                                        dataIndex: "ty_le_sai_lech",
                                        key: "ty_le_sai_lech",
                                        width: 150,
                                        align: "center",
                                        render: (value) => {
                                            if (!value || Math.abs(value) < 0.1) {
                                                return (
                                                    <Progress
                                                        type="circle"
                                                        percent={100}
                                                        width={50}
                                                        strokeColor="#52c41a"
                                                        format={() => "100%"}
                                                    />
                                                );
                                            }
                                            const doChinhXac = Math.max(
                                                0,
                                                100 - Math.abs(value)
                                            );
                                            return (
                                                <Progress
                                                    type="circle"
                                                    percent={doChinhXac}
                                                    width={50}
                                                    strokeColor={
                                                        doChinhXac >= 95
                                                            ? "#52c41a"
                                                            : doChinhXac >= 90
                                                            ? "#1890ff"
                                                            : doChinhXac >= 85
                                                            ? "#faad14"
                                                            : "#ff4d4f"
                                                    }
                                                    format={(percent) =>
                                                        `${percent.toFixed(0)}%`
                                                    }
                                                />
                                            );
                                        },
                                    },
                                    {
                                        title: "Đánh giá",
                                        key: "danh_gia",
                                        width: 150,
                                        render: (_, record) => {
                                            if (!record.chenh_lech || Math.abs(record.chenh_lech) < 0.001) {
                                                return (
                                                    <Tag
                                                        color="success"
                                                        icon={<CheckCircleOutlined />}
                                                    >
                                                        Đạt định mức
                                                    </Tag>
                                                );
                                            }
                                            if (record.chenh_lech > 0) {
                                                return (
                                                    <Tag
                                                        color="error"
                                                        icon={<ExclamationCircleOutlined />}
                                                    >
                                                        Vượt định mức
                                                    </Tag>
                                                );
                                            }
                                            return (
                                                <Tag
                                                    color="warning"
                                                    icon={<WarningOutlined />}
                                                >
                                                    Dưới định mức
                                                </Tag>
                                            );
                                        },
                                    },
                                ]}
                                summary={(pageData) => {
                                    let totalDinhMuc = 0;
                                    let totalThucTe = 0;
                                    let totalChenhLech = 0;

                                    pageData.forEach(
                                        ({
                                            sl_dinh_muc,
                                            sl_thuc_te,
                                            chenh_lech,
                                        }) => {
                                            totalDinhMuc += Number(sl_dinh_muc || 0);
                                            totalThucTe += Number(sl_thuc_te || 0);
                                            totalChenhLech += Number(chenh_lech || 0);
                                        }
                                    );

                                    return (
                                        <Table.Summary.Row
                                            style={{ background: "#fafafa" }}
                                        >
                                            <Table.Summary.Cell colSpan={3}>
                                                <Text strong>Tổng cộng</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                <Text strong style={{ color: "#52c41a" }}>
                                                    {formatVNNumber(totalDinhMuc)}
                                                </Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                <Text
                                                    strong
                                                    style={{
                                                        color:
                                                            totalThucTe > totalDinhMuc
                                                                ? "#ff4d4f"
                                                                : "#52c41a",
                                                    }}
                                                >
                                                    {formatVNNumber(totalThucTe)}
                                                </Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                <Text
                                                    strong
                                                    type={
                                                        totalChenhLech > 0
                                                            ? "danger"
                                                            : totalChenhLech < 0
                                                            ? "warning"
                                                            : "success"
                                                    }
                                                >
                                                    {totalChenhLech > 0 ? "+" : ""}
                                                    {formatVNNumber(totalChenhLech)}
                                                </Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell colSpan={2} />
                                        </Table.Summary.Row>
                                    );
                                }}
                            />
                        </Card>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default DoiSoatDinhMuc;
