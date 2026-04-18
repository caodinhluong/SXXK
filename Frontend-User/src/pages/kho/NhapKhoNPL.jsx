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
    Row,
    Col,
    Card,
    Drawer,
    Space,
    Descriptions,
    Popconfirm,
} from "antd";
import { UploadOutlined, CheckCircleOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { uploadSingleFile } from "../../services/upload.service";
import { getAllHoaDonNhap, getHoaDonNhapById } from "../../services/hoadonnhap.service";
import { getAllKho } from "../../services/kho.service";
import { getAllNhapKhoNPL, createNhapKhoNPL, updateNhapKhoNPL, deleteNhapKhoNPL, getSoLuongCoTheNhap } from "../../services/nhapkhonpl.service";
import { getQuyDoiListNPL, calculateNPL_DN_to_HQ } from "../../services/quyDoiHelper.service";
import { 
    showCreateSuccess,
    showUpdateSuccess,
    showDeleteSuccess, 
    showLoadError, 
    showSaveError,
    showUploadSuccess,
    showUploadError,
    showWarning
} from "../../components/notification";
import { extractErrorMessage } from "../../utils/errorHandler";

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

const NhapKhoNPL = () => {
    const [form] = Form.useForm();

    // Dữ liệu
    const [hoaDonNhapList, setHoaDonNhapList] = useState([]);
    const [chiTietNhap, setChiTietNhap] = useState([]);
    const [khoList, setKhoList] = useState([]);

    // Upload file
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
            const data = await getAllNhapKhoNPL();
            setLichSuPhieu(data || []);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError('danh sách lịch sử phiếu nhập kho NPL', errorMsg);
        } finally {
            setLoadingLichSu(false);
        }
    };

    /* ============================================================
       🟢 LẤY DỮ LIỆU BAN ĐẦU
    ============================================================ */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resHDN, resKho] = await Promise.all([
                    getAllHoaDonNhap(),
                    getAllKho(),
                ]);
                setHoaDonNhapList(resHDN || []);
                // getAllKho trả về { data: [...] }, cần lấy resKho.data
                setKhoList(resKho?.data || []);
            } catch (error) {
                const errorMsg = extractErrorMessage(error);
                showLoadError('danh sách hóa đơn nhập và kho', errorMsg);
            }
        };
        fetchData();
        fetchLichSu(); // Gọi lấy lịch sử phiếu nhập
    }, []);

    /* ============================================================
       🟢 KHI CHỌN HÓA ĐƠN NHẬP
    ============================================================ */
    const handleHoaDonChange = async (id_hd_nhap) => {
        try {
            const res = await getHoaDonNhapById(id_hd_nhap);
            console.log("Chi tiết HĐN:", res);

            // Lấy data từ response (có thể là res.data hoặc res trực tiếp)
            const hoaDonData = res?.data || res;
            const chiTiets = hoaDonData?.chiTiets || [];

            // 🆕 Lấy số lượng có thể nhập
            const soLuongCoTheNhap = await getSoLuongCoTheNhap(id_hd_nhap);
            console.log("Số lượng có thể nhập:", soLuongCoTheNhap);

            // Load chi tiết và quy đổi cho từng NPL
            const chiTietPromises = chiTiets.map(async (item, index) => {
                const id_npl = item.nguyenPhuLieu?.id_npl || item.id_npl;
                
                // Tìm thông tin số lượng có thể nhập
                const nplInfo = soLuongCoTheNhap.find(info => info.id_npl === id_npl);
                
                // Load danh sách quy đổi cho NPL này
                let quyDoiList = [];
                try {
                    quyDoiList = await getQuyDoiListNPL(id_npl);
                } catch (err) {
                    console.log(`NPL ${id_npl} không có quy đổi`, err);
                }

                return {
                    key: index + 1,
                    id_npl,
                    ten_npl: item.nguyenPhuLieu?.ten_npl || item.ten_npl || 'N/A',
                    so_luong_hd: item.so_luong,
                    so_luong_dn: nplInfo?.co_the_nhap || 0, // Mặc định = số lượng có thể nhập
                    so_luong_hq: nplInfo?.co_the_nhap || 0,
                    co_the_nhap: nplInfo?.co_the_nhap || 0, // 🆕 Số lượng tối đa có thể nhập
                    da_nhap: nplInfo?.da_nhap || 0, // 🆕 Số lượng đã nhập trước đó
                    quyDoiList: quyDoiList,
                    id_qd: null,
                    ten_dvt_dn: null,
                    ten_dvt_hq: null
                };
            });

            const chiTiet = await Promise.all(chiTietPromises);
            
            console.log("Chi tiết NPL đã xử lý:", chiTiet);
            setChiTietNhap(chiTiet);
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showLoadError('chi tiết hóa đơn nhập', errorMsg);
        }
    };

    /* ============================================================
       🟢 CHỌN ĐƠN VỊ QUY ĐỔI
    ============================================================ */
    const handleQuyDoiChange = async (key, id_qd) => {
        const item = chiTietNhap.find(ct => ct.key === key);
        if (!item) return;

        // Nếu bỏ chọn (clear), reset về trạng thái không có quy đổi
        if (!id_qd) {
            setChiTietNhap((prev) =>
                prev.map((ct) => {
                    if (ct.key === key) {
                        return {
                            ...ct,
                            id_qd: null,
                            ten_dvt_dn: null,
                            ten_dvt_hq: null,
                            he_so: 1,
                            co_the_nhap_dn: null,
                            so_luong_dn: ct.co_the_nhap,
                            so_luong_hq: ct.co_the_nhap
                        };
                    }
                    return ct;
                })
            );
            return;
        }

        const qd = item.quyDoiList.find(q => q.id_qd === id_qd);
        if (!qd) return;

        // Tính giới hạn có thể nhập theo đơn vị DN
        // Ví dụ: co_the_nhap = 100 Mét, he_so = 100 (1 Cây = 100 Mét)
        // => co_the_nhap_dn = 100 / 100 = 1 Cây
        const co_the_nhap_dn = item.co_the_nhap / parseFloat(qd.he_so || 1);

        setChiTietNhap((prev) =>
            prev.map((ct) => {
                if (ct.key === key) {
                    return {
                        ...ct,
                        id_qd,
                        ten_dvt_dn: qd.ten_dvt_dn,
                        ten_dvt_hq: qd.ten_dvt_hq,
                        he_so: parseFloat(qd.he_so || 1),
                        co_the_nhap_dn, // Giới hạn theo đơn vị DN
                        so_luong_dn: Math.min(co_the_nhap_dn, ct.so_luong_dn || 0),
                        so_luong_hq: ct.co_the_nhap
                    };
                }
                return ct;
            })
        );
    };

    /* ============================================================
       🟢 THAY ĐỔI SỐ LƯỢNG (CÓ QUY ĐỔI)
    ============================================================ */
    const handleSoLuongChange = async (key, value) => {
        const item = chiTietNhap.find(ct => ct.key === key);
        
        if (!item.id_qd) {
            // Không có quy đổi → Nhập trực tiếp số lượng HQ
            setChiTietNhap((prev) =>
                prev.map((ct) =>
                    ct.key === key ? { ...ct, so_luong_dn: value, so_luong_hq: value } : ct
                )
            );
            return;
        }

        // Có quy đổi → Tính toán
        try {
            const result = await calculateNPL_DN_to_HQ(
                item.id_npl,
                item.ten_dvt_dn,
                value
            );
            
            setChiTietNhap((prev) =>
                prev.map((ct) =>
                    ct.key === key ? { 
                        ...ct, 
                        so_luong_dn: value,
                        so_luong_hq: result.so_luong_hq,
                        ten_dvt_hq: result.ten_dvt_hq
                    } : ct
                )
            );
        } catch (error) {
            console.error('Lỗi tính toán quy đổi:', error);
            const errorMsg = extractErrorMessage(error);
            showWarning(
                'Không thể tính toán quy đổi', 
                `Lỗi khi quy đổi đơn vị cho ${item.ten_npl}: ${errorMsg}`
            );
        }
    };

    /* ============================================================
       🟢 UPLOAD FILE (giống LoHang)
    ============================================================ */
    const handleUpload = async ({ file, onSuccess, onError }) => {
        try {
            setUploading(true);
            const res = await uploadSingleFile(file);
            if (res?.data?.imageUrl) {
                setFileUrl(res.data.imageUrl);
                showUploadSuccess(file.name);
                onSuccess(res.data, file);
            } else {
                showUploadError();
                onError(new Error("Không có URL file!"));
            }
        } catch (err) {
            console.error(err);
            showUploadError();
            onError(err);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            id_hd_nhap: record.hoaDonNhap?.id_hd_nhap,
            id_kho: record.kho?.id_kho,
            ngay_nhap: dayjs(record.ngay_nhap),
        });
        // Backend trả về chiTiets, không phải chiTietNhapKhoNPLs
        const chiTiets = record.chiTiets || [];
        setChiTietNhap(chiTiets.map((item, index) => ({
            key: item.id_ct || index,
            id_npl: item.nguyenPhuLieu?.id_npl,
            ten_npl: item.nguyenPhuLieu?.ten_npl,
            so_luong_hd: item.so_luong,
            so_luong_nhap: item.so_luong,
        })));
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id_nhap) => {
        try {
            await deleteNhapKhoNPL(id_nhap);
            showDeleteSuccess('Phiếu nhập kho NPL');
            fetchLichSu(); // Refresh danh sách
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            showSaveError('xóa phiếu nhập kho NPL', errorMsg);
        }
    };

    const cancelEdit = () => {
        setEditingRecord(null);
        form.resetFields();
        setChiTietNhap([]);
    };

    /* ============================================================
       🟢 SUBMIT FORM — TẠO/CẬP NHẬT PHIẾU NHẬP KHO
    ============================================================ */
    const onFinish = async (values) => {
        console.log("values-----------------", values)
        console.log("values----------------- 🟢 Chi tiết NPL:", chiTietNhap);

        if (!chiTietNhap.length) {
            showWarning(
                'Thiếu thông tin chi tiết', 
                'Vui lòng chọn hóa đơn nhập để hiển thị danh sách nguyên phụ liệu cần nhập kho'
            );
            return;
        }

        // 🆕 Kiểm tra số lượng nhập <= 0
        const zeroItems = chiTietNhap.filter(item => {
            const soLuongDN = item.so_luong_dn || 0;
            const soLuongHQ = item.so_luong_hq || 0;
            return soLuongDN <= 0 || soLuongHQ <= 0;
        });
        if (zeroItems.length > 0) {
            const errorMsg = zeroItems.map(item => 
                `• ${item.ten_npl}: Số lượng phải lớn hơn 0`
            ).join('\n');
            showWarning('Số lượng nhập không hợp lệ', errorMsg);
            return;
        }

        // 🆕 Kiểm tra số lượng nhập không vượt quá số lượng có thể nhập
        const invalidItems = chiTietNhap.filter(item => {
            // Kiểm tra theo đơn vị HQ (đơn vị chuẩn)
            const soLuongHQ = item.so_luong_hq || 0;
            const coTheNhap = item.co_the_nhap || 0;
            return soLuongHQ > coTheNhap;
        });
        if (invalidItems.length > 0) {
            const errorMsg = invalidItems.map(item => {
                const dvtDisplay = item.ten_dvt_hq || '';
                return `• ${item.ten_npl}: Nhập ${formatVNNumber(item.so_luong_hq)} ${dvtDisplay} vượt quá giới hạn ${formatVNNumber(item.co_the_nhap)} ${dvtDisplay}`;
            }).join('\n');
            showWarning('Số lượng nhập vượt quá giới hạn cho phép', errorMsg);
            return;
        }

        const payloadPhieu = {
            id_hd_nhap: values.id_hd_nhap,
            id_kho: values.id_kho,
            ngay_nhap: values.ngay_nhap
                ? dayjs(values.ngay_nhap).format("YYYY-MM-DD")
                : null,
            file_phieu: fileUrl || null,
            chi_tiets: chiTietNhap.map(item => ({
                id_npl: item.id_npl,
                so_luong_nhap: item.so_luong_hq || item.so_luong_dn // Backend expects so_luong_nhap
            }))
        };

        console.log("📦 Dữ liệu gửi đi:", payloadPhieu);

        try {
            setSubmitting(true);

            if (editingRecord) {
                // Cập nhật phiếu nhập
                const resUpdate = await updateNhapKhoNPL(editingRecord.id_nhap, payloadPhieu);
                if (!resUpdate?.success) {
                    showSaveError('cập nhật phiếu nhập kho NPL', 'Không nhận được phản hồi thành công từ máy chủ');
                    return;
                }
                console.log("✅ Đã cập nhật phiếu nhập:", editingRecord.id_nhap);
                showUpdateSuccess('Phiếu nhập kho NPL');
            } else {
                // Tạo mới phiếu nhập
                const resPhieu = await createNhapKhoNPL(payloadPhieu);
                if (!resPhieu?.success || !resPhieu?.data?.id_nhap) {
                    showSaveError('tạo phiếu nhập kho NPL', 'Không nhận được phản hồi thành công từ máy chủ');
                    return;
                }
                console.log("✅ Đã tạo phiếu nhập:", resPhieu.data.id_nhap);
                showCreateSuccess('Phiếu nhập kho NPL');
            }

            // Reset form
            setEditingRecord(null);
            form.resetFields();
            setChiTietNhap([]);
            setFileUrl(null);
            fetchLichSu(); // Refresh danh sách
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            const action = editingRecord ? 'cập nhật' : 'tạo';
            showSaveError(`${action} phiếu nhập kho NPL`, errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const showDrawer = (record) => { setSelectedPhieu(record); setIsDrawerOpen(true); };
    
    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedPhieu(null), 300);
    };

    /* ============================================================
       🟢 CỘT BẢNG CHI TIẾT
    ============================================================ */
    const columns = [
        { 
            title: "Tên Nguyên phụ liệu", 
            dataIndex: "ten_npl", 
            key: "ten_npl",
            width: '20%',
            render: (text) => text || '-'
        },
        {
            title: "Số lượng theo HĐ",
            dataIndex: "so_luong_hd",
            key: "so_luong_hd",
            width: '12%',
            align: 'right',
            render: (val) => val !== null && val !== undefined ? formatVNNumber(val) : '-'
        },
        {
            title: "Đã nhập",
            dataIndex: "da_nhap",
            key: "da_nhap",
            width: '10%',
            align: 'right',
            render: (val) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                {val !== null && val !== undefined ? formatVNNumber(val) : '0'}
            </span>
        },
        {
            title: "Có thể nhập",
            dataIndex: "co_the_nhap",
            key: "co_the_nhap",
            width: '12%',
            align: 'right',
            render: (val) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                {val !== null && val !== undefined ? formatVNNumber(val) : '0'}
            </span>
        },
        {
            title: "Đơn vị",
            key: "don_vi",
            width: '18%',
            render: (_, record) => {
                if (!record.quyDoiList || record.quyDoiList.length === 0) {
                    return <span style={{ color: '#999' }}>Không có quy đổi</span>;
                }
                return (
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Chọn đơn vị"
                        value={record.id_qd}
                        onChange={(val) => handleQuyDoiChange(record.key, val)}
                        allowClear
                    >
                        {record.quyDoiList.map(qd => (
                            <Option key={qd.id_qd} value={qd.id_qd}>
                                {qd.ten_dvt_dn} (1 = {qd.he_so} {qd.ten_dvt_hq})
                            </Option>
                        ))}
                    </Select>
                );
            }
        },
        {
            title: "Số lượng nhập",
            key: "so_luong_nhap",
            width: '28%',
            render: (_, record) => {
                // Xác định giới hạn tối đa dựa trên đơn vị đang chọn
                const maxValue = record.id_qd ? (record.co_the_nhap_dn || record.co_the_nhap) : record.co_the_nhap;
                const currentValue = record.so_luong_dn || 0;
                
                // Kiểm tra các điều kiện lỗi
                const isZeroOrNegative = currentValue <= 0;
                const isOverLimit = currentValue > maxValue;
                const hasError = isZeroOrNegative || isOverLimit;
                
                return (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <InputNumber
                            min={0.01}
                            max={maxValue}
                            style={{ width: '100%' }}
                            value={currentValue}
                            onChange={(val) => handleSoLuongChange(record.key, val)}
                            placeholder={record.id_qd ? `Nhập ${record.ten_dvt_dn}` : 'Nhập số lượng'}
                            status={hasError ? 'error' : ''}
                        />
                        {isZeroOrNegative && (
                            <Typography.Text type="danger" style={{ fontSize: '12px' }}>
                                ⚠️ Số lượng phải lớn hơn 0
                            </Typography.Text>
                        )}
                        {!isZeroOrNegative && isOverLimit && (
                            <Typography.Text type="danger" style={{ fontSize: '12px' }}>
                                ⚠️ Vượt quá giới hạn! Tối đa: {formatVNNumber(maxValue)} {record.id_qd ? record.ten_dvt_dn : ''}
                            </Typography.Text>
                        )}
                        {record.id_qd && record.so_luong_hq !== record.so_luong_dn && currentValue > 0 && !hasError && (
                            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                ✓ Quy đổi = {formatVNNumber(record.so_luong_hq)} {record.ten_dvt_hq}
                            </Typography.Text>
                        )}
                    </Space>
                );
            }
        },
    ];

    const lichSuColumns = [
        { 
            title: 'Số phiếu', 
            dataIndex: 'so_phieu', 
            render: (text, record) => text || `PNKNPL-${record.id_nhap}`,
            width: '15%'
        },
        { 
            title: 'Ngày nhập', 
            dataIndex: 'ngay_nhap', 
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-',
            width: '12%'
        },
        { 
            title: 'Kho nhận', 
            dataIndex: ['kho', 'ten_kho'],
            render: (text, record) => text || record.kho?.ten_kho || '-',
            width: '20%'
        },
        { 
            title: 'Hóa đơn liên quan', 
            dataIndex: ['hoaDonNhap', 'so_hd'],
            render: (text, record) => text || record.hoaDonNhap?.so_hd || '-',
            width: '18%'
        },
        {
            title: 'Số lượng NPL',
            key: 'so_luong_npl',
            render: (_, record) => {
                const chiTiets = record.chiTiets || [];
                return chiTiets.length > 0 ? `${chiTiets.length} loại` : '-';
            },
            width: '12%',
            align: 'center'
        },
        { 
            title: 'Hành động', 
            key: 'action', 
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => showDrawer(record)}>Xem</Button>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm title="Bạn có chắc muốn xóa phiếu này?" onConfirm={() => handleDelete(record.id_nhap)}>
                        <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
            width: '23%'
        },
    ];
    
    const chiTietColumns = [
        { 
            title: 'STT',
            key: 'stt',
            width: '8%',
            align: 'center',
            render: (_, __, index) => index + 1
        },
        { 
            title: 'Tên Nguyên phụ liệu', 
            dataIndex: ['nguyenPhuLieu', 'ten_npl'],
            render: (text) => text || '-',
            width: '50%'
        },
        { 
            title: 'Số lượng nhập', 
            dataIndex: 'so_luong', 
            width: '22%',
            align: 'right', 
            render: (val) => formatVNNumber(val) || '-'
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false}>
                <Title level={3} style={{ marginBottom: 24 }}>
                    {editingRecord ? `Chỉnh sửa Phiếu Nhập kho NPL #${editingRecord.so_phieu || `PNKNPL-${editingRecord.id_nhap}`}` : 'Tạo Phiếu Nhập Kho Nguyên Phụ Liệu'}
                </Title>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    {/* Hóa đơn nhập */}
                    <Form.Item
                        label="Hóa đơn nhập liên quan"
                        name="id_hd_nhap"
                        rules={[{ required: true, message: "Chọn hóa đơn nhập!" }]}
                    >
                        <Select
                            placeholder="Tìm và chọn số hóa đơn nhập"
                            onChange={handleHoaDonChange}
                            showSearch
                        >
                            {hoaDonNhapList.map((hd) => (
                                <Option key={hd.id_hd_nhap} value={hd.id_hd_nhap}>
                                    {`${hd.so_hd} - Ngày ${hd.ngay_hd}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Kho */}
                    <Form.Item
                        label="Kho nhận hàng"
                        name="id_kho"
                        rules={[{ required: true, message: "Chọn kho nhận hàng!" }]}
                    >
                        <Select placeholder="Chọn kho">
                            {khoList.map((k) => (
                                <Option key={k.id_kho} value={k.id_kho}>
                                    {k.ten_kho}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Ngày nhập */}
                    <Form.Item
                        label="Ngày nhập kho"
                        name="ngay_nhap"
                        rules={[{ required: true, message: "Chọn ngày nhập kho!" }]}
                    >
                        <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                    </Form.Item>

                    {/* Upload file */}
                    <Form.Item label="File phiếu nhập (nếu có)">
                        <Upload
                            customRequest={handleUpload}
                            maxCount={1}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} loading={uploading}>
                                Tải lên file
                            </Button>
                        </Upload>

                        {fileUrl && (
                            <div style={{ marginTop: 8 }}>
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                    Xem file đã tải lên
                                </a>
                            </div>
                        )}
                    </Form.Item>

                    {/* Bảng chi tiết */}
                    <Title level={4}>Chi tiết Nguyên Phụ Liệu Nhập Kho</Title>
                    <Table
                        columns={columns}
                        dataSource={chiTietNhap}
                        pagination={false}
                        rowKey="key"
                        bordered
                    />

                    <Form.Item style={{ marginTop: 24 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />} loading={submitting}>
                                {editingRecord ? 'Cập nhật Phiếu nhập' : 'Xác nhận Nhập kho'}
                            </Button>
                            {editingRecord && (
                                <Button icon={<CloseCircleOutlined />} onClick={cancelEdit}>Hủy sửa</Button>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
            <Card title="Lịch sử Phiếu Nhập kho NPL" bordered={false}>
                <Table columns={lichSuColumns} dataSource={lichSuPhieu} rowKey="id_nhap" loading={loadingLichSu} />
            </Card>

            <Drawer 
                title={`Chi tiết Phiếu nhập: ${selectedPhieu?.so_phieu || `PNKNPL-${selectedPhieu?.id_nhap}`}`} 
                width={700} 
                open={isDrawerOpen} 
                onClose={closeDrawer}
            >
                {selectedPhieu && <>
                    <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                        <Descriptions.Item label="Số phiếu">
                            {selectedPhieu.so_phieu || `PNKNPL-${selectedPhieu.id_nhap}`}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày nhập">
                            {dayjs(selectedPhieu.ngay_nhap).format('DD/MM/YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kho nhận">
                            {selectedPhieu.kho?.ten_kho || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hóa đơn liên quan">
                            {selectedPhieu.hoaDonNhap?.so_hd || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày hóa đơn">
                            {selectedPhieu.hoaDonNhap?.ngay_hd ? dayjs(selectedPhieu.hoaDonNhap.ngay_hd).format('DD/MM/YYYY') : '-'}
                        </Descriptions.Item>
                        {selectedPhieu.file_phieu && (
                            <Descriptions.Item label="File đính kèm">
                                <a href={selectedPhieu.file_phieu} target="_blank" rel="noopener noreferrer">
                                    Xem file
                                </a>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                    <Title level={5}>Danh sách NPL đã nhập</Title>
                    <Table 
                        columns={chiTietColumns} 
                        dataSource={selectedPhieu.chiTiets || []} 
                        rowKey="id_ct" 
                        pagination={false} 
                        size="small" 
                        bordered 
                        summary={(pageData) => {
                            const totalItems = pageData.length;
                            return (
                                <Table.Summary fixed>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={3} align="right">
                                            <Text strong>Tổng cộng:</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="right">
                                            <Text strong>{totalItems} loại NPL</Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </Table.Summary>
                            );
                        }}
                    />
                </>}
            </Drawer>
        </Space>
    );
};

export default NhapKhoNPL;
