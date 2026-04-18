import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, Popconfirm, InputNumber, Row, Col, Typography, Card, Upload, Tooltip, Tabs, Drawer, Spin, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, UploadOutlined, FolderOpenOutlined, SearchOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as ToKhaiService from '../services/tokhai.service';
import * as BaoCaoThanhKhoanService from '../services/baocaothanhkhoan.service';
import { 
    showUpdateSuccess, 
    showDeleteSuccess, 
    showLoadError, 
    showDeleteError 
} from './notification';

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Hàm format số theo kiểu Việt Nam (1.000.000)
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const QuanLyToKhai = ({ type }) => {
    const [crudForm] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isChiTietDrawerOpen, setIsChiTietDrawerOpen] = useState(false);
    
    const [selectedToKhai, setSelectedToKhai] = useState(null);
    const [crudModalContent, setCrudModalContent] = useState({ type: null, record: null, title: '' });
    const [selectedHoaDon, setSelectedHoaDon] = useState(null);
    const [hoaDonChiTiet, setHoaDonChiTiet] = useState([]);
    const [baoCaoList, setBaoCaoList] = useState([]);
    const [loadingBaoCao, setLoadingBaoCao] = useState(false);
    
    // State for dropdown data
    const [tienTeList, setTienTeList] = useState([]);
    const [nplList, setNplList] = useState([]);
    const [spList, setSpList] = useState([]);

    // Fetch dropdown data - chỉ chạy 1 lần
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [tienTeRes, nplRes, spRes] = await Promise.all([
                    ToKhaiService.getAllTienTe(),
                    ToKhaiService.getAllNguyenPhuLieu(),
                    ToKhaiService.getAllSanPham()
                ]);
                setTienTeList(tienTeRes || []);
                setNplList(nplRes || []);
                setSpList(spRes || []);
            } catch {
                showLoadError('dữ liệu dropdown');
            }
        };
        fetchDropdownData();
    }, []);

    // Fetch tờ khai data và trả về data mới
    const fetchToKhaiData = useCallback(async () => {
        try {
            setLoading(true);
            let toKhaiResponse, hoaDonResponse, vanDonResponse, loHangResponse;
            
            if (type === 'Nhập') {
                [toKhaiResponse, hoaDonResponse, vanDonResponse, loHangResponse] = await Promise.all([
                    ToKhaiService.getAllToKhaiNhap(),
                    ToKhaiService.getAllHoaDonNhap(),
                    ToKhaiService.getAllVanDonNhap(),
                    ToKhaiService.getAllLoHang()
                ]);
            } else {
                [toKhaiResponse, hoaDonResponse, vanDonResponse, loHangResponse] = await Promise.all([
                    ToKhaiService.getAllToKhaiXuat(),
                    ToKhaiService.getAllHoaDonXuat(),
                    ToKhaiService.getAllVanDonXuat(),
                    ToKhaiService.getAllLoHang()
                ]);
            }
            
            const transformedData = (toKhaiResponse || []).map((item) => {
                const id_lh = item.id_lh;
                const loHang = loHangResponse?.find(lh => lh.id_lh === id_lh);
                const hoaDonList = (hoaDonResponse || []).filter(hd => hd.id_lh === id_lh);
                const vanDonList = (vanDonResponse || []).filter(vd => vd.id_lh === id_lh);
                
                const loHangData = loHang ? [{
                    id_lh: loHang.id_lh,
                    id_hd: loHang.id_hd, // Thêm id_hd
                    so_lh: `LH-${loHang.id_lh}`,
                    ngay_dong_goi: loHang.ngay_dong_goi ? dayjs(loHang.ngay_dong_goi).format('YYYY-MM-DD') : '',
                    ngay_xuat_cang: loHang.ngay_xuat_cang ? dayjs(loHang.ngay_xuat_cang).format('YYYY-MM-DD') : '',
                    cang_xuat: loHang.cang_xuat || '',
                    cang_nhap: loHang.cang_nhap || '',
                    file_chung_tu: loHang.file_chung_tu || '',
                }] : [];
                
                const hoaDonData = hoaDonList.map(hd => ({
                    id_hd_nhap: hd.id_hd_nhap,
                    id_hd_xuat: hd.id_hd_xuat,
                    so_hd: hd.so_hd,
                    ngay_hd: hd.ngay_hd ? dayjs(hd.ngay_hd).format('YYYY-MM-DD') : '',
                    id_tt: hd.id_tt,
                    tong_tien: hd.tong_tien,
                    file_hoa_don: hd.file_hoa_don,
                    chiTiet: hd.chiTiets || [],
                }));
                
                const vanDonData = vanDonList.map(vd => ({
                    id_vd: vd.id_vd,
                    so_vd: vd.so_vd,
                    ngay_phat_hanh: vd.ngay_phat_hanh ? dayjs(vd.ngay_phat_hanh).format('YYYY-MM-DD') : '',
                    cang_xuat: vd.cang_xuat || '',
                    cang_nhap: vd.cang_nhap || '',
                    file_van_don: vd.file_van_don || '',
                }));

                return {
                    id: type === 'Nhập' ? item.id_tkn : item.id_tkx,
                    loai: type,
                    so_tk: item.so_tk,
                    ngay_tk: item.ngay_tk ? dayjs(item.ngay_tk).format('YYYY-MM-DD') : '',
                    trang_thai: item.trang_thai,
                    so_hd: loHang?.hopDong?.so_hd || '-',
                    details: { loHang: loHangData, hoaDon: hoaDonData, vanDon: vanDonData }
                };
            });
            
            setDataSource(transformedData);
            return transformedData; // Trả về data mới
        } catch (err) {
            console.error('Error fetching tờ khai:', err);
            showLoadError('dữ liệu tờ khai');
            return [];
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchToKhaiData();
    }, [fetchToKhaiData]);

    // Ref để lưu ID của tờ khai đang mở drawer
    const selectedToKhaiIdRef = React.useRef(null);
    
    // Sync selectedToKhai với dataSource khi dataSource thay đổi
    useEffect(() => {
        if (selectedToKhaiIdRef.current && isDrawerOpen && dataSource.length > 0) {
            const updatedToKhai = dataSource.find(item => item.id === selectedToKhaiIdRef.current);
            if (updatedToKhai) {
                setSelectedToKhai(updatedToKhai);
            }
        }
    }, [dataSource, isDrawerOpen]);

    // Handlers - dùng useCallback để tránh re-create function
    const handleOpenCrudModal = useCallback((modalType, record = null) => {
        const typeMap = { loHang: 'Lô hàng', hoaDon: 'Hóa đơn', vanDon: 'Vận đơn' };
        const title = `${record ? 'Chỉnh sửa' : 'Thêm mới'} ${typeMap[modalType]}`;
        
        setCrudModalContent({ type: modalType, record, title });
        setHoaDonChiTiet([]);
        
        if (record) {
            const dateFields = ['ngay_dong_goi', 'ngay_xuat_cang', 'ngay_hd', 'ngay_phat_hanh'];
            const recordWithDayjs = { ...record };
            dateFields.forEach(field => { 
                if (record[field]) recordWithDayjs[field] = dayjs(record[field]); 
            });
            
            setTimeout(() => crudForm.setFieldsValue(recordWithDayjs), 0);
            
            if (modalType === 'hoaDon' && record.chiTiet) {
                setHoaDonChiTiet(record.chiTiet.map((ct, idx) => ({
                    ...ct, 
                    key: ct.id_ct || `ct_${idx}`
                })));
            }
        } else {
            crudForm.resetFields();
        }
        setIsCrudModalOpen(true);
    }, [crudForm]);

    const handleCloseCrudModal = useCallback(() => {
        setIsCrudModalOpen(false);
        setCrudModalContent({ type: null, record: null, title: '' });
        setHoaDonChiTiet([]);
        crudForm.resetFields();
    }, [crudForm]);

    const handleCrudSave = useCallback(async () => { 
        const { type: modalType, record } = crudModalContent;
        const typeMap = { loHang: 'Lô hàng', hoaDon: 'Hóa đơn', vanDon: 'Vận đơn' };
        
        try {
            const values = await crudForm.validateFields();
            setSaving(true);
            
            const formattedValues = { ...values };
            if (values.ngay_dong_goi) formattedValues.ngay_dong_goi = dayjs(values.ngay_dong_goi).format('YYYY-MM-DD');
            if (values.ngay_xuat_cang) formattedValues.ngay_xuat_cang = dayjs(values.ngay_xuat_cang).format('YYYY-MM-DD');
            if (values.ngay_hd) formattedValues.ngay_hd = dayjs(values.ngay_hd).format('YYYY-MM-DD');
            if (values.ngay_phat_hanh) formattedValues.ngay_phat_hanh = dayjs(values.ngay_phat_hanh).format('YYYY-MM-DD');
            
            if (modalType === 'hoaDon') {
                formattedValues.chi_tiets = hoaDonChiTiet.map(ct => ({
                    id_npl: ct.id_npl, id_sp: ct.id_sp, so_luong: ct.so_luong, don_gia: ct.don_gia,
                    tri_gia: (ct.so_luong || 0) * (ct.don_gia || 0)
                }));
                // Tính tổng tiền từ chi tiết
                formattedValues.tong_tien = hoaDonChiTiet.reduce((sum, ct) => sum + ((ct.so_luong || 0) * (ct.don_gia || 0)), 0);
            }
            
            if (record) {
                if (modalType === 'loHang') {
                    await ToKhaiService.updateLoHang(record.id_lh, formattedValues);
                } else if (modalType === 'hoaDon') {
                    const idField = selectedToKhai?.loai === 'Nhập' ? record.id_hd_nhap : record.id_hd_xuat;
                    if (selectedToKhai?.loai === 'Nhập') {
                        await ToKhaiService.updateHoaDonNhap(idField, formattedValues);
                    } else {
                        await ToKhaiService.updateHoaDonXuat(idField, formattedValues);
                    }
                } else if (modalType === 'vanDon') {
                    if (selectedToKhai?.loai === 'Nhập') {
                        await ToKhaiService.updateVanDonNhap(record.id_vd, formattedValues);
                    } else {
                        await ToKhaiService.updateVanDonXuat(record.id_vd, formattedValues);
                    }
                }
                showUpdateSuccess(typeMap[modalType]);
            }
            
            handleCloseCrudModal();
            
            // Refresh data và cập nhật selectedToKhai trực tiếp
            const newData = await fetchToKhaiData();
            if (selectedToKhaiIdRef.current && newData.length > 0) {
                const updatedToKhai = newData.find(item => item.id === selectedToKhaiIdRef.current);
                if (updatedToKhai) {
                    setSelectedToKhai(updatedToKhai);
                }
            }
            
        } catch (err) {
            console.error('Error saving:', err);
            showLoadError(`cập nhật ${typeMap[modalType]}`);
        } finally {
            setSaving(false);
        }
    }, [crudModalContent, crudForm, hoaDonChiTiet, selectedToKhai, handleCloseCrudModal, fetchToKhaiData]);

    // Load báo cáo thanh khoản theo hợp đồng
    const loadBaoCaoThanhKhoan = useCallback(async (id_hd) => {
        try {
            setLoadingBaoCao(true);
            const response = await BaoCaoThanhKhoanService.getAllReports({ id_hd, limit: 100 });
            setBaoCaoList(response.data || []);
        } catch (err) {
            console.error('Error loading báo cáo:', err);
            showLoadError('báo cáo thanh khoản');
        } finally {
            setLoadingBaoCao(false);
        }
    }, []);

    // Xóa báo cáo thanh khoản
    const handleDeleteBaoCao = useCallback(async (id_bc, id_hd) => {
        try {
            await BaoCaoThanhKhoanService.deleteReport(id_bc);
            showDeleteSuccess('Báo cáo thanh khoản');
            // Reload danh sách báo cáo
            await loadBaoCaoThanhKhoan(id_hd);
        } catch (err) {
            console.error('Error deleting báo cáo:', err);
            showDeleteError('báo cáo thanh khoản');
        }
    }, [loadBaoCaoThanhKhoan]);

    const showDrawer = useCallback((record) => { 
        setSelectedToKhai(record);
        selectedToKhaiIdRef.current = record.id;
        setIsDrawerOpen(true);
        
        // Load báo cáo thanh khoản nếu có id_hd
        if (record.details?.loHang?.[0]?.id_hd) {
            loadBaoCaoThanhKhoan(record.details.loHang[0].id_hd);
        }
    }, [loadBaoCaoThanhKhoan]);
    
    const closeDrawer = useCallback(() => {
        setSelectedToKhai(null);
        selectedToKhaiIdRef.current = null;
        setBaoCaoList([]);
        setIsDrawerOpen(false);
    }, []);

    const showChiTietDrawer = useCallback((hoaDon) => { 
        setSelectedHoaDon(hoaDon); 
        setIsChiTietDrawerOpen(true); 
    }, []);

    const closeChiTietDrawer = useCallback(() => {
        setSelectedHoaDon(null);
        setIsChiTietDrawerOpen(false);
    }, []);

    const handleAddChiTietRow = useCallback(() => {
        setHoaDonChiTiet(prev => [...prev, { 
            key: `new_${Date.now()}`, 
            so_luong: 1, 
            don_gia: 0 
        }]);
    }, []);

    const handleRemoveChiTietRow = useCallback((key) => {
        setHoaDonChiTiet(prev => prev.filter(item => item.key !== key));
    }, []);

    const handleChiTietChange = useCallback((key, field, value) => { 
        setHoaDonChiTiet(prev => prev.map(item => {
            if (item.key === key) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'so_luong' || field === 'don_gia') {
                    updatedItem.tri_gia = (updatedItem.so_luong || 0) * (updatedItem.don_gia || 0);
                }
                return updatedItem;
            }
            return item;
        }));
    }, []);

    // Render kết luận với icon và màu sắc
    const renderKetLuan = useCallback((ketLuan) => {
        const config = {
            'HopLe': { color: 'success', icon: <CheckCircleOutlined />, text: 'Hợp lệ' },
            'CanhBao': { color: 'warning', icon: <WarningOutlined />, text: 'Cảnh báo' },
            'ViPham': { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Vi phạm' }
        };
        const item = config[ketLuan] || config['HopLe'];
        return <Tag color={item.color} icon={item.icon}>{item.text}</Tag>;
    }, []);

    const renderTrangThai = useCallback((trangThai) => {
        const config = {
            'HopLe': { color: 'green', text: 'Hợp lệ' },
            'TamKhoa': { color: 'orange', text: 'Tạm khóa' },
            'Huy': { color: 'red', text: 'Đã hủy' }
        };
        const item = config[trangThai] || config['HopLe'];
        return <Tag color={item.color}>{item.text}</Tag>;
    }, []);

    // Delete handlers
    const handleDeleteToKhai = useCallback(async (record) => {
        try {
            if (type === 'Nhập') {
                await ToKhaiService.deleteToKhaiNhap(record.id);
            } else {
                await ToKhaiService.deleteToKhaiXuat(record.id);
            }
            showDeleteSuccess('Tờ khai');
            await fetchToKhaiData();
        } catch (err) {
            console.error('Error deleting:', err);
            showDeleteError('tờ khai');
        }
    }, [type, fetchToKhaiData]);

    const handleDeleteLoHang = useCallback(async (record) => {
        try {
            await ToKhaiService.deleteLoHang(record.id_lh);
            showDeleteSuccess('Lô hàng');
            const newData = await fetchToKhaiData();
            if (selectedToKhaiIdRef.current && newData.length > 0) {
                const updatedToKhai = newData.find(item => item.id === selectedToKhaiIdRef.current);
                if (updatedToKhai) setSelectedToKhai(updatedToKhai);
            }
        } catch (err) {
            console.error('Error deleting:', err);
            showDeleteError('lô hàng');
        }
    }, [fetchToKhaiData]);

    const handleDeleteHoaDon = useCallback(async (record) => {
        try {
            if (type === 'Nhập') {
                await ToKhaiService.deleteHoaDonNhap(record.id_hd_nhap);
            } else {
                await ToKhaiService.deleteHoaDonXuat(record.id_hd_xuat);
            }
            showDeleteSuccess('Hóa đơn');
            const newData = await fetchToKhaiData();
            if (selectedToKhaiIdRef.current && newData.length > 0) {
                const updatedToKhai = newData.find(item => item.id === selectedToKhaiIdRef.current);
                if (updatedToKhai) setSelectedToKhai(updatedToKhai);
            }
        } catch (err) {
            console.error('Error deleting:', err);
            showDeleteError('hóa đơn');
        }
    }, [type, fetchToKhaiData]);

    const handleDeleteVanDon = useCallback(async (record) => {
        try {
            await ToKhaiService.deleteVanDon(record.id_vd);
            showDeleteSuccess('Vận đơn');
            const newData = await fetchToKhaiData();
            if (selectedToKhaiIdRef.current && newData.length > 0) {
                const updatedToKhai = newData.find(item => item.id === selectedToKhaiIdRef.current);
                if (updatedToKhai) setSelectedToKhai(updatedToKhai);
            }
        } catch (err) {
            console.error('Error deleting:', err);
            showDeleteError('vận đơn');
        }
    }, [fetchToKhaiData]);

    // Memoized columns để tránh re-create mỗi render
    const mainColumns = useMemo(() => [ 
        { title: 'Số Tờ khai', dataIndex: 'so_tk' }, 
        { title: 'Số Hợp đồng', dataIndex: 'so_hd' }, 
        { title: 'Ngày khai', dataIndex: 'ngay_tk', render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: 'Hành động', key: 'action', align: 'center', render: (_, record) => (
            <Space>
                <Button icon={<FolderOpenOutlined />} onClick={() => showDrawer(record)}>Chi tiết</Button>
                <Popconfirm title="Xóa Tờ khai?" onConfirm={() => handleDeleteToKhai(record)}>
                    <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
            </Space>
        )},
    ], [showDrawer, handleDeleteToKhai]);

    const loHangColumns = useMemo(() => [ 
        { title: 'Số Lô hàng', dataIndex: 'so_lh' }, 
        { title: 'Ngày đóng gói', dataIndex: 'ngay_dong_goi', render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: 'Ngày xuất cảng', dataIndex: 'ngay_xuat_cang', render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' }, 
        { title: 'Cảng xuất', dataIndex: 'cang_xuat' },
        { title: 'Cảng nhập', dataIndex: 'cang_nhap' }, 
        { title: 'File', dataIndex: 'file_chung_tu', render: file => file ? <Tooltip title={file}><FileOutlined style={{color: '#1890ff'}}/></Tooltip> : null },
        { title: 'Hành động', key: 'action', width: 120, align: 'center', render: (_, record) => (
            <Space size="small">
                <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenCrudModal('loHang', record)} />
                <Popconfirm title="Xóa?" onConfirm={() => handleDeleteLoHang(record)}>
                    <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        )}
    ], [handleOpenCrudModal, handleDeleteLoHang]);

    const hoaDonColumns = useMemo(() => [ 
        { title: 'Số Hóa đơn', dataIndex: 'so_hd' }, 
        { title: 'Ngày HĐ', dataIndex: 'ngay_hd', render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: 'Tổng tiền', dataIndex: 'tong_tien', render: (val) => formatVNNumber(val) }, 
        { title: 'Tiền tệ', dataIndex: 'id_tt', render: (id) => tienTeList.find(t => t.id_tt === id)?.ma_tt },
        { title: 'Hàng hóa', key: 'chi_tiet', align: 'center', render: (_, record) => (
            <Button type="link" onClick={() => showChiTietDrawer(record)}>Xem ({record.chiTiet?.length || 0})</Button>
        )},
        { title: 'File', dataIndex: 'file_hoa_don', render: file => file ? <Tooltip title={file}><FileOutlined style={{color: '#1890ff'}}/></Tooltip> : null },
        { title: 'Hành động', key: 'action', width: 120, align: 'center', render: (_, record) => (
            <Space size="small">
                <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenCrudModal('hoaDon', record)} />
                <Popconfirm title="Xóa?" onConfirm={() => handleDeleteHoaDon(record)}>
                    <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        )}
    ], [tienTeList, showChiTietDrawer, handleOpenCrudModal, handleDeleteHoaDon]);

    const vanDonColumns = useMemo(() => [ 
        { title: 'Số Vận đơn', dataIndex: 'so_vd' }, 
        { title: 'Ngày phát hành', dataIndex: 'ngay_phat_hanh', render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: 'Cảng xuất', dataIndex: 'cang_xuat' }, 
        { title: 'Cảng nhập', dataIndex: 'cang_nhap' },
        { title: 'File', dataIndex: 'file_van_don', render: file => file ? <Tooltip title={file}><FileOutlined style={{color: '#1890ff'}}/></Tooltip> : null },
        { title: 'Hành động', key: 'action', width: 120, align: 'center', render: (_, record) => (
            <Space size="small">
                <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenCrudModal('vanDon', record)} />
                <Popconfirm title="Xóa?" onConfirm={() => handleDeleteVanDon(record)}>
                    <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        )}
    ], [handleOpenCrudModal, handleDeleteVanDon]);

    // Chi tiết columns - không dùng inline onChange để tránh re-render
    const chiTietColumnsForModal = useMemo(() => {
        const itemList = selectedToKhai?.loai === 'Nhập' ? nplList : spList;
        const fieldName = selectedToKhai?.loai === 'Nhập' ? 'id_npl' : 'id_sp';
        
        return [ 
            { title: 'Hàng hóa', dataIndex: fieldName, render: (_, record) => (
                <Select 
                    placeholder="Chọn hàng hóa" 
                    value={record.id_npl || record.id_sp} 
                    onChange={(val) => handleChiTietChange(record.key, fieldName, val)} 
                    style={{width: '100%'}}
                >
                    {itemList.map(item => (
                        <Option key={item.id_npl || item.id_sp} value={item.id_npl || item.id_sp}>
                            {item.ten_npl || item.ten_sp}
                        </Option>
                    ))}
                </Select>
            )},
            { title: 'Số lượng', dataIndex: 'so_luong', width: 120, render: (_, record) => (
                <InputNumber min={1} value={record.so_luong} onChange={(val) => handleChiTietChange(record.key, 'so_luong', val)} style={{width: '100%'}}/>
            )},
            { title: 'Đơn giá', dataIndex: 'don_gia', width: 150, render: (_, record) => (
                <InputNumber min={0} value={record.don_gia} onChange={(val) => handleChiTietChange(record.key, 'don_gia', val)} style={{width: '100%'}}/>
            )},
            { title: 'Trị giá', dataIndex: 'tri_gia', width: 150, render: (_, record) => formatVNNumber((record.so_luong || 0) * (record.don_gia || 0)) },
            { title: '', width: 60, render: (_, record) => (
                <Button type="link" danger size="small" onClick={() => handleRemoveChiTietRow(record.key)}>Xóa</Button>
            )},
        ];
    }, [selectedToKhai?.loai, nplList, spList, handleChiTietChange, handleRemoveChiTietRow]);

    // Chi tiết columns cho drawer xem (read-only)
    const chiTietColumnsReadOnly = useMemo(() => {
        const itemList = selectedToKhai?.loai === 'Nhập' ? nplList : spList;
        return [ 
            { title: 'Hàng hóa', render: (_, record) => {
                const item = itemList.find(i => (i.id_npl || i.id_sp) === (record.id_npl || record.id_sp));
                return item?.ten_npl || item?.ten_sp || 'N/A';
            }},
            { title: 'Số lượng', dataIndex: 'so_luong', width: 120, render: val => formatVNNumber(val) },
            { title: 'Đơn giá', dataIndex: 'don_gia', width: 150, render: val => formatVNNumber(val) },
            { title: 'Trị giá', width: 150, render: (_, record) => formatVNNumber((record.so_luong || 0) * (record.don_gia || 0)) },
        ];
    }, [selectedToKhai?.loai, nplList, spList]);

    // Columns cho bảng báo cáo thanh khoản
    const baoCaoColumns = useMemo(() => {
        const id_hd = selectedToKhai?.details?.loHang?.[0]?.id_hd;
        return [
            { 
                title: 'Kỳ Báo cáo', 
                render: (_, record) => `${dayjs(record.tu_ngay).format('DD/MM/YYYY')} - ${dayjs(record.den_ngay).format('DD/MM/YYYY')}`,
                width: '30%'
            },
            { 
                title: 'Thời gian tạo', 
                dataIndex: 'thoi_gian_tao', 
                render: (text) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : '-',
                width: '25%'
            },
            { 
                title: 'Kết luận', 
                dataIndex: 'ket_luan', 
                render: renderKetLuan,
                width: '15%'
            },
            { 
                title: 'Trạng thái', 
                dataIndex: 'trang_thai', 
                render: renderTrangThai,
                width: '15%'
            },
            { 
                title: 'Hành động', 
                key: 'action', 
                width: '15%',
                align: 'center',
                render: (_, record) => (
                    <Popconfirm
                        title="Xóa báo cáo thanh khoản?"
                        description="Bạn có chắc chắn muốn xóa báo cáo này?"
                        onConfirm={() => handleDeleteBaoCao(record.id_bc, id_hd)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                )
            },
        ];
    }, [selectedToKhai, handleDeleteBaoCao, renderKetLuan, renderTrangThai]);

    const renderCrudForm = () => { 
        const { type: formType } = crudModalContent;
        if (formType === 'loHang') {
            return <>
                <Form.Item name="so_lh" label="Số Lô hàng" rules={[{ required: true }]}><Input /></Form.Item>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="ngay_dong_goi" label="Ngày đóng gói"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="ngay_xuat_cang" label="Ngày xuất cảng"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="cang_xuat" label="Cảng xuất"><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="cang_nhap" label="Cảng nhập"><Input /></Form.Item></Col>
                </Row>
                <Form.Item name="file_chung_tu" label="File chứng từ"><Upload maxCount={1}><Button icon={<UploadOutlined />}>Tải lên</Button></Upload></Form.Item>
            </>;
        }
        if (formType === 'hoaDon') {
            // Tính tổng tiền từ chi tiết
            const tongTien = hoaDonChiTiet.reduce((sum, ct) => sum + ((ct.so_luong || 0) * (ct.don_gia || 0)), 0);
            
            return <>
                <Form.Item name="so_hd" label="Số Hóa đơn" rules={[{ required: true }]}><Input /></Form.Item>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="ngay_hd" label="Ngày Hóa đơn" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="id_tt" label="Tiền tệ"><Select>{tienTeList.map(t => <Option key={t.id_tt} value={t.id_tt}>{t.ma_tt}</Option>)}</Select></Form.Item></Col>
                </Row>
                <Form.Item label="Tổng tiền (tự động tính)">
                    <InputNumber value={tongTien} disabled style={{ width: '100%' }} formatter={value => formatVNNumber(value)} parser={value => value.replace(/\./g, '')} />
                </Form.Item>
                <Form.Item name="file_hoa_don" label="File scan hóa đơn"><Upload maxCount={1}><Button icon={<UploadOutlined />}>Tải lên</Button></Upload></Form.Item>
                <Title level={5}>Chi tiết hàng hóa</Title>
                <Table columns={chiTietColumnsForModal} dataSource={hoaDonChiTiet} rowKey="key" size="small" pagination={false} />
                <Button onClick={handleAddChiTietRow} icon={<PlusOutlined />} style={{ marginTop: 16 }} type="dashed">Thêm hàng hóa</Button>
            </>;
        }
        if (formType === 'vanDon') {
            return <>
                <Form.Item name="so_vd" label="Số Vận đơn" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="ngay_phat_hanh" label="Ngày phát hành" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="cang_xuat" label="Cảng xuất"><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="cang_nhap" label="Cảng nhập"><Input /></Form.Item></Col>
                </Row>
                <Form.Item name="file_van_don" label="File scan vận đơn"><Upload maxCount={1}><Button icon={<UploadOutlined />}>Tải lên</Button></Upload></Form.Item>
            </>;
        }
        return null;
    };

    return (
        <Spin spinning={loading}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
                <h2 className="page-header-heading" style={{ margin: 0 }}>Quản lý Tờ khai {type}</h2>
                <Input placeholder={`Tìm kiếm tờ khai ${type.toLowerCase()}...`} prefix={<SearchOutlined />} style={{ width: 300 }} />
            </div>

            <Card bordered={false}>
                <Table columns={mainColumns} dataSource={dataSource} rowKey="id" />
            </Card>

            {/* Modal CRUD - chỉ render khi mở */}
            <Modal 
                title={crudModalContent.title} 
                open={isCrudModalOpen} 
                onCancel={handleCloseCrudModal}
                onOk={handleCrudSave} 
                okText="Lưu" 
                cancelText="Hủy" 
                width={crudModalContent.type === 'hoaDon' ? 1000 : 800}
                confirmLoading={saving}
                destroyOnClose
                maskClosable={false}
            >
                <Form form={crudForm} layout="vertical">{renderCrudForm()}</Form>
            </Modal>
            
            {/* Drawer chi tiết tờ khai */}
            <Drawer 
                title={`Chi tiết Tờ khai ${type}: ${selectedToKhai?.so_tk || ''}`} 
                width="80vw" 
                open={isDrawerOpen} 
                onClose={closeDrawer}
                destroyOnClose
            >
                {selectedToKhai?.details && (
                    <Tabs defaultActiveKey="1" type="card">
                        <TabPane tab="Lô hàng" key="1">
                            <Button onClick={() => handleOpenCrudModal('loHang')} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>Thêm Lô hàng</Button>
                            <Table columns={loHangColumns} dataSource={selectedToKhai.details.loHang} rowKey="id_lh" pagination={false} size="small" />
                        </TabPane>
                        <TabPane tab="Hóa đơn" key="2">
                            <Button onClick={() => handleOpenCrudModal('hoaDon')} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>Thêm Hóa đơn</Button>
                            <Table columns={hoaDonColumns} dataSource={selectedToKhai.details.hoaDon} rowKey={type === 'Nhập' ? "id_hd_nhap" : "id_hd_xuat"} pagination={false} size="small" />
                        </TabPane>
                        <TabPane tab="Vận đơn" key="3">
                            <Button onClick={() => handleOpenCrudModal('vanDon')} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>Thêm Vận đơn</Button>
                            <Table columns={vanDonColumns} dataSource={selectedToKhai.details.vanDon} rowKey="id_vd" pagination={false} size="small" />
                        </TabPane>
                        <TabPane tab={`Báo cáo thanh khoản (${baoCaoList.length})`} key="4">
                            <Spin spinning={loadingBaoCao}>
                                {baoCaoList.length > 0 ? (
                                    <>
                                        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                            Danh sách báo cáo thanh khoản liên quan đến hợp đồng này. Bạn có thể xóa báo cáo để sửa thông tin tờ khai.
                                        </Text>
                                        <Table 
                                            columns={baoCaoColumns} 
                                            dataSource={baoCaoList} 
                                            rowKey="id_bc" 
                                            pagination={false} 
                                            size="small" 
                                        />
                                    </>
                                ) : (
                                    <Card style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <Text type="secondary">Chưa có báo cáo thanh khoản nào cho hợp đồng này</Text>
                                    </Card>
                                )}
                            </Spin>
                        </TabPane>
                    </Tabs>
                )}
            </Drawer>
            
            {/* Drawer chi tiết hóa đơn */}
            <Drawer 
                title={`Chi tiết Hóa đơn: ${selectedHoaDon?.so_hd || ''}`} 
                width={720} 
                open={isChiTietDrawerOpen} 
                onClose={closeChiTietDrawer}
                destroyOnClose
            >
                <Text strong style={{ display: 'block', marginBottom: 16 }}>Danh sách hàng hóa</Text>
                <Table columns={chiTietColumnsReadOnly} dataSource={selectedHoaDon?.chiTiet || []} rowKey="id_ct" size="small" pagination={false} />
            </Drawer>
        </Spin>
    );
};

export default QuanLyToKhai;
