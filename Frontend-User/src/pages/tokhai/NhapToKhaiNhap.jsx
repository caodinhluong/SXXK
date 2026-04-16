import React, { useState, useEffect } from "react";
import {
    Steps, Button, Form, Select, DatePicker, Input, Upload, Table,
    InputNumber, Card, Typography, Row, Col, Space, message, Modal, Divider
} from "antd";
import {
    UploadOutlined, PlusOutlined, DeleteOutlined, FileExcelOutlined, DownloadOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { 
    showCreateSuccess, 
    showLoadError, 
    showSaveError,
    showUploadSuccess,
    showUploadError 
} from "../../components/notification";

// 🧩 Import API services
import { getAllHopDong } from "../../services/hopdong.service";
import { getAllNguyenPhuLieu } from "../../services/nguyenphulieu.service";
import { getAllTienTe } from "../../services/tiente.service";
import { uploadSingleFile } from "../../services/upload.service";
import { 
    createToKhaiNhap, 
    getAllToKhaiNhap,
    importToKhaiNhapFromExcel,
    getTemplateToKhaiNhap
} from "../../services/tokhainhap.service";
import { createLoHang, getAllLoHang } from "../../services/lohang.service";
import { createHoaDonNhap, getAllHoaDonNhap } from "../../services/hoadonnhap.service";
import { createVanDonNhap, getAllVanDonNhap } from "../../services/vandonnhap.service";

const { Step } = Steps;
const { Option } = Select;
const { Title } = Typography;

const NhapToKhaiNhap = () => {
    const [current, setCurrent] = useState(0);
    const [formLoHang] = Form.useForm();
    const [formHoaDonVanDon] = Form.useForm();
    const [formToKhai] = Form.useForm();

    const [hopDongList, setHopDongList] = useState([]);
    const [nplList, setNplList] = useState([]);
    const [tienTeList, setTienTeList] = useState([]);
    const [hoaDonList, setHoaDonList] = useState([]);
    const [vanDonList, setVanDonList] = useState([]);
    const [toKhaiList, setToKhaiList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [chiTietHoaDon, setChiTietHoaDon] = useState([
        { key: 1, id_npl: null, so_luong: 0, don_gia: 0, tri_gia: 0 }
    ]);
    const [tongTienHoaDon, setTongTienHoaDon] = useState(0);

    // ✅ File URLs
    const [fileLoHang, setFileLoHang] = useState(null);
    const [fileHoaDon, setFileHoaDon] = useState(null);
    const [fileVanDon, setFileVanDon] = useState(null);
    const [fileToKhai, setFileToKhai] = useState(null);
    const [fileExcelImport, setFileExcelImport] = useState(null);

    // ✅ Import Excel state
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [selectedLoHang, setSelectedLoHang] = useState(null);
    const [loHangList, setLoHangList] = useState([]);

    /* ============================================================
       🟢 LẤY DỮ LIỆU BAN ĐẦU
    ============================================================ */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resHD, resNPL, resTT, resHDN, resVDN, resTKN] = await Promise.all([
                    getAllHopDong(),
                    getAllNguyenPhuLieu(),
                    getAllTienTe(),
                    getAllHoaDonNhap(),
                    getAllVanDonNhap(),
                    getAllToKhaiNhap(),
                ]);
                setHopDongList(resHD.data || []);
                setNplList(resNPL.data || []);
                setTienTeList(resTT.data || []);
                setHoaDonList(Array.isArray(resHDN) ? resHDN : (resHDN.data || []));
                setVanDonList(Array.isArray(resVDN) ? resVDN : (resVDN.data || []));
                setToKhaiList(Array.isArray(resTKN) ? resTKN : (resTKN.data || []));
            } catch {
                showLoadError('dữ liệu ban đầu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    /* ============================================================
       🟢 XỬ LÝ UPLOAD FILE
       (giữ nguyên như bạn đã làm)
    ============================================================ */
    const handleUpload = async ({ file, onSuccess, onError }, type) => {
        try {
            setUploading(true);
            const res = await uploadSingleFile(file);
            if (res?.data?.imageUrl) {
                showUploadSuccess(file.name);
                switch (type) {
                    case "lohang":
                        setFileLoHang(res.data.imageUrl);
                        break;
                    case "hoadon":
                        setFileHoaDon(res.data.imageUrl);
                        break;
                    case "vandon":
                        setFileVanDon(res.data.imageUrl);
                        break;
                    case "tokhai":
                        setFileToKhai(res.data.imageUrl);
                        break;
                    case "excel":
                        setFileExcelImport(res.data.imageUrl);
                        break;
                    default:
                        break;
                }
                if (onSuccess) onSuccess(res.data, file);
            } else {
                showUploadError();
                if (onError) onError(new Error("Không có URL!"));
            }
        } catch (err) {
            console.error(err);
            showUploadError();
            if (onError) onError(err);
        } finally {
            setUploading(false);
        }
    };

    // ✅ Import Excel handlers
    const handleImportExcel = async (file) => {
        try {
            setImportLoading(true);
            const reader = new FileReader();
            const data = await new Promise((resolve, reject) => {
                reader.onload = (e) => {
                    try {
                        const workbook = XLSX.read(e.target.result, { type: "binary" });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(sheet);
                        resolve(jsonData);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsBinaryString(file);
            });

            const res = await importToKhaiNhapFromExcel(data, selectedLoHang);
            if (res.success) {
                message.success(`Import thành công: ${res.data?.thanh_cong || 0} tờ khai`);
                setImportModalVisible(false);
                const resTKN = await getAllToKhaiNhap();
                setToKhaiList(Array.isArray(resTKN) ? resTKN : (resTKN.data || []));
            } else {
                message.error(res.message || "Import thất bại");
            }
        } catch (err) {
            message.error(err.message || "Lỗi khi import Excel");
        } finally {
            setImportLoading(false);
        }
        return false;
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await getTemplateToKhaiNhap();
            if (res.success && res.data) {
                const templateData = res.data.vi_du ? [res.data.vi_du] : [];
                const ws = XLSX.utils.json_to_sheet(templateData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "ToKhaiNhap");
                XLSX.writeFile(wb, "_template_tokhai_nhap.xlsx");
                message.success("Đã tải mẫu template");
            }
        } catch (err) {
            message.error("Lỗi khi tải template");
        }
    };

    const openImportModal = async () => {
        try {
            setLoading(true);
            const res = await getAllLoHang();
            const lhList = Array.isArray(res) ? res : (res.data || []);
            const mappedList = lhList.map(item => ({
                ...item,
                ten_hd: item.hopDong?.so_hd || "N/A"
            }));
            setLoHangList(mappedList);
            setImportModalVisible(true);
        } catch (err) {
            message.error("Lỗi khi tải danh sách lô hàng");
        } finally {
            setLoading(false);
        }
    };

    /* ============================================================
       🟢 XỬ LÝ FORM
    ============================================================ */
    useEffect(() => {
        const total = chiTietHoaDon.reduce((sum, item) => sum + (item.tri_gia || 0), 0);
        setTongTienHoaDon(total);
        formHoaDonVanDon.setFieldsValue({ tong_tien: total });
    }, [chiTietHoaDon, formHoaDonVanDon]);

    const next = async () => {
        try {
            if (current === 0) {
                await formLoHang.validateFields();
                // Validate ngày tháng
                const values = formLoHang.getFieldsValue();
                if (values.ngay_dong_goi && values.ngay_xuat_cang) {
                    if (dayjs(values.ngay_xuat_cang).isBefore(dayjs(values.ngay_dong_goi))) {
                        showSaveError('Ngày xuất cảng phải sau ngày đóng gói');
                        return;
                    }
                }
            }
            if (current === 1) {
                await formHoaDonVanDon.validateFields();
                
                // Validate chi tiết hóa đơn
                const validItems = chiTietHoaDon.filter(item => item.id_npl && item.so_luong > 0 && item.don_gia > 0);
                if (validItems.length === 0) {
                    showSaveError('Vui lòng thêm ít nhất 1 nguyên phụ liệu với số lượng và đơn giá hợp lệ');
                    return;
                }

                // ✅ Kiểm tra trùng lặp nguyên phụ liệu trong chi tiết hóa đơn
                const nplIds = validItems.map(item => item.id_npl);
                const duplicateNpl = nplIds.find((id, index) => nplIds.indexOf(id) !== index);
                if (duplicateNpl) {
                    const nplName = nplList.find(npl => npl.id_npl === duplicateNpl)?.ten_npl || duplicateNpl;
                    showSaveError(`Nguyên phụ liệu "${nplName}" đã được thêm vào hóa đơn. Vui lòng không nhập trùng lặp`);
                    return;
                }

                // ✅ Kiểm tra trùng lặp số hóa đơn
                const values = formHoaDonVanDon.getFieldsValue();
                const existingHoaDon = hoaDonList.find(hd => hd.so_hd === values.so_hd);
                if (existingHoaDon) {
                    showSaveError(`Số hóa đơn "${values.so_hd}" đã tồn tại trong hệ thống. Vui lòng nhập số hóa đơn khác`);
                    return;
                }

                // ✅ Kiểm tra trùng lặp số vận đơn (nếu có nhập)
                if (values.so_vd) {
                    const existingVanDon = vanDonList.find(vd => vd.so_vd === values.so_vd);
                    if (existingVanDon) {
                        showSaveError(`Số vận đơn "${values.so_vd}" đã tồn tại trong hệ thống. Vui lòng nhập số vận đơn khác`);
                        return;
                    }
                }

                // ✅ Validate date logic for hóa đơn và vận đơn
                const loHangValues = formLoHang.getFieldsValue();
                if (values.ngay_hd && loHangValues.ngay_dong_goi) {
                    if (dayjs(values.ngay_hd).isBefore(dayjs(loHangValues.ngay_dong_goi))) {
                        showSaveError('Ngày hóa đơn không thể trước ngày đóng gói');
                        return;
                    }
                }
                if (values.ngay_phat_hanh && loHangValues.ngay_dong_goi) {
                    if (dayjs(values.ngay_phat_hanh).isBefore(dayjs(loHangValues.ngay_dong_goi))) {
                        showSaveError('Ngày phát hành vận đơn không thể trước ngày đóng gói');
                        return;
                    }
                }
            }
            setCurrent((c) => c + 1);
        } catch (err) {
            if (err.errorFields) {
                showSaveError('Vui lòng điền đầy đủ thông tin bắt buộc');
            } else {
                showSaveError('thông tin');
            }
        }
    };

    const prev = () => setCurrent((c) => c - 1);

    const handleAddRow = () =>
        setChiTietHoaDon([
            ...chiTietHoaDon,
            { key: Date.now(), id_npl: null, so_luong: 0, don_gia: 0, tri_gia: 0 },
        ]);

    const handleRemoveRow = (key) =>
        setChiTietHoaDon(chiTietHoaDon.filter((item) => item.key !== key));

    const handleChiTietChange = (key, field, value) => {
        const newData = [...chiTietHoaDon];
        const index = newData.findIndex((item) => key === item.key);
        if (index > -1) {
            const item = { ...newData[index] };
            item[field] = value;
            if (field === "so_luong" || field === "don_gia") {
                item.tri_gia = (item.so_luong || 0) * (item.don_gia || 0);
            }
            newData.splice(index, 1, item);
            setChiTietHoaDon(newData);
        }
    };

    const onFinish = async () => {
        try {
            // Validate cuối cùng (bắt buộc phần toKhai)
            await formToKhai.validateFields();
            
            // Validate lại chi tiết hóa đơn
            const validItems = chiTietHoaDon.filter(item => item.id_npl && item.so_luong > 0 && item.don_gia > 0);
            if (validItems.length === 0) {
                showSaveError('Vui lòng thêm ít nhất 1 nguyên phụ liệu với số lượng và đơn giá hợp lệ');
                return;
            }

            // ✅ Kiểm tra trùng lặp số tờ khai
            const toKhaiForm = formToKhai.getFieldsValue();
            const existingToKhai = toKhaiList.find(tk => tk.so_tk === toKhaiForm.so_to_khai);
            if (existingToKhai) {
                showSaveError(`Số tờ khai "${toKhaiForm.so_to_khai}" đã tồn tại trong hệ thống. Vui lòng nhập số tờ khai khác`);
                return;
            }

            // ✅ Validate date logic for tờ khai
            const loHangForm = formLoHang.getFieldsValue();
            const hoaDonForm = formHoaDonVanDon.getFieldsValue();

            // Ngày đăng ký tờ khai phải sau ngày hóa đơn
            if (toKhaiForm.ngay_dk && hoaDonForm.ngay_hd) {
                if (dayjs(toKhaiForm.ngay_dk).isBefore(dayjs(hoaDonForm.ngay_hd))) {
                    showSaveError('Ngày đăng ký tờ khai không thể trước ngày hóa đơn');
                    return;
                }
            }

            // Ngày thông quan phải sau hoặc bằng ngày đăng ký tờ khai
            if (toKhaiForm.ngay_thong_quan && toKhaiForm.ngay_dk) {
                if (dayjs(toKhaiForm.ngay_thong_quan).isBefore(dayjs(toKhaiForm.ngay_dk))) {
                    showSaveError('Ngày thông quan không thể trước ngày đăng ký tờ khai');
                    return;
                }
            }

            // Ngày xử lý phải sau hoặc bằng ngày đăng ký tờ khai
            if (toKhaiForm.ngay_xu_ly && toKhaiForm.ngay_dk) {
                if (dayjs(toKhaiForm.ngay_xu_ly).isBefore(dayjs(toKhaiForm.ngay_dk))) {
                    showSaveError('Ngày xử lý không thể trước ngày đăng ký tờ khai');
                    return;
                }
            }

            // --- 1) Tạo Lô hàng (bắt buộc để có id_lh)
            const payloadLoHang = {
                id_hd: loHangForm.id_hd, // now should be defined
                // nếu bạn muốn gửi id_lh do người nhập thì giữ id_lh, else omit
                // id_lh: loHangForm.id_lh || undefined,
                ngay_dong_goi: loHangForm.ngay_dong_goi ? loHangForm.ngay_dong_goi.format("YYYY-MM-DD") : null,
                ngay_xuat_cang: loHangForm.ngay_xuat_cang ? loHangForm.ngay_xuat_cang.format("YYYY-MM-DD") : null,
                cang_xuat: loHangForm.cang_xuat || null,
                cang_nhap: loHangForm.cang_nhap || null,
                file_chung_tu: fileLoHang || null,
            };

            // debug: in ra payloadLoHang để kiểm tra trước khi gửi
            console.log("payloadLoHang:", payloadLoHang);

            const resLoHang = await createLoHang(payloadLoHang);
            const createdLoHang = resLoHang?.data || resLoHang;
            const id_lh = createdLoHang?.id_lh || createdLoHang?.data?.id_lh;
            if (!id_lh) throw new Error("Không lấy được id_lh sau khi tạo lô hàng");

            // --- 2) Tạo Hóa đơn nhập (và chi tiết)
            const chiTiet = chiTietHoaDon.map((ct) => ({
                id_npl: ct.id_npl,
                so_luong: ct.so_luong,
                don_gia: ct.don_gia,
                tri_gia: ct.tri_gia,
            }));
            const tong_tri_gia = chiTiet.reduce((s, i) => s + (i.tri_gia || 0), 0);

            const payloadHoaDon = {
                id_lh,
                so_hd: hoaDonForm.so_hd,
                ngay_hd: hoaDonForm.ngay_hd ? hoaDonForm.ngay_hd.format("YYYY-MM-DD") : null,
                id_tt: hoaDonForm.id_tt,
                tong_tien: tong_tri_gia,
                file_hoa_don: fileHoaDon || null,
                chi_tiets: chiTiet,
            };

            await createHoaDonNhap(payloadHoaDon);

            // --- 3)  Tạo Vận đơn
            const payloadVanDon = {
                id_lh,
                so_vd: hoaDonForm.so_vd || null,
                ngay_phat_hanh: hoaDonForm.ngay_phat_hanh ? hoaDonForm.ngay_phat_hanh.format("YYYY-MM-DD") : null,
                cang_xuat: hoaDonForm.vd_cang_xuat || null,
                cang_nhap: hoaDonForm.vd_cang_nhap || null,
                file_van_don: fileVanDon || null,
            };


            if (payloadVanDon.so_vd || payloadVanDon.file_van_don) {
                await createVanDonNhap(payloadVanDon);
            }

            // --- 4) Tạo Tờ khai nhập (payload phẳng theo BE đòi hỏi)
            const payloadToKhai = {
                id_lh,
                so_tk: toKhaiForm.so_to_khai,
                ngay_tk: toKhaiForm.ngay_dk ? toKhaiForm.ngay_dk.format("YYYY-MM-DD") : null,
                ma_to_khai: toKhaiForm.ma_to_khai || null,
                loai_hang: toKhaiForm.loai_hang || null,
                ngay_thong_quan: toKhaiForm.ngay_thong_quan ? toKhaiForm.ngay_thong_quan.format("YYYY-MM-DD") : null,
                cang_nhap: toKhaiForm.cang_nhap || null,
                thue_nhap_khau: toKhaiForm.thue_nhap_khau || null,
                thue_gtgt: toKhaiForm.thue_gtgt || null,
                tong_tri_gia,
                id_tt: hoaDonForm.id_tt,
                file_to_khai: fileToKhai || null,
                file_excel_import: fileExcelImport || null,
                ghi_chu: toKhaiForm.ghi_chu || null,
                nguoi_xu_ly: toKhaiForm.nguoi_xu_ly || null,
                ngay_xu_ly: toKhaiForm.ngay_xu_ly ? toKhaiForm.ngay_xu_ly.format("YYYY-MM-DD") : null,
                // trang_thai: "Chờ duyệt"  // mặc định BE đã set rồi,
            };

            await createToKhaiNhap(payloadToKhai);

            showCreateSuccess('Tờ khai nhập');

            // Reset state/forms
            setCurrent(0);
            formLoHang.resetFields();
            formHoaDonVanDon.resetFields();
            formToKhai.resetFields();
            setFileLoHang(null);
            setFileHoaDon(null);
            setFileVanDon(null);
            setFileToKhai(null);
            setFileExcelImport(null);
            setChiTietHoaDon([{ key: 1, id_npl: null, so_luong: 0, don_gia: 0, tri_gia: 0 }]);
        } catch (err) {
            console.error("onFinish error:", err);
            showSaveError('tờ khai nhập');
        }
    };

    /* ============================================================
       🟢 CỘT CHI TIẾT HÓA ĐƠN
    ============================================================ */
    const columnsChiTiet = [
        {
            title: "Nguyên phụ liệu",
            dataIndex: "id_npl",
            render: (_, record) => (
                <Select
                    style={{ width: 200 }}
                    value={record.id_npl}
                    onChange={(val) => handleChiTietChange(record.key, "id_npl", val)}
                    placeholder="Chọn NPL"
                    status={!record.id_npl && chiTietHoaDon.length > 1 ? 'error' : ''}
                >
                    {nplList.map((npl) => (
                        <Option key={npl.id_npl} value={npl.id_npl}>
                            {npl.ten_npl}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Số lượng",
            dataIndex: "so_luong",
            render: (_, record) => (
                <InputNumber
                    min={1}
                    value={record.so_luong}
                    onChange={(val) => handleChiTietChange(record.key, "so_luong", val)}
                    placeholder="Nhập số lượng"
                    status={record.so_luong <= 0 && chiTietHoaDon.length > 1 ? 'error' : ''}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: "Đơn giá",
            dataIndex: "don_gia",
            render: (_, record) => (
                <InputNumber
                    min={1}
                    value={record.don_gia}
                    onChange={(val) => handleChiTietChange(record.key, "don_gia", val)}
                    placeholder="Nhập đơn giá"
                    status={record.don_gia <= 0 && chiTietHoaDon.length > 1 ? 'error' : ''}
                    style={{ width: '100%' }}
                />
            ),
        },
        { title: "Trị giá", dataIndex: "tri_gia", render: (text) => text?.toLocaleString() },
        {
            title: "Hành động",
            render: (_, record) => (
                <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveRow(record.key)} />
            ),
        },
    ];

    /* ============================================================
       🟢 GIAO DIỆN 3 BƯỚC (render tất cả forms nhưng chỉ hiển thị step hiện tại)
    ============================================================ */
    const steps = [
        {
            title: "1. Thông tin Lô hàng",
            content: (
                <div style={{ display: current === 0 ? "block" : "none" }}>
                    <Form form={formLoHang} layout="vertical" preserve={true}>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label="Hợp đồng liên quan" name="id_hd" rules={[{ required: true, message: "Vui lòng chọn hợp đồng!" }]}>
                                    <Select placeholder="Chọn hợp đồng">
                                        {hopDongList.map((hd) => (
                                            <Option key={hd.id_hd} value={hd.id_hd}>
                                                {hd.so_hd}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Ngày đóng gói" 
                                    name="ngay_dong_goi"
                                    rules={[{ required: true, message: "Vui lòng chọn ngày đóng gói!" }]}
                                >
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Chọn ngày" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Ngày xuất cảng" 
                                    name="ngay_xuat_cang"
                                    rules={[{ required: true, message: "Vui lòng chọn ngày xuất cảng!" }]}
                                >
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Chọn ngày" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Cảng xuất" 
                                    name="cang_xuat"
                                    rules={[{ required: true, message: "Vui lòng nhập cảng xuất!" }]}
                                >
                                    <Input placeholder="Nhập tên cảng xuất" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Cảng nhập" 
                                    name="cang_nhap"
                                    rules={[{ required: true, message: "Vui lòng nhập cảng nhập!" }]}
                                >
                                    <Input placeholder="Nhập tên cảng nhập" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label="File chứng từ lô hàng">
                                    <Upload
                                        customRequest={(options) => handleUpload(options, "lohang")}
                                        maxCount={1}
                                        showUploadList={true}
                                        onRemove={() => setFileLoHang(null)}
                                        fileList={fileLoHang ? [{
                                            uid: '-3',
                                            name: 'File lô hàng',
                                            status: 'done',
                                            url: fileLoHang,
                                        }] : []}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading} disabled={!!fileLoHang}>
                                            Tải lên file
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
            ),
        },
        {
            title: "2. Hóa đơn & Vận đơn",
            content: (
                <div style={{ display: current === 1 ? "block" : "none" }}>
                    <Form form={formHoaDonVanDon} layout="vertical" preserve={true}>
                        <Row gutter={24}>
                            {/* ====== HÓA ĐƠN ====== */}
                            <Col span={12}>
                                <Form.Item label="Số hóa đơn" name="so_hd" rules={[{ required: true, message: "Vui lòng nhập số hóa đơn!" }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Ngày hóa đơn" name="ngay_hd" rules={[{ required: true, message: "Vui lòng chọn ngày" }]}>
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Loại tiền tệ" name="id_tt" rules={[{ required: true, message: "Vui lòng chọn loại tiền!" }]}>
                                    <Select placeholder="Chọn tiền tệ">
                                        {tienTeList.map((tt) => (
                                            <Option key={tt.id_tt} value={tt.id_tt}>
                                                {tt.ten_tt}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Tổng tiền (tự động)">
                                    <InputNumber
                                        disabled
                                        value={tongTienHoaDon}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Chi tiết hóa đơn">
                                    <Button
                                        type="dashed"
                                        onClick={handleAddRow}
                                        icon={<PlusOutlined />}
                                        style={{ marginBottom: 10 }}
                                    >
                                        Thêm nguyên phụ liệu
                                    </Button>
                                    <Table
                                        columns={columnsChiTiet}
                                        dataSource={chiTietHoaDon}
                                        pagination={false}
                                        rowKey="key"
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="File hóa đơn">
                                    <Upload
                                        customRequest={(options) => handleUpload(options, "hoadon")}
                                        maxCount={1}
                                        showUploadList={true}
                                        onRemove={() => setFileHoaDon(null)}
                                        fileList={fileHoaDon ? [{
                                            uid: '-4',
                                            name: 'File hóa đơn',
                                            status: 'done',
                                            url: fileHoaDon,
                                        }] : []}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading} disabled={!!fileHoaDon}>
                                            Tải lên file
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>

                            {/* ====== VẬN ĐƠN ====== */}
                            <Col span={12}>
                                <Form.Item label="Số vận đơn" name="so_vd" rules={[{ required: true, message: "Vui lòng nhập số vận đơn!" }]}>
                                    <Input placeholder="Nhập số vận đơn" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Ngày phát hành" name="ngay_phat_hanh" rules={[{ required: true, message: "Vui lòng chọn ngày phát hành!" }]}>
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Cảng xuất (trên vận đơn)" name="vd_cang_xuat" rules={[{ required: true, message: "Vui lòng nhập cảng xuất" }]}>
                                    <Input placeholder="Nhập cảng xuất trên vận đơn" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Cảng nhập (trên vận đơn)" name="vd_cang_nhap" rules={[{ required: true, message: "Vui lòng nhập cảng nhập!" }]}>
                                    <Input placeholder="Nhập cảng nhập trên vận đơn" />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="File vận đơn">
                                    <Upload
                                        customRequest={(options) => handleUpload(options, "vandon")}
                                        maxCount={1}
                                        showUploadList={true}
                                        onRemove={() => setFileVanDon(null)}
                                        fileList={fileVanDon ? [{
                                            uid: '-5',
                                            name: 'File vận đơn',
                                            status: 'done',
                                            url: fileVanDon,
                                        }] : []}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading} disabled={!!fileVanDon}>
                                            Tải lên file
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
            ),
        },
        {
            title: "3. Tờ khai nhập khẩu",
            content: (
                <div style={{ display: current === 2 ? "block" : "none" }}>
                    <Form form={formToKhai} layout="vertical" preserve={true}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item label="Số tờ khai" name="so_to_khai" rules={[{ required: true, message: "Vui lòng nhập số tờ khai" }]}>
                                    <Input placeholder="Nhập số tờ khai" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Ngày đăng ký tờ khai" name="ngay_dk" rules={[{ required: true, message: "Vui lòng chọn ngày đăng kí tờ khai" }]}>
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Chọn ngày" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Mã tờ khai" 
                                    name="ma_to_khai"
                                    rules={[
                                        { required: true, message: "Vui lòng chọn mã tờ khai!" }
                                    ]}
                                >
                                    <Select placeholder="Chọn mã tờ khai">
                                        <Option value="G11">G11 - Nhập khẩu thông thường</Option>
                                        <Option value="G12">G12 - Nhập khẩu ưu đãi</Option>
                                        <Option value="G13">G13 - Tạm nhập tái xuất</Option>
                                        <Option value="G14">G14 - Chuyển khẩu</Option>
                                        <Option value="G51">G51 - Tái nhập</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Loại hàng" 
                                    name="loai_hang"
                                    rules={[
                                        { required: true, message: "Vui lòng chọn loại hàng!" }
                                    ]}
                                >
                                    <Select placeholder="Chọn loại hàng">
                                        <Option value="NguyenLieu">Nguyên liệu</Option>
                                        <Option value="SanPham">Sản phẩm</Option>
                                        <Option value="BanThanhPham">Bán thành phẩm</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Ngày thông quan" 
                                    name="ngay_thong_quan"
                                    rules={[
                                        { required: true, message: "Vui lòng chọn ngày thông quan!" }
                                    ]}
                                >
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Chọn ngày thông quan" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Cảng nhập" 
                                    name="cang_nhap"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập cảng nhập!" },
                                        { min: 2, message: "Tên cảng nhập phải có ít nhất 2 ký tự!" },
                                        { max: 100, message: "Tên cảng nhập không được vượt quá 100 ký tự!" }
                                    ]}
                                >
                                    <Input placeholder="Nhập tên cảng nhập" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Thuế nhập khẩu" 
                                    name="thue_nhap_khau"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập thuế nhập khẩu!" },
                                        { type: 'number', min: 0, message: "Thuế nhập khẩu phải lớn hơn hoặc bằng 0!" }
                                    ]}
                                >
                                    <InputNumber 
                                        min={0} 
                                        style={{ width: "100%" }} 
                                        placeholder="Nhập thuế nhập khẩu"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Thuế GTGT" 
                                    name="thue_gtgt"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập thuế GTGT!" },
                                        { type: 'number', min: 0, message: "Thuế GTGT phải lớn hơn hoặc bằng 0!" }
                                    ]}
                                >
                                    <InputNumber 
                                        min={0} 
                                        style={{ width: "100%" }} 
                                        placeholder="Nhập thuế GTGT"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="Người xử lý" 
                                    name="nguoi_xu_ly"
                                    rules={[
                                        { min: 2, message: "Tên người xử lý phải có ít nhất 2 ký tự!" },
                                        { max: 100, message: "Tên người xử lý không được vượt quá 100 ký tự!" }
                                    ]}
                                >
                                    <Input placeholder="Nhập tên người xử lý" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Ngày xử lý" name="ngay_xu_ly">
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Chọn ngày xử lý" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item 
                                    label="Ghi chú" 
                                    name="ghi_chu"
                                    rules={[
                                        { max: 500, message: "Ghi chú không được vượt quá 500 ký tự!" }
                                    ]}
                                >
                                    <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" maxLength={500} showCount />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="File tờ khai">
                                    <Upload
                                        customRequest={(options) => handleUpload(options, "tokhai")}
                                        maxCount={1}
                                        showUploadList={true}
                                        onRemove={() => setFileToKhai(null)}
                                        fileList={fileToKhai ? [{
                                            uid: '-1',
                                            name: 'File tờ khai',
                                            status: 'done',
                                            url: fileToKhai,
                                        }] : []}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading} disabled={!!fileToKhai}>
                                            Tải lên file tờ khai
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="File Excel Import">
                                    <Upload
                                        customRequest={(options) => handleUpload(options, "excel")}
                                        maxCount={1}
                                        showUploadList={true}
                                        onRemove={() => setFileExcelImport(null)}
                                        fileList={fileExcelImport ? [{
                                            uid: '-2',
                                            name: 'File Excel',
                                            status: 'done',
                                            url: fileExcelImport,
                                        }] : []}
                                        accept=".xlsx,.xls"
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading} disabled={!!fileExcelImport}>
                                            Tải lên file Excel
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
            ),
        },
    ];

    return (
        <>
            <Card loading={loading}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <Title level={3} style={{ margin: 0 }}>
                        Khai báo Tờ khai Nhập khẩu
                    </Title>
                    <Space>
                        <Button icon={<FileExcelOutlined />} onClick={openImportModal}>
                            Import Excel
                        </Button>
                        <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                            Tải mẫu
                        </Button>
                    </Space>
                </div>
                <Steps current={current} style={{ maxWidth: 900, margin: "0 auto 24px auto" }}>
                    {steps.map((item) => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>

                {/* Render tất cả contents (forms) — mỗi content tự ẩn/hiện */}
                <div className="steps-content">
                    {steps.map((item, idx) => (
                        <div key={idx}>{item.content}</div>
                    ))}
                </div>

                <div style={{ marginTop: 24, textAlign: "center" }}>
                    <Space>
                        {current > 0 && <Button onClick={prev}>Quay lại</Button>}
                        {current < steps.length - 1 && (
                            <Button type="primary" onClick={next}>
                                Tiếp theo
                            </Button>
                        )}
                        {current === steps.length - 1 && (
                            <Button type="primary" onClick={onFinish}>
                                Hoàn tất & Nộp tờ khai
                            </Button>
                        )}
                    </Space>
                </div>
            </Card>

            {/* Import Excel Modal */}
            <Modal
                title="Import Tờ khai Nhập từ Excel"
                open={importModalVisible}
                onCancel={() => setImportModalVisible(false)}
                footer={null}
                width={500}
            >
                <div style={{ padding: "16px 0" }}>
                    <p style={{ marginBottom: 16 }}>
                        Chọn file Excel để import tờ khai. Đảm bảo file có các cột: <b>so_tk, ngay_tk, ma_to_khai, loai_hang, cang_nhap, tong_tri_gia, thue_nhap_khau, thue_gtgt</b>
                    </p>
                    <Form layout="vertical">
                        <Form.Item label="Chọn Lô hàng" required>
                            <Select
                                placeholder="Chọn lô hàng"
                                value={selectedLoHang}
                                onChange={setSelectedLoHang}
                                showSearch
                                optionFilterProp="children"
                                style={{ width: "100%" }}
                            >
                                {loHangList.map(lh => (
                                    <Option key={lh.id_lh} value={lh.id_lh}>
                                        {lh.so_lo} - {lh.ten_hd}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Chọn file Excel" required>
                            <Upload
                                accept=".xlsx,.xls"
                                beforeUpload={handleImportExcel}
                                showUploadList={false}
                                disabled={!selectedLoHang || importLoading}
                            >
                                <Button icon={<UploadOutlined />} loading={importLoading} disabled={!selectedLoHang}>
                                    {importLoading ? "Đang import..." : "Chọn file Excel"}
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </>
    );
};

export default NhapToKhaiNhap;
