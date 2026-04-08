import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

/**
 * Chuyển tiếng Việt có dấu thành không dấu
 * @param {string} str - Chuỗi cần chuyển đổi
 * @returns {string} - Chuỗi không dấu
 */
const removeVietnameseTones = (str) => {
    if (!str) return '';
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    return str;
};

/**
 * Export báo cáo thanh khoản ra PDF
 * @param {Object} baoCaoData - Dữ liệu báo cáo
 * @param {string} fileName - Tên file (không cần extension)
 */
export const exportBaoCaoToPDF = (baoCaoData, fileName = 'BaoCaoThanhKhoan') => {
    try {
        // Validate data
        if (!baoCaoData) {
            throw new Error('Khong co du lieu bao cao');
        }

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        let yPos = 15;
        
        // Tiêu đề chính
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('BAO CAO QUYET TOAN HOP DONG', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 10;
        
        // Thông tin chung - Đưa vào table với 2 cột
        autoTable(doc, {
            startY: yPos,
            head: [[{ content: 'THONG TIN CHUNG', colSpan: 2, styles: { halign: 'center' } }]],
            body: [
                ['Ten to chuc:', removeVietnameseTones(baoCaoData.thongTinChung?.ten_dn || '')],
                ['Ma so thue:', baoCaoData.thongTinChung?.ma_so_thue || ''],
                ['Dia chi:', removeVietnameseTones(baoCaoData.thongTinChung?.dia_chi || '')],
                ['So hop dong:', baoCaoData.kyBaoCao?.so_hd || ''],
                ['Ky bao cao:', `Tu ${dayjs(baoCaoData.kyBaoCao?.tu_ngay).format('DD/MM/YYYY')} den ${dayjs(baoCaoData.kyBaoCao?.den_ngay).format('DD/MM/YYYY')}`]
            ],
            theme: 'grid',
            styles: { 
                fontSize: 10, 
                cellPadding: 3,
                font: 'helvetica',
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            headStyles: { 
                fillColor: [41, 128, 185], 
                textColor: [255, 255, 255], 
                fontStyle: 'bold',
                halign: 'center',
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            bodyStyles: {
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            columnStyles: {
                0: { cellWidth: 50, fontStyle: 'bold', halign: 'left' },
                1: { cellWidth: 'auto', halign: 'left' }
            }
        });
        
        // Bảng 1: N-X-T Sản phẩm với header gom nhóm
        if (baoCaoData.baoCaoNXT_SP && baoCaoData.baoCaoNXT_SP.length > 0) {
            doc.addPage();
            yPos = 15;
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('BAO CAO NHAP - XUAT - TON KHO SAN PHAM (Mau 15a)', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
            yPos += 10;
            
            const nxtSPData = baoCaoData.baoCaoNXT_SP.map(item => [
                item.stt || '',
                removeVietnameseTones(item.ma_sp || ''),
                removeVietnameseTones(item.ten_sp || ''),
                removeVietnameseTones(item.don_vi_tinh || ''),
                item.ton_dau_ky?.toLocaleString() || '0',
                item.nhap_kho_trong_ky?.toLocaleString() || '0',
                item.chuyen_muc_dich?.toLocaleString() || '0',
                item.xuat_khau?.toLocaleString() || '0',
                item.xuat_khac?.toLocaleString() || '0',
                item.ton_cuoi_ky?.toLocaleString() || '0',
                removeVietnameseTones(item.ghi_chu || '')
            ]);
            
            autoTable(doc, {
                startY: yPos,
                head: [
                    // Header nhóm
                    [
                        { content: 'STT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ma SP', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ten san pham', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'DVT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ton dau ky', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Nhap trong ky', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Xuat kho trong ky', colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ton cuoi ky', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ghi chu', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
                    ],
                    // Header chi tiết
                    [
                        { content: 'Chuyen MD', styles: { halign: 'center' } },
                        { content: 'Xuat khau', styles: { halign: 'center' } },
                        { content: 'Xuat khac', styles: { halign: 'center' } }
                    ]
                ],
                body: nxtSPData,
                theme: 'grid',
                styles: { 
                    fontSize: 8, 
                    cellPadding: 2,
                    font: 'helvetica',
                    halign: 'center',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                headStyles: { 
                    fillColor: [211, 211, 211], 
                    textColor: [0, 0, 0], 
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                bodyStyles: {
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 40, halign: 'left' },
                    3: { cellWidth: 15, halign: 'center' },
                    4: { cellWidth: 20, halign: 'right' },
                    5: { cellWidth: 20, halign: 'right' },
                    6: { cellWidth: 20, halign: 'right' },
                    7: { cellWidth: 20, halign: 'right' },
                    8: { cellWidth: 20, halign: 'right' },
                    9: { cellWidth: 20, halign: 'right' },
                    10: { cellWidth: 30, halign: 'left' }
                }
            });
        }
        
        // Bảng 2: Sử dụng NPL với header gom nhóm
        if (baoCaoData.baoCaoSD_NPL && baoCaoData.baoCaoSD_NPL.length > 0) {
            doc.addPage();
            yPos = 15;
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('BAO CAO SU DUNG NGUYEN LIEU, VAT TU (Mau 15b)', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
            yPos += 10;
            
            const sdNPLData = baoCaoData.baoCaoSD_NPL.map(item => [
                item.stt || '',
                removeVietnameseTones(item.ma_npl || ''),
                removeVietnameseTones(item.ten_npl || ''),
                removeVietnameseTones(item.don_vi_tinh || ''),
                item.ton_dau_ky?.toLocaleString() || '0',
                item.tai_nhap?.toLocaleString() || '0',
                item.nhap_khac?.toLocaleString() || '0',
                item.xuat_san_pham?.toLocaleString() || '0',
                item.thay_doi_muc_dich?.toLocaleString() || '0',
                item.ton_cuoi_ky?.toLocaleString() || '0',
                removeVietnameseTones(item.ghi_chu || '')
            ]);
            
            autoTable(doc, {
                startY: yPos,
                head: [
                    // Header nhóm
                    [
                        { content: 'STT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ma NPL', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ten NPL, VT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'DVT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ton dau ky', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Nhap trong ky', colSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Xuat trong ky', colSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ton cuoi ky', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ghi chu', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
                    ],
                    // Header chi tiết
                    [
                        { content: 'Tai nhap', styles: { halign: 'center' } },
                        { content: 'Nhap khac', styles: { halign: 'center' } },
                        { content: 'Xuat SX', styles: { halign: 'center' } },
                        { content: 'Chuyen MD', styles: { halign: 'center' } }
                    ]
                ],
                body: sdNPLData,
                theme: 'grid',
                styles: { 
                    fontSize: 8, 
                    cellPadding: 2,
                    font: 'helvetica',
                    halign: 'center',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                headStyles: { 
                    fillColor: [211, 211, 211], 
                    textColor: [0, 0, 0], 
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                bodyStyles: {
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 40, halign: 'left' },
                    3: { cellWidth: 15, halign: 'center' },
                    4: { cellWidth: 20, halign: 'right' },
                    5: { cellWidth: 20, halign: 'right' },
                    6: { cellWidth: 20, halign: 'right' },
                    7: { cellWidth: 20, halign: 'right' },
                    8: { cellWidth: 20, halign: 'right' },
                    9: { cellWidth: 20, halign: 'right' },
                    10: { cellWidth: 30, halign: 'left' }
                }
            });
        }
        
        // Bảng 3: Định mức với header gom nhóm
        if (baoCaoData.dinhMucThucTe && baoCaoData.dinhMucThucTe.length > 0) {
            doc.addPage();
            yPos = 15;
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DINH MUC THUC TE SAN XUAT (Mau 16)', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
            yPos += 10;
            
            const dinhMucData = baoCaoData.dinhMucThucTe.map(item => [
                item.stt || '',
                removeVietnameseTones(item.ma_sp || ''),
                removeVietnameseTones(item.ten_sp || ''),
                removeVietnameseTones(item.don_vi_tinh_sp || ''),
                removeVietnameseTones(item.ma_npl || ''),
                removeVietnameseTones(item.ten_npl || ''),
                removeVietnameseTones(item.don_vi_tinh_npl || ''),
                item.luong_sd?.toLocaleString() || '0',
                removeVietnameseTones(item.ghi_chu || '')
            ]);
            
            autoTable(doc, {
                startY: yPos,
                head: [
                    // Header nhóm
                    [
                        { content: 'STT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ma SP', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ten san pham', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'DVT (SP)', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Nguyen lieu, vat tu', colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Dinh muc/1SP', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Ghi chu', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
                    ],
                    // Header chi tiết
                    [
                        { content: 'Ma NPL', styles: { halign: 'center' } },
                        { content: 'Ten NPL', styles: { halign: 'center' } },
                        { content: 'DVT (NPL)', styles: { halign: 'center' } }
                    ]
                ],
                body: dinhMucData,
                theme: 'grid',
                styles: { 
                    fontSize: 8, 
                    cellPadding: 2,
                    font: 'helvetica',
                    halign: 'center',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                headStyles: { 
                    fillColor: [211, 211, 211], 
                    textColor: [0, 0, 0], 
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                bodyStyles: {
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 35, halign: 'left' },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 20, halign: 'center' },
                    5: { cellWidth: 35, halign: 'left' },
                    6: { cellWidth: 20, halign: 'center' },
                    7: { cellWidth: 25, halign: 'right' },
                    8: { cellWidth: 30, halign: 'left' }
                }
            });
        }
        
        // Note: Additional JSON data fields (data_ton_dau_ky, data_nhap_trong_ky, etc.) 
        // are included in the Excel export for detailed analysis.
        // PDF export focuses on the main report tables to keep file size manageable.
        
        // Lưu file
        doc.save(`${fileName}.pdf`);
        console.log('PDF da duoc tao thanh cong:', fileName);
        
        return true;
    } catch (error) {
        console.error('Loi khi xuat PDF:', error);
        console.error('Chi tiet loi:', error.message, error.stack);
        throw new Error(`Loi xuat PDF: ${error.message}`);
    }
};

export default exportBaoCaoToPDF;
