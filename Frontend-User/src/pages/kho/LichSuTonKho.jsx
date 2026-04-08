import { useState, useEffect } from "react";
import { 
    Table, Select, Space, Row, Col, Typography, Card, Tabs, Tag, 
    DatePicker, Button, Empty, Statistic, Alert 
} from "antd";
import { 
    InboxOutlined, ShoppingOutlined, SearchOutlined, 
    HistoryOutlined, RiseOutlined, FallOutlined, StockOutlined,
    LineChartOutlined 
} from "@ant-design/icons";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    Legend, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import dayjs from "dayjs";
import khoService from "../../services/kho.service";
import lichSuTonKhoService from "../../services/lichsutonkho.service";
import { showLoadError } from "../../components/notification";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Format số theo kiểu Việt Nam
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '0';
    return Number(value).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
};

const LichSuTonKho = () => {
    const [khoList, setKhoList] = useState([]);
    const [selectedKhoId, setSelectedKhoId] = useState(null);
    const [lichSuNPL, 
setLichSuNPL] = useState([]);
    const [lichSuSP, setLichSuSP] = useState([]);
    const [loadingKho, setLoadingKho] = useState(false);
    const [loadingNPL, setLoadingNPL] = useState(false);
    const [loadingSP, setLoadingSP] = useState(false);
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);

    // Load danh sách kho
    useEffect(() => {
        const fetchKho = async () => {
            setLoadingKho(true);
            try {
                const res = await khoService.getAllKho();
                setKhoList(res.data || []);
            } catch {
                showLoadError('danh sách kho');
            } finally {
                setLoadingKho(false);
            }
        };
        fetchKho();
    }, []);

    // Load lịch sử tồn kho khi chọn kho hoặc thay đổi date range
    useEffect(() => {
        if (selectedKhoId && dateRange && dateRange[0] && dateRange[1]) {
            fetchLichSuTonKho();
        }
    }, [selectedKhoId, dateRange]);

    const fetchLichSuTonKho = async () => {
        if (!selectedKhoId || !dateRange || !dateRange[0] || !dateRange[1]) return;

        setLoadingNPL(true);
        setLoadingSP(true);

        try {
            const filters = {
                id_kho: selectedKhoId,
                tu_ngay: dateRange[0].format('YYYY-MM-DD'),
                den_ngay: dateRange[1].format('YYYY-MM-DD')
            };

            const res = await lichSuTonKhoService.getAll(filters);
            
            // Phân loại data theo NPL và SP
            const dataArray = res.data || res || [];
            const nplData = dataArray.filter(item => item.id_npl);
            const spData = dataArray.filter(item => item.id_sp);
            
            setLichSuNPL(nplData);
            setLichSuSP(spData);
        } catch (error) {
            showLoadError('lịch sử tồn kho');
            setLichSuNPL([]);
            setLichSuSP([]);
        } finally {
            setLoadingNPL(false);
            setLoadingSP(false);
        }
    };

    const handleKhoChange = (id_kho) => {
        setSelectedKhoId(id_kho);
        if (!id_kho) {
            setLichSuNPL([]);
            setLichSuSP([]);
        }
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    // Tính toán thống kê cho NPL
    const statsNPL = {
        totalRecords: lichSuNPL.length,
        totalNhap: lichSuNPL.reduce((sum, item) => sum + Number(item.nhap_trong_ky || 0), 0),
        totalXuat: lichSuNPL.reduce((sum, item) => sum + Number(item.xuat_trong_ky || 0), 0),
        totalTonCuoi: lichSuNPL.reduce((sum, item) => sum + Number(item.ton_cuoi_ky || 0), 0)
    };

    // Tính toán thống kê cho SP
    const statsSP = {
        totalRecords: lichSuSP.length,
        totalNhap: lichSuSP.reduce((sum, item) => sum + Number(item.nhap_trong_ky || 0), 0),
        totalXuat: lichSuSP.reduce((sum, item) => sum + Number(item.xuat_trong_ky || 0), 0),
        totalTonCuoi: lichSuSP.reduce((sum, item) => sum + Number(item.ton_cuoi_ky || 0), 0)
    };

    // Columns cho bảng NPL
    const columnsNPL = [
        {
            title: 'Mã NPL',
            key: 'id_npl',
            width: 100,
            render: (_, record) => record.nguyenPhuLieu?.id_npl || record.id_npl || 'N/A'
        },
        {
            title: 'Tên Nguyên Phụ Liệu',
            key: 'ten_npl',
            width: 200,
            render: (_, record) => record.nguyenPhuLieu?.ten_npl || 'N/A'
        },
        {
            title: 'Kỳ',
            key: 'period',
            width: 200,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(record.tu_ngay).format('DD/MM/YYYY')} - {dayjs(record.den_ngay).format('DD/MM/YYYY')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        Khóa sổ: {dayjs(record.ngay_khoa_so).format('DD/MM/YYYY HH:mm')}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Tồn đầu kỳ',
            dataIndex: 'ton_dau_ky',
            key: 'ton_dau_ky',
            width: 120,
            align: 'right',
            render: (value) => <Text>{formatVNNumber(value)}</Text>
        },
        {
            title: 'Nhập trong kỳ',
            dataIndex: 'nhap_trong_ky',
            key: 'nhap_trong_ky',
            width: 130,
            align: 'right',
            render: (value) => (
                <Text style={{ color: '#52c41a' }}>
                    <RiseOutlined /> {formatVNNumber(value)}
                </Text>
            )
        },
        {
            title: 'Xuất trong kỳ',
            dataIndex: 'xuat_trong_ky',
            key: 'xuat_trong_ky',
            width: 130,
            align: 'right',
            render: (value) => (
                <Text style={{ color: '#ff4d4f' }}>
                    <FallOutlined /> {formatVNNumber(value)}
                </Text>
            )
        },
        {
            title: 'Tồn cuối kỳ',
            dataIndex: 'ton_cuoi_ky',
            key: 'ton_cuoi_ky',
            width: 120,
            align: 'right',
            render: (value) => {
                const num = Number(value) || 0;
                return (
                    <Text strong style={{ color: num <= 0 ? '#ff4d4f' : num < 100 ? '#faad14' : '#1890ff' }}>
                        {formatVNNumber(value)}
                    </Text>
                );
            }
        },
        {
            title: 'ĐVT',
            key: 'dvt',
            width: 80,
            render: (_, record) => record.donViTinh?.ten_dvt || 'N/A'
        },
        {
            title: 'Biến động',
            key: 'change',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const change = Number(record.ton_cuoi_ky || 0) - Number(record.ton_dau_ky || 0);
                if (change > 0) {
                    return <Tag color="success">+{formatVNNumber(change)}</Tag>;
                } else if (change < 0) {
                    return <Tag color="error">{formatVNNumber(change)}</Tag>;
                }
                return <Tag>0</Tag>;
            }
        }
    ];

    // Columns cho bảng SP
    const columnsSP = [
        {
            title: 'Mã SP',
            key: 'id_sp',
            width: 100,
            render: (_, record) => record.sanPham?.id_sp || record.id_sp || 'N/A'
        },
        {
            title: 'Tên Sản Phẩm',
            key: 'ten_sp',
            width: 200,
            render: (_, record) => record.sanPham?.ten_sp || 'N/A'
        },
        {
            title: 'Kỳ',
            key: 'period',
            width: 200,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(record.tu_ngay).format('DD/MM/YYYY')} - {dayjs(record.den_ngay).format('DD/MM/YYYY')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        Khóa sổ: {dayjs(record.ngay_khoa_so).format('DD/MM/YYYY HH:mm')}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Tồn đầu kỳ',
            dataIndex: 'ton_dau_ky',
            key: 'ton_dau_ky',
            width: 120,
            align: 'right',
            render: (value) => <Text>{formatVNNumber(value)}</Text>
        },
        {
            title: 'Nhập trong kỳ',
            dataIndex: 'nhap_trong_ky',
            key: 'nhap_trong_ky',
            width: 130,
            align: 'right',
            render: (value) => (
                <Text style={{ color: '#52c41a' }}>
                    <RiseOutlined /> {formatVNNumber(value)}
                </Text>
            )
        },
        {
            title: 'Xuất trong kỳ',
            dataIndex: 'xuat_trong_ky',
            key: 'xuat_trong_ky',
            width: 130,
            align: 'right',
            render: (value) => (
                <Text style={{ color: '#ff4d4f' }}>
                    <FallOutlined /> {formatVNNumber(value)}
                </Text>
            )
        },
        {
            title: 'Tồn cuối kỳ',
            dataIndex: 'ton_cuoi_ky',
            key: 'ton_cuoi_ky',
            width: 120,
            align: 'right',
            render: (value) => {
                const num = Number(value) || 0;
                return (
                    <Text strong style={{ color: num <= 0 ? '#ff4d4f' : num < 100 ? '#faad14' : '#1890ff' }}>
                        {formatVNNumber(value)}
                    </Text>
                );
            }
        },
        {
            title: 'ĐVT',
            key: 'dvt',
            width: 80,
            render: (_, record) => record.donViTinh?.ten_dvt || 'N/A'
        },
        {
            title: 'Biến động',
            key: 'change',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const change = Number(record.ton_cuoi_ky || 0) - Number(record.ton_dau_ky || 0);
                if (change > 0) {
                    return <Tag color="success">+{formatVNNumber(change)}</Tag>;
                } else if (change < 0) {
                    return <Tag color="error">{formatVNNumber(change)}</Tag>;
                }
                return <Tag>0</Tag>;
            }
        }
    ];

    const selectedKho = khoList.find(k => k.id_kho === selectedKhoId);

    // Prepare chart data for NPL
    const prepareChartDataNPL = () => {
        return lichSuNPL.map(item => ({
            name: `${dayjs(item.tu_ngay).format('DD/MM')} - ${dayjs(item.den_ngay).format('DD/MM')}`,
            fullDate: `${dayjs(item.tu_ngay).format('DD/MM/YYYY')} - ${dayjs(item.den_ngay).format('DD/MM/YYYY')}`,
            npl: item.nguyenPhuLieu?.ten_npl || 'N/A',
            tonDauKy: Number(item.ton_dau_ky || 0),
            nhapTrongKy: Number(item.nhap_trong_ky || 0),
            xuatTrongKy: Number(item.xuat_trong_ky || 0),
            tonCuoiKy: Number(item.ton_cuoi_ky || 0)
        }));
    };

    // Prepare chart data for SP
    const prepareChartDataSP = () => {
        return lichSuSP.map(item => ({
            name: `${dayjs(item.tu_ngay).format('DD/MM')} - ${dayjs(item.den_ngay).format('DD/MM')}`,
            fullDate: `${dayjs(item.tu_ngay).format('DD/MM/YYYY')} - ${dayjs(item.den_ngay).format('DD/MM/YYYY')}`,
            sp: item.sanPham?.ten_sp || 'N/A',
            tonDauKy: Number(item.ton_dau_ky || 0),
            nhapTrongKy: Number(item.nhap_trong_ky || 0),
            xuatTrongKy: Number(item.xuat_trong_ky || 0),
            tonCuoiKy: Number(item.ton_cuoi_ky || 0)
        }));
    };

    // Custom tooltip for chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Card size="small" style={{ minWidth: 200 }}>
                    <Text strong>{payload[0]?.payload?.fullDate || label}</Text>
                    {payload[0]?.payload?.npl && (
                        <div><Text type="secondary">NPL: {payload[0].payload.npl}</Text></div>
                    )}
                    {payload[0]?.payload?.sp && (
                        <div><Text type="secondary">SP: {payload[0].payload.sp}</Text></div>
                    )}
                    <div style={{ marginTop: 8 }}>
                        {payload.map((entry, index) => (
                            <div key={index} style={{ color: entry.color }}>
                                <Text style={{ color: entry.color }}>
                                    {entry.name}: {formatVNNumber(entry.value)}
                                </Text>
                            </div>
                        ))}
                    </div>
                </Card>
            );
        }
        return null;
    };

    const tabItems = [
        {
            key: 'npl',
            label: (
                <span>
                    <InboxOutlined /> Nguyên Phụ Liệu ({lichSuNPL.length})
                </span>
            ),
            children: (
                <>
                    {lichSuNPL.length > 0 && (
                        <>
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={6}>
                                    <Card size="small">
                                        <Statistic
                                            title="Tổng số bản ghi"
                                            value={statsNPL.totalRecords}
                                            prefix={<HistoryOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card size="small">
                                        <Statistic
                                            title="Tổng nhập"
                                            value={formatVNNumber(statsNPL.totalNhap)}
                                            valueStyle={{ color: '#52c41a' }}
                                            prefix={<RiseOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card size="small">
                                        <Statistic
                                            title="Tổng xuất"
                                            value={formatVNNumber(statsNPL.totalXuat)}
                                            valueStyle={{ color: '#ff4d4f' }}
                                            prefix={<FallOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card size="small">
                                        <Statistic
                                            title="Tổng tồn cuối kỳ"
                                            value={formatVNNumber(statsNPL.totalTonCuoi)}
                                            valueStyle={{ color: '#1890ff' }}
                                            prefix={<StockOutlined />}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            <Card 
                                size="small" 
                                title={
                                    <Space>
                                        <LineChartOutlined />
                                        <Text strong>Biểu đồ biến động tồn kho NPL</Text>
                                    </Space>
                                }
                                style={{ marginBottom: 16 }}
                            >
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={prepareChartDataNPL()}>
                                        <defs>
                                            <linearGradient id="colorTonDau" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorNhap" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorXuat" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorTonCuoi" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Area 
                                            type="monotone" 
                                            dataKey="tonDauKy" 
                                            stroke="#8884d8" 
                                            fillOpacity={1}
                                            fill="url(#colorTonDau)"
                                            name="Tồn đầu kỳ"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="nhapTrongKy" 
                                            stroke="#52c41a" 
                                            fillOpacity={1}
                                            fill="url(#colorNhap)"
                                            name="Nhập trong kỳ"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="xuatTrongKy" 
                                            stroke="#ff4d4f" 
                                            fillOpacity={1}
                                            fill="url(#colorXuat)"
                                            name="Xuất trong kỳ"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="tonCuoiKy" 
                                            stroke="#1890ff" 
                                            fillOpacity={1}
                                            fill="url(#colorTonCuoi)"
                                            name="Tồn cuối kỳ"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </>
                    )}
                    <Table
                        columns={columnsNPL}
                        dataSource={lichSuNPL}
                        rowKey="id"
                        loading={loadingNPL}
                        pagination={{ 
                            pageSize: 10, 
                            showSizeChanger: true, 
                            showTotal: (total) => `Tổng ${total} bản ghi` 
                        }}
                        locale={{ emptyText: <Empty description="Chưa có dữ liệu lịch sử tồn kho NPL" /> }}
                        scroll={{ x: 1200 }}
                    />
                </>
            )
        },
        {
            key: 'sp',
            label: (
                <span>
                    <ShoppingOutlined /> Sản Phẩm ({lichSuSP.length})
                </span>
            ),
            children: (
                <>
                    {lichSuSP.length > 0 && (
                        <>
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={6}>
                                    <Card size="small">
                                        <Statistic
                                            title="Tổng số bản ghi"
                                            value={statsSP.totalRecords}
                                            prefix={<HistoryOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card size="small">
                                        <Statistic
                                            title="Tổng nhập"
                                            value={formatVNNumber(statsSP.totalNhap)}
                                            valueStyle={{ color: '#52c41a' }}
                                            prefix={<RiseOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card size="small">
                                        <Statistic
                                            title="Tổng xuất"
                                            value={formatVNNumber(statsSP.totalXuat)}
                                            valueStyle={{ color: '#ff4d4f' }}
                                            prefix={<FallOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card size="small">
                                        <Statistic
                                            title="Tổng tồn cuối kỳ"
                                            value={formatVNNumber(statsSP.totalTonCuoi)}
                                            valueStyle={{ color: '#1890ff' }}
                                            prefix={<StockOutlined />}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            <Card 
                                size="small" 
                                title={
                                    <Space>
                                        <LineChartOutlined />
                                        <Text strong>Biểu đồ biến động tồn kho Sản Phẩm</Text>
                                    </Space>
                                }
                                style={{ marginBottom: 16 }}
                            >
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={prepareChartDataSP()}>
                                        <defs>
                                            <linearGradient id="colorTonDauSP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorNhapSP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorXuatSP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorTonCuoiSP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Area 
                                            type="monotone" 
                                            dataKey="tonDauKy" 
                                            stroke="#8884d8" 
                                            fillOpacity={1}
                                            fill="url(#colorTonDauSP)"
                                            name="Tồn đầu kỳ"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="nhapTrongKy" 
                                            stroke="#52c41a" 
                                            fillOpacity={1}
                                            fill="url(#colorNhapSP)"
                                            name="Nhập trong kỳ"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="xuatTrongKy" 
                                            stroke="#ff4d4f" 
                                            fillOpacity={1}
                                            fill="url(#colorXuatSP)"
                                            name="Xuất trong kỳ"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="tonCuoiKy" 
                                            stroke="#1890ff" 
                                            fillOpacity={1}
                                            fill="url(#colorTonCuoiSP)"
                                            name="Tồn cuối kỳ"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </>
                    )}
                    <Table
                        columns={columnsSP}
                        dataSource={lichSuSP}
                        rowKey="id"
                        loading={loadingSP}
                        pagination={{ 
                            pageSize: 10, 
                            showSizeChanger: true, 
                            showTotal: (total) => `Tổng ${total} bản ghi` 
                        }}
                        locale={{ emptyText: <Empty description="Chưa có dữ liệu lịch sử tồn kho sản phẩm" /> }}
                        scroll={{ x: 1200 }}
                    />
                </>
            )
        }
    ];

    return (
        <>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} className="page-header-heading">
                        <HistoryOutlined /> Lịch Sử Tồn Kho
                    </Title>
                </Col>
            </Row>

            <Card variant="borderless" className="content-card" style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col>
                        <Text strong>Chọn kho:</Text>
                    </Col>
                    <Col flex="auto">
                        <Select
                            placeholder="-- Chọn kho để xem lịch sử --"
                            style={{ width: 280 }}
                            onChange={handleKhoChange}
                            value={selectedKhoId}
                            loading={loadingKho}
                            allowClear
                        >
                            {khoList.map(k => (
                                <Option key={k.id_kho} value={k.id_kho}>{k.ten_kho}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <Text strong>Khoảng thời gian:</Text>
                    </Col>
                    <Col>
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            format="DD/MM/YYYY"
                            style={{ width: 280 }}
                            disabled={!selectedKhoId}
                        />
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={fetchLichSuTonKho}
                            disabled={!selectedKhoId || !dateRange}
                            loading={loadingNPL || loadingSP}
                        >
                            Tìm kiếm
                        </Button>
                    </Col>
                </Row>
            </Card>

            {!selectedKhoId ? (
                <Card variant="borderless" className="content-card">
                    <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Vui lòng chọn kho và khoảng thời gian để xem lịch sử tồn kho"
                    />
                </Card>
            ) : (
                <Card 
                    variant="borderless" 
                    className="content-card"
                    title={
                        <Space>
                            <Text strong>Lịch sử tồn kho tại: {selectedKho?.ten_kho || ''}</Text>
                            {dateRange && dateRange[0] && dateRange[1] && (
                                <Tag color="blue">
                                    {dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')}
                                </Tag>
                            )}
                        </Space>
                    }
                    extra={selectedKho?.dia_chi && <Text type="secondary">{selectedKho.dia_chi}</Text>}
                >
                    {(lichSuNPL.length === 0 && lichSuSP.length === 0 && !loadingNPL && !loadingSP) && (
                        <Alert
                            message="Không có dữ liệu"
                            description="Không tìm thấy lịch sử tồn kho trong khoảng thời gian đã chọn. Vui lòng thử khoảng thời gian khác."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}
                    <Tabs items={tabItems} defaultActiveKey="npl" />
                </Card>
            )}
        </>
    );
};

export default LichSuTonKho;
