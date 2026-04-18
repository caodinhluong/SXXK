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
} from "@ant-design/icons";
import dayjs from "dayjs";

import { getAll as getAllToKhaiNhap } from "../../services/tokhainhap.service";
import { getAll as getAllNhapKho } from "../../services/nhapkhonpl.service";
import {
    getAllNhap,
    getNhapById,
    createNhap,
    updateTrangThaiNhap,
    removeNhap,
} from "../../services/doisoat.service";
import {
    showCreateSuccess,
    showUpdateSuccess,
    showDeleteSuccess,
    showLoadError,
    showSaveError,
    showError,
} from "../../components/notification";
import { extractErrorMessage } from "../../utils/errorHandler";

const { Option } = Select;
const { Title, Text } = Typography;

// Format số theo kiểu Việt Nam
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return "";
    return Number(value).toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const DoiSoatNhap = () => {
    const [form] = Form.useForm();

    const [toKhaiList, setToKhaiList] = useState([]);
    const [nhapKhoList, setNhapKhoList] = useState([]);
    const [doiSoatList, setDoiSoatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedDoiSoat, setSelectedDoiSoat] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterResult, setFilterResult] = useState(null);

    // Fetch danh sách đối soát nhập
    const fetchDoiSoatList = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (filterStatus) filters.trang_thai = filterStatus;
            if (filterResult) filters.ket_qua = filterResult;

            const response = await getAllNhap(filters);
            const data = Array.isArray(response) ? response : [];
            setDoiSoatList(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("danh sách đối soát nhập", errorMsg);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterResult]);

    // Fetch danh sách tờ khai nhập
    const fetchToKhaiNhap = async () => {
        try {
            const response = await getAllToKhaiNhap();
            const data = Array.isArray(response)
                ? response
                : response?.data || response || [];
            setToKhaiList(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("danh sách tờ khai nhập", errorMsg);
        }
    };

    // Fetch danh sách nhập kho NPL
    const fetchNhapKho = async () => {
        try {
            const response = await getAllNhapKho();
            const data = Array.isArray(response)
                ? response
                : response?.data || response || [];
            setNhapKhoList(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("danh sách nhập kho", errorMsg);
        }
    };

    useEffect(() => {
        fetchDoiSoatList();
        fetchToKhaiNhap();
        fetchNhapKho();
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
            const response = await getNhapById(record.id_ds);
            const data = response?.data || response;
            setSelectedDoiSoat(data);
            setViewModalVisible(true);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showError("Lỗi khi tải chi tiết", errorMsg);
        }
    };

    // Cập nhật trạng thái
    const handleUpdateStatus = async (id, trang_thai) => {
        try {
            await updateTrangThaiNhap(id, trang_thai);
            showUpdateSuccess("trạng thái đối soát");
            fetchDoiSoatList();
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showError("Lỗi khi cập nhật trạng thái", errorMsg);
        }
    };

    // Xóa đối soát
    const handleDelete = async (id) => {
        try {
            await removeNhap(id);
            showDeleteSuccess("đối soát nhập");
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
                id_tkn: values.id_tkn,
                id_nhap_kho: values.id_nhap_kho,
                nguoi_doi_soat: values.nguoi_doi_soat,
                ngay_doi_soat: values.ngay_doi_soat
                    ? values.ngay_doi_soat.format("YYYY-MM-DD")
                    : null,
            };

            await createNhap(payload);
            showCreateSuccess("đối soát nhập");

            setModalVisible(false);
            form.resetFields();
            fetchDoiSoatList();
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showSaveError("đối soát nhập", errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Render kết quả đối soát
    const renderKetQua = (ketQua) => {
        const config = {
            KhopDu: {
                color: "success",
                label: "Khớp đủ",
                icon: <CheckCircleOutlined />,
            },
            ChenhLech: {
                color: "warning",
                label: "Chênh lệch",
                icon: <WarningOutlined />,
            },
            CanXacMinh: {
                color: "error",
                label: "Cần xác minh",
                icon: <ExclamationCircleOutlined />,
            },
        };

        const item = config[ketQua] || config["CanXacMinh"];
        return (
            <Tag color={item.color} icon={item.icon}>
                {item.label}
            </Tag>
        );
    };

    // Render trạng thái
    const renderTrangThai = (trangThai) => {
        const config = {
            ChuaXuLy: {
                color: "default",
                label: "Chưa xử lý",
            },
            DangXuLy: {
                color: "processing",
                label: "Đang xử lý",
            },
            HoanThanh: {
                color: "success",
                label: "Hoàn thành",
            },
            CanBoSung: {
                color: "warning",
                label: "Cần bổ sung",
            },
        };

        const item = config[trangThai] || config["ChuaXuLy"];
        return <Tag color={item.color}>{item.label}</Tag>;
    };

    // Columns cho table
    const columns = [
        {
            title: "Mã đối soát",
            dataIndex: "id_ds",
            key: "id_ds",
            width: "10%",
            render: (text) => (
                <Space>
                    <SwapOutlined style={{ color: "#1890ff" }} />
                    <Text strong>DS-{String(text).padStart(5, "0")}</Text>
                </Space>
            ),
        },
        {
            title: "Ngày đối soát",
            dataIndex: "ngay_doi_soat",
            key: "ngay_doi_soat",
            width: "11%",
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
            sorter: (a, b) =>
                dayjs(a.ngay_doi_soat).unix() - dayjs(b.ngay_doi_soat).unix(),
        },
        {
            title: "Tờ khai nhập",
            dataIndex: ["toKhaiNhap", "so_to_khai"],
            key: "so_to_khai",
            width: "13%",
            ellipsis: true,
            render: (text, record) => (
                <Tooltip title={`ID: ${record.id_tkn}`}>
                    <Text>{text || `TKN-${record.id_tkn}`}</Text>
                </Tooltip>
            ),
        },
        {
            title: "Phiếu nhập kho",
            dataIndex: ["nhapKho", "so_phieu"],
            key: "so_phieu",
            width: "13%",
            ellipsis: true,
            render: (text, record) => (
                <Tooltip title={`ID: ${record.id_nhap_kho}`}>
                    <Text>{text || `NK-${record.id_nhap_kho}`}</Text>
                </Tooltip>
            ),
        },
        {
            title: "Kết quả",
            dataIndex: "ket_qua",
            key: "ket_qua",
            width: "12%",
            filters: [
                { text: "Khớp đủ", value: "KhopDu" },
                { text: "Chênh lệch", value: "ChenhLech" },
                { text: "Cần xác minh", value: "CanXacMinh" },
            ],
            onFilter: (value, record) => record.ket_qua === value,
            render: renderKetQua,
        },
        {
            title: "Chênh lệch SL",
            dataIndex: "chenh_lech_sl",
            key: "chenh_lech_sl",
            width: "11%",
            align: "right",
            render: (value) => {
                if (!value || value === 0) {
                    return <Text type="success">0</Text>;
                }
                return (
                    <Text type="warning" strong>
                        {formatVNNumber(value)}
                    </Text>
                );
            },
        },
        {
            title: "Người đối soát",
            dataIndex: "nguoi_doi_soat",
            key: "nguoi_doi_soat",
            width: "12%",
            ellipsis: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            width: "12%",
            filters: [
                { text: "Chưa xử lý", value: "ChuaXuLy" },
                { text: "Đang xử lý", value: "DangXuLy" },
                { text: "Hoàn thành", value: "HoanThanh" },
                { text: "Cần bổ sung", value: "CanBoSung" },
            ],
            onFilter: (value, record) => record.trang_thai === value,
            render: renderTrangThai,
        },
        {
            title: "Thao tác",
            key: "action",
            width: "6%",
            align: "center",
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
                    {record.trang_thai !== "HoanThanh" && (
                        <Tooltip title="Đánh dấu hoàn thành">
                            <Button
                                type="text"
                                icon={<CheckCircleOutlined />}
                                onClick={() =>
                                    handleUpdateStatus(record.id_ds, "HoanThanh")
                                }
                                size="small"
                                style={{ color: "#52c41a" }}
                            />
                        </Tooltip>
                    )}
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
        khopDu: doiSoatList.filter((d) => d.ket_qua === "KhopDu").length,
        chenhLech: doiSoatList.filter((d) => d.ket_qua === "ChenhLech").length,
        chuaXuLy: doiSoatList.filter((d) => d.trang_thai === "ChuaXuLy").length,
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
                            prefix={<SwapOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Khớp đủ"
                            value={stats.khopDu}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chênh lệch"
                            value={stats.chenhLech}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chưa xử lý"
                            value={stats.chuaXuLy}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Table Card */}
            <Card
                title={
                    <Space>
                        <SwapOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
                        <Title level={4} style={{ margin: 0 }}>
                            Đối Soát Nhập (Tờ Khai vs Nhập Kho)
                        </Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Select
                            placeholder="Lọc theo kết quả"
                            style={{ width: 150 }}
                            allowClear
                            onChange={setFilterResult}
                            value={filterResult}
                        >
                            <Option value="KhopDu">Khớp đủ</Option>
                            <Option value="ChenhLech">Chênh lệch</Option>
                            <Option value="CanXacMinh">Cần xác minh</Option>
                        </Select>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            style={{ width: 150 }}
                            allowClear
                            onChange={setFilterStatus}
                            value={filterStatus}
                        >
                            <Option value="ChuaXuLy">Chưa xử lý</Option>
                            <Option value="DangXuLy">Đang xử lý</Option>
                            <Option value="HoanThanh">Hoàn thành</Option>
                            <Option value="CanBoSung">Cần bổ sung</Option>
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
                    size="middle"
                />
            </Card>

            {/* Modal Tạo đối soát */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined />
                        <span>Tạo Đối Soát Nhập Mới</span>
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
                    description="Chọn tờ khai nhập và phiếu nhập kho tương ứng để thực hiện đối soát. Hệ thống sẽ tự động so sánh số lượng và phát hiện chênh lệch."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="id_tkn"
                                label="Tờ khai nhập"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn tờ khai nhập",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn tờ khai nhập"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                >
                                    {toKhaiList.map((tk) => (
                                        <Option key={tk.id_tkn} value={tk.id_tkn}>
                                            {tk.so_to_khai || `TKN-${tk.id_tkn}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="id_nhap_kho"
                                label="Phiếu nhập kho"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn phiếu nhập kho",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn phiếu nhập kho"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                >
                                    {nhapKhoList.map((nk) => (
                                        <Option key={nk.id_nhap} value={nk.id_nhap}>
                                            {nk.so_phieu || `NK-${nk.id_nhap}`}
                                        </Option>
                                    ))}
                                </Select>
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

            {/* Modal Xem Chi Tiết - HIỂN THỊ KẾT QUẢ ĐỐI SOÁT RÕ RÀNG */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined style={{ color: "#1890ff" }} />
                        <span>Chi tiết Đối Soát Nhập</span>
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
                width={1000}
            >
                {selectedDoiSoat && (
                    <>
                        <Divider style={{ margin: "16px 0" }} />

                        {/* Kết quả tổng quan */}
                        <Alert
                            message={
                                <Space>
                                    <Text strong style={{ fontSize: "16px" }}>
                                        Kết quả đối soát:
                                    </Text>
                                    {renderKetQua(selectedDoiSoat.ket_qua)}
                                </Space>
                            }
                            description={
                                selectedDoiSoat.ly_do_chenh_lech || "Không có ghi chú"
                            }
                            type={
                                selectedDoiSoat.ket_qua === "KhopDu"
                                    ? "success"
                                    : selectedDoiSoat.ket_qua === "ChenhLech"
                                    ? "warning"
                                    : "error"
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
                                        DS-{String(selectedDoiSoat.id_ds).padStart(5, "0")}
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
                                <Descriptions.Item label="Tờ khai nhập">
                                    <Text strong>
                                        {selectedDoiSoat.toKhaiNhap?.so_to_khai ||
                                            `TKN-${selectedDoiSoat.id_tkn}`}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phiếu nhập kho">
                                    <Text strong>
                                        {selectedDoiSoat.nhapKho?.so_phieu ||
                                            `NK-${selectedDoiSoat.id_nhap_kho}`}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {renderTrangThai(selectedDoiSoat.trang_thai)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Kết quả">
                                    {renderKetQua(selectedDoiSoat.ket_qua)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Tổng hợp chênh lệch */}
                        <Card
                            title={
                                <Space>
                                    <WarningOutlined style={{ color: "#faad14" }} />
                                    <span>Tổng hợp chênh lệch</span>
                                </Space>
                            }
                            size="small"
                            style={{ marginBottom: 16 }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Tổng chênh lệch số lượng"
                                        value={selectedDoiSoat.chenh_lech_sl || 0}
                                        precision={3}
                                        valueStyle={{
                                            color:
                                                selectedDoiSoat.chenh_lech_sl > 0
                                                    ? "#faad14"
                                                    : "#52c41a",
                                        }}
                                        suffix="đơn vị"
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Tổng chênh lệch tiền"
                                        value={selectedDoiSoat.chenh_lech_tien || 0}
                                        precision={0}
                                        valueStyle={{
                                            color:
                                                selectedDoiSoat.chenh_lech_tien > 0
                                                    ? "#faad14"
                                                    : "#52c41a",
                                        }}
                                        suffix="VNĐ"
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Chi tiết đối soát từng NPL - HIỂN THỊ RÕ RÀNG */}
                        <Card
                            title={
                                <Space>
                                    <FileTextOutlined style={{ color: "#1890ff" }} />
                                    <span>Chi tiết đối soát từng nguyên phụ liệu</span>
                                </Space>
                            }
                            size="small"
                        >
                            <Table
                                dataSource={selectedDoiSoat.chiTiets || []}
                                rowKey="id_ct"
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: "Nguyên phụ liệu",
                                        dataIndex: ["nguyenPhuLieu", "ten_npl"],
                                        key: "ten_npl",
                                        width: 200,
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
                                        title: "SL Tờ khai",
                                        dataIndex: "sl_to_khai",
                                        key: "sl_to_khai",
                                        width: 130,
                                        align: "right",
                                        render: (value) => (
                                            <Text type="secondary">
                                                {formatVNNumber(value)}
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: "SL Nhập kho",
                                        dataIndex: "sl_nhap_kho",
                                        key: "sl_nhap_kho",
                                        width: 130,
                                        align: "right",
                                        render: (value) => (
                                            <Text type="secondary">
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
                                                        Khớp
                                                    </Tag>
                                                );
                                            }
                                            return (
                                                <Text
                                                    type="warning"
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
                                        title: "Tỷ lệ chênh lệch",
                                        key: "ty_le",
                                        width: 150,
                                        align: "center",
                                        render: (_, record) => {
                                            if (
                                                !record.chenh_lech ||
                                                Math.abs(record.chenh_lech) < 0.001
                                            ) {
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
                                            const tyLe =
                                                record.sl_to_khai > 0
                                                    ? Math.abs(
                                                          (record.chenh_lech /
                                                              record.sl_to_khai) *
                                                              100
                                                      )
                                                    : 0;
                                            const doKhop = Math.max(
                                                0,
                                                100 - tyLe
                                            );
                                            return (
                                                <Progress
                                                    type="circle"
                                                    percent={doKhop}
                                                    width={50}
                                                    strokeColor={
                                                        doKhop >= 95
                                                            ? "#52c41a"
                                                            : doKhop >= 90
                                                            ? "#1890ff"
                                                            : doKhop >= 80
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
                                        title: "Lý do",
                                        dataIndex: "ly_do",
                                        key: "ly_do",
                                        width: 200,
                                        render: (text) => {
                                            if (!text) {
                                                return (
                                                    <Tag
                                                        color="success"
                                                        icon={<CheckCircleOutlined />}
                                                    >
                                                        Không có chênh lệch
                                                    </Tag>
                                                );
                                            }
                                            return (
                                                <Tag
                                                    color="warning"
                                                    icon={<WarningOutlined />}
                                                >
                                                    {text}
                                                </Tag>
                                            );
                                        },
                                    },
                                ]}
                                summary={(pageData) => {
                                    let totalToKhai = 0;
                                    let totalNhapKho = 0;
                                    let totalChenhLech = 0;

                                    pageData.forEach(
                                        ({
                                            sl_to_khai,
                                            sl_nhap_kho,
                                            chenh_lech,
                                        }) => {
                                            totalToKhai += Number(sl_to_khai || 0);
                                            totalNhapKho += Number(sl_nhap_kho || 0);
                                            totalChenhLech += Math.abs(
                                                Number(chenh_lech || 0)
                                            );
                                        }
                                    );

                                    return (
                                        <Table.Summary.Row
                                            style={{ background: "#fafafa" }}
                                        >
                                            <Table.Summary.Cell>
                                                <Text strong>Tổng cộng</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                <Text strong>
                                                    {formatVNNumber(totalToKhai)}
                                                </Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                <Text strong>
                                                    {formatVNNumber(totalNhapKho)}
                                                </Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                <Text
                                                    strong
                                                    type={
                                                        totalChenhLech > 0
                                                            ? "warning"
                                                            : "success"
                                                    }
                                                >
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

export default DoiSoatNhap;
