import React, { useEffect, useState, useCallback } from "react";
import {
    Table, Button, Modal, Form, Input, Select, DatePicker, Space, Popconfirm,
    InputNumber, Row, Col, Typography, Card, Upload, Tooltip
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined,
    UploadOutlined, EyeOutlined, SearchOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getAllHopDong, createHopDong, updateHopDong, deleteHopDong } from "../../services/hopdong.service";
import { getLoHangByHopDong } from "../../services/lohang.service";
import { uploadSingleFile } from "../../services/upload.service";
import { getAllTienTe } from '../../services/tiente.service';
import { 
    showCreateSuccess, 
    showUpdateSuccess, 
    showDeleteSuccess, 
    showLoadError, 
    showSaveError,
    showUploadSuccess,
    showUploadError
} from '../../components/notification';

const { Option } = Select;
const { Title } = Typography;
const { Search } = Input;

// Hàm format số theo kiểu Việt Nam (1.000.000)
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN');
};

const HopDong = () => {
    const [crudForm] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [crudModalContent, setCrudModalContent] = useState({ type: null, record: null, title: "" });
    const [selectedHopDong, setSelectedHopDong] = useState(null);
    const [loHangDataSource, setLoHangDataSource] = useState([]);
    const [tienTeList, setTienTeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);


    // ✅ upload file
    const [fileUrl, setFileUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    // const tienTeList = [
    //     { id_tt: 1, ma_tt: "USD", ten_tt: "Đô la Mỹ" },
    //     { id_tt: 2, ma_tt: "VND", ten_tt: "Việt Nam Đồng" },
    // ];
    // ✅ Lấy danh sách tiền tệ từ BE
    const fetchTienTe = async () => {
        try {
            const res = await getAllTienTe();
            if (res?.success) setTienTeList(res.data);
            else showLoadError('danh sách tiền tệ');
        } catch (err) {
            console.error(err);
            showLoadError('danh sách tiền tệ');
        }
    };

    const fetchHopDong = async () => {
        try {
            setLoading(true);
            const res = await getAllHopDong();
            if (res?.success) setDataSource(res.data);
        } catch {
            showLoadError('danh sách hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHopDong();
        fetchTienTe();
    }, []);

    const showDetailModal = useCallback(async (record) => {
        try {
            setSelectedHopDong(record);
            const res = await getLoHangByHopDong(record.id_hd);
            console.log("LoHang response:", res); // Debug log
            const lhData = res?.data?.data || res?.data || res || [];
            setLoHangDataSource(Array.isArray(lhData) ? lhData : []);
            setDetailModalOpen(true);
        } catch (err) {
            console.error("Lỗi lấy lô hàng:", err); // Debug log
            showLoadError('danh sách lô hàng');
        }
    }, []);

    const closeDetailModal = useCallback(() => {
        setDetailModalOpen(false);
        // Delay reset để tránh flicker
        setTimeout(() => {
            setSelectedHopDong(null);
            setLoHangDataSource([]);
        }, 300);
    }, []);

    const handleOpenCrudModal = useCallback((type, record = null) => {
        const title = `${record ? "Chỉnh sửa" : "Thêm mới"} ${type === "hopDong" ? "Hợp đồng" : "Lô hàng"}`;
        setCrudModalContent({ type, record, title });
        setFileUrl(null);
        crudForm.resetFields();

        if (record) {
            const dateFields = ["ngay_ky", "ngay_hieu_luc", "ngay_het_han", "ngay_dong_goi", "ngay_xuat_cang"];
            const recordWithDayjs = { ...record };
            dateFields.forEach((f) => {
                if (record[f]) recordWithDayjs[f] = dayjs(record[f]);
            });
            // Dùng setTimeout để đảm bảo form đã mount
            setTimeout(() => {
                crudForm.setFieldsValue(recordWithDayjs);
            }, 0);
            if (type === "hopDong" && record.file_hop_dong) setFileUrl(record.file_hop_dong);
            if (type === "loHang" && record.file_chung_tu) setFileUrl(record.file_chung_tu);
        }
        setIsCrudModalOpen(true);
    }, [crudForm]);

    const closeCrudModal = useCallback(() => {
        setIsCrudModalOpen(false);
        // Delay reset để tránh flicker
        setTimeout(() => {
            setCrudModalContent({ type: null, record: null, title: "" });
            setFileUrl(null);
            crudForm.resetFields();
        }, 300);
    }, [crudForm]);

    // ✅ Upload file (theo mẫu LoHang.jsx)
    const handleUpload = async ({ file, onSuccess, onError }) => {
        try {
            setUploading(true);
            const res = await uploadSingleFile(file);
            if (res?.data?.imageUrl) {
                setFileUrl(res.data.imageUrl);
                showUploadSuccess(file.name);
                onSuccess(res.data, file);
            } else {
                showUploadError();
                onError(new Error("Không có URL file!"));
            }
        } catch (err) {
            console.error(err);
            showUploadError();
            onError(err);
        } finally {
            setUploading(false);
        }
    };

    const handleCrudSave = useCallback(async () => {
        try {
            const values = await crudForm.validateFields();
            setSaving(true);
            
            Object.keys(values).forEach((key) => {
                if (dayjs.isDayjs(values[key])) {
                    values[key] = values[key].format("YYYY-MM-DD");
                }
            });

            if (crudModalContent.type === "hopDong") {
                const payload = { ...values, file_hop_dong: fileUrl || null };

                if (crudModalContent.record) {
                    await updateHopDong(crudModalContent.record.id_hd, payload);
                    showUpdateSuccess('Hợp đồng');
                } else {
                    await createHopDong(payload);
                    showCreateSuccess('Hợp đồng');
                }
                fetchHopDong();
            }

            closeCrudModal();
        } catch (err) {
            console.error(err);
            showSaveError('hợp đồng');
        } finally {
            setSaving(false);
        }
    }, [crudForm, crudModalContent, fileUrl, closeCrudModal]);

    const handleDeleteHopDong = async (id_hd) => {
        try {
            await deleteHopDong(id_hd);
            showDeleteSuccess('Hợp đồng');
            fetchHopDong();
        } catch {
            showSaveError('hợp đồng');
        }
    };

    const mainColumns = [
        { title: "Số Hợp đồng", dataIndex: "so_hd" },
        { title: "Ngày ký", dataIndex: "ngay_ky", render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: "Ngày hiệu lực", dataIndex: "ngay_hieu_luc", render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: "Ngày hết hạn", dataIndex: "ngay_het_han", render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        {
            title: "Giá trị",
            dataIndex: "gia_tri",
            align: "right",
            render: (val) => formatVNNumber(val),
        },
        {
            title: "Tiền tệ",
            dataIndex: "id_tt",
            render: (id) => tienTeList.find((t) => t.id_tt === id)?.ma_tt,
        },
        {
            title: "File",
            dataIndex: "file_hop_dong",
            align: "center",
            render: (file) =>
                file ? (
                    <Tooltip title="Xem file hợp đồng">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => window.open(file, "_blank")}
                        />
                    </Tooltip>
                ) : (
                    "-"
                ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 220,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Button icon={<FolderOpenOutlined />} onClick={() => showDetailModal(record)}>
                        Lô hàng
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenCrudModal("hopDong", record)}>
                        Sửa
                    </Button>
                    <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDeleteHopDong(record.id_hd)}>
                        <Button icon={<DeleteOutlined />} danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const loHangColumns = [
        // { title: "Số Lô hàng", dataIndex: "id_lh" },
        { title: "Ngày đóng gói", dataIndex: "ngay_dong_goi", render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: "Ngày xuất cảng", dataIndex: "ngay_xuat_cang", render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: "Cảng xuất", dataIndex: "cang_xuat" },
        { title: "Cảng nhập", dataIndex: "cang_nhap" },
        {
            title: "File",
            dataIndex: "file_chung_tu",
            align: "center",
            render: (file) =>
                file ? (
                    <Tooltip title="Xem file chứng từ">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => window.open(file, "_blank")}
                        />
                    </Tooltip>
                ) : (
                    "-"
                ),
        },
    ];

    const renderCrudForm = () => {
        if (crudModalContent.type === "hopDong") {
            return (
                <>
                    <Form.Item name="so_hd" label="Số hợp đồng" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="ngay_ky" label="Ngày ký" rules={[{ required: true, message: 'Vui lòng chọn ngày ký' }]}>
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item 
                                name="ngay_hieu_luc" 
                                label="Ngày hiệu lực"
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const ngayHetHan = getFieldValue('ngay_het_han');
                                            if (!value || !ngayHetHan) {
                                                return Promise.resolve();
                                            }
                                            if (value.isBefore(ngayHetHan)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Ngày hiệu lực phải nhỏ hơn ngày hết hạn'));
                                        },
                                    }),
                                ]}
                            >
                                <DatePicker 
                                    style={{ width: "100%" }} 
                                    format="DD/MM/YYYY"
                                    onChange={() => {
                                        // Trigger validation cho ngày hết hạn khi ngày hiệu lực thay đổi
                                        crudForm.validateFields(['ngay_het_han']);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item 
                                name="ngay_het_han" 
                                label="Ngày hết hạn"
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const ngayHieuLuc = getFieldValue('ngay_hieu_luc');
                                            if (!value || !ngayHieuLuc) {
                                                return Promise.resolve();
                                            }
                                            if (value.isAfter(ngayHieuLuc)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Ngày hết hạn phải lớn hơn ngày hiệu lực'));
                                        },
                                    }),
                                ]}
                            >
                                <DatePicker 
                                    style={{ width: "100%" }} 
                                    format="DD/MM/YYYY"
                                    onChange={() => {
                                        // Trigger validation cho ngày hiệu lực khi ngày hết hạn thay đổi
                                        crudForm.validateFields(['ngay_hieu_luc']);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="gia_tri" label="Giá trị hợp đồng">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    formatter={(value) => formatVNNumber(value)}
                                    parser={(value) => value.replace(/\./g, "")}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="id_tt" label="Tiền tệ">
                                <Select placeholder="Chọn tiền tệ">
                                    {tienTeList.map((t) => (
                                        <Option key={t.id_tt} value={t.id_tt}>
                                            {t.ma_tt}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ✅ Upload file thật + xem trước (giống LoHang.jsx) */}
                    <Form.Item label="File scan hợp đồng">
                        <Upload
                            customRequest={handleUpload}
                            maxCount={1}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} loading={uploading}>
                                Tải lên file
                            </Button>
                        </Upload>

                        {fileUrl && (
                            <div style={{ marginTop: 8 }}>
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                    Xem file đã tải lên
                                </a>
                            </div>
                        )}
                    </Form.Item>
                </>
            );
        }

        return null;
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
                <h2 className="page-header-heading" style={{ margin: 0 }}>Quản lý Hợp đồng</h2>
                <div style={{ display: 'flex', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
                    <Input
                        placeholder="Tìm kiếm hợp đồng..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenCrudModal("hopDong")}>
                        Thêm mới
                    </Button>
                </div>
            </div>

            <Card bordered={false}>
                <Table columns={mainColumns} dataSource={dataSource} rowKey="so_hd" loading={loading} />
            </Card>

            <Modal
                title={`Danh sách Lô hàng của Hợp đồng: ${selectedHopDong?.so_hd || ''}`}
                open={isDetailModalOpen}
                onCancel={closeDetailModal}
                footer={null}
                width="80vw"
                destroyOnClose
                maskClosable={false}
            >
                <Table columns={loHangColumns} dataSource={loHangDataSource} rowKey="id_lh" size="small" />
            </Modal>

            <Modal
                title={crudModalContent.title}
                open={isCrudModalOpen}
                onCancel={closeCrudModal}
                onOk={handleCrudSave}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={saving}
                destroyOnClose
                maskClosable={false}
            >
                <Form form={crudForm} layout="vertical">
                    {renderCrudForm()}
                </Form>
            </Modal>
        </>
    );
};

export default HopDong;
