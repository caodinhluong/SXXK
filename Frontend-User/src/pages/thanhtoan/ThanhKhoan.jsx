import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Form, Select, message, Typography, Space, Spin, 
    DatePicker, Row, Col, Card, Tabs, Tooltip, Descriptions, Tag, Input, Popconfirm, Statistic, Divider 
} from 'antd';
import { 
    CalculatorOutlined, DownloadOutlined, SaveOutlined, ArrowLeftOutlined, 
    QuestionCircleOutlined, PrinterOutlined, EyeOutlined, SearchOutlined,
    WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DeleteOutlined,
    InboxOutlined, RiseOutlined, FallOutlined, SwapOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as BaoCaoThanhKhoanService from '../../services/baocaothanhkhoan.service';
import { exportBaoCaoToExcel } from '../../utils/exportExcel';
import { exportBaoCaoToPDF } from '../../utils/exportPDF';

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const ThanhKhoan = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [baoCaoData, setBaoCaoData] = useState(null);
    const [savedReports, setSavedReports] = useState([]);
    const [hopDongList, setHopDongList] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [filterKetLuan, setFilterKetLuan] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [currentReportId, setCurrentReportId] = useState(null);

    // Fetch initial data
    useEffect(() => {
        fetchHopDongList();
        loadSavedReports();
    }, []);

    // Auto-fetch when filter changes
    useEffect(() => {
        if (step === 1) {
            fetchSavedReports(1, pagination.pageSize);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterKetLuan]);

    const loadSavedReports = async () => {
        try {
            const response = await BaoCaoThanhKhoanService.getAllReports({ page: 1, limit: 10 });
            setSavedReports(response.data || []);
            setPagination({
                current: response.pagination?.page || 1,
                pageSize: response.pagination?.limit || 10,
                total: response.pagination?.total || 0
            });
        } catch (error) {
            message.error(error.message || 'Không thể tải lịch sử báo cáo!');
        }
    };

    const fetchHopDongList = async () => {
        try {
            setLoading(true);
            const response = await BaoCaoThanhKhoanService.getAllHopDong();
            setHopDongList(Array.isArray(response) ? response : []);
        } catch (error) {
            if (error.status === 401) {
                message.error('Phiên đăng nhập hết hạn!');
            } else {
                message.error(error.message || 'Không thể tải danh sách hợp đồng!');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedReports = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const response = await BaoCaoThanhKhoanService.getAllReports({
                page,
                limit: pageSize,
                q: searchText || undefined,
                ket_luan_tong_the: filterKetLuan || undefined
            });
            setSavedReports(response.data || []);
            setPagination({
                current: response.pagination?.page || 1,
                pageSize: response.pagination?.limit || 10,
                total: response.pagination?.total || 0
            });
        } catch (error) {
            message.error(error.message || 'Không thể tải lịch sử báo cáo!');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async (values) => {
        try {
            setLoading(true);
            const payload = {
                id_hd: values.id_hd,
                tu_ngay: values.ky_bao_cao[0].format('YYYY-MM-DD'),
                den_ngay: values.ky_bao_cao[1].format('YYYY-MM-DD'),
            };
            const response = await BaoCaoThanhKhoanService.calculateReport(payload);
            setBaoCaoData(response);
            setCurrentReportId(null); // Reset khi tính toán mới
            setStep(2);
            message.success('Tính toán thanh khoản thành công!');
        } catch (error) {
            if (error.status === 401) {
                message.error('Phiên đăng nhập hết hạn!');
            } else {
                message.error(error.error || error.message || 'Lỗi khi tính toán báo cáo!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewReport = async (record) => {
        try {
            setLoading(true);
            const response = await BaoCaoThanhKhoanService.getReportById(record.id_bc);
            
            console.log('Response from backend:', response);
            console.log('Data snapshot:', response.data_snapshot);
            
            // Reconstruct baoCaoData from saved report with all JSON fields
            const reportData = {
                thongTinChung: response.thongTinChung || response.data_snapshot?.thongTinChung,
                kyBaoCao: {
                    id_hd: response.id_hd,
                    so_hd: response.so_hd,
                    tu_ngay: response.tu_ngay,
                    den_ngay: response.den_ngay
                },
                baoCaoNXT_SP: response.data_snapshot?.baoCaoNXT_SP || [],
                baoCaoSD_NPL: response.data_snapshot?.baoCaoSD_NPL || [],
                dinhMucThucTe: response.data_snapshot?.dinhMucThucTe || [],
                // Add JSON fields
                data_ton_dau_ky: response.data_ton_dau_ky || null,
                data_nhap_trong_ky: response.data_nhap_trong_ky || null,
                data_xuat_trong_ky: response.data_xuat_trong_ky || null,
                data_ton_cuoi_ky: response.data_ton_cuoi_ky || null,
                data_dinh_muc: response.data_dinh_muc || null,
                data_doi_soat: response.data_doi_soat || null
            };
            
            console.log('Reconstructed report data:', reportData);
            
            setBaoCaoData(reportData);
            setCurrentReportId(record.id_bc); // Lưu ID báo cáo đang xem
            setStep(2);
        } catch (error) {
            console.error('Error viewing report:', error);
            message.error(error.error || error.message || 'Lỗi khi xem báo cáo!');
        } finally {
            setLoading(false);
        }
    };


    const handleSaveReport = async () => {
        if (!baoCaoData) {
            message.warning('Không có dữ liệu báo cáo để lưu!');
            return;
        }

        // Prevent double-click
        if (isSaving) {
            message.warning('Đang xử lý, vui lòng đợi...');
            return;
        }

        // Nếu đang xem báo cáo cũ, không cho lưu
        if (currentReportId) {
            message.warning('Báo cáo này đã tồn tại. Không thể lưu lại!');
            return;
        }
        
        try {
            setIsSaving(true);
            setLoading(true);
            
            // Determine ket_luan_tong_the based on warnings
            let ketLuan = 'HopLe';
            const hasWarning = 
                (baoCaoData.baoCaoNXT_SP || []).some(sp => sp.ghi_chu && sp.ghi_chu.includes('Cảnh báo')) ||
                (baoCaoData.baoCaoSD_NPL || []).some(npl => npl.ghi_chu && npl.ghi_chu.includes('Cảnh báo'));
            if (hasWarning) {
                ketLuan = 'CanhBao';
            }

            const payload = {
                id_hd: baoCaoData.kyBaoCao.id_hd,
                tu_ngay: baoCaoData.kyBaoCao.tu_ngay,
                den_ngay: baoCaoData.kyBaoCao.den_ngay,
                ket_luan_tong_the: ketLuan,
                data_snapshot: {
                    thongTinChung: baoCaoData.thongTinChung,
                    kyBaoCao: baoCaoData.kyBaoCao,
                    baoCaoNXT_SP: baoCaoData.baoCaoNXT_SP,
                    baoCaoSD_NPL: baoCaoData.baoCaoSD_NPL,
                    dinhMucThucTe: baoCaoData.dinhMucThucTe
                }
            };
            
            const response = await BaoCaoThanhKhoanService.saveReport(payload);
            message.success(response.message || 'Lưu báo cáo thành công!');
            await fetchSavedReports();
        } catch (error) {
            if (error.status === 401) {
                message.error('Phiên đăng nhập hết hạn!');
            } else {
                message.error(error.error || error.message || 'Lỗi khi lưu báo cáo!');
            }
        } finally {
            setIsSaving(false);
            setLoading(false);
        }
    };

    const handlePrint = () => { 
        window.print(); 
    };

    const handleExportExcel = () => {
        if (!baoCaoData) {
            message.warning('Không có dữ liệu để xuất!');
            return;
        }
        
        try {
            const fileName = `BaoCao_${baoCaoData.kyBaoCao?.so_hd}_${dayjs().format('YYYYMMDD_HHmmss')}`;
            exportBaoCaoToExcel(baoCaoData, fileName);
            message.success('Đã xuất file Excel thành công!');
        } catch (error) {
            message.error('Lỗi khi xuất file Excel!');
            console.error(error);
        }
    };

    const handleExportPDF = async () => {
        if (!baoCaoData) {
            message.warning('Không có dữ liệu để xuất!');
            return;
        }
        
        try {
            const fileName = `BaoCao_${baoCaoData.kyBaoCao?.so_hd}_${dayjs().format('YYYYMMDD_HHmmss')}`;
            console.log('Bắt đầu xuất PDF với dữ liệu:', baoCaoData);
            await exportBaoCaoToPDF(baoCaoData, fileName);
            message.success('Đã xuất file PDF thành công!');
        } catch (error) {
            message.error(`Lỗi khi xuất file PDF: ${error.message}`);
            console.error('Chi tiết lỗi PDF:', error);
        }
    };

    const handleTableChange = (paginationConfig) => {
        fetchSavedReports(paginationConfig.current, paginationConfig.pageSize);
    };

    const handleSearch = () => {
        fetchSavedReports(1, pagination.pageSize);
    };

    const handleDeleteReport = async (id_bc) => {
        try {
            setLoading(true);
            await BaoCaoThanhKhoanService.deleteReport(id_bc);
            message.success('Xóa báo cáo thành công!');
            await fetchSavedReports(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.error || error.message || 'Lỗi khi xóa báo cáo!');
        } finally {
            setLoading(false);
        }
    };

    // Render kết luận với icon và màu sắc
    const renderKetLuan = (ketLuan) => {
        const config = {
            'HopLe': { color: 'success', icon: <CheckCircleOutlined />, text: 'Hợp lệ' },
            'CanhBao': { color: 'warning', icon: <WarningOutlined />, text: 'Cảnh báo' },
            'ViPham': { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Vi phạm' }
        };
        const item = config[ketLuan] || config['HopLe'];
        return <Tag color={item.color} icon={item.icon}>{item.text}</Tag>;
    };

    const renderTrangThai = (trangThai) => {
        const config = {
            'HopLe': { color: 'green', text: 'Hợp lệ' },
            'TamKhoa': { color: 'orange', text: 'Tạm khóa' },
            'Huy': { color: 'red', text: 'Đã hủy' }
        };
        const item = config[trangThai] || config['HopLe'];
        return <Tag color={item.color}>{item.text}</Tag>;
    };

    // Calculate summary statistics for better overview
    const calculateSummaryStats = () => {
        if (!baoCaoData) return null;

        const stats = {
            totalNPL: 0,
            totalSP: 0,
            totalNhapNPL: 0,
            totalNhapSP: 0,
            totalXuatNPL: 0,
            totalXuatSP: 0,
            tonDauKyNPL: 0,
            tonDauKySP: 0,
            tonCuoiKyNPL: 0,
            tonCuoiKySP: 0
        };

        // Count from main report data
        if (baoCaoData.baoCaoSD_NPL) {
            stats.totalNPL = baoCaoData.baoCaoSD_NPL.length;
            baoCaoData.baoCaoSD_NPL.forEach(item => {
                stats.tonDauKyNPL += item.ton_dau_ky || 0;
                stats.totalNhapNPL += (item.tai_nhap || 0) + (item.nhap_khac || 0);
                stats.totalXuatNPL += (item.xuat_san_pham || 0) + (item.thay_doi_muc_dich || 0);
                stats.tonCuoiKyNPL += item.ton_cuoi_ky || 0;
            });
        }

        if (baoCaoData.baoCaoNXT_SP) {
            stats.totalSP = baoCaoData.baoCaoNXT_SP.length;
            baoCaoData.baoCaoNXT_SP.forEach(item => {
                stats.tonDauKySP += item.ton_dau_ky || 0;
                stats.totalNhapSP += item.nhap_kho_trong_ky || 0;
                stats.totalXuatSP += (item.xuat_khau || 0) + (item.xuat_khac || 0) + (item.chuyen_muc_dich || 0);
                stats.tonCuoiKySP += item.ton_cuoi_ky || 0;
            });
        }

        return stats;
    };

    // Columns definitions
    const nxtSPColumns = [
        { title: '(1) STT', dataIndex: 'stt', width: '4%', align: 'center' },
        { title: '(2) Mã SP', dataIndex: 'ma_sp', width: '7%' },
        { title: '(3) Tên sản phẩm', dataIndex: 'ten_sp', width: '15%' },
        { title: '(4) ĐVT', dataIndex: 'don_vi_tinh', width: '5%', align: 'center' },
        { title: '(5) Tồn đầu kỳ', dataIndex: 'ton_dau_ky', width: '8%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
        { title: '(6) Nhập trong kỳ', dataIndex: 'nhap_kho_trong_ky', width: '9%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
        { 
            title: 'Xuất kho trong kỳ', 
            children: [
                { title: '(7) Chuyển MĐ', dataIndex: 'chuyen_muc_dich', width: '8%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
                { title: '(8) Xuất khẩu', dataIndex: 'xuat_khau', width: '8%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
                { title: '(9) Xuất khác', dataIndex: 'xuat_khac', width: '8%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
            ]
        },
        { 
            title: () => <Tooltip title="(5) + (6) - (7) - (8) - (9)"><span>(10) Tồn cuối kỳ <QuestionCircleOutlined /></span></Tooltip>, 
            dataIndex: 'ton_cuoi_ky', 
            width: '10%', 
            align: 'right', 
            render: (v) => <Text type={v < 0 ? 'danger' : undefined} strong={v < 0}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
        },
        { 
            title: '(11) Ghi chú', 
            dataIndex: 'ghi_chu', 
            width: '18%',
            render: (text) => text ? <Text type="warning">{text}</Text> : null
        },
    ];
    
    const sdNPLColumns = [
        { title: '(1) STT', dataIndex: 'stt', width: '4%', align: 'center' },
        { title: '(2) Mã NPL', dataIndex: 'ma_npl', width: '7%' },
        { title: '(3) Tên NPL, VT', dataIndex: 'ten_npl', width: '15%' },
        { title: '(4) ĐVT', dataIndex: 'don_vi_tinh', width: '5%', align: 'center' },
        { title: '(5) Tồn đầu kỳ', dataIndex: 'ton_dau_ky', width: '8%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
        { 
            title: 'Nhập trong kỳ', 
            children: [
                { title: '(6) Tái nhập', dataIndex: 'tai_nhap', width: '8%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
                { title: '(7) Nhập khác', dataIndex: 'nhap_khac', width: '8%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
            ]
        },
        { 
            title: 'Xuất trong kỳ', 
            children: [
                { title: '(8) Xuất SX', dataIndex: 'xuat_san_pham', width: '8%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
                { title: '(9) Chuyển MĐ', dataIndex: 'thay_doi_muc_dich', width: '8%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
            ]
        },
        { 
            title: () => <Tooltip title="(5) + (6) + (7) - (8) - (9)"><span>(10) Tồn cuối kỳ <QuestionCircleOutlined /></span></Tooltip>, 
            dataIndex: 'ton_cuoi_ky', 
            width: '10%', 
            align: 'right', 
            render: (v) => <Text type={v < 0 ? 'danger' : undefined} strong={v < 0}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
        },
        { 
            title: '(11) Ghi chú', 
            dataIndex: 'ghi_chu', 
            width: '19%',
            render: (text) => text ? <Text type="warning">{text}</Text> : null
        },
    ];
    
    const dinhMucColumns = [
        { title: '(1) STT', dataIndex: 'stt', width: '6%', align: 'center' },
        { title: '(2) Mã SP', dataIndex: 'ma_sp', width: '9%' },
        { title: '(3) Tên sản phẩm', dataIndex: 'ten_sp', width: '17%' },
        { title: '(4) ĐVT (SP)', dataIndex: 'don_vi_tinh_sp', width: '7%', align: 'center' },
        { 
            title: 'Nguyên liệu, vật tư', 
            children: [
                { title: '(5) Mã', dataIndex: 'ma_npl', width: '9%' },
                { title: '(6) Tên', dataIndex: 'ten_npl', width: '22%' },
                { title: '(7) ĐVT', dataIndex: 'don_vi_tinh_npl', width: '7%', align: 'center' }
            ]
        },
        { title: '(8) Định mức/1SP', dataIndex: 'luong_sd', width: '11%', align: 'right', render: (v) => v !== null && v !== undefined ? formatVNNumber(v) : '' },
        { title: '(9) Ghi chú', dataIndex: 'ghi_chu', width: '12%' },
    ];
    
    const savedReportsColumns = [
        { title: 'Số Hợp đồng', dataIndex: 'so_hd' },
        { title: 'Doanh nghiệp', dataIndex: 'ten_dn' },
        { 
            title: 'Kỳ Báo cáo', 
            render: (_, record) => `${dayjs(record.tu_ngay).format('DD/MM/YYYY')} - ${dayjs(record.den_ngay).format('DD/MM/YYYY')}`
        },
        { 
            title: 'Thời gian tạo', 
            dataIndex: 'thoi_gian_tao', 
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-'
        },
        { 
            title: 'Kết luận', 
            dataIndex: 'ket_luan_tong_the', 
            render: renderKetLuan
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'trang_thai', 
            render: renderTrangThai
        },
        { 
            title: 'Hành động', 
            key: 'action', 
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button 
                        type="primary"
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewReport(record)}
                        style={{ color: '#fff' }}
                    >
                        Xem
                    </Button>
                    <Popconfirm
                        title="Xóa báo cáo thanh khoản?"
                        description="Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác."
                        onConfirm={() => handleDeleteReport(record.id_bc)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];


    // Step 2: Hiển thị kết quả báo cáo
    if (step === 2 && baoCaoData) {
        // Count warnings
        const spWarnings = (baoCaoData.baoCaoNXT_SP || []).filter(sp => sp.ghi_chu).length;
        const nplWarnings = (baoCaoData.baoCaoSD_NPL || []).filter(npl => npl.ghi_chu).length;
        const totalWarnings = spWarnings + nplWarnings;
        
        // Calculate summary statistics
        const summaryStats = calculateSummaryStats();

        return (
            <Spin spinning={loading} tip="Đang xử lý...">
                <Card>
                    <Row justify="space-between" align="middle" style={{ marginBottom: 24 }} className="no-print">
                        <Col>
                            <Space>
                                <Button 
                                    icon={<ArrowLeftOutlined />} 
                                    onClick={() => { 
                                        setStep(1); 
                                        setBaoCaoData(null);
                                        setCurrentReportId(null);
                                    }}
                                >
                                    Quay lại
                                </Button>
                                <Title level={4} style={{ margin: 0 }}>Kết quả Quyết toán Hợp đồng</Title>
                                {totalWarnings > 0 && (
                                    <Tag color="warning" icon={<WarningOutlined />}>
                                        {totalWarnings} cảnh báo
                                    </Tag>
                                )}
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Button icon={<PrinterOutlined />} onClick={handlePrint} disabled={isSaving}>In Báo cáo</Button>
                                <Button icon={<DownloadOutlined />} onClick={handleExportExcel} disabled={isSaving}>Xuất Excel</Button>
                                <Button icon={<DownloadOutlined />} onClick={handleExportPDF} disabled={isSaving}>Xuất PDF</Button>
                                <Button 
                                    type="primary" 
                                    icon={<SaveOutlined />} 
                                    onClick={handleSaveReport}
                                    loading={isSaving}
                                    disabled={isSaving || currentReportId}
                                    style={currentReportId ? { backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' } : {}}
                                >
                                    {currentReportId ? 'Đã lưu' : (isSaving ? 'Đang lưu...' : 'Lưu Báo cáo')}
                                </Button>
                            </Space>
                        </Col>
                    </Row>

                    <div id="print-area">
                        <Descriptions bordered size="small" column={2} style={{ marginBottom: 24 }} title="THÔNG TIN CHUNG">
                            <Descriptions.Item label="Tên tổ chức">{baoCaoData.thongTinChung?.ten_dn}</Descriptions.Item>
                            <Descriptions.Item label="Mã số thuế">{baoCaoData.thongTinChung?.ma_so_thue}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>{baoCaoData.thongTinChung?.dia_chi}</Descriptions.Item>
                            <Descriptions.Item label="Số hợp đồng">{baoCaoData.kyBaoCao?.so_hd}</Descriptions.Item>
                            <Descriptions.Item label="Kỳ báo cáo">
                                {`Từ ${dayjs(baoCaoData.kyBaoCao?.tu_ngay).format('DD/MM/YYYY')} đến ${dayjs(baoCaoData.kyBaoCao?.den_ngay).format('DD/MM/YYYY')}`}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Chi tiết Báo cáo
                        </Divider>

                        <Tabs 
                            defaultActiveKey="1" 
                            type="card"
                            items={[
                                {
                                    key: '1',
                                    label: (
                                        <span>
                                            Mẫu 15a: BC N-X-T Sản phẩm
                                            {spWarnings > 0 && <Tag color="warning" style={{ marginLeft: 8 }}>{spWarnings}</Tag>}
                                        </span>
                                    ),
                                    children: (
                                        <>
                                            <Title level={5} style={{ textAlign: 'center', padding: '16px 0' }}>
                                                BÁO CÁO QUYẾT TOÁN NHẬP - XUẤT - TỒN KHO SẢN PHẨM
                                            </Title>
                                            <Table 
                                                columns={nxtSPColumns} 
                                                dataSource={(baoCaoData.baoCaoNXT_SP || []).map((item, index) => ({ ...item, key: item.id_sp || index }))} 
                                                rowKey="key" 
                                                bordered 
                                                pagination={false} 
                                                size="small" 
                                                scroll={{ x: 'max-content' }}
                                                style={{ width: '100%' }}
                                            />
                                        </>
                                    )
                                },
                                {
                                    key: '2',
                                    label: (
                                        <span>
                                            Mẫu 15b: BC Sử dụng NPL
                                            {nplWarnings > 0 && <Tag color="warning" style={{ marginLeft: 8 }}>{nplWarnings}</Tag>}
                                        </span>
                                    ),
                                    children: (
                                        <>
                                            <Title level={5} style={{ textAlign: 'center', padding: '16px 0' }}>
                                                BÁO CÁO QUYẾT TOÁN TÌNH HÌNH SỬ DỤNG NGUYÊN LIỆU, VẬT TƯ
                                            </Title>
                                            <Table 
                                                columns={sdNPLColumns} 
                                                dataSource={(baoCaoData.baoCaoSD_NPL || []).map((item, index) => ({ ...item, key: item.id_npl || index }))} 
                                                rowKey="key" 
                                                bordered 
                                                pagination={false} 
                                                size="small" 
                                                scroll={{ x: 'max-content' }}
                                                style={{ width: '100%' }}
                                            />
                                        </>
                                    )
                                },
                                {
                                    key: '3',
                                    label: 'Mẫu 16: Định mức Thực tế',
                                    children: (
                                        <>
                                            <Title level={5} style={{ textAlign: 'center', padding: '16px 0' }}>
                                                ĐỊNH MỨC THỰC TẾ SẢN XUẤT SẢN PHẨM XUẤT KHẨU
                                            </Title>
                                            <Table 
                                                columns={dinhMucColumns} 
                                                dataSource={(baoCaoData.dinhMucThucTe || []).map((item, index) => ({ ...item, key: `${item.id_sp}-${item.id_npl}-${index}` }))} 
                                                rowKey="key" 
                                                bordered 
                                                pagination={false} 
                                                size="small" 
                                                scroll={{ x: 'max-content' }}
                                                style={{ width: '100%' }}
                                            />
                                        </>
                                    )
                                },
                                ...(baoCaoData.data_ton_dau_ky ? [{
                                    key: '4',
                                    label: (
                                        <Tooltip title="Dữ liệu chi tiết về tồn kho đầu kỳ của NPL và SP - Snapshot tại thời điểm bắt đầu kỳ báo cáo">
                                            <Space>
                                                <InboxOutlined />
                                                Chi tiết: Tồn đầu kỳ
                                                <Tag color="blue">Dữ liệu lưu trữ</Tag>
                                            </Space>
                                        </Tooltip>
                                    ),
                                    children: (
                                        <>
                                            <Title level={5} style={{ textAlign: 'center', padding: '16px 0', color: '#1890ff' }}>
                                                📦 CHI TIẾT TỒN ĐẦU KỲ
                                            </Title>
                                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: '14px' }}>
                                                Dữ liệu tồn kho đầu kỳ được lưu trữ để theo dõi lịch sử và đối chiếu
                                            </Text>
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} lg={12}>
                                                    <Card 
                                                        title={
                                                            <Space>
                                                                <InboxOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                                                                <span style={{ fontWeight: 600 }}>Nguyên phụ liệu</span>
                                                                <Tag color="blue">{baoCaoData.data_ton_dau_ky?.npl?.length || 0} mặt hàng</Tag>
                                                            </Space>
                                                        } 
                                                        size="small"
                                                        style={{ borderColor: '#1890ff', borderWidth: '2px', boxShadow: '0 2px 8px rgba(24, 144, 255, 0.1)' }}
                                                        headStyle={{ backgroundColor: '#f0f5ff' }}
                                                    >
                                                        <Table
                                                            columns={[
                                                                { title: 'Mã NPL', dataIndex: 'ma_npl', width: '25%', render: (text) => <Text strong>{text}</Text> },
                                                                { title: 'Tên NPL', dataIndex: 'ten_npl', width: '40%' },
                                                                { 
                                                                    title: 'Tồn đầu kỳ', 
                                                                    dataIndex: 'ton_dau_ky', 
                                                                    width: '20%', 
                                                                    align: 'right', 
render: (v) => <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
                                                            },
                                                                { title: 'ĐVT', dataIndex: 'don_vi_tinh', width: '15%', align: 'center', render: (text) => <Tag>{text}</Tag> }
                                                            ]}
                                                            dataSource={baoCaoData.data_ton_dau_ky?.npl || []}
                                                            rowKey="id_npl"
                                                            pagination={false}
                                                            size="small"
                                                            bordered
                                                            summary={(pageData) => {
                                                                let total = 0;
                                                                pageData.forEach(({ ton_dau_ky }) => {
                                                                    total += ton_dau_ky || 0;
                                                                });
                                                                return (
                                                                    <Table.Summary.Row style={{ backgroundColor: '#e6f7ff', fontWeight: 'bold' }}>
                                                                        <Table.Summary.Cell colSpan={2}>
                                                                            <Text strong style={{ fontSize: '14px' }}>📊 Tổng cộng</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell align="right">
                                                                            <Text strong style={{ color: '#1890ff', fontSize: '15px' }}>{formatVNNumber(total)}</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell />
                                                                    </Table.Summary.Row>
                                                                );
                                                            }}
                                                        />
                                                    </Card>
                                                </Col>
                                                <Col xs={24} lg={12}>
                                                    <Card 
                                                        title={
                                                            <Space>
                                                                <InboxOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                                                                <span style={{ fontWeight: 600 }}>Sản phẩm</span>
                                                                <Tag color="green">{baoCaoData.data_ton_dau_ky?.sp?.length || 0} mặt hàng</Tag>
                                                            </Space>
                                                        } 
                                                        size="small"
                                                        style={{ borderColor: '#52c41a', borderWidth: '2px', boxShadow: '0 2px 8px rgba(82, 196, 26, 0.1)' }}
                                                        headStyle={{ backgroundColor: '#f6ffed' }}
                                                    >
                                                        <Table
                                                            columns={[
                                                                { title: 'Mã SP', dataIndex: 'ma_sp', width: '25%', render: (text) => <Text strong>{text}</Text> },
                                                                { title: 'Tên SP', dataIndex: 'ten_sp', width: '40%' },
                                                                { 
                                                                    title: 'Tồn đầu kỳ', 
                                                                    dataIndex: 'ton_dau_ky', 
                                                                    width: '20%', 
                                                                    align: 'right', 
                                                                    render: (v) => <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
                                                                },
                                                                { title: 'ĐVT', dataIndex: 'don_vi_tinh', width: '15%', align: 'center', render: (text) => <Tag color="green">{text}</Tag> }
                                                            ]}
                                                            dataSource={baoCaoData.data_ton_dau_ky?.sp || []}
                                                            rowKey="id_sp"
                                                            pagination={false}
                                                            size="small"
                                                            bordered
                                                            summary={(pageData) => {
                                                                let total = 0;
                                                                pageData.forEach(({ ton_dau_ky }) => {
                                                                    total += ton_dau_ky || 0;
                                                                });
                                                                return (
                                                                    <Table.Summary.Row style={{ backgroundColor: '#f6ffed', fontWeight: 'bold' }}>
                                                                        <Table.Summary.Cell colSpan={2}>
                                                                            <Text strong style={{ fontSize: '14px' }}>📊 Tổng cộng</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell align="right">
                                                                            <Text strong style={{ color: '#52c41a', fontSize: '15px' }}>{formatVNNumber(total)}</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell />
                                                                    </Table.Summary.Row>
                                                                );
                                                            }}
                                                        />
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </>
                                    )
                                }] : []),
                                ...(baoCaoData.data_nhap_trong_ky ? [{
                                    key: '5',
                                    label: (
                                        <Tooltip title="Tổng hợp các giao dịch nhập kho trong kỳ báo cáo - Bao gồm tái nhập và nhập khác">
                                            <Space>
                                                <RiseOutlined />
                                                Chi tiết: Nhập trong kỳ
                                                <Tag color="green">Dữ liệu lưu trữ</Tag>
                                            </Space>
                                        </Tooltip>
                                    ),
                                    children: (
                                        <>
                                            <Title level={5} style={{ textAlign: 'center', padding: '16px 0', color: '#52c41a' }}>
                                                📥 CHI TIẾT NHẬP TRONG KỲ
                                            </Title>
                                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: '14px' }}>
                                                Tổng hợp các giao dịch nhập kho trong kỳ báo cáo (Tái nhập, Nhập khác)
                                            </Text>
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} lg={12}>
                                                    <Card 
                                                        title={
                                                            <Space>
                                                                <RiseOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                                                                <span style={{ fontWeight: 600 }}>Nguyên phụ liệu</span>
                                                                <Tag color="orange">{baoCaoData.data_nhap_trong_ky?.npl?.length || 0} mặt hàng</Tag>
                                                            </Space>
                                                        } 
                                                        size="small"
                                                        style={{ borderColor: '#faad14', borderWidth: '2px', boxShadow: '0 2px 8px rgba(250, 173, 20, 0.1)' }}
                                                        headStyle={{ backgroundColor: '#fffbe6' }}
                                                    >
                                                        <Table
                                                            columns={[
                                                                { title: 'Mã NPL', dataIndex: 'ma_npl', width: '20%', render: (text) => <Text strong>{text}</Text> },
                                                                { title: 'Tên NPL', dataIndex: 'ten_npl', width: '35%' },
                                                                { 
                                                                    title: <Tooltip title="Nhập lại hàng đã xuất khẩu"><span>Tái nhập 🔄</span></Tooltip>, 
                                                                    dataIndex: 'tai_nhap', 
                                                                    width: '15%', 
                                                                    align: 'right', 
                                                                    render: (v) => <Text style={{ color: '#52c41a', fontWeight: 500 }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
                                                                },
                                                                { 
                                                                    title: <Tooltip title="Nhập từ nguồn khác"><span>Nhập khác 📦</span></Tooltip>, 
                                                                    dataIndex: 'nhap_khac', 
                                                                    width: '15%', 
                                                                    align: 'right', 
                                                                    render: (v) => <Text style={{ color: '#1890ff', fontWeight: 500 }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
                                                                },
                                                                { title: 'ĐVT', dataIndex: 'don_vi_tinh', width: '15%', align: 'center', render: (text) => <Tag>{text}</Tag> }
                                                            ]}
                                                            dataSource={baoCaoData.data_nhap_trong_ky?.npl || []}
                                                            rowKey="id_npl"
                                                            pagination={false}
                                                            size="small"
                                                            bordered
                                                            summary={(pageData) => {
                                                                let totalTaiNhap = 0;
                                                                let totalNhapKhac = 0;
                                                                pageData.forEach(({ tai_nhap, nhap_khac }) => {
                                                                    totalTaiNhap += tai_nhap || 0;
                                                                    totalNhapKhac += nhap_khac || 0;
                                                                });
                                                                return (
                                                                    <Table.Summary.Row style={{ backgroundColor: '#fffbe6', fontWeight: 'bold' }}>
                                                                        <Table.Summary.Cell colSpan={2}>
                                                                            <Text strong style={{ fontSize: '14px' }}>📊 Tổng cộng</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell align="right">
                                                                            <Text strong style={{ color: '#52c41a', fontSize: '15px' }}>{formatVNNumber(totalTaiNhap)}</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell align="right">
                                                                            <Text strong style={{ color: '#1890ff', fontSize: '15px' }}>{formatVNNumber(totalNhapKhac)}</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell />
                                                                    </Table.Summary.Row>
                                                                );
                                                            }}
                                                        />
                                                    </Card>
                                                </Col>
                                                <Col xs={24} lg={12}>
                                                    <Card 
                                                        title={
                                                            <Space>
                                                                <RiseOutlined style={{ color: '#13c2c2', fontSize: '18px' }} />
                                                                <span style={{ fontWeight: 600 }}>Sản phẩm</span>
                                                                <Tag color="cyan">{baoCaoData.data_nhap_trong_ky?.sp?.length || 0} mặt hàng</Tag>
                                                            </Space>
                                                        } 
                                                        size="small"
                                                        style={{ borderColor: '#13c2c2', borderWidth: '2px', boxShadow: '0 2px 8px rgba(19, 194, 194, 0.1)' }}
                                                        headStyle={{ backgroundColor: '#e6fffb' }}
                                                    >
                                                        <Table
                                                            columns={[
                                                                { title: 'Mã SP', dataIndex: 'ma_sp', width: '25%', render: (text) => <Text strong>{text}</Text> },
                                                                { title: 'Tên SP', dataIndex: 'ten_sp', width: '40%' },
                                                                { 
                                                                    title: 'Nhập kho', 
                                                                    dataIndex: 'nhap_kho_trong_ky', 
                                                                    width: '20%', 
                                                                    align: 'right', 
                                                                    render: (v) => <Text strong style={{ color: '#13c2c2', fontSize: '14px' }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
                                                                },
                                                                { title: 'ĐVT', dataIndex: 'don_vi_tinh', width: '15%', align: 'center', render: (text) => <Tag color="cyan">{text}</Tag> }
                                                            ]}
                                                            dataSource={baoCaoData.data_nhap_trong_ky?.sp || []}
                                                            rowKey="id_sp"
                                                            pagination={false}
                                                            size="small"
                                                            bordered
                                                            summary={(pageData) => {
                                                                let total = 0;
                                                                pageData.forEach(({ nhap_kho_trong_ky }) => {
                                                                    total += nhap_kho_trong_ky || 0;
                                                                });
                                                                return (
                                                                    <Table.Summary.Row style={{ backgroundColor: '#e6fffb', fontWeight: 'bold' }}>
                                                                        <Table.Summary.Cell colSpan={2}>
                                                                            <Text strong style={{ fontSize: '14px' }}>📊 Tổng cộng</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell align="right">
                                                                            <Text strong style={{ color: '#13c2c2', fontSize: '15px' }}>{formatVNNumber(total)}</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell />
                                                                    </Table.Summary.Row>
                                                                );
                                                            }}
                                                        />
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </>
                                    )
                                }] : []),
                                ...(baoCaoData.data_xuat_trong_ky ? [{
                                    key: '6',
                                    label: (
                                        <Tooltip title="Chi tiết các giao dịch xuất kho trong kỳ - Xuất khẩu, xuất khác, chuyển mục đích">
                                            <Space>
                                                <FallOutlined />
                                                Chi tiết: Xuất trong kỳ
                                                <Tag color="red">Dữ liệu lưu trữ</Tag>
                                            </Space>
                                        </Tooltip>
                                    ),
                                    children: (
                                        <>
                                            <Title level={5} style={{ textAlign: 'center', padding: '16px 0', color: '#f5222d' }}>
                                                📤 CHI TIẾT XUẤT TRONG KỲ
                                            </Title>
                                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: '14px' }}>
                                                Tổng hợp các giao dịch xuất kho trong kỳ báo cáo (Xuất khẩu, Xuất khác, Chuyển mục đích)
                                            </Text>
                                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: '14px' }}>
                                                Tổng hợp các giao dịch xuất kho trong kỳ báo cáo (Xuất khẩu, Xuất khác, Chuyển mục đích)
                                            </Text>
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} lg={12}>
                                                    <Card 
                                                        title={
                                                            <Space>
                                                                <FallOutlined style={{ color: '#f5222d', fontSize: '18px' }} />
                                                                <span style={{ fontWeight: 600 }}>Nguyên phụ liệu</span>
                                                                <Tag color="red">{baoCaoData.data_xuat_trong_ky?.npl?.length || 0} mặt hàng</Tag>
                                                            </Space>
                                                        } 
                                                        size="small"
                                                        style={{ borderColor: '#f5222d', borderWidth: '2px', boxShadow: '0 2px 8px rgba(245, 34, 45, 0.1)' }}
                                                        headStyle={{ backgroundColor: '#fff1f0' }}
                                                    >
                                                        <Table
                                                            columns={[
                                                                { title: 'Mã NPL', dataIndex: 'ma_npl', width: '20%', render: (text) => <Text strong>{text}</Text> },
                                                                { title: 'Tên NPL', dataIndex: 'ten_npl', width: '35%' },
                                                                { title: 'Xuất SX', dataIndex: 'xuat_san_pham', width: '15%', align: 'right', render: (v) => <Text style={{ color: '#f5222d', fontWeight: 500 }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text> },
                                                                { title: 'Chuyển MĐ', dataIndex: 'thay_doi_muc_dich', width: '15%', align: 'right', render: (v) => <Text style={{ color: '#fa8c16', fontWeight: 500 }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text> },
                                                                { title: 'ĐVT', dataIndex: 'don_vi_tinh', width: '15%', align: 'center', render: (text) => <Tag>{text}</Tag> }
                                                            ]}
                                                            dataSource={baoCaoData.data_xuat_trong_ky?.npl || []}
                                                            rowKey="id_npl"
                                                            pagination={false}
                                                            size="small"
                                                            bordered
                                                        />
                                                    </Card>
                                                </Col>
                                                <Col xs={24} lg={12}>
                                                    <Card 
                                                        title={
                                                            <Space>
                                                                <FallOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
                                                                <span style={{ fontWeight: 600 }}>Sản phẩm</span>
                                                                <Tag color="orange">{baoCaoData.data_xuat_trong_ky?.sp?.length || 0} mặt hàng</Tag>
                                                            </Space>
                                                        } 
                                                        size="small"
                                                        style={{ borderColor: '#fa8c16', borderWidth: '2px', boxShadow: '0 2px 8px rgba(250, 140, 22, 0.1)' }}
                                                        headStyle={{ backgroundColor: '#fff7e6' }}
                                                    >
                                                        <Table
                                                            columns={[
                                                                { title: 'Mã SP', dataIndex: 'ma_sp', width: '15%', render: (text) => <Text strong>{text}</Text> },
                                                                { title: 'Tên SP', dataIndex: 'ten_sp', width: '30%' },
                                                                { title: 'XK', dataIndex: 'xuat_khau', width: '13%', align: 'right', render: (v) => <Text style={{ color: '#f5222d', fontWeight: 500 }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text> },
                                                                { title: 'Xuất khác', dataIndex: 'xuat_khac', width: '13%', align: 'right', render: (v) => <Text style={{ color: '#fa541c', fontWeight: 500 }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text> },
                                                                { title: 'Chuyển MĐ', dataIndex: 'chuyen_muc_dich', width: '14%', align: 'right', render: (v) => <Text style={{ color: '#fa8c16', fontWeight: 500 }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text> },
                                                                { title: 'ĐVT', dataIndex: 'don_vi_tinh', width: '15%', align: 'center', render: (text) => <Tag color="orange">{text}</Tag> }
                                                            ]}
                                                            dataSource={baoCaoData.data_xuat_trong_ky?.sp || []}
                                                            rowKey="id_sp"
                                                            pagination={false}
                                                            size="small"
                                                            bordered
                                                        />
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </>
                                    )
                                }] : []),
                                ...(baoCaoData.data_ton_cuoi_ky ? [{
                                    key: '7',
                                    label: (
                                        <Tooltip title="Dữ liệu tồn kho cuối kỳ - Kết quả sau khi tính toán nhập xuất trong kỳ">
                                            <Space>
                                                <SwapOutlined />
                                                Chi tiết: Tồn cuối kỳ
                                                <Tag color="purple">Dữ liệu lưu trữ</Tag>
                                            </Space>
                                        </Tooltip>
                                    ),
                                    children: (
                                        <>
                                            <Title level={5} style={{ textAlign: 'center', padding: '16px 0', color: '#722ed1' }}>
                                                📊 CHI TIẾT TỒN CUỐI KỲ
                                            </Title>
                                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: '14px' }}>
                                                Số lượng tồn kho cuối kỳ = Tồn đầu kỳ + Nhập trong kỳ - Xuất trong kỳ
                                            </Text>
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} lg={12}>
                                                    <Card 
                                                        title={
                                                            <Space>
                                                                <SwapOutlined style={{ color: '#722ed1', fontSize: '18px' }} />
                                                                <span style={{ fontWeight: 600 }}>Nguyên phụ liệu</span>
                                                                <Tag color="purple">{baoCaoData.data_ton_cuoi_ky?.npl?.length || 0} mặt hàng</Tag>
                                                            </Space>
                                                        } 
                                                        size="small"
                                                        style={{ borderColor: '#722ed1', borderWidth: '2px', boxShadow: '0 2px 8px rgba(114, 46, 209, 0.1)' }}
                                                        headStyle={{ backgroundColor: '#f9f0ff' }}
                                                    >
                                                        <Table
                                                            columns={[
                                                                { title: 'Mã NPL', dataIndex: 'ma_npl', width: '25%', render: (text) => <Text strong>{text}</Text> },
                                                                { title: 'Tên NPL', dataIndex: 'ten_npl', width: '40%' },
                                                                { 
                                                                    title: 'Tồn cuối kỳ', 
                                                                    dataIndex: 'ton_cuoi_ky', 
                                                                    width: '20%', 
                                                                    align: 'right', 
                                                                    render: (v) => <Text type={v < 0 ? 'danger' : undefined} strong style={{ fontSize: '14px', color: v < 0 ? '#f5222d' : '#722ed1' }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
                                                                },
                                                                { title: 'ĐVT', dataIndex: 'don_vi_tinh', width: '15%', align: 'center', render: (text) => <Tag color="purple">{text}</Tag> }
                                                            ]}
                                                            dataSource={baoCaoData.data_ton_cuoi_ky?.npl || []}
                                                            rowKey="id_npl"
                                                            pagination={false}
                                                            size="small"
                                                            bordered
                                                        />
                                                    </Card>
                                                </Col>
                                                <Col xs={24} lg={12}>
                                                    <Card 
                                                        title={
                                                            <Space>
                                                                <SwapOutlined style={{ color: '#eb2f96', fontSize: '18px' }} />
                                                                <span style={{ fontWeight: 600 }}>Sản phẩm</span>
                                                                <Tag color="magenta">{baoCaoData.data_ton_cuoi_ky?.sp?.length || 0} mặt hàng</Tag>
                                                            </Space>
                                                        } 
                                                        size="small"
                                                        style={{ borderColor: '#eb2f96', borderWidth: '2px', boxShadow: '0 2px 8px rgba(235, 47, 150, 0.1)' }}
                                                        headStyle={{ backgroundColor: '#fff0f6' }}
                                                    >
                                                        <Table
                                                            columns={[
                                                                { title: 'Mã SP', dataIndex: 'ma_sp', width: '25%', render: (text) => <Text strong>{text}</Text> },
                                                                { title: 'Tên SP', dataIndex: 'ten_sp', width: '40%' },
                                                                { 
                                                                    title: 'Tồn cuối kỳ', 
                                                                    dataIndex: 'ton_cuoi_ky', 
                                                                    width: '20%', 
                                                                    align: 'right', 
                                                                    render: (v) => <Text type={v < 0 ? 'danger' : undefined} strong style={{ fontSize: '14px', color: v < 0 ? '#f5222d' : '#eb2f96' }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
                                                                },
                                                                { title: 'ĐVT', dataIndex: 'don_vi_tinh', width: '15%', align: 'center', render: (text) => <Tag color="magenta">{text}</Tag> }
                                                            ]}
                                                            dataSource={baoCaoData.data_ton_cuoi_ky?.sp || []}
                                                            rowKey="id_sp"
                                                            pagination={false}
                                                            size="small"
                                                            bordered
                                                        />
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </>
                                    )
                                }] : []),
                                ...(baoCaoData.data_dinh_muc ? [{
                                    key: '8',
                                    label: (
                                        <Tooltip title="Định mức sử dụng nguyên liệu cho từng sản phẩm - Dữ liệu tham chiếu">
                                            <Space>
                                                <CalculatorOutlined />
                                                Chi tiết: Định mức
                                                <Tag color="geekblue">Dữ liệu lưu trữ</Tag>
                                            </Space>
                                        </Tooltip>
                                    ),
                                    children: (
                                        <>
                                            <Title level={5} style={{ textAlign: 'center', padding: '16px 0', color: '#2f54eb' }}>
                                                📐 CHI TIẾT ĐỊNH MỨC SẢN XUẤT
                                            </Title>
                                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: '14px' }}>
                                                Định mức sử dụng nguyên liệu/vật tư cho mỗi đơn vị sản phẩm
                                            </Text>
                                            <Table
                                                columns={[
                                                    { title: 'Mã SP', dataIndex: 'ma_sp', width: '10%', render: (text) => <Text strong style={{ color: '#2f54eb' }}>{text}</Text> },
                                                    { title: 'Tên SP', dataIndex: 'ten_sp', width: '20%' },
                                                    { title: 'ĐVT SP', dataIndex: 'don_vi_tinh_sp', width: '8%', align: 'center', render: (text) => <Tag color="blue">{text}</Tag> },
                                                    { title: 'Mã NPL', dataIndex: 'ma_npl', width: '10%', render: (text) => <Text strong>{text}</Text> },
                                                    { title: 'Tên NPL', dataIndex: 'ten_npl', width: '25%' },
                                                    { title: 'ĐVT NPL', dataIndex: 'don_vi_tinh_npl', width: '8%', align: 'center', render: (text) => <Tag>{text}</Tag> },
                                                    { 
                                                        title: <Tooltip title="Lượng NPL cần dùng để sản xuất 1 đơn vị SP"><span>Định mức/1SP 📏</span></Tooltip>, 
                                                        dataIndex: 'luong_sd', 
                                                        width: '12%', 
                                                        align: 'right', 
                                                        render: (v) => <Text strong style={{ color: '#2f54eb', fontSize: '14px' }}>{v !== null && v !== undefined ? formatVNNumber(v) : ''}</Text>
                                                    },
                                                    { title: 'Ghi chú', dataIndex: 'ghi_chu', width: '7%' }
                                                ]}
                                                dataSource={baoCaoData.data_dinh_muc?.items || []}
                                                rowKey={(record, index) => `${record.id_sp}-${record.id_npl}-${index}`}
                                                pagination={false}
                                                size="small"
                                                bordered
                                                scroll={{ x: 'max-content' }}
                                            />
                                        </>
                                    )
                                }] : []),
                                ...(baoCaoData.data_doi_soat && (baoCaoData.data_doi_soat.npl?.length > 0 || baoCaoData.data_doi_soat.sp?.length > 0) ? [{
                                    key: '9',
                                    label: (
                                        <Tooltip title="Danh sách các cảnh báo và vấn đề cần xem xét trong quá trình đối soát">
                                            <Space>
                                                <WarningOutlined />
                                                Chi tiết: Đối soát & Cảnh báo
                                                <Tag color="warning">
                                                    {(baoCaoData.data_doi_soat.npl?.length || 0) + (baoCaoData.data_doi_soat.sp?.length || 0)} vấn đề
                                                </Tag>
                                            </Space>
                                        </Tooltip>
                                    ),
                                    children: (
                                        <>
                                            <Title level={5} style={{ textAlign: 'center', padding: '16px 0', color: '#faad14' }}>
                                                ⚠️ CHI TIẾT ĐỐI SOÁT - CÁC CẢNH BÁO
                                            </Title>
                                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: '14px' }}>
                                                Các mặt hàng có vấn đề cần xem xét và xử lý
                                            </Text>
                                            <Row gutter={[16, 16]}>
                                                {baoCaoData.data_doi_soat.npl && baoCaoData.data_doi_soat.npl.length > 0 && (
                                                    <Col xs={24} lg={12}>
                                                        <Card 
                                                            title={
                                                                <Space>
                                                                    <WarningOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                                                                    <span style={{ fontWeight: 600 }}>Cảnh báo NPL</span>
                                                                    <Tag color="warning">{baoCaoData.data_doi_soat.npl.length} vấn đề</Tag>
                                                                </Space>
                                                            } 
                                                            size="small"
                                                            style={{ borderColor: '#faad14', borderWidth: '2px', boxShadow: '0 2px 8px rgba(250, 173, 20, 0.15)' }}
                                                            headStyle={{ backgroundColor: '#fffbe6' }}
                                                        >
                                                            <Table
                                                                columns={[
                                                                    { title: 'Mã NPL', dataIndex: 'ma_npl', width: '20%', render: (text) => <Text strong>{text}</Text> },
                                                                    { title: 'Tên NPL', dataIndex: 'ten_npl', width: '35%' },
                                                                    { 
                                                                        title: 'Vấn đề', 
                                                                        dataIndex: 'ghi_chu', 
                                                                        width: '45%',
                                                                        render: (text) => (
                                                                            <Space>
                                                                                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                                                                                <Text type="warning" strong>{text}</Text>
                                                                            </Space>
                                                                        )
                                                                    }
                                                                ]}
                                                                dataSource={baoCaoData.data_doi_soat.npl}
                                                                rowKey="id_npl"
                                                                pagination={false}
                                                                size="small"
                                                                bordered
                                                            />
                                                        </Card>
                                                    </Col>
                                                )}
                                                {baoCaoData.data_doi_soat.sp && baoCaoData.data_doi_soat.sp.length > 0 && (
                                                    <Col xs={24} lg={12}>
                                                        <Card 
                                                            title={
                                                                <Space>
                                                                    <WarningOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
                                                                    <span style={{ fontWeight: 600 }}>Cảnh báo SP</span>
                                                                    <Tag color="orange">{baoCaoData.data_doi_soat.sp.length} vấn đề</Tag>
                                                                </Space>
                                                            } 
                                                            size="small"
                                                            style={{ borderColor: '#fa8c16', borderWidth: '2px', boxShadow: '0 2px 8px rgba(250, 140, 22, 0.15)' }}
                                                            headStyle={{ backgroundColor: '#fff7e6' }}
                                                        >
                                                            <Table
                                                                columns={[
                                                                    { title: 'Mã SP', dataIndex: 'ma_sp', width: '20%', render: (text) => <Text strong>{text}</Text> },
                                                                    { title: 'Tên SP', dataIndex: 'ten_sp', width: '35%' },
                                                                    { 
                                                                        title: 'Vấn đề', 
                                                                        dataIndex: 'ghi_chu', 
                                                                        width: '45%',
                                                                        render: (text) => (
                                                                            <Space>
                                                                                <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                                                                                <Text type="warning" strong>{text}</Text>
                                                                            </Space>
                                                                        )
                                                                    }
                                                                ]}
                                                                dataSource={baoCaoData.data_doi_soat.sp}
                                                                rowKey="id_sp"
                                                                pagination={false}
                                                                size="small"
                                                                bordered
                                                            />
                                                        </Card>
                                                    </Col>
                                                )}
                                            </Row>
                                        </>
                                    )
                                }] : [])
                            ]}
                        />
                    </div>
                </Card>
            </Spin>
        );
    }

    // Step 1: Form tạo báo cáo mới
    return (
        <Spin spinning={loading} tip="Đang tải...">
            <Card style={{ marginBottom: 24 }}>
                <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>Tạo Báo cáo Quyết toán mới</Title>
                <Form form={form} layout="vertical" onFinish={handleCalculate}>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item 
                                name="id_hd" 
                                label="Chọn Hợp đồng cần thanh khoản" 
                                rules={[{ required: true, message: 'Vui lòng chọn hợp đồng!' }]}
                            >
                                <Select 
                                    placeholder="Chọn hợp đồng"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {hopDongList.map(hd => (
                                        <Option key={hd.id_hd} value={hd.id_hd}>{hd.so_hd}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item 
                                name="ky_bao_cao" 
                                label="Chọn Kỳ báo cáo (Từ ngày - Đến ngày)" 
                                rules={[{ required: true, message: 'Vui lòng chọn kỳ báo cáo!' }]}
                            >
                                <RangePicker 
                                    style={{ width: '100%' }} 
                                    format="DD/MM/YYYY"
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<CalculatorOutlined />} 
                            size="large"
                            style={{ width: '100%' }}
                        >
                            Thực hiện Tính toán
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Lịch sử các Báo cáo đã tạo">
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={8}>
                        <Input
                            placeholder="Tìm theo số HĐ hoặc tên DN..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={handleSearch}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Select
                            placeholder="Lọc theo kết luận"
                            allowClear
                            style={{ width: '100%' }}
                            value={filterKetLuan}
                            onChange={(value) => setFilterKetLuan(value)}
                        >
                            <Option value="HopLe">Hợp lệ</Option>
                            <Option value="CanhBao">Cảnh báo</Option>
                            <Option value="ViPham">Vi phạm</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={4}>
                        <Button icon={<SearchOutlined />} onClick={handleSearch}>Tìm kiếm</Button>
                    </Col>
                </Row>
                <Table 
                    columns={savedReportsColumns} 
                    dataSource={savedReports} 
                    rowKey="id_bc"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} báo cáo`
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                    style={{ width: '100%' }}
                />
            </Card>
        </Spin>
    );
};

export default ThanhKhoan;
