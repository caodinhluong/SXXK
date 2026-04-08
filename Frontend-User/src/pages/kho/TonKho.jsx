import { useState, useEffect } from "react";
import { Table, Select, Space, Row, Col, Typography, Card, Tabs, Tag, Input, Empty } from "antd";
import { InboxOutlined, ShoppingOutlined, SearchOutlined } from "@ant-design/icons";
import khoService from "../../services/kho.service";
import { showLoadError } from "../../components/notification";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// Format số theo kiểu Việt Nam
const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '0';
    return Number(value).toLocaleString('vi-VN');
};

const TonKho = () => {
    const [khoList, setKhoList] = useState([]);
    const [selectedKhoId, setSelectedKhoId] = useState(null);
    const [tonKhoNPL, setTonKhoNPL] = useState([]);
    const [tonKhoSP, setTonKhoSP] = useState([]);
    const [loadingKho, setLoadingKho] = useState(false);
    const [loadingNPL, setLoadingNPL] = useState(false);
    const [loadingSP, setLoadingSP] = useState(false);
    const [searchNPL, setSearchNPL] = useState("");
    const [searchSP, setSearchSP] = useState("");

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

    // Load tồn kho khi chọn kho
    const handleKhoChange = async (id_kho) => {
        setSelectedKhoId(id_kho);
        setSearchNPL("");
        setSearchSP("");
        
        if (!id_kho) {
            setTonKhoNPL([]);
            setTonKhoSP([]);
            return;
        }

        // Load song song cả NPL và SP
        setLoadingNPL(true);
        setLoadingSP(true);
        
        try {
            const [resNPL, resSP] = await Promise.all([
                khoService.getTonKhoNPLByKho(id_kho),
                khoService.getTonKhoSPByKho(id_kho)
            ]);
            setTonKhoNPL(resNPL.data || []);
            setTonKhoSP(resSP.data || []);
        } catch {
            showLoadError('tồn kho');
        } finally {
            setLoadingNPL(false);
            setLoadingSP(false);
        }
    };

    // Filter data theo search - hỗ trợ cả 2 cấu trúc data
    const filteredNPL = tonKhoNPL.filter(item => {
        const tenNPL = item.nguyenPhuLieu?.ten_npl || item.ten_npl || '';
        return !searchNPL || tenNPL.toLowerCase().includes(searchNPL.toLowerCase());
    });
    
    const filteredSP = tonKhoSP.filter(item => {
        const tenSP = item.sanPham?.ten_sp || item.ten_sp || '';
        return !searchSP || tenSP.toLowerCase().includes(searchSP.toLowerCase());
    });

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
            sorter: (a, b) => {
                const tenA = a.nguyenPhuLieu?.ten_npl || a.ten_npl || '';
                const tenB = b.nguyenPhuLieu?.ten_npl || b.ten_npl || '';
                return tenA.localeCompare(tenB);
            },
            render: (_, record) => record.nguyenPhuLieu?.ten_npl || record.ten_npl || 'N/A'
        },
        {
            title: 'ĐVT Hải quan',
            key: 'dvt_hq',
            width: 120,
            render: (_, record) => record.nguyenPhuLieu?.donViTinhHQ?.ten_dvt || record.don_vi || record.ten_dvt || 'N/A'
        },
        {
            title: 'Số lượng tồn (HQ)',
            dataIndex: 'so_luong_ton',
            key: 'so_luong_ton',
            width: 150,
            align: 'right',
            sorter: (a, b) => Number(a.so_luong_ton) - Number(b.so_luong_ton),
            render: (value) => {
                const num = Number(value) || 0;
                return (
                    <Text strong style={{ color: num <= 0 ? '#ff4d4f' : num < 100 ? '#faad14' : '#52c41a' }}>
                        {formatVNNumber(num)}
                    </Text>
                );
            }
        },
        {
            title: 'ĐVT Doanh nghiệp',
            key: 'dvt_dn',
            width: 140,
            render: (_, record) => {
                const dvtDN = record.nguyenPhuLieu?.quyDoiDN?.ten_dvt;
                return dvtDN ? <Text type="success">{dvtDN}</Text> : <Text type="secondary">-</Text>;
            }
        },
        {
            title: 'Số lượng tồn (DN)',
            key: 'so_luong_ton_dn',
            width: 150,
            align: 'right',
            render: (_, record) => {
                const soLuongHQ = Number(record.so_luong_ton) || 0;
                const heSo = record.nguyenPhuLieu?.quyDoiDN?.he_so;
                
                if (!heSo) {
                    return <Text type="secondary">-</Text>;
                }
                
                const soLuongDN = soLuongHQ / Number(heSo);
                return (
                    <Text strong style={{ color: soLuongDN <= 0 ? '#ff4d4f' : soLuongDN < 100 ? '#faad14' : '#52c41a' }}>
                        {formatVNNumber(soLuongDN.toFixed(2))}
                    </Text>
                );
            }
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const num = Number(record.so_luong_ton) || 0;
                if (num <= 0) return <Tag color="error">Hết hàng</Tag>;
                if (num < 100) return <Tag color="warning">Sắp hết</Tag>;
                return <Tag color="success">Còn hàng</Tag>;
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
            sorter: (a, b) => {
                const tenA = a.sanPham?.ten_sp || a.ten_sp || '';
                const tenB = b.sanPham?.ten_sp || b.ten_sp || '';
                return tenA.localeCompare(tenB);
            },
            render: (_, record) => record.sanPham?.ten_sp || record.ten_sp || 'N/A'
        },
        {
            title: 'ĐVT Hải quan',
            key: 'dvt_hq',
            width: 120,
            render: (_, record) => record.sanPham?.donViTinhHQ?.ten_dvt || record.don_vi || record.ten_dvt || 'N/A'
        },
        {
            title: 'Số lượng tồn (HQ)',
            dataIndex: 'so_luong_ton',
            key: 'so_luong_ton',
            width: 150,
            align: 'right',
            sorter: (a, b) => Number(a.so_luong_ton) - Number(b.so_luong_ton),
            render: (value) => {
                const num = Number(value) || 0;
                return (
                    <Text strong style={{ color: num <= 0 ? '#ff4d4f' : num < 100 ? '#faad14' : '#52c41a' }}>
                        {formatVNNumber(num)}
                    </Text>
                );
            }
        },
        {
            title: 'ĐVT Doanh nghiệp',
            key: 'dvt_dn',
            width: 140,
            render: (_, record) => {
                const dvtDN = record.sanPham?.quyDoiDN?.ten_dvt;
                return dvtDN ? <Text type="success">{dvtDN}</Text> : <Text type="secondary">-</Text>;
            }
        },
        {
            title: 'Số lượng tồn (DN)',
            key: 'so_luong_ton_dn',
            width: 150,
            align: 'right',
            render: (_, record) => {
                const soLuongHQ = Number(record.so_luong_ton) || 0;
                const heSo = record.sanPham?.quyDoiDN?.he_so;
                
                if (!heSo) {
                    return <Text type="secondary">-</Text>;
                }
                
                const soLuongDN = soLuongHQ / Number(heSo);
                return (
                    <Text strong style={{ color: soLuongDN <= 0 ? '#ff4d4f' : soLuongDN < 100 ? '#faad14' : '#52c41a' }}>
                        {formatVNNumber(soLuongDN.toFixed(2))}
                    </Text>
                );
            }
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const num = Number(record.so_luong_ton) || 0;
                if (num <= 0) return <Tag color="error">Hết hàng</Tag>;
                if (num < 100) return <Tag color="warning">Sắp hết</Tag>;
                return <Tag color="success">Còn hàng</Tag>;
            }
        }
    ];

    const selectedKho = khoList.find(k => k.id_kho === selectedKhoId);

    const tabItems = [
        {
            key: 'npl',
            label: (
                <span>
                    <InboxOutlined /> Nguyên Phụ Liệu ({filteredNPL.length})
                </span>
            ),
            children: (
                <>
                    <Row style={{ marginBottom: 16 }}>
                        <Col>
                            <Search
                                placeholder="Tìm kiếm NPL..."
                                allowClear
                                enterButton={<SearchOutlined />}
                                style={{ width: 300 }}
                                value={searchNPL}
                                onChange={(e) => setSearchNPL(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Table
                        columns={columnsNPL}
                        dataSource={filteredNPL}
                        rowKey="id"
                        loading={loadingNPL}
                        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} NPL` }}
                        locale={{ emptyText: <Empty description="Chưa có dữ liệu tồn kho NPL" /> }}
                    />
                </>
            )
        },
        {
            key: 'sp',
            label: (
                <span>
                    <ShoppingOutlined /> Sản Phẩm ({filteredSP.length})
                </span>
            ),
            children: (
                <>
                    <Row style={{ marginBottom: 16 }}>
                        <Col>
                            <Search
                                placeholder="Tìm kiếm sản phẩm..."
                                allowClear
                                enterButton={<SearchOutlined />}
                                style={{ width: 300 }}
                                value={searchSP}
                                onChange={(e) => setSearchSP(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Table
                        columns={columnsSP}
                        dataSource={filteredSP}
                        rowKey="id"
                        loading={loadingSP}
                        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} sản phẩm` }}
                        locale={{ emptyText: <Empty description="Chưa có dữ liệu tồn kho sản phẩm" /> }}
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
                        Theo dõi Tồn Kho
                    </Title>
                </Col>
                <Col>
                    <Space>
                        <Text>Chọn kho:</Text>
                        <Select
                            placeholder="-- Chọn kho để xem tồn --"
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
                    </Space>
                </Col>
            </Row>

            {selectedKhoId ? (
                <Card 
                    variant="borderless" 
                    className="content-card"
                    title={`Tồn kho tại: ${selectedKho?.ten_kho || ''}`}
                    extra={<Text type="secondary">{selectedKho?.dia_chi}</Text>}
                >
                    <Tabs items={tabItems} defaultActiveKey="npl" />
                </Card>
            ) : (
                <Card variant="borderless" className="content-card">
                    <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Vui lòng chọn kho để xem tồn kho"
                    />
                </Card>
            )}
        </>
    );
};

export default TonKho;
