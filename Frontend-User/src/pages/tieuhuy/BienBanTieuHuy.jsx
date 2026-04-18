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
    InputNumber,
} from "antd";
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    EditOutlined,
    FileTextOutlined,
    UploadOutlined,
    InboxOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
    getAll,
    getById,
    create,
    update,
    remove,
} from "../../services/bienbantieuhuy.service";
import { getAllNguyenPhuLieu } from "../../services/nguyenphulieu.service";
import { getAllSanPham } from "../../services/sanpham.service";
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
const { TextArea } = Input;

// Format số theo kiểu Việt Nam
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return "";
    return Number(value).toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const BienBanTieuHuy = () => {
    const [form] = Form.useForm();

    const [bienBanList, setBienBanList] = useState([]);
    const [nplList, setNplList] = useState([]);
    const [spList, setSpList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [selectedBienBan, setSelectedBienBan] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);

    // Fetch danh sách biên bản tiêu hủy
    const fetchBienBanList = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAll();
            setBienBanList(Array.isArray(data) ? data : []);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("danh sách biên bản tiêu hủy", errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch danh sách NPL
    const fetchNPL = async () => {
        try {
            const response = await getAllNguyenPhuLieu();
            const data = Array.isArray(response)
                ? response
                : response?.data || response || [];
            setNplList(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("danh sách nguyên phụ liệu", errorMsg);
        }
    };

    // Fetch danh sách SP
    const fetchSP = async () => {
        try {
            const response = await getAllSanPham();
            const data = Array.isArray(response)
                ? response
                : response?.data || response || [];
            setSpList(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError("danh sách sản phẩm", errorMsg);
        }
    };

    useEffect(() => {
        fetchBienBanList();
        fetchNPL();
        fetchSP();
    }, [fetchBienBanList]);

    // Mở modal tạo mới
    const handleCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            ngay_tieu_huy: dayjs(),
            trang_thai: "ChuaThucHien",
            chiTiets: [],
        });
        setModalVisible(true);
    };

    // Mở modal sửa
    const handleEdit = async (record) => {
        try {
            const response = await getById(record.id_bb);
            const data = response?.data || response;
            setEditingRecord(data);

            form.setFieldsValue({
                so_bien_ban: data.so_bien_ban,
                ngay_tieu_huy: data.ngay_tieu_huy ? dayjs(data.ngay_tieu_huy) : null,
                dia_diem: data.dia_diem,
                ly_do: data.ly_do,
                thanh_phan_tham_gia: data.thanh_phan_tham_gia,
                co_quan_chung_kien: data.co_quan_chung_kien,
                trang_thai: data.trang_thai,
                chiTiets: data.chiTiets || [],
            });
            setModalVisible(true);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showError("Lỗi khi tải chi tiết", errorMsg);
        }
    };

    // Xem chi tiết
    const handleView = async (record) => {
        try {
            const response = await getById(record.id_bb);
            const data = response?.data || response;
            setSelectedBienBan(data);
            setViewModalVisible(true);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showError("Lỗi khi tải chi tiết", errorMsg);
        }
    };

    // Xóa biên bản
    const handleDelete = async (id) => {
        try {
            await remove(id);
            showDeleteSuccess("biên bản tiêu hủy");
            fetchBienBanList();
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
                so_bien_ban: values.so_bien_ban,
                ngay_tieu_huy: values.ngay_tieu_huy
                    ? values.ngay_tieu_huy.format("YYYY-MM-DD")
                    : null,
                dia_diem: values.dia_diem,
                ly_do: values.ly_do,
                thanh_phan_tham_gia: values.thanh_phan_tham_gia,
                co_quan_chung_kien: values.co_quan_chung_kien,
                trang_thai: values.trang_thai,
                chiTiets: values.chiTiets || [],
            };

            if (editingRecord) {
                await update(editingRecord.id_bb, payload);
                showUpdateSuccess("biên bản tiêu hủy");
            } else {
                await create(payload);
                showCreateSuccess("biên bản tiêu hủy");
            }

            setModalVisible(false);
            form.resetFields();
            setEditingRecord(null);
            fetchBienBanList();
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showSaveError("biên bản tiêu hủy", errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Render trạng thái
    const renderTrangThai = (trangThai) => {
        const config = {
            ChuaThucHien: {
                color: "default",
                label: "Chưa thực hiện",
                icon: <ExclamationCircleOutlined />,
            },
            DangThucHien: {
                color: "processing",
                label: "Đang thực hiện",
                icon: <ReloadOutlined spin />,
            },
            HoanThanh: {
                color: "success",
                label: "Hoàn thành",
                icon: <CheckCircleOutlined />,
            },
            Huy: {
                color: "error",
                label: "Hủy",
                icon: <CloseCircleOutlined />,
            },
        };

        const item = config[trangThai] || config["ChuaThucHien"];
        return (
            <Tag color={item.color} icon={item.icon}>
                {item.label}
            </Tag>
        );
    };

    // Columns cho table
    const columns = [
        {
            title: "Mã biên bản",
            dataIndex: "id_bb",
            key: "id_bb",
            width: "10%",
            render: (text) => (
                <Space>
                    <FileTextOutlined style={{ color: "#1890ff" }} />
                    <Text strong>BB-{String(text).padStart(5, "0")}</Text>
                </Space>
            ),
        },
        {
            title: "Số biên bản",
            dataIndex: "so_bien_ban",
            key: "so_bien_ban",
            width: "12%",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Ngày tiêu hủy",
            dataIndex: "ngay_tieu_huy",
            key: "ngay_tieu_huy",
            width: "12%",
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
            sorter: (a, b) =>
                dayjs(a.ngay_tieu_huy).unix() - dayjs(b.ngay_tieu_huy).unix(),
        },
        {
            title: "Địa điểm",
            dataIndex: "dia_diem",
            key: "dia_diem",
            width: "18%",
            ellipsis: true,
        },
        {
            title: "Lý do",
            dataIndex: "ly_do",
            key: "ly_do",
            width: "23%",
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <Text ellipsis>{text}</Text>
                </Tooltip>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            width: "13%",
            filters: [
                { text: "Chưa thực hiện", value: "ChuaThucHien" },
                { text: "Đang thực hiện", value: "DangThucHien" },
                { text: "Hoàn thành", value: "HoanThanh" },
                { text: "Hủy", value: "Huy" },
            ],
            onFilter: (value, record) => record.trang_thai === value,
            render: renderTrangThai,
        },
        {
            title: "Thao tác",
            key: "action",
            width: "12%",
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
                        description="Bạn có chắc muốn xóa biên bản tiêu hủy này?"
                        onConfirm={() => handleDelete(record.id_bb)}
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
        total: bienBanList.length,
        chuaThucHien: bienBanList.filter((d) => d.trang_thai === "ChuaThucHien").length,
        dangThucHien: bienBanList.filter((d) => d.trang_thai === "DangThucHien").length,
        hoanThanh: bienBanList.filter((d) => d.trang_thai === "HoanThanh").length,
    };

    return (
        <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng biên bản"
                            value={stats.total}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chưa thực hiện"
                            value={stats.chuaThucHien}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: "#8c8c8c" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đang thực hiện"
                            value={stats.dangThucHien}
                            prefix={<ReloadOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={stats.hoanThanh}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#52c41a" }}
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
                            Biên Bản Tiêu Hủy
                        </Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            style={{ width: 180 }}
                            allowClear
                            onChange={setFilterStatus}
                            value={filterStatus}
                        >
                            <Option value="ChuaThucHien">Chưa thực hiện</Option>
                            <Option value="DangThucHien">Đang thực hiện</Option>
                            <Option value="HoanThanh">Hoàn thành</Option>
                            <Option value="Huy">Hủy</Option>
                        </Select>
                        <Tooltip title="Làm mới dữ liệu">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchBienBanList}
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
                            Tạo biên bản mới
                        </Button>
                    </Space>
                }
                bordered={false}
            >
                <Table
                    dataSource={bienBanList}
                    columns={columns}
                    loading={loading}
                    rowKey="id_bb"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} biên bản`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    size="middle"
                />
            </Card>

            {/* Modal Tạo/Sửa biên bản */}
            <Modal
                title={
                    <Space>
                        {editingRecord ? <EditOutlined /> : <PlusOutlined />}
                        <span>{editingRecord ? "Cập nhật" : "Tạo"} Biên Bản Tiêu Hủy</span>
                    </Space>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingRecord(null);
                }}
                footer={null}
                width={900}
                destroyOnClose
            >
                <Divider style={{ margin: "16px 0" }} />
                <Alert
                    message="Hướng dẫn"
                    description="Nhập thông tin biên bản tiêu hủy và danh sách nguyên phụ liệu/sản phẩm cần tiêu hủy. Có thể upload file biên bản và hình ảnh minh chứng."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="so_bien_ban"
                                label="Số biên bản"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập số biên bản",
                                    },
                                    {
                                        max: 50,
                                        message: "Số biên bản không được vượt quá 50 ký tự",
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập số biên bản" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ngay_tieu_huy"
                                label="Ngày tiêu hủy"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày tiêu hủy",
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày tiêu hủy"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="dia_diem"
                                label="Địa điểm tiêu hủy"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập địa điểm",
                                    },
                                    {
                                        max: 255,
                                        message: "Địa điểm không được vượt quá 255 ký tự",
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập địa điểm tiêu hủy" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="trang_thai"
                                label="Trạng thái"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn trạng thái",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="ChuaThucHien">Chưa thực hiện</Option>
                                    <Option value="DangThucHien">Đang thực hiện</Option>
                                    <Option value="HoanThanh">Hoàn thành</Option>
                                    <Option value="Huy">Hủy</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="ly_do"
                        label="Lý do tiêu hủy"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập lý do tiêu hủy",
                            },
                        ]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập lý do tiêu hủy"
                            showCount
                            maxLength={1000}
                        />
                    </Form.Item>

                    <Form.Item
                        name="thanh_phan_tham_gia"
                        label="Thành phần tham gia"
                    >
                        <TextArea
                            rows={2}
                            placeholder="Nhập danh sách thành phần tham gia (mỗi người một dòng)"
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Form.Item
                        name="co_quan_chung_kien"
                        label="Cơ quan chứng kiến"
                    >
                        <Input placeholder="Nhập tên cơ quan chứng kiến" maxLength={255} />
                    </Form.Item>

                    <Divider>Chi tiết tiêu hủy</Divider>

                    <Form.List name="chiTiets">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Card
                                        key={key}
                                        size="small"
                                        style={{ marginBottom: 16 }}
                                        extra={
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => remove(name)}
                                                icon={<DeleteOutlined />}
                                            >
                                                Xóa
                                            </Button>
                                        }
                                    >
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "loai"]}
                                                    label="Loại"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: "Chọn loại",
                                                        },
                                                    ]}
                                                >
                                                    <Select
                                                        placeholder="Chọn loại"
                                                        onChange={() => {
                                                            // Reset id when changing type
                                                            const chiTiets = form.getFieldValue("chiTiets");
                                                            chiTiets[name].id_npl = undefined;
                                                            chiTiets[name].id_sp = undefined;
                                                            form.setFieldsValue({ chiTiets });
                                                        }}
                                                    >
                                                        <Option value="NPL">Nguyên phụ liệu</Option>
                                                        <Option value="SP">Sản phẩm</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    noStyle
                                                    shouldUpdate={(prevValues, currentValues) =>
                                                        prevValues.chiTiets?.[name]?.loai !==
                                                        currentValues.chiTiets?.[name]?.loai
                                                    }
                                                >
                                                    {({ getFieldValue }) => {
                                                        const loai = getFieldValue(["chiTiets", name, "loai"]);
                                                        if (loai === "NPL") {
                                                            return (
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, "id_npl"]}
                                                                    label="Nguyên phụ liệu"
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: "Chọn NPL",
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Select
                                                                        placeholder="Chọn NPL"
                                                                        showSearch
                                                                        optionFilterProp="children"
                                                                    >
                                                                        {nplList.map((npl) => (
                                                                            <Option
                                                                                key={npl.id_npl}
                                                                                value={npl.id_npl}
                                                                            >
                                                                                {npl.ten_npl}
                                                                            </Option>
                                                                        ))}
                                                                    </Select>
                                                                </Form.Item>
                                                            );
                                                        } else if (loai === "SP") {
                                                            return (
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, "id_sp"]}
                                                                    label="Sản phẩm"
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: "Chọn SP",
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Select
                                                                        placeholder="Chọn sản phẩm"
                                                                        showSearch
                                                                        optionFilterProp="children"
                                                                    >
                                                                        {spList.map((sp) => (
                                                                            <Option
                                                                                key={sp.id_sp}
                                                                                value={sp.id_sp}
                                                                            >
                                                                                {sp.ten_sp}
                                                                            </Option>
                                                                        ))}
                                                                    </Select>
                                                                </Form.Item>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "so_luong"]}
                                                    label="Số lượng"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: "Nhập số lượng",
                                                        },
                                                        {
                                                            type: "number",
                                                            min: 0.001,
                                                            message: "Số lượng phải > 0",
                                                        },
                                                    ]}
                                                >
                                                    <InputNumber
                                                        placeholder="Số lượng"
                                                        style={{ width: "100%" }}
                                                        min={0}
                                                        step={0.001}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "don_vi_tinh"]}
                                                    label="Đơn vị tính"
                                                >
                                                    <Input placeholder="Đơn vị tính" maxLength={50} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={16}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "ly_do_chi_tiet"]}
                                                    label="Lý do chi tiết"
                                                >
                                                    <TextArea
                                                        rows={1}
                                                        placeholder="Lý do tiêu hủy mặt hàng này"
                                                        maxLength={500}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}

                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    icon={<PlusOutlined />}
                                    style={{ marginBottom: 16 }}
                                >
                                    Thêm mặt hàng tiêu hủy
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space size="middle">
                            <Button
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                    setEditingRecord(null);
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
                                {editingRecord ? "Cập nhật" : "Tạo mới"}
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
                        <span>Chi tiết Biên Bản Tiêu Hủy</span>
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
                width={900}
            >
                {selectedBienBan && (
                    <>
                        <Divider style={{ margin: "16px 0" }} />

                        {/* Thông tin cơ bản */}
                        <Card
                            title="Thông tin biên bản"
                            size="small"
                            style={{ marginBottom: 16 }}
                        >
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Mã biên bản" span={2}>
                                    <Text strong style={{ fontSize: "16px" }}>
                                        BB-{String(selectedBienBan.id_bb).padStart(5, "0")}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số biên bản">
                                    <Text strong>{selectedBienBan.so_bien_ban}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tiêu hủy">
                                    {selectedBienBan.ngay_tieu_huy
                                        ? dayjs(selectedBienBan.ngay_tieu_huy).format("DD/MM/YYYY")
                                        : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa điểm">
                                    {selectedBienBan.dia_diem}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {renderTrangThai(selectedBienBan.trang_thai)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Lý do" span={2}>
                                    {selectedBienBan.ly_do}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thành phần tham gia" span={2}>
                                    {selectedBienBan.thanh_phan_tham_gia || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Cơ quan chứng kiến" span={2}>
                                    {selectedBienBan.co_quan_chung_kien || "-"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Chi tiết tiêu hủy */}
                        {selectedBienBan.chiTiets && selectedBienBan.chiTiets.length > 0 && (
                            <Card
                                title="Chi tiết tiêu hủy"
                                size="small"
                                style={{ marginBottom: 16 }}
                            >
                                <Table
                                    dataSource={selectedBienBan.chiTiets}
                                    columns={[
                                        {
                                            title: "STT",
                                            key: "stt",
                                            width: 60,
                                            render: (_, __, index) => index + 1,
                                        },
                                        {
                                            title: "Loại",
                                            key: "loai",
                                            width: 100,
                                            render: (_, record) => (
                                                <Tag color={record.id_npl ? "blue" : "green"}>
                                                    {record.id_npl ? "NPL" : "SP"}
                                                </Tag>
                                            ),
                                        },
                                        {
                                            title: "Tên mặt hàng",
                                            key: "ten",
                                            render: (_, record) =>
                                                record.nguyenPhuLieu?.ten_npl ||
                                                record.sanPham?.ten_sp ||
                                                "-",
                                        },
                                        {
                                            title: "Số lượng",
                                            dataIndex: "so_luong",
                                            key: "so_luong",
                                            width: 120,
                                            align: "right",
                                            render: (value) => formatVNNumber(value),
                                        },
                                        {
                                            title: "Đơn vị",
                                            dataIndex: "don_vi_tinh",
                                            key: "don_vi_tinh",
                                            width: 100,
                                        },
                                        {
                                            title: "Lý do chi tiết",
                                            dataIndex: "ly_do_chi_tiet",
                                            key: "ly_do_chi_tiet",
                                            ellipsis: true,
                                        },
                                    ]}
                                    pagination={false}
                                    size="small"
                                    rowKey="id_ct"
                                />
                            </Card>
                        )}

                        {/* File biên bản */}
                        {selectedBienBan.file_bien_ban && (
                            <Card title="File biên bản" size="small" style={{ marginBottom: 16 }}>
                                <a
                                    href={selectedBienBan.file_bien_ban}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button icon={<FileTextOutlined />}>
                                        Xem file biên bản
                                    </Button>
                                </a>
                            </Card>
                        )}

                        {/* Hình ảnh */}
                        {selectedBienBan.file_hinh_anh && (
                            <Card title="Hình ảnh minh chứng" size="small">
                                <Space wrap>
                                    {(typeof selectedBienBan.file_hinh_anh === "string"
                                        ? JSON.parse(selectedBienBan.file_hinh_anh)
                                        : selectedBienBan.file_hinh_anh
                                    ).map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Hình ${index + 1}`}
                                            style={{
                                                width: 150,
                                                height: 150,
                                                objectFit: "cover",
                                                borderRadius: 8,
                                            }}
                                        />
                                    ))}
                                </Space>
                            </Card>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
};

export default BienBanTieuHuy;
