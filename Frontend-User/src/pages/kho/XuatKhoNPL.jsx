import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Table, InputNumber, Upload, Typography, Popconfirm, Row, Col, Card, Space, Drawer, Descriptions, Input } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined, CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XuatKhoNPLService from '../../services/xuatkhonpl.service';
import { getAllKho } from '../../services/kho.service';
import { getQuyDoiListNPL, calculateNPL_DN_to_HQ } from '../../services/quyDoiHelper.service';

import axios from 'axios';
import { showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showLoadError, showSaveError, showWarning } from '../../components/notification';
import { extractErrorMessage } from '../../utils/errorHandler';

const { Option } = Select;
const { Title, Text } = Typography;

// Hàm format số theo kiểu Việt Nam (1.000.000)
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN');
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const getTonKhoNPLByKho = async (id_kho) => {
    try {
        // Gọi API mới: GET /api/kho/:id_kho/ton-kho-npl
        const response = await axios.get(`${API_BASE_URL}/kho/${id_kho}/ton-kho-npl`, {
            headers: getAuthHeader()
        });
        // Xử lý response có thể là { success, data } hoặc array trực tiếp
        const data = response.data?.data || response.data || [];
        console.log("Tồn kho NPL:", data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Lỗi getTonKhoNPLByKho:", error);
        throw error.response?.data || error;
    }
};

const XuatKhoNPL = () => {
    const [form] = Form.useForm();
    const [chiTietXuat, setChiTietXuat] = useState([]);
    const [khoList, setKhoList] = useState([]);
    const [selectedKhoId, setSelectedKhoId] = useState(null);
    const [nplTrongKho, setNplTrongKho] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [lichSuPhieu, setLichSuPhieu] = useState([]);
    const [loadingLichSu, setLoadingLichSu] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPhieu, setSelectedPhieu] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);

    const fetchLichSu = async () => {
        setLoadingLichSu(true);
        try {
            const response = await XuatKhoNPLService.getAllXuatKhoNPL();
            setLichSuPhieu(response.data || []);
        } catch (error) {
            if (error.status === 401) {
                showWarning('Phiên làm việc hết hạn', 'Vui lòng đăng nhập lại');
            } else {
                const errorMsg = extractErrorMessage(error);
                showLoadError('lịch sử phiếu xuất NPL', errorMsg);
            }
        } finally { 
            setLoadingLichSu(false); 
        }
    };
    
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await getAllKho();
                // Xử lý response có thể là { success, data } hoặc array trực tiếp
                const khoData = res?.data || res || [];
                setKhoList(Array.isArray(khoData) ? khoData : []);
            } catch (error) {
                if (error.status === 401) {
                    showWarning('Phiên làm việc hết hạn', 'Vui lòng đăng nhập lại');
                } else {
                    const errorMsg = extractErrorMessage(error);
                    showLoadError('danh sách kho', errorMsg);
                }
            }
        };
        
        fetchInitialData();
        fetchLichSu();
    }, []);

    const handleKhoChange = async (id_kho) => {
        setSelectedKhoId(id_kho);
        setChiTietXuat([]);
        if (id_kho) {
            try {
                const data = await getTonKhoNPLByKho(id_kho);
                setNplTrongKho(data || []);
            } catch (error) {
                if (error.status === 401) {
                    showWarning('Phiên làm việc hết hạn', 'Vui lòng đăng nhập lại');
                } else {
                    const errorMsg = extractErrorMessage(error);
                    showLoadError('tồn kho của kho này', errorMsg);
                }
            }
        } else {
            setNplTrongKho([]);
        }
    };

    const handleAddRow = () => {
        if (!selectedKhoId) {
            showWarning('Vui lòng chọn kho xuất hàng trước');
            return;
        }
        const newRow = { 
            key: Date.now(), 
            id_npl: null, 
            so_luong_dn: 1,
            so_luong_hq: 1, 
            ton_kho: 0, 
            don_vi: '',
            quyDoiList: [],
            id_qd: null,
            ten_dvt_dn: null,
            ten_dvt_hq: null
        };
        setChiTietXuat([...chiTietXuat, newRow]);
    };

    const handleRemoveRow = (key) => setChiTietXuat(chiTietXuat.filter(item => item.key !== key));
    
    const handleRowChange = async (key, field, value) => {
        const newData = [...chiTietXuat];
        const index = newData.findIndex(item => key === item.key);
        if (index > -1) {
            if (field === 'id_npl') {
                const selectedNPL = nplTrongKho.find(npl => (npl.id_npl || npl.nguyenPhuLieu?.id_npl) === value);
                newData[index].id_npl = value;
                newData[index].ton_kho = selectedNPL ? (selectedNPL.so_luong_ton || 0) : 0;
                newData[index].don_vi = selectedNPL ? (selectedNPL.don_vi || selectedNPL.nguyenPhuLieu?.donViTinhHQ?.ten_dvt || '') : '';
                newData[index].so_luong_dn = 1;
                newData[index].so_luong_hq = 1;
                
                // Load quy đổi
                try {
                    const quyDoiList = await getQuyDoiListNPL(value);
                    newData[index].quyDoiList = quyDoiList;
                } catch (err) {
                    console.log('Không có quy đổi cho NPL', value, err);
                    newData[index].quyDoiList = [];
                }
            } else if (field === 'id_qd') {
                const qd = newData[index].quyDoiList.find(q => q.id_qd === value);
                newData[index].id_qd = value;
                newData[index].ten_dvt_dn = qd?.ten_dvt_dn || null;
                newData[index].ten_dvt_hq = qd?.ten_dvt_hq || null;
            } else if (field === 'so_luong') {
                // Tính toán quy đổi nếu có
                if (newData[index].id_qd) {
                    try {
                        const result = await calculateNPL_DN_to_HQ(
                            newData[index].id_npl,
                            newData[index].ten_dvt_dn,
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
            } else {
                newData[index][field] = value;
            }
            setChiTietXuat(newData);
        }
    };

    const showDrawer = (record) => { setSelectedPhieu(record); setIsDrawerOpen(true); };
    
    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedPhieu(null), 300);
    };
    
    const handleEdit = async (record) => {
        setEditingRecord(record);
        // Phải await để đảm bảo nplTrongKho được cập nhật trước khi set chi tiết
        await handleKhoChange(record.kho?.id_kho);
        
        form.setFieldsValue({
            id_kho: record.kho?.id_kho,
            ngay_xuat: dayjs(record.ngay_xuat),
            ca_kip: record.ca_kip || '',
        });

        // Backend trả về chiTiets, không phải chiTietXuatKhoNPLs
        const chiTiets = record.chiTiets || [];
        
        // Cần setTimeout nhỏ để đợi state nplTrongKho cập nhật xong sau khi await
        setTimeout(() => {
            const tonKhoHienTai = (nplTrongKho || []).reduce((acc, item) => {
                acc[item.id_npl] = item.so_luong_ton;
                return acc;
            }, {});

            const chiTiet = chiTiets.map((item, index) => {
                const tonKho = tonKhoHienTai[item.nguyenPhuLieu?.id_npl] || 0;
                return {
                    key: item.id_ct || index,
                    id_npl: item.nguyenPhuLieu?.id_npl,
                    so_luong: item.so_luong,
                    // Tồn kho khả dụng khi sửa = tồn kho hiện tại + lượng đã xuất của chính phiếu này
                    ton_kho: tonKho + item.so_luong,
                    don_vi: item.nguyenPhuLieu?.don_vi || '',
                }
            });
            setChiTietXuat(chiTiet);
        }, 100);

        window.scrollTo(0, 0);
    };

    const handleDelete = async (id_xuat) => {
        try {
            await XuatKhoNPLService.deleteXuatKhoNPL(id_xuat);
            showDeleteSuccess('Phiếu xuất NPL');
            fetchLichSu();
        } catch (error) {
            if (error.status === 401) {
                showWarning('Phiên làm việc hết hạn', 'Vui lòng đăng nhập lại');
            } else {
                const errorMsg = extractErrorMessage(error);
                showSaveError('xóa phiếu xuất NPL', errorMsg);
            }
        }
    };
    
    const cancelEdit = () => {
        setEditingRecord(null);
        form.resetFields();
        setChiTietXuat([]);
        setSelectedKhoId(null);
        setNplTrongKho([]);
    };
    
    const onFinish = async (values) => {
        if (!chiTietXuat.length || chiTietXuat.some(item => !item.id_npl)) {
            showWarning('Vui lòng thêm và chọn nguyên phụ liệu');
            return;
        }
        
        // Validate số lượng xuất không vượt quá tồn kho
        for (const item of chiTietXuat) {
            if (item.so_luong > item.ton_kho) {
                showWarning('Số lượng xuất không được vượt quá tồn kho khả dụng');
                return;
            }
        }
        
        setSubmitting(true);
        const payload = {
            id_kho: values.id_kho,
            ngay_xuat: dayjs(values.ngay_xuat).format("YYYY-MM-DD"),
            ca_kip: values.ca_kip || null,
            file_phieu: null,
            chi_tiets: chiTietXuat.map((item) => ({
                id_npl: item.id_npl,
                so_luong: item.so_luong_hq || item.so_luong_dn // Lưu số lượng HQ
            }))
        };
        
        try {
            if (editingRecord) {
                await XuatKhoNPLService.updateXuatKhoNPL(editingRecord.id_xuat, payload);
                showUpdateSuccess('Phiếu xuất NPL');
            } else {
                await XuatKhoNPLService.createXuatKhoNPL(payload);
                showCreateSuccess('Phiếu xuất NPL');
            }
            cancelEdit();
            fetchLichSu();
        } catch (error) {
            if (error.status === 401) {
                showWarning('Phiên làm việc hết hạn', 'Vui lòng đăng nhập lại');
            } else {
                const errorMsg = extractErrorMessage(error);
                showSaveError('phiếu xuất NPL', errorMsg);
            }
        } finally { 
            setSubmitting(false); 
        }
    };

    const columns = [
        { title: 'Nguyên phụ liệu', dataIndex: 'id_npl', width: '30%', render: (_, record) => (
            <Select style={{ width: '100%' }} placeholder="Chọn NPL" value={record.id_npl} onChange={(val) => handleRowChange(record.key, 'id_npl', val)} showSearch optionFilterProp="children">
                {nplTrongKho.map(npl => {
                    const id = npl.id_npl || npl.nguyenPhuLieu?.id_npl;
                    const ten = npl.ten_npl || npl.nguyenPhuLieu?.ten_npl || 'N/A';
                    const ton = npl.so_luong_ton || 0;
                    const dvt = npl.don_vi || npl.nguyenPhuLieu?.donViTinhHQ?.ten_dvt || '';
                    return <Option key={id} value={id}>{`${ten} (Tồn: ${ton} ${dvt})`}</Option>;
                })}
            </Select>
        ) },
        { 
            title: 'Đơn vị', 
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
                                {qd.ten_dvt_dn}
                            </Option>
                        ))}
                    </Select>
                );
            }
        },
        { title: 'Tồn kho', dataIndex: 'ton_kho', align: 'center', width: '15%', render: (text, record) => <Text strong>{`${formatVNNumber(text || 0)} ${record.ten_dvt_hq || record.don_vi || ''}`}</Text> },
        { 
            title: 'Số lượng xuất', 
            width: '20%',
            render: (_, record) => (
                <Space direction="vertical" style={{ width: '100%' }}>
                    <InputNumber 
                        min={1} 
                        max={record.ton_kho} 
                        style={{ width: '100%' }} 
                        value={record.so_luong_dn} 
                        onChange={(val) => handleRowChange(record.key, 'so_luong', val)} 
                        disabled={!record.id_npl}
                        placeholder={record.id_qd ? record.ten_dvt_dn : 'Số lượng'}
                    />
                    {record.id_qd && record.so_luong_hq !== record.so_luong_dn && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            = {formatVNNumber(record.so_luong_hq)} {record.ten_dvt_hq}
                        </Text>
                    )}
                </Space>
            )
        },
        { title: 'Hành động', width: '20%', align: 'center', render: (_, record) => <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleRemoveRow(record.key)}><Button icon={<DeleteOutlined/>} danger /></Popconfirm> },
    ];

    const lichSuColumns = [
        { title: 'Số phiếu', dataIndex: 'so_phieu', render: (text, record) => text || `PXKNPL-${record.id_xuat}` },
        { title: 'Ngày xuất', dataIndex: 'ngay_xuat', render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: 'Kho xuất', dataIndex: ['kho', 'ten_kho'] },
        { title: 'Ca kíp', dataIndex: 'ca_kip', render: (text) => text || '-' },
        { title: 'Hành động', key: 'action', width: 220, align: 'center', render: (_, record) => (
            <Space>
                <Button size="small" icon={<EyeOutlined />} onClick={() => showDrawer(record)}>Xem</Button>
                <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id_xuat)}><Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button></Popconfirm>
            </Space>
        )},
    ];
    const chiTietColumns = [
        { 
            title: 'Tên Nguyên phụ liệu', 
            dataIndex: ['nguyenPhuLieu', 'ten_npl'],
            render: (text) => text || '-'
        },
        { 
            title: 'Số lượng xuất', 
            dataIndex: 'so_luong', 
            align: 'right', 
            render: (val, record) => {
                const donVi = record.nguyenPhuLieu?.donViTinhHQ?.ten_dvt || record.nguyenPhuLieu?.don_vi || '';
                return `${formatVNNumber(val)} ${donVi}`;
            }
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false}>
                <Title level={3}>{editingRecord ? `Chỉnh sửa Phiếu Xuất kho NPL #${editingRecord.so_phieu || `PXKNPL-${editingRecord.id_xuat}`}` : 'Tạo Phiếu Xuất Kho NPL (cho Sản xuất)'}</Title>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={24}>
                        <Col span={12}><Form.Item label="Kho xuất hàng" name="id_kho" rules={[{ required: true, message: "Vui lòng chọn kho xuất" }]}><Select placeholder={editingRecord ? null : "-- Trước tiên, hãy chọn kho --"} onChange={handleKhoChange} disabled={!!editingRecord}>{khoList.map(k => <Option key={k.id_kho} value={k.id_kho}>{k.ten_kho}</Option>)}</Select></Form.Item></Col>
                        <Col span={12}><Form.Item label="Ngày xuất kho" name="ngay_xuat" rules={[{ required: true, message: "Vui lòng chọn ngày xuất" }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={12}><Form.Item label="Ca kíp" name="ca_kip"><Input placeholder="Nhập ca kíp (ví dụ: Ca 1, Ca 2, Ca sáng...)" /></Form.Item></Col>
                    </Row>
                    <Form.Item label="File phiếu xuất (nếu có)" name="file_phieu">
                        <Upload
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={(info) => {
                                if (info.fileList.length > 0) {
                                    form.setFieldsValue({ file_phieu: info.fileList[0].originFileObj });
                                }
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Tải lên</Button>
                        </Upload>
                    </Form.Item>
                    <Title level={4}>Chi tiết Nguyên Phụ Liệu Cần Xuất</Title>
                    <Button onClick={handleAddRow} type="dashed" icon={<PlusOutlined />} style={{ marginBottom: 16 }} disabled={!selectedKhoId}>Thêm Nguyên phụ liệu</Button>
                    <Table columns={columns} dataSource={chiTietXuat} pagination={false} rowKey="key" bordered/>
                    <Form.Item style={{ marginTop: 24 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>{editingRecord ? 'Cập nhật Phiếu xuất' : 'Lưu Phiếu xuất'}</Button>
                            {editingRecord && <Button icon={<CloseCircleOutlined />} onClick={cancelEdit}>Hủy sửa</Button>}
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Lịch sử Phiếu Xuất kho NPL" bordered={false}>
                <Table columns={lichSuColumns} dataSource={lichSuPhieu} rowKey="id_xuat" loading={loadingLichSu} />
            </Card>

            <Drawer title={`Chi tiết Phiếu xuất: ${selectedPhieu?.so_phieu || `PXKNPL-${selectedPhieu?.id_xuat}`}`} width={600} open={isDrawerOpen} onClose={closeDrawer} destroyOnClose>
                {selectedPhieu && <>
                    <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                        <Descriptions.Item label="Ngày xuất">{dayjs(selectedPhieu.ngay_xuat).format('DD/MM/YYYY')}</Descriptions.Item>
                        <Descriptions.Item label="Kho xuất">{selectedPhieu.kho?.ten_kho}</Descriptions.Item>
                        <Descriptions.Item label="Ca kíp">{selectedPhieu.ca_kip || '-'}</Descriptions.Item>
                    </Descriptions>
                    <Title level={5}>Danh sách NPL đã xuất</Title>
                    <Table columns={chiTietColumns} dataSource={selectedPhieu.chiTiets || []} rowKey="id_ct" pagination={false} size="small" bordered />
                </>}
            </Drawer>
        </Space>
    );
};

export default XuatKhoNPL;