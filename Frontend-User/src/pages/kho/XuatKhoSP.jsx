import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Table, InputNumber, Typography, Tag, Space, Row, Col, Card, Drawer, Descriptions, Popconfirm, Input } from 'antd';
import { SendOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import * as XuatKhoSPService from '../../services/xuatkhosp.service';
import * as KhoService from '../../services/kho.service';
import * as HoaDonXuatService from '../../services/hoadonxuat.service';

import { showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showLoadError, showSaveError, showError } from '../../components/notification';
import { requiredSelectRule, pastDateRules } from '../../utils/validationRules';

const { Option } = Select;
const { Title, Text } = Typography;

// Hàm format số theo kiểu Việt Nam (1.000.000)
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Gọi API lấy tồn kho SP theo kho
const getTonKhoSPByKho = async (id_kho) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/kho/${id_kho}/ton-kho-sp`, {
            headers: getAuthHeader()
        });
        const data = response.data?.data || response.data || [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Lỗi getTonKhoSPByKho:", error);
        return [];
    }
};

const XuatKhoSP = () => {
    const [form] = Form.useForm();
    const [chiTietXuat, setChiTietXuat] = useState([]);
    const [khoList, setKhoList] = useState([]);
    const [hoaDonXuatList, setHoaDonXuatList] = useState([]);
    const [selectedKhoId, setSelectedKhoId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [lichSuPhieu, setLichSuPhieu] = useState([]);
    const [loadingLichSu, setLoadingLichSu] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPhieu, setSelectedPhieu] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [tonKhoSP, setTonKhoSP] = useState([]);
    
    const fetchLichSu = async () => {
        setLoadingLichSu(true);
        try {
            const response = await XuatKhoSPService.getAllXuatKhoSP();
            setLichSuPhieu(response.data || []);
        } catch {
            showLoadError('lịch sử phiếu xuất SP'); 
        } finally { 
            setLoadingLichSu(false); 
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resKho, resHDX] = await Promise.all([
                    KhoService.getAllKho(), 
                    HoaDonXuatService.getAllHoaDonXuat()
                ]);
                console.log('API Kho response:', resKho);
                console.log('API HoaDonXuat response:', resHDX);
                setKhoList(resKho.data || []);
                const hdxData = resHDX?.data?.data || resHDX?.data || resHDX || [];
                console.log('HoaDonXuatList set to:', hdxData);
                setHoaDonXuatList(hdxData);
            } catch {
                showLoadError('dữ liệu ban đầu'); 
            }
        };
        fetchData();
        fetchLichSu();
    }, []);

    const handleKhoChange = async (id_kho) => {
        setSelectedKhoId(id_kho);
        form.setFieldsValue({ id_hd_xuat: null });
        setChiTietXuat([]);
        
        // Lấy tồn kho SP của kho được chọn
        if (id_kho) {
            const tonKhoData = await getTonKhoSPByKho(id_kho);
            console.log('Tồn kho SP:', tonKhoData);
            setTonKhoSP(tonKhoData);
        } else {
            setTonKhoSP([]);
        }
    };
    
    const handleHoaDonChange = (id_hd_xuat) => {
        const hd = hoaDonXuatList.find(h => h.id_hd_xuat === id_hd_xuat);
        console.log('Hóa đơn xuất được chọn:', hd);
        console.log('Chi tiết hóa đơn:', hd?.chiTiets);
        console.log('Tồn kho hiện tại:', tonKhoSP);
        
        if (hd && selectedKhoId && hd.chiTiets) {
            const chiTietCapNhat = hd.chiTiets.map((item, index) => {
                // Tìm tồn kho của SP này trong kho đã chọn
                // item.id_sp hoặc item.sanPham?.id_sp
                const spId = item.id_sp || item.sanPham?.id_sp;
                const tonKhoItem = tonKhoSP.find(tk => tk.id_sp === spId);
                const soLuongTon = tonKhoItem ? parseFloat(tonKhoItem.so_luong_ton) || 0 : 0;
                const donVi = item.sanPham?.donViTinhHQ?.ten_dvt || tonKhoItem?.don_vi || 'N/A';
                
                // Parse số lượng từ hóa đơn (có thể là string hoặc decimal)
                const soLuongHD = parseFloat(item.so_luong) || 0;
                
                console.log(`SP ${spId} (${item.sanPham?.ten_sp}): SL theo HĐ = ${soLuongHD}, tồn kho = ${soLuongTon}`);
                
                return {
                    key: index + 1,
                    id_sp: spId,
                    ten_sp: item.sanPham?.ten_sp || 'N/A',
                    so_luong_hd: soLuongHD,
                    ton_kho: soLuongTon,
                    so_luong_xuat: Math.min(soLuongHD, soLuongTon),
                    id_qd: item.id_qd || null,
                    ten_dvt_dn: donVi,
                };
            });
            setChiTietXuat(chiTietCapNhat);
        } else {
            setChiTietXuat([]);
        }
    };
    
    const handleSoLuongChange = (key, value) => {
        setChiTietXuat(chiTietXuat.map(item => item.key === key ? { ...item, so_luong_xuat: value } : item));
    };

    const onFinish = async (values) => {
        // Validation: Kiểm tra có chi tiết xuất không
        if (chiTietXuat.length === 0) {
            showError('Không có sản phẩm', 'Vui lòng chọn hóa đơn xuất để có danh sách sản phẩm');
            return;
        }

        // Validation: Kiểm tra số lượng xuất
        const tongSoLuongXuat = chiTietXuat.reduce((sum, item) => sum + (item.so_luong_xuat || 0), 0);
        if (tongSoLuongXuat === 0) {
            showError('Số lượng không hợp lệ', 'Tổng số lượng xuất phải lớn hơn 0');
            return;
        }

        // Validation: Kiểm tra vượt tồn kho
        const vuotTonKho = chiTietXuat.some(item => item.so_luong_xuat > item.ton_kho);
        if(vuotTonKho) {
            showError('Số lượng xuất không hợp lệ', 'Số lượng xuất không được vượt quá tồn kho khả dụng');
            return;
        }

        // Validation: Kiểm tra có sản phẩm nào chưa nhập số lượng
        const chuaNhapSoLuong = chiTietXuat.some(item => !item.so_luong_xuat || item.so_luong_xuat <= 0);
        if (chuaNhapSoLuong) {
            showError('Số lượng không hợp lệ', 'Vui lòng nhập số lượng xuất cho tất cả sản phẩm');
            return;
        }

        setSubmitting(true);
        const payload = {
            id_kho: values.id_kho,
            ngay_xuat: dayjs(values.ngay_xuat).format("YYYY-MM-DD"),
            ca_kip: values.ca_kip || null,
            chi_tiets: chiTietXuat.map(item => ({ 
                id_sp: item.id_sp, 
                so_luong: item.so_luong_xuat
            })),
        };
        try {
            if (editingRecord) {
                await XuatKhoSPService.updateXuatKhoSP(editingRecord.id_xuat, payload);
                showUpdateSuccess('Phiếu xuất SP');
            } else {
                await XuatKhoSPService.createXuatKhoSP(payload);
                showCreateSuccess('Phiếu xuất SP');
            }
            cancelEdit();
            fetchLichSu();
        } catch {
            showSaveError('phiếu xuất SP');
        } finally {
            setSubmitting(false);
        }
    };
    
    const showDrawer = (record) => { setSelectedPhieu(record); setIsDrawerOpen(true); };
    
    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedPhieu(null), 300);
    };
    
    const handleEdit = async (record) => {
        setEditingRecord(record);
        
        // Lấy tồn kho SP trước
        const tonKhoData = await getTonKhoSPByKho(record.kho.id_kho);
        setTonKhoSP(tonKhoData);
        setSelectedKhoId(record.kho.id_kho);
        
        setTimeout(() => {
            form.setFieldsValue({
                id_kho: record.kho.id_kho,
                id_hd_xuat: record.hoaDonXuat?.id_hd_xuat,
                ngay_xuat: dayjs(record.ngay_xuat),
                ca_kip: record.ca_kip || '',
            });
            
            if (record.hoaDonXuat) {
                const hd = hoaDonXuatList.find(h => h.id_hd_xuat === record.hoaDonXuat.id_hd_xuat);

                if (hd && hd.chiTiets) {
                    const chiTiet = hd.chiTiets.map((itemHD, index) => {
                        const chiTietDaXuat = record.chiTiets?.find(ctx => ctx.sanPham?.id_sp === itemHD.id_sp);
                        const soLuongDaXuat = chiTietDaXuat ? chiTietDaXuat.so_luong : 0;
                        const tonKhoItem = tonKhoData.find(tk => tk.id_sp === itemHD.id_sp);
                        const soLuongTon = tonKhoItem ? tonKhoItem.so_luong_ton : 0;
                        const donVi = itemHD.sanPham?.donViTinhHQ?.ten_dvt || tonKhoItem?.don_vi || 'N/A';
                        
                        return {
                            key: index + 1,
                            id_sp: itemHD.id_sp,
                            ten_sp: itemHD.sanPham?.ten_sp || 'N/A',
                            so_luong_hd: itemHD.so_luong || 0,
                            // Tồn kho khả dụng khi sửa = tồn kho hiện tại + lượng đã xuất của chính phiếu này
                            ton_kho: soLuongTon + soLuongDaXuat,
                            so_luong_xuat: soLuongDaXuat,
                            id_qd: itemHD.id_qd || null,
                            ten_dvt_dn: donVi,
                        }
                    });
                    setChiTietXuat(chiTiet);
                }
            }
        }, 100);

        window.scrollTo(0, 0);
    };

    const handleDelete = async (id_xuat) => {
        try {
            await XuatKhoSPService.deleteXuatKhoSP(id_xuat);
            showDeleteSuccess('Phiếu xuất SP');
            fetchLichSu();
        } catch {
            showSaveError('phiếu xuất SP'); 
        }
    };
    
    const cancelEdit = () => {
        setEditingRecord(null);
        form.resetFields();
        setChiTietXuat([]);
        setSelectedKhoId(null);
        setTonKhoSP([]);
    };

    const columns = [
        { title: 'Tên Sản phẩm', dataIndex: 'ten_sp' }, 
        { title: 'Đơn vị tính', dataIndex: 'ten_dvt_dn' },
        { title: 'Số lượng theo HĐ', dataIndex: 'so_luong_hd', align: 'center', render: val => formatVNNumber(val) },
        { title: 'Tồn kho khả dụng', dataIndex: 'ton_kho', align: 'center', render: text => <Text strong>{formatVNNumber(text)}</Text> },
        { title: 'Số lượng thực xuất', dataIndex: 'so_luong_xuat', width: 250, render: (text, record) => (
            <Space>
                <InputNumber min={0} max={record.ton_kho} value={text} onChange={(val) => handleSoLuongChange(record.key, val)}/>
                {text > record.ton_kho && <Tag color="error">Vượt tồn kho!</Tag>}
            </Space>
        )},
    ];

    const lichSuColumns = [
        { title: 'Số phiếu', dataIndex: 'so_phieu', render: (text, record) => text || `PXKSP-${record.id_xuat}` }, 
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
        { title: 'Tên sản phẩm', dataIndex: ['sanPham', 'ten_sp'] },
        { title: 'Số lượng xuất', dataIndex: 'so_luong', align: 'right', render: (val) => formatVNNumber(val) },
    ];
    
    const isSubmitDisabled = !selectedKhoId || chiTietXuat.length === 0 || chiTietXuat.some(item => item.so_luong_xuat > item.ton_kho) || chiTietXuat.reduce((sum, item) => sum + item.so_luong_xuat, 0) === 0;

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false}>
                <Title level={3}>{editingRecord ? `Chỉnh sửa Phiếu Xuất kho SP #${editingRecord.so_phieu || `PXKSP-${editingRecord.id_xuat}`}` : 'Tạo Phiếu Xuất Kho Sản Phẩm'}</Title>
                 <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={24}>
                        <Col span={8}><Form.Item label="Kho xuất hàng" name="id_kho" rules={[requiredSelectRule('kho xuất')]}><Select placeholder="-- Chọn kho trước --" onChange={handleKhoChange} disabled={!!editingRecord}>{khoList.map(k => <Option key={k.id_kho} value={k.id_kho}>{k.ten_kho}</Option>)}</Select></Form.Item></Col>
                        <Col span={8}><Form.Item label="Hóa đơn xuất" name="id_hd_xuat" rules={[requiredSelectRule('hóa đơn xuất')]}><Select placeholder="Chọn hóa đơn" onChange={handleHoaDonChange} disabled={!selectedKhoId}>{hoaDonXuatList.map(hd => <Option key={hd.id_hd_xuat} value={hd.id_hd_xuat}>{hd.so_hd} - {hd.ngay_hd ? dayjs(hd.ngay_hd).format('DD/MM/YYYY') : 'N/A'}</Option>)}</Select></Form.Item></Col>
                        <Col span={8}><Form.Item label="Ngày xuất kho" name="ngay_xuat" rules={pastDateRules('ngày xuất')}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày xuất" /></Form.Item></Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={8}><Form.Item label="Ca kíp" name="ca_kip"><Input placeholder="Nhập ca kíp (ví dụ: Ca 1, Ca 2, Ca sáng...)" /></Form.Item></Col>
                    </Row>
                    <Title level={4}>Chi tiết Sản Phẩm Xuất Kho</Title>
                    <Table columns={columns} dataSource={chiTietXuat} pagination={false} rowKey="key" bordered/>
                    <Form.Item style={{ marginTop: 24 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting} disabled={isSubmitDisabled} style={{ color: '#fff' }}>
                                {editingRecord ? 'Cập nhật' : 'Xác nhận Xuất kho'}
                            </Button>
                            {editingRecord && <Button icon={<CloseCircleOutlined />} onClick={cancelEdit}>Hủy sửa</Button>}
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Lịch sử Phiếu Xuất kho SP" bordered={false}>
                <Table columns={lichSuColumns} dataSource={lichSuPhieu} rowKey="id_xuat" loading={loadingLichSu} />
            </Card>

            <Drawer title={`Chi tiết Phiếu xuất: ${selectedPhieu?.so_phieu || `PXKSP-${selectedPhieu?.id_xuat}`}`} width={600} open={isDrawerOpen} onClose={closeDrawer} destroyOnClose>
                {selectedPhieu && <>
                    <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                        <Descriptions.Item label="Ngày xuất">{dayjs(selectedPhieu.ngay_xuat).format('DD/MM/YYYY')}</Descriptions.Item>
                        <Descriptions.Item label="Kho xuất">{selectedPhieu.kho?.ten_kho}</Descriptions.Item>
                        <Descriptions.Item label="Ca kíp">{selectedPhieu.ca_kip || '-'}</Descriptions.Item>
                    </Descriptions>
                    <Title level={5}>Danh sách sản phẩm đã xuất</Title>
                    <Table columns={chiTietColumns} dataSource={selectedPhieu.chiTiets || []} rowKey="id_ct" pagination={false} size="small" bordered />
                </>}
            </Drawer>
        </Space>
    );
};

export default XuatKhoSP;