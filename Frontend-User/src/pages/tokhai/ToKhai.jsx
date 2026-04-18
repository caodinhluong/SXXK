import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, Popconfirm, message, InputNumber, Row, Col, Typography, Card, Upload, Tooltip, Tabs, Tag, Drawer, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, UploadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

// --- Dữ liệu giả lập ---
const tienTeList = [{ id_tt: 1, ma_tt: 'USD' }, { id_tt: 2, ma_tt: 'VND' }];
const nplList = [{ id_npl: 1, ten_npl: 'Vải Cotton' }, { id_npl: 2, ten_npl: 'Chỉ may' }];
const spList = [{ id_sp: 1, ten_sp: 'Áo phông cổ tròn' }];
const toKhaiTrangThaiList = ['Chờ duyệt', 'Thông quan', 'Kiểm tra hồ sơ', 'Kiểm tra thực tế', 'Tái xuất', 'Tịch thu'];

const initialToKhaiData = [
    {
        id: 'tkn_301', loai: 'Nhập', so_tk: "1059...", ngay_tk: "2025-04-13", trang_thai: "Thông quan", so_hd: 'HD-2025-001',
        details: {
            loHang: [{ id_lh: 1, so_lh: 'LH-001', ngay_dong_goi: '2025-04-10', ngay_xuat_cang: '2025-04-12', cang_xuat: 'Cảng Cát Lái', cang_nhap: 'Cảng Singapore', file_chung_tu: 'chungtu_lh1.pdf' }],
            hoaDon: [{ id_hd_nhap: 101, so_hd: "INV-123", ngay_hd: "2025-04-09", id_tt: 1, tong_tien: 15000, file_hoa_don: 'hdn_101.pdf', chiTiet: [{ id_ct: 1001, id_npl: 1, so_luong: 1000, don_gia: 10, tri_gia: 10000 }, { id_ct: 1002, id_npl: 2, so_luong: 50, don_gia: 100, tri_gia: 5000 }] }],
            vanDon: [{ id_vd: 201, so_vd: "BL-ABC", ngay_phat_hanh: "2025-04-11", cang_xuat: 'Cảng Cát Lái', cang_nhap: 'Cảng Singapore', file_van_don: 'vdn_201.pdf' }],
        }
    },
];
// -----------------------

