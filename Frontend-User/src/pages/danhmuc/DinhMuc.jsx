import React, { useEffect, useState, useCallback } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Select,
    InputNumber,
    Space,
    Typography,
    Row,
    Col,
    Card,
    Spin,
    Input,
    Upload,
    message,
    Popconfirm,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    ReloadOutlined,
    UploadOutlined,
    DownloadOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import {
    getAllDinhMuc,
    getDinhMucBySanPham,
    createDinhMuc,
    deleteDinhMuc,
    importDinhMucFromExcel,
    getTemplateDinhMuc,
} from '../../services/dinhmuc.service';
import { getAllSanPham } from '../../services/sanpham.service';
import { getAllNguyenPhuLieu } from '../../services/nguyenphulieu.service';
import {
    showCreateSuccess,
    showUpdateSuccess,
    showLoadError,
    showSaveError,
    showError,
} from '../../components/notification';

const { Option } = Select;
const { Title, Text } = Typography;

const DinhMuc = () => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [dinhMucDetails, setDinhMucDetails] = useState([]);
    const [allDinhMuc, setAllDinhMuc] = useState([]);
    const [spList, setSpList] = useState([]);
    const [nplList, setNplList] = useState([]);
    const [saving, setSaving] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    // ===================== IMPORT EXCEL =====================
    const handleImportExcel = async (file) => {
        try {
            setImportLoading(true);
            
            const reader = new FileReader();
            const data = await new Promise((resolve, reject) => {
                reader.onload = (e) => {
                    try {
                        const workbook = XLSX.read(e.target.result, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(sheet);
                        resolve(jsonData);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsBinaryString(file);
            });

            const res = await importDinhMucFromExcel(data);
            if (res.success) {
                message.success(`Import thành công: ${res.data?.thanh_cong || 0} dòng`);
                fetchAll();
            } else {
                message.error(res.message || 'Import thất bại');
            }
        } catch (err) {
            message.error(err.message || 'Lỗi khi import Excel');
        } finally {
            setImportLoading(false);
        }
        return false;
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await getTemplateDinhMuc();
            if (res.success && res.data) {
                const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'mau_dinh_muc.json';
                link.click();
                message.success('Đã tải mẫu template');
            }
        } catch (err) {
            message.error('Lỗi khi tải mẫu');
        }
    };

    // ===================== FETCH DATA =====================
    const fetchAll = async () => {
        try {
            setLoading(true);
            // Sử dụng API sản phẩm và nguyên liệu đã có (đã phân quyền theo id_dn)
            const [spRes, nplRes, dmRes] = await Promise.all([
                getAllSanPham(),
                getAllNguyenPhuLieu(),
                getAllDinhMuc(),
            ]);
            setSpList(spRes.data || []);
            setNplList(nplRes.data || []);

            // Gom nhóm định mức theo sản phẩm
            const grouped = Object.values(
                (dmRes.data || []).reduce((acc, item) => {
                    const id_sp = item.id_sp;
                    if (!acc[id_sp]) {
                        acc[id_sp] = {
                            id_sp,
                            ten_sp: item.sanPham?.ten_sp || '',
                            dinh_muc_chi_tiet: [],
                        };
                    }
                    acc[id_sp].dinh_muc_chi_tiet.push({
                        id_dm: item.id_dm,
                        id_npl: item.id_npl,
                        ten_npl: item.nguyenPhuLieu?.ten_npl,
                        so_luong: item.so_luong,
                        ghi_chu: item.ghi_chu,
                    });
                    return acc;
                }, {})
            );
            setAllDinhMuc(grouped);
        } catch (err) {
            showLoadError('danh sách định mức');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // ===================== MODAL =====================
    const handleOpenModal = useCallback(async (product = null) => {
        setEditingProduct(product);
        setDinhMucDetails([]);
        form.resetFields();
        setIsModalOpen(true);

        if (product) {
            setLoadingModal(true);
            try {
                const res = await getDinhMucBySanPham(product.id_sp);
                const details = (res.data || []).map((dm) => ({
                    key: dm.id_dm || Date.now() + Math.random(),
                    id_dm: dm.id_dm,
                    id_npl: dm.id_npl,
                    so_luong: dm.so_luong,
                    ghi_chu: dm.ghi_chu || '',
                }));
                setDinhMucDetails(details);
                setTimeout(() => form.setFieldsValue({ id_sp: product.id_sp }), 0);
            } catch (err) {
                showLoadError('định mức chi tiết');
            } finally {
                setLoadingModal(false);
            }
        }
    }, [form]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setTimeout(() => {
            setDinhMucDetails([]);
            setEditingProduct(null);
            form.resetFields();
        }, 300);
    }, [form]);

    const handleAddRow = () => {
        const newRow = { key: Date.now(), id_npl: null, so_luong: 0.01, ghi_chu: '' };
        setDinhMucDetails([...dinhMucDetails, newRow]);
    };

    const handleRemoveRow = (key) => {
        setDinhMucDetails(dinhMucDetails.filter((item) => item.key !== key));
    };

    const handleRowChange = (key, field, value) => {
        setDinhMucDetails((prev) =>
            prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
        );
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (dinhMucDetails.length === 0) {
                showError('Dữ liệu không hợp lệ', 'Phải có ít nhất một nguyên phụ liệu!');
                return;
            }

            // Kiểm tra dữ liệu hợp lệ
            const invalidRows = dinhMucDetails.filter(
                (item) => !item.id_npl || !item.so_luong || item.so_luong <= 0
            );
            if (invalidRows.length > 0) {
                showError('Dữ liệu không hợp lệ', 'Vui lòng chọn nguyên phụ liệu và nhập số lượng hợp lệ cho tất cả các dòng!');
                return;
            }

            setSaving(true);
            const payload = {
                id_sp: values.id_sp,
                dinh_muc_chi_tiet: dinhMucDetails.map((item) => ({
                    id_nguyen_lieu: item.id_npl,
                    so_luong: parseFloat(item.so_luong),
                    ghi_chu: item.ghi_chu || '',
                })),
            };

            if (editingProduct) {
                // 🔥 Lấy toàn bộ định mức cũ và xóa từng dòng theo id_dm
                const resOld = await getDinhMucBySanPham(values.id_sp);
                const oldDetails = resOld.data || [];
                for (const item of oldDetails) {
                    await deleteDinhMuc(item.id_dm);
                }
            }

            await createDinhMuc(payload);
            if (editingProduct) {
                showUpdateSuccess('Định mức');
            } else {
                showCreateSuccess('Định mức');
            }
            handleCloseModal();
            fetchAll();
        } catch (err) {
            showSaveError('định mức');
        } finally {
            setSaving(false);
        }
    };

    // ===================== TABLE COLUMNS =====================
    const columnsMain = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'ten_sp',
        },
        {
            title: 'Số NPL trong định mức',
            align: 'center',
            render: (_, record) => record.dinh_muc_chi_tiet.length,
        },
        {
            title: 'Hành động',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>
                        Xem / Sửa
                    </Button>
                </Space>
            ),
        },
    ];

    const columnsModal = [
        {
            title: 'Nguyên phụ liệu',
            dataIndex: 'id_npl',
            render: (_, record) => (
                <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn NPL"
                    value={record.id_npl}
                    onChange={(val) => handleRowChange(record.key, 'id_npl', val)}
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
            title: 'Số lượng',
            dataIndex: 'so_luong',
            width: 150,
            render: (_, record) => (
                <InputNumber
                    min={0.01}
                    step="0.01"
                    style={{ width: '100%' }}
                    value={record.so_luong}
                    onChange={(val) => handleRowChange(record.key, 'so_luong', val || 0.01)}
                    placeholder="Nhập số lượng"
                    formatter={(value) => {
                        if (!value) return '';
                        const num = parseFloat(value);
                        return num % 1 === 0 ? num.toString() : value;
                    }}
                    parser={(value) => value}
                />
            ),
        },
        {
            title: 'Hành động',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleRemoveRow(record.key)}
                />
            ),
        },
    ];

    // ===================== RENDER =====================
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
                <h2 className="page-header-heading" style={{ margin: 0 }}>Quản lý Định mức Sản phẩm</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button icon={<ReloadOutlined />} onClick={fetchAll}>
                        Tải lại
                    </Button>
                    <Upload
                        accept=".xlsx,.xls,.json"
                        showUploadList={false}
                        beforeUpload={handleImportExcel}
                        disabled={importLoading}
                    >
                        <Button icon={<UploadOutlined />} loading={importLoading}>
                            Import Excel
                        </Button>
                    </Upload>
                    <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                        Tải mẫu
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenModal()}
                    >
                        Khai báo Định mức
                    </Button>
                </div>
            </div>

            <Card bordered={false}>
                <Spin spinning={loading}>
                    <Table columns={columnsMain} dataSource={allDinhMuc} rowKey="id_sp" />
                </Spin>
            </Card>

            <Modal
                title={
                    editingProduct
                        ? `Định mức cho sản phẩm: ${editingProduct.ten_sp}`
                        : 'Khai báo Định mức mới'
                }
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={850}
                destroyOnClose
                maskClosable={false}
            >
                <Spin spinning={loadingModal}>
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="id_sp"
                            label="Sản phẩm"
                            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
                        >
                            <Select placeholder="Chọn sản phẩm" disabled={!!editingProduct}>
                                {spList.map((sp) => (
                                    <Option key={sp.id_sp} value={sp.id_sp}>
                                        {sp.ten_sp}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Text strong>Danh sách Nguyên phụ liệu cấu thành:</Text>
                        <Table
                            columns={columnsModal}
                            dataSource={dinhMucDetails}
                            pagination={false}
                            rowKey="key"
                            bordered
                            size="small"
                            style={{ margin: '16px 0' }}
                        />
                        <Button
                            onClick={handleAddRow}
                            type="dashed"
                            icon={<PlusOutlined />}
                            style={{ width: '100%' }}
                        >
                            Thêm Nguyên phụ liệu
                        </Button>

                        <div style={{ marginTop: 24, textAlign: 'right' }}>
                            <Space>
                                <Button onClick={handleCloseModal}>Hủy</Button>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSave}
                                    loading={saving}
                                >
                                    Lưu Định mức
                                </Button>
                            </Space>
                        </div>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default DinhMuc;
