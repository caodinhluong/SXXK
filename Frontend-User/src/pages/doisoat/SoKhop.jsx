import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Select,
    Space,
    Card,
    Spin,
    Tag,
    DatePicker,
    Row,
    Col,
    message,
    Empty,
    Divider,
    Descriptions,
    Alert,
} from 'antd';
import {
    ReloadOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import {
    soKhopToKhaiXuatVoiPhieuXuat,
    getDanhSachChuaKhop,
    getBaoCaoSoKhop,
    getChiTietSoKhop,
} from '../../services/sokhop.service';
import { getAllSanPham } from '../../services/sanpham.service';
import { showError, showSuccess, showLoadError } from '../../components/notification';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SoKhop = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [danhSachChuaKhop, setDanhSachChuaKhop] = useState({ toKhai: [], phieuXuat: [] });
    const [dsToKhai, setDsToKhai] = useState([]);
    const [dsPhieuXuat, setDsPhieuXuat] = useState([]);
    const [selectedToKhai, setSelectedToKhai] = useState(null);
    const [selectedPhieuXuat, setSelectedPhieuXuat] = useState(null);
    const [modalSoKhopOpen, setModalSoKhopOpen] = useState(false);
    const [ketQuaSoKhop, setKetQuaSoKhop] = useState(null);

    useEffect(() => {
        fetchDanhSachChuaKhop();
    }, []);

    const fetchDanhSachChuaKhop = async () => {
        try {
            setLoading(true);
            const [tkRes, pxRes] = await Promise.all([
                getDanhSachChuaKhop('to_khai'),
                getDanhSachChuaKhop('phieu_xuat'),
            ]);
            setDsToKhai(tkRes || []);
            setDsPhieuXuat(pxRes || []);
        } catch (err) {
            showLoadError('danh sách chưa khớp');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectToKhai = (tk) => {
        setSelectedToKhai(tk);
        setSelectedPhieuXuat(null);
        form.setFieldsValue({ id_xuat_kho: null });
    };

    const handleSelectPhieuXuat = (px) => {
        setSelectedPhieuXuat(px);
    };

    const handleSoKhop = async () => {
        try {
            const values = await form.validateFields();
            if (!selectedToKhai || !selectedPhieuXuat) {
                message.warning('Vui lòng chọn tờ khai và phiếu xuất');
                return;
            }

            setLoadingModal(true);
            const res = await soKhopToKhaiXuatVoiPhieuXuat({
                id_tkx: selectedToKhai.id,
                id_xuat_kho: selectedPhieuXuat.id,
                nguoi_khop: values.nguoi_khop || 'Admin',
                ngay_khop: values.ngay_khop,
            });

            setKetQuaSoKhop(res);
            setModalSoKhopOpen(true);
            fetchDanhSachChuaKhop();
        } catch (err) {
            showError('Lỗi', err.message || 'Không thể thực hiện so khớp');
        } finally {
            setLoadingModal(false);
        }
    };

    const handleCloseModal = () => {
        setModalSoKhopOpen(false);
        setKetQuaSoKhop(null);
        setSelectedToKhai(null);
        setSelectedPhieuXuat(null);
        form.resetFields();
    };

    const getStatusTag = (ket_qua) => {
        switch (ket_qua) {
            case 'KhopDu':
                return <Tag icon={<CheckCircleOutlined />} color="success">Khớp đủ</Tag>;
            case 'ChenhLech':
                return <Tag icon={<ExclamationCircleOutlined />} color="warning">Chênh lệch</Tag>;
            default:
                return <Tag color="default">Cần xác minh</Tag>;
        }
    };

    const columnsToKhai = [
        {
            title: 'Số tờ khai',
            dataIndex: 'so_tk',
            key: 'so_tk',
        },
        {
            title: 'Ngày tờ khai',
            dataIndex: 'ngay_tk',
            key: 'ngay_tk',
        },
        {
            title: 'Mã TK',
            dataIndex: 'ma_to_khai',
            key: 'ma_to_khai',
            render: (ma) => <Tag color="blue">{ma}</Tag>,
        },
        {
            title: 'Số lô',
            dataIndex: 'so_lo',
            key: 'so_lo',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            render: (trang_thai) => (
                trang_thai === 'ThongQuan' ? <Tag color="green">Đã thông quan</Tag> : <Tag>{trang_thai}</Tag>
            ),
        },
    ];

    const columnsPhieuXuat = [
        {
            title: 'Số phiếu xuất',
            dataIndex: 'id',
            key: 'id',
            render: (id) => `PX${id}`,
        },
        {
            title: 'Ngày xuất',
            dataIndex: 'ngay_xuat',
            key: 'ngay_xuat',
        },
        {
            title: 'Ca/Kíp',
            dataIndex: 'ca_kip',
            key: 'ca_kip',
        },
        {
            title: 'Kho',
            dataIndex: 'ten_kho',
            key: 'ten_kho',
        },
        {
            title: 'Lý do xuất',
            dataIndex: 'ly_do_xuat',
            key: 'ly_do_xuat',
            render: (lydo) => <Tag color="purple">{lydo || 'Xuất khẩu'}</Tag>,
        },
    ];

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="page-header-heading" style={{ margin: 0 }}>
                    So khớp Tờ khai Xuất - Phiếu Xuất Kho (Mã 155)
                </h2>
                <Button icon={<ReloadOutlined />} onClick={fetchDanhSachChuaKhop}>
                    Tải lại
                </Button>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Danh sách Tờ khai Xuất chưa khớp" bordered={false}>
                        <Table
                            columns={columnsToKhai}
                            dataSource={dsToKhai}
                            rowKey="id"
                            loading={loading}
                            size="small"
                            rowSelection={{
                                type: 'radio',
                                selectedRowKeys: selectedToKhai ? [selectedToKhai.id] : [],
                                onChange: (keys, selectedRows) => {
                                    if (selectedRows.length > 0) handleSelectToKhai(selectedRows[0]);
                                },
                            }}
                            pagination={{ pageSize: 10 }}
                            scroll={{ y: 400 }}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Danh sách Phiếu Xuất Kho chưa khớp" bordered={false}>
                        <Table
                            columns={columnsPhieuXuat}
                            dataSource={dsPhieuXuat}
                            rowKey="id"
                            loading={loading}
                            size="small"
                            rowSelection={{
                                type: 'radio',
                                selectedRowKeys: selectedPhieuXuat ? [selectedPhieuXuat.id] : [],
                                onChange: (keys, selectedRows) => {
                                    if (selectedRows.length > 0) handleSelectPhieuXuat(selectedRows[0]);
                                },
                            }}
                            pagination={{ pageSize: 10 }}
                            scroll={{ y: 400 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: 16 }} bordered={false}>
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="nguoi_khop" label="Người so khớp">
                                <Select placeholder="Người thực hiện">
                                    <Option value="Admin">Admin</Option>
                                    <Option value="Kho">Nhân viên kho</Option>
                                    <Option value="XuatNhapKhau">NV XNK</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="ngay_khop" label="Ngày so khớp">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12} style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button
                                type="primary"
                                icon={<SyncOutlined />}
                                onClick={handleSoKhop}
                                loading={loadingModal}
                                disabled={!selectedToKhai || !selectedPhieuXuat}
                            >
                                Thực hiện So khớp (Mã 155)
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Modal
                title="Kết quả So khớp Mã 155"
                open={modalSoKhopOpen}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Đóng
                    </Button>,
                ]}
                width={800}
            >
                {ketQuaSoKhop && (
                    <>
                        <Alert
                            message={ketQuaSoKhop.ket_qua === 'KhopDu' ? 'Khớp đủ - Hợp lệ' : 'Có chênh lệch'}
                            description={ketQuaSoKhop.ket_qua === 'KhopDu' 
                                ? 'Dữ liệu tờ khai và phiếu xuất khớp nhau' 
                                : `Tổng chênh lệch: ${ketQuaSoKhop.tong_chenh_lech}`
                            }
                            type={ketQuaSoKhop.ket_qua === 'KhopDu' ? 'success' : 'warning'}
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="ID Tờ khai">{ketQuaSoKhop.id_tkx}</Descriptions.Item>
                            <Descriptions.Item label="ID Phiếu xuất">{ketQuaSoKhop.id_xuat_kho}</Descriptions.Item>
                            <Descriptions.Item label="Mã so khớp">{ketQuaSoKhop.ma_doi_soat}</Descriptions.Item>
                            <Descriptions.Item label="Kết quả">
                                {getStatusTag(ketQuaSoKhop.ket_qua)}
                            </Descriptions.Item>
                        </Descriptions>
                        
                        {ketQuaSoKhop.chi_tiet && ketQuaSoKhop.chi_tiet.length > 0 && (
                            <>
                                <Divider>Chi tiết so khớp</Divider>
                                <Table
                                    dataSource={ketQuaSoKhop.chi_tiet}
                                    columns={[
                                        { title: 'Tên', dataIndex: 'ten' },
                                        { title: 'SL Tờ khai', dataIndex: 'sl_to_khai' },
                                        { title: 'SL Phiếu xuất', dataIndex: 'sl_phieu_xuat' },
                                        { title: 'Chênh lệch', dataIndex: 'chenh_lech' },
                                        {
                                            title: 'Trạng thái',
                                            dataIndex: 'chenh_lech',
                                            render: (cl) => Math.abs(cl) > 0.001 
                                                ? <Tag color="warning">Chênh lệch</Tag> 
                                                : <Tag color="success">Khớp</Tag>
                                        },
                                    ]}
                                    pagination={false}
                                    size="small"
                                />
                            </>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
};

export default SoKhop;