const ToKhai = () => {
    const [crudForm] = Form.useForm();
    const [dataSource, setDataSource] = useState(initialToKhaiData);

    const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isChiTietDrawerOpen, setIsChiTietDrawerOpen] = useState(false);

    const [selectedToKhai, setSelectedToKhai] = useState(null);
    const [crudModalContent, setCrudModalContent] = useState({ type: null, record: null, title: '' });
    const [selectedHoaDon, setSelectedHoaDon] = useState(null);
    const [hoaDonChiTiet, setHoaDonChiTiet] = useState([]);

    const handleOpenCrudModal = (type, record = null) => {
        const typeMap = { loHang: 'Lô hàng', hoaDon: 'Hóa đơn', vanDon: 'Vận đơn' };
        const title = `${record ? 'Chỉnh sửa' : 'Thêm mới'} ${typeMap[type]}`;
        setCrudModalContent({ type, record, title });
        crudForm.resetFields();
        setHoaDonChiTiet([]);
        if (record) {
            const dateFields = ['ngay_dong_goi', 'ngay_xuat_cang', 'ngay_hd', 'ngay_phat_hanh'];
            const recordWithDayjs = { ...record };
            dateFields.forEach(field => { if (record[field]) recordWithDayjs[field] = dayjs(record[field]); });
            crudForm.setFieldsValue(recordWithDayjs);
            if (type === 'hoaDon' && record.chiTiet) {
                setHoaDonChiTiet(record.chiTiet.map(ct => ({ ...ct, key: ct.id_ct || Date.now() })));
            }
        }
        setIsCrudModalOpen(true);
    };

    const handleCrudSave = () => { message.success('Lưu thành công!'); setIsCrudModalOpen(false); };
    const showDrawer = (record) => { setSelectedToKhai(record); setIsDrawerOpen(true); };
    const closeDrawer = () => { setIsDrawerOpen(false); setTimeout(() => setSelectedToKhai(null), 300); };
    const showChiTietDrawer = (hoaDon) => { setSelectedHoaDon(hoaDon); setIsChiTietDrawerOpen(true); };
    const closeChiTietDrawer = () => { setIsChiTietDrawerOpen(false); setTimeout(() => setSelectedHoaDon(null), 300); };

    const handleAddChiTietRow = () => setHoaDonChiTiet([...hoaDonChiTiet, { key: Date.now(), so_luong: 1, don_gia: 0 }]);
    const handleRemoveChiTietRow = (key) => setHoaDonChiTiet(hoaDonChiTiet.filter(item => item.key !== key));
    const handleChiTietChange = (key, field, value) => {
        const newData = hoaDonChiTiet.map(item => {
            if (item.key === key) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'so_luong' || field === 'don_gia') {
                    updatedItem.tri_gia = (updatedItem.so_luong || 0) * (updatedItem.don_gia || 0);
                }
                return updatedItem;
            }
            return item;
        });
        setHoaDonChiTiet(newData);
    };

    const mainColumns = [
        { title: 'Số Tờ khai', dataIndex: 'so_tk' }, { title: 'Loại', dataIndex: 'loai', render: (text) => <Tag color={text === 'Nhập' ? 'blue' : 'green'}>{text.toUpperCase()}</Tag> },
        { title: 'Số Hợp đồng', dataIndex: 'so_hd' }, { title: 'Ngày khai', dataIndex: 'ngay_tk' },
        { title: 'Trạng thái', dataIndex: 'trang_thai', render: text => <Tag color={text === "Thông quan" ? "success" : "processing"}>{text}</Tag> },
        {
            title: 'Hành động', key: 'action', align: 'center', render: (_, record) => (
                <Space>
                    <Button icon={<FolderOpenOutlined />} onClick={() => showDrawer(record)}>Chi tiết</Button>
                    <Popconfirm title="Xóa Tờ khai và toàn bộ chứng từ liên quan?"><Button danger icon={<DeleteOutlined />}>Xóa</Button></Popconfirm>
                </Space>
            )
        },
    ];

    const actionColumn = (type, onEditClick, onDeleteClick) => ({
        title: 'Hành động', key: 'action', width: 120, align: 'center', render: (_, record) => (
            <Space size="small">
                <Button type="link" icon={<EditOutlined />} onClick={() => onEditClick(type, record)} />
                <Popconfirm title={`Xóa mục này?`} onConfirm={() => onDeleteClick(record)}>
                    <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        )
    });

    const loHangColumns = [
        { title: 'Số Lô hàng', dataIndex: 'so_lh' }, { title: 'Ngày đóng gói', dataIndex: 'ngay_dong_goi' },
        { title: 'Ngày xuất cảng', dataIndex: 'ngay_xuat_cang' }, { title: 'Cảng xuất', dataIndex: 'cang_xuat' },
        { title: 'Cảng nhập', dataIndex: 'cang_nhap' }, { title: 'File', dataIndex: 'file_chung_tu', render: file => file ? <Tooltip title={file}><FileOutlined style={{ color: '#1890ff' }} /></Tooltip> : null },
        actionColumn('loHang', handleOpenCrudModal, (record) => console.log('Delete Lô hàng', record.id_lh))
    ];

    const hoaDonColumns = [
        { title: 'Số Hóa đơn', dataIndex: 'so_hd' }, { title: 'Ngày HĐ', dataIndex: 'ngay_hd' },
        { title: 'Tổng tiền', dataIndex: 'tong_tien', render: (val) => val ? Number(val).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '' }, { title: 'Tiền tệ', dataIndex: 'id_tt', render: (id) => tienTeList.find(t => t.id_tt === id)?.ma_tt },
        { title: 'Hàng hóa', key: 'chi_tiet', align: 'center', render: (_, record) => <Button type="link" onClick={() => showChiTietDrawer(record)}>Xem ({record.chiTiet?.length || 0})</Button> },
        { title: 'File', dataIndex: 'file_hoa_don', render: file => file ? <Tooltip title={file}><FileOutlined style={{ color: '#1890ff' }} /></Tooltip> : null },
        actionColumn('hoaDon', handleOpenCrudModal, (record) => console.log('Delete Hóa đơn', record.id_hd_nhap))
    ];

    const vanDonColumns = [
        { title: 'Số Vận đơn', dataIndex: 'so_vd' }, { title: 'Ngày phát hành', dataIndex: 'ngay_phat_hanh' },
        { title: 'Cảng xuất', dataIndex: 'cang_xuat' }, { title: 'Cảng nhập', dataIndex: 'cang_nhap' },
        { title: 'File', dataIndex: 'file_van_don', render: file => file ? <Tooltip title={file}><FileOutlined style={{ color: '#1890ff' }} /></Tooltip> : null },
        actionColumn('vanDon', handleOpenCrudModal, (record) => console.log('Delete Vận đơn', record.id_vd))
    ];

    const hoaDonChiTietColumns = [
        {
            title: 'Hàng hóa', dataIndex: 'id_npl', render: (_, record) => (
                <Select placeholder="Chọn hàng hóa" value={record.id_npl || record.id_sp} onChange={(val) => handleChiTietChange(record.key, selectedToKhai?.loai === 'Nhập' ? 'id_npl' : 'id_sp', val)} style={{ width: '100%' }}>
                    {(selectedToKhai?.loai === 'Nhập' ? nplList : spList).map(item => <Option key={item.id_npl || item.id_sp} value={item.id_npl || item.id_sp}>{item.ten_npl || item.ten_sp}</Option>)}
                </Select>
            )
        },
        { title: 'Số lượng', dataIndex: 'so_luong', width: 120, render: (_, record) => <InputNumber min={1} value={record.so_luong} onChange={(val) => handleChiTietChange(record.key, 'so_luong', val)} style={{ width: '100%' }} /> },
        { title: 'Đơn giá', dataIndex: 'don_gia', width: 150, render: (_, record) => <InputNumber min={0} value={record.don_gia} onChange={(val) => handleChiTietChange(record.key, 'don_gia', val)} style={{ width: '100%' }} /> },
        { title: 'Trị giá', dataIndex: 'tri_gia', width: 150, render: (text, record) => Number((record.so_luong || 0) * (record.don_gia || 0)).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) },
        { title: 'Hành động', width: 80, align: 'center', render: (_, record) => <Popconfirm title="Xóa dòng này?" onConfirm={() => handleRemoveChiTietRow(record.key)}><Button type="link" danger>Xóa</Button></Popconfirm> },
    ];

    const renderCrudForm = () => {
        const { type } = crudModalContent;
        if (type === 'loHang') {
            return <>
                <Form.Item name="so_lh" label="Số Lô hàng" rules={[{ required: true }]}><Input /></Form.Item>
                <Row gutter={16}><Col span={12}><Form.Item name="ngay_dong_goi" label="Ngày đóng gói"><DatePicker style={{ width: '100%' }} /></Form.Item></Col><Col span={12}><Form.Item name="ngay_xuat_cang" label="Ngày xuất cảng"><DatePicker style={{ width: '100%' }} /></Form.Item></Col></Row>
                <Row gutter={16}><Col span={12}><Form.Item name="cang_xuat" label="Cảng xuất"><Input /></Form.Item></Col><Col span={12}><Form.Item name="cang_nhap" label="Cảng nhập"><Input /></Form.Item></Col></Row>
                <Form.Item name="file_chung_tu" label="File chứng từ"><Upload maxCount={1}><Button icon={<UploadOutlined />}>Tải lên</Button></Upload></Form.Item>
            </>;
        }
        if (type === 'hoaDon') {
            return <>
                <Form.Item name="so_hd" label="Số Hóa đơn" rules={[{ required: true }]}><Input /></Form.Item>
                <Row gutter={16}><Col span={12}><Form.Item name="ngay_hd" label="Ngày Hóa đơn" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col><Col span={12}><Form.Item name="id_tt" label="Tiền tệ"><Select>{tienTeList.map(t => <Option key={t.id_tt} value={t.id_tt}>{t.ma_tt}</Option>)}</Select></Form.Item></Col></Row>
                <Form.Item name="file_hoa_don" label="File scan hóa đơn"><Upload maxCount={1}><Button icon={<UploadOutlined />}>Tải lên</Button></Upload></Form.Item>
                <Title level={5}>Chi tiết hàng hóa</Title>
                <Table columns={hoaDonChiTietColumns} dataSource={hoaDonChiTiet} rowKey="key" size="small" pagination={false} bordered />
                <Button onClick={handleAddChiTietRow} icon={<PlusOutlined />} style={{ marginTop: 16 }} type="dashed">Thêm hàng hóa</Button>
            </>;
        }
        if (type === 'vanDon') {
            return <>
                <Form.Item name="so_vd" label="Số Vận đơn" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="ngay_phat_hanh" label="Ngày phát hành" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
                <Row gutter={16}><Col span={12}><Form.Item name="cang_xuat" label="Cảng xuất"><Input /></Form.Item></Col><Col span={12}><Form.Item name="cang_nhap" label="Cảng nhập"><Input /></Form.Item></Col></Row>
                <Form.Item name="file_van_don" label="File scan vận đơn"><Upload maxCount={1}><Button icon={<UploadOutlined />}>Tải lên</Button></Upload></Form.Item>
            </>;
        }
        return null;
    };

    return (
        <>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col><Title level={3}>Quản lý Tờ khai</Title></Col>
                <Col><Search placeholder="Tìm theo số TK, số HĐ..." style={{ width: 300 }} /></Col>
            </Row>
            <Card bordered={false}><Table columns={mainColumns} dataSource={dataSource} rowKey="id" /></Card>

            <Modal title={crudModalContent.title} open={isCrudModalOpen} onCancel={() => { setIsCrudModalOpen(false); crudForm.resetFields(); }} onOk={handleCrudSave} okText="Lưu" cancelText="Hủy" width={crudModalContent.type === 'hoaDon' ? 1000 : 800} destroyOnClose maskClosable={false}>
                <Form form={crudForm} layout="vertical">{renderCrudForm()}</Form>
            </Modal>

            <Drawer title={`Chi tiết Tờ khai: ${selectedToKhai?.so_tk || ''}`} width="80vw" open={isDrawerOpen} onClose={closeDrawer} destroyOnClose>
                {selectedToKhai?.details ? (
                    <Tabs defaultActiveKey="1" type="card">
                        <TabPane tab="Lô hàng" key="1">
                            <Table title={() => <Button onClick={() => handleOpenCrudModal('loHang')} icon={<PlusOutlined />}>Thêm Lô hàng</Button>}
                                columns={loHangColumns} dataSource={selectedToKhai.details.loHang} rowKey="id_lh" pagination={false} size="small" bordered />
                        </TabPane>
                        <TabPane tab="Hóa đơn" key="2">
                            <Table title={() => <Button onClick={() => handleOpenCrudModal('hoaDon')} icon={<PlusOutlined />}>Thêm Hóa đơn</Button>}
                                columns={hoaDonColumns} dataSource={selectedToKhai.details.hoaDon} rowKey="id_hd_nhap" pagination={false} size="small" bordered />
                        </TabPane>
                        <TabPane tab="Vận đơn" key="3">
                            <Table title={() => <Button onClick={() => handleOpenCrudModal('vanDon')} icon={<PlusOutlined />}>Thêm Vận đơn</Button>}
                                columns={vanDonColumns} dataSource={selectedToKhai.details.vanDon} rowKey="id_vd" pagination={false} size="small" bordered />
                        </TabPane>
                    </Tabs>
                ) : <Text>Không có dữ liệu chi tiết cho Tờ khai này.</Text>}
            </Drawer>

            <Drawer title={`Chi tiết Hóa đơn: ${selectedHoaDon?.so_hd || ''}`} width={720} open={isChiTietDrawerOpen} onClose={closeChiTietDrawer} destroyOnClose>
                <Table title={() => <Text strong>Danh sách hàng hóa</Text>} columns={hoaDonChiTietColumns.slice(0, 4)} dataSource={selectedHoaDon?.chiTiet} rowKey="id_ct" size="small" pagination={false} bordered />
            </Drawer>
        </>
    );
};

export default ToKhai;