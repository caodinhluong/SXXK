import React, { useState, useEffect } from "react";
import {
    Form,
    Select,
    DatePicker,
    Button,
    Table,
    InputNumber,
    Upload,
    Typography,
    Popconfirm,
    Row,
    Col,
    Card,
    Space,
    Drawer, 
    Descriptions,
} from "antd";
import {
    UploadOutlined,
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { uploadSingleFile } from "../../services/upload.service";
import { getAllKho } from "../../services/kho.service";
import { getAllSanPham } from "../../services/sanpham.service";
import { getQuyDoiListSP, calculateSP_DN_to_HQ } from "../../services/quyDoiHelper.service";
import { 
    getAllNhapKhoSP,
    createNhapKhoSP, 
    updateNhapKhoSP,
    deleteNhapKhoSP 
} from "../../services/nhapkhosp.service";
import {
    showCreateSuccess,
    showUpdateSuccess,
    showDeleteSuccess,
    showLoadError,
    showSaveError,
    showUploadSuccess,
    showUploadError,
    showError
} from "../../components/notification";
import { extractErrorMessage } from "../../utils/errorHandler";

const { Option } = Select;
const { Title, Text } = Typography;

// Hàm format số theo kiểu Việt Nam (1.000.000)
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN');
};

const NhapKhoSP = () => {
    const [form] = Form.useForm();

    const [khoList, setKhoList] = useState([]);
    const [spList, setSpList] = useState([]); // must be array
    const [chiTietNhap, setChiTietNhap] = useState([]);

    const [fileUrl, setFileUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [lichSuPhieu, setLichSuPhieu] = useState([]);
    const [loadingLichSu, setLoadingLichSu] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPhieu, setSelectedPhieu] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);

    const fetchLichSu = async () => {
        setLoadingLichSu(true);
        try {
            const response = await getAllNhapKhoSP();
            const data = response?.data || response || [];
            setLichSuPhieu(data);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError('lịch sử phiếu nhập SP', errorMsg);
        } finally {
            setLoadingLichSu(false);
        }
    };

    useEffect(() => {
        fetchLichSu();
        
        const fetchData = async () => {
            try {
                const [resKho, resSP] = await Promise.all([getAllKho(), getAllSanPham()]);

                // resKho may be { success, data } or data array — handle both
                const khoArr = Array.isArray(resKho) ? resKho : (resKho?.data || resKho || []);
                const spArr = Array.isArray(resSP) ? resSP : (resSP?.data || resSP || []);

                setKhoList(khoArr);
                setSpList(spArr);
            } catch (error) {
                const errorMsg = extractErrorMessage(error);
                showLoadError('danh sách kho hoặc sản phẩm', errorMsg);
            }
        };

        fetchData();
    }, []);

    /* bảng chi tiết */
    const handleAddRow = async () => {
        const newRow = { 
            key: Date.now(), 
            id_sp: null, 
            so_luong_dn: 1,
            so_luong_hq: 1,
            quyDoiList: [],
            id_qd: null,
            ten_dvt_sp: null,
            ten_dvt_hq: null
        };
        setChiTietNhap(prev => [...prev, newRow]);
    };

    const handleRemoveRow = (key) => {
        setChiTietNhap(prev => prev.filter(item => item.key !== key));
    };

    const handleRowChange = async (key, field, value) => {
        const newData = [...chiTietNhap];
        const index = newData.findIndex(item => item.key === key);
        
        if (index > -1) {
            if (field === 'id_sp') {
                newData[index].id_sp = value;
                newData[index].so_luong_dn = 1;
                newData[index].so_luong_hq = 1;
                newData[index].validated = false; // Reset validation state
                
                // Load quy đổi cho SP
                try {
                    const quyDoiList = await getQuyDoiListSP(value);
                    newData[index].quyDoiList = quyDoiList;
                } catch (err) {
                    console.log('Không có quy đổi cho SP', value, err);
                    newData[index].quyDoiList = [];
                }
            } else if (field === 'id_qd') {
                const qd = newData[index].quyDoiList.find(q => q.id_qd === value);
                newData[index].id_qd = value;
                newData[index].ten_dvt_sp = qd?.ten_dvt_sp || null;
                newData[index].ten_dvt_hq = qd?.ten_dvt_hq || null;
            } else if (field === 'so_luong') {
                // Validate quantity
                if (value && value <= 0) {
                    newData[index].validated = true;
                }
                
                // Tính toán quy đổi nếu có
                if (newData[index].id_qd) {
                    try {
                        const result = await calculateSP_DN_to_HQ(
                            newData[index].id_sp,
                            newData[index].ten_dvt_sp,
                            value
                        );
                        newData[index].so_luong_dn = value;
                        newData[index].so_luong_hq = result.so_luong_hq;
                    } catch (err) {
                        console.log('Lỗi tính quy đổi', err);
                        newData[index].so_luong_dn = value;
                        newData[index].so_luong_hq = value;
                    }
                } else {
                    newData[index].so_luong_dn = value;
                    newData[index].so_luong_hq = value;
                }
            }
            setChiTietNhap(newData);
        }
    };

    /* upload file */
    const handleUpload = async ({ file, onSuccess, onError }) => {
        try {
            setUploading(true);
            const res = await uploadSingleFile(file);
            if (res?.data?.imageUrl) {
                setFileUrl(res.data.imageUrl);
                showUploadSuccess(file.name);
                if (onSuccess) onSuccess(res.data, file);
            } else {
                showUploadError();
                if (onError) onError(new Error("Không có URL file"));
            }
        } catch (err) {
            showUploadError();
            if (onError) onError(err);
        } finally {
            setUploading(false);
        }
    };

    const showDrawer = (record) => {
        setSelectedPhieu(record);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedPhieu(null), 300);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            id_kho: record.kho?.id_kho,
            ngay_nhap: dayjs(record.ngay_nhap),
        });
        setFileUrl(record.file_phieu || null);
        
        // Backend trả về chiTiets với structure: { id_ct, id_sp, so_luong, sanPham: {...} }
        const chiTiets = record.chiTiets || [];
        setChiTietNhap(chiTiets.map((item, index) => ({
            key: item.id_ct || index,
            id_sp: item.sanPham?.id_sp || item.id_sp,
            so_luong_dn: item.so_luong,
            so_luong_hq: item.so_luong,
            so_luong: item.so_luong,
            quyDoiList: [],
            id_qd: null,
            ten_dvt_sp: null,
            ten_dvt_hq: null,
            validated: false
        })));
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id_nhap) => {
        try {
            await deleteNhapKhoSP(id_nhap);
            showDeleteSuccess('Phiếu nhập SP');
            fetchLichSu(); // Tải lại danh sách
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showSaveError('xóa phiếu nhập SP', errorMsg);
        }
    };
    
    const cancelEdit = () => {
        setEditingRecord(null);
        form.resetFields();
        setChiTietNhap([]);
        setFileUrl(null);
    };

    const onFinish = async (values) => {
        if (!chiTietNhap.length) {
            showError("Vui lòng thêm ít nhất một sản phẩm!", "Không có sản phẩm nào được chọn");
            return;
        }

        // Mark all items as validated for visual feedback
        const validatedItems = chiTietNhap.map(item => ({ ...item, validated: true }));
        setChiTietNhap(validatedItems);

        // Validate chi tiết
        let hasError = false;
        for (const item of chiTietNhap) {
            if (!item.id_sp) {
                showError("Vui lòng chọn sản phẩm cho tất cả dòng!", "Có dòng chưa chọn sản phẩm");
                hasError = true;
                break;
            }
            const soLuong = item.so_luong_hq || item.so_luong_dn;
            if (!soLuong || soLuong <= 0) {
                showError("Số lượng phải lớn hơn 0!", "Kiểm tra lại số lượng nhập");
                hasError = true;
                break;
            }
        }

        if (hasError) {
            return;
        }

        const payload = {
            id_kho: values.id_kho,
            ngay_nhap: values.ngay_nhap
                ? dayjs(values.ngay_nhap).format("YYYY-MM-DD")
                : null,
            file_phieu: fileUrl || null,
            chi_tiets: chiTietNhap.map(item => ({
                id_sp: item.id_sp,
                so_luong_nhap: item.so_luong_hq || item.so_luong_dn || item.so_luong // Backend expects 'so_luong_nhap'
            }))
        };

        console.log("📦 Payload gửi đi:", payload);

        try {
            setSubmitting(true);

            if (editingRecord) {
                // Chế độ Cập nhật
                await updateNhapKhoSP(editingRecord.id_nhap, payload);
                showUpdateSuccess('Phiếu nhập SP');
            } else {
                // Chế độ Tạo mới
                await createNhapKhoSP(payload);
                showCreateSuccess('Phiếu nhập SP');
            }
            
            cancelEdit(); // Reset form và trạng thái
            fetchLichSu(); // Tải lại lịch sử

        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showSaveError('phiếu nhập SP', errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: "id_sp",
            width: '30%',
            render: (_, record) => (
                <Select
                    placeholder="Chọn sản phẩm"
                    style={{ width: "100%" }}
                    value={record.id_sp}
                    onChange={(val) => handleRowChange(record.key, "id_sp", val)}
                    showSearch
                    optionFilterProp="children"
                    status={!record.id_sp && record.validated ? 'error' : ''}
                >
                    {(Array.isArray(spList) ? spList : []).map(sp => (
                        <Option key={sp.id_sp} value={sp.id_sp}>{sp.ten_sp}</Option>
                    ))}
                </Select>
            )
        },
        {
            title: "Đơn vị",
            width: '20%',
            render: (_, record) => {
                if (!record.quyDoiList || record.quyDoiList.length === 0) {
                    return <span style={{ color: '#999' }}>-</span>;
                }
                return (
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Chọn đơn vị"
                        value={record.id_qd}
                        onChange={(val) => handleRowChange(record.key, 'id_qd', val)}
                    >
                        {record.quyDoiList.map(qd => (
                            <Option key={qd.id_qd} value={qd.id_qd}>
                                {qd.ten_dvt_sp} (1 = {qd.he_so} {qd.ten_dvt_hq})
                            </Option>
                        ))}
                    </Select>
                );
            }
        },
        {
            title: "Số lượng nhập",
            width: '30%',
            render: (_, record) => {
                const soLuong = record.so_luong_dn;
                const hasError = record.validated && (!soLuong || soLuong <= 0);
                
                return (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <InputNumber
                            min={0.01}
                            style={{ width: "100%" }}
                            value={record.so_luong_dn}
                            onChange={(val) => handleRowChange(record.key, "so_luong", val)}
                            placeholder={record.id_qd ? `Nhập ${record.ten_dvt_sp}` : 'Nhập số lượng'}
                            status={hasError ? 'error' : ''}
                        />
                        {hasError && (
                            <Text type="danger" style={{ fontSize: '12px' }}>
                                Số lượng phải lớn hơn 0
                            </Text>
                        )}
                        {record.id_qd && record.so_luong_hq !== record.so_luong_dn && !hasError && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                = {formatVNNumber(record.so_luong_hq)} {record.ten_dvt_hq}
                            </Text>
                        )}
                    </Space>
                );
            }
        },
        {
            title: "Hành động",
            width: '20%',
            align: 'center',
            render: (_, record) => (
                <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleRemoveRow(record.key)}>
                    <Button icon={<DeleteOutlined />} danger />
                </Popconfirm>
            )
        }
    ];

    const lichSuColumns = [
        { 
            title: 'Số phiếu', 
            dataIndex: 'so_phieu', 
            render: (text, record) => text || `PNKSP-${record.id_nhap}`,
            width: '15%'
        },
        { 
            title: 'Ngày nhập', 
            dataIndex: 'ngay_nhap', 
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-',
            width: '15%'
        },
        { 
            title: 'Kho nhận', 
            dataIndex: ['kho', 'ten_kho'],
            render: (text) => text || '-',
            width: '25%'
        },
        {
            title: 'Số lượng SP',
            key: 'so_luong_sp',
            render: (_, record) => {
                const chiTiets = record.chiTiets || [];
                return chiTiets.length > 0 ? `${chiTiets.length} loại` : '-';
            },
            width: '15%',
            align: 'center'
        },
        { 
            title: 'Hành động', 
            key: 'action', 
            width: '30%', 
            align: 'center', 
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => showDrawer(record)}>Xem</Button>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm title="Bạn có chắc muốn xóa phiếu này?" onConfirm={() => handleDelete(record.id_nhap)}>
                        <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];
    
    const chiTietColumns = [
        { 
            title: 'STT',
            key: 'stt',
            width: '10%',
            align: 'center',
            render: (_, __, index) => index + 1
        },
        { 
            title: 'Tên sản phẩm', 
            dataIndex: ['sanPham', 'ten_sp'],
            render: (text) => text || '-',
            width: '60%'
        },
        { 
            title: 'Số lượng nhập', 
            dataIndex: 'so_luong', 
            align: 'right', 
            width: '30%',
            render: (val) => formatVNNumber(val) 
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false}>
                <Title level={3}>{editingRecord ? `Chỉnh sửa Phiếu Nhập kho SP #${editingRecord.so_phieu || `PNKSP-${editingRecord.id_nhap}`}` : 'Tạo Phiếu Nhập Kho Sản Phẩm (Thành phẩm)'}</Title>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item 
                                label="Kho nhận hàng" 
                                name="id_kho" 
                                rules={[
                                    { required: true, message: "Vui lòng chọn kho nhận hàng!" }
                                ]}
                            >
                                <Select placeholder="Chọn kho">{khoList.map(k => (<Option key={k.id_kho} value={k.id_kho}>{k.ten_kho}</Option>))}</Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                label="Ngày nhập kho" 
                                name="ngay_nhap" 
                                rules={[
                                    { required: true, message: "Vui lòng chọn ngày nhập kho!" },
                                    {
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            if (!dayjs(value).isValid()) {
                                                return Promise.reject(new Error('Ngày không hợp lệ'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="File phiếu nhập (nếu có)">
                        <Upload customRequest={handleUpload} maxCount={1} showUploadList={!!fileUrl}>
                            <Button icon={<UploadOutlined />} loading={uploading}>Tải lên</Button>
                        </Upload>
                    </Form.Item>
                    <Title level={4}>Chi tiết Sản Phẩm Nhập Kho</Title>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddRow} style={{ marginBottom: 16 }}>Thêm Sản phẩm</Button>
                    <Table columns={columns} dataSource={chiTietNhap} pagination={false} rowKey="key" bordered />
                    <Form.Item style={{ marginTop: 24 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                {editingRecord ? 'Cập nhật Phiếu nhập' : 'Lưu Phiếu nhập'}
                            </Button>
                            {editingRecord && (
                                <Button icon={<CloseCircleOutlined />} onClick={cancelEdit}>Hủy sửa</Button>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Lịch sử Phiếu Nhập kho SP" bordered={false}>
                <Table columns={lichSuColumns} dataSource={lichSuPhieu} rowKey="id_nhap" loading={loadingLichSu} />
            </Card>

            <Drawer title={`Chi tiết Phiếu nhập: ${selectedPhieu?.so_phieu || `PNKSP-${selectedPhieu?.id_nhap}`}`} width={700} open={isDrawerOpen} onClose={closeDrawer} destroyOnClose>
                {selectedPhieu && <>
                    <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                        <Descriptions.Item label="Số phiếu">
                            {selectedPhieu.so_phieu || `PNKSP-${selectedPhieu.id_nhap}`}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày nhập">{dayjs(selectedPhieu.ngay_nhap).format('DD/MM/YYYY')}</Descriptions.Item>
                        <Descriptions.Item label="Kho nhận">{selectedPhieu.kho?.ten_kho || '-'}</Descriptions.Item>
                        {selectedPhieu.file_phieu && (
                            <Descriptions.Item label="File đính kèm">
                                <a href={selectedPhieu.file_phieu} target="_blank" rel="noopener noreferrer">
                                    Xem file
                                </a>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                    <Title level={5}>Danh sách sản phẩm đã nhập</Title>
                    <Table columns={chiTietColumns} dataSource={selectedPhieu.chiTiets || []} rowKey="id_ct" pagination={false} size="small" bordered />
                </>}
            </Drawer>
        </Space>
    );
};

export default NhapKhoSP;


