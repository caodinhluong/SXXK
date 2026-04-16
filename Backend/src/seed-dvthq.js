'use strict';

const db = require('./models');
const DonViTinhHQ = db.DonViTinhHQ;

const seedDonViTinhHQ = async () => {
    const units = [
        { ma_dvt: 'kg', ten_dvt: 'Kilôgam', loai_dvt: 'TatCa' },
        { ma_dvt: 'g', ten_dvt: 'Gam', loai_dvt: 'TatCa' },
        { ma_dvt: 'tấn', ten_dvt: 'Tấn', loai_dvt: 'TatCa' },
        { ma_dvt: 'tạ', ten_dvt: 'Tạ', loai_dvt: 'TatCa' },
        { ma_dvt: 'yến', ten_dvt: 'Yến', loai_dvt: 'TatCa' },
        { ma_dvt: 'cái', ten_dvt: 'Cái/Chiếc', loai_dvt: 'TatCa' },
        { ma_dvt: 'bộ', ten_dvt: 'Bộ', loai_dvt: 'TatCa' },
        { ma_dvt: 'đôi', ten_dvt: 'Đôi', loai_dvt: 'TatCa' },
        { ma_dvt: 'cặp', ten_dvt: 'Cặp', loai_dvt: 'TatCa' },
        { ma_dvt: 'thùng', ten_dvt: 'Thùng', loai_dvt: 'TatCa' },
        { ma_dvt: 'bao', ten_dvt: 'Bao', loai_dvt: 'TatCa' },
        { ma_dvt: 'kiện', ten_dvt: 'Kiện', loai_dvt: 'TatCa' },
        { ma_dvt: 'pallet', ten_dvt: 'Pallet', loai_dvt: 'TatCa' },
        { ma_dvt: 'cuộn', ten_dvt: 'Cuộn', loai_dvt: 'TatCa' },
        { ma_dvt: 'mét', ten_dvt: 'Mét', loai_dvt: 'TatCa' },
        { ma_dvt: 'm2', ten_dvt: 'Mét vuông', loai_dvt: 'TatCa' },
        { ma_dvt: 'm3', ten_dvt: 'Mét khối', loai_dvt: 'TatCa' },
        { ma_dvt: 'lít', ten_dvt: 'Lít', loai_dvt: 'TatCa' },
        { ma_dvt: 'ml', ten_dvt: 'Mililit', loai_dvt: 'TatCa' },
        { ma_dvt: 'chai', ten_dvt: 'Chai/Lọ', loai_dvt: 'TatCa' },
        { ma_dvt: 'hộp', ten_dvt: 'Hộp', loai_dvt: 'TatCa' },
        { ma_dvt: 'xấp', ten_dvt: 'Xấp/Tập', loai_dvt: 'TatCa' },
        { ma_dvt: 'raj', ten_dvt: 'Raj', loai_dvt: 'TatCa' },
        { ma_dvt: 'kg/cuộn', ten_dvt: 'Kilôgam/cuộn', loai_dvt: 'DonViNguon', ty_le_quy_doi: 25, id_dvt_dich: 1 },
    ];

    try {
        for (const unit of units) {
            const existing = await DonViTinhHQ.findOne({ where: { ma_dvt: unit.ma_dvt } });
            if (!existing) {
                await DonViTinhHQ.create(unit);
                console.log(`✅ Created: ${unit.ma_dvt} - ${unit.ten_dvt}`);
            } else {
                console.log(`⏭️  Already exists: ${unit.ma_dvt}`);
            }
        }
        console.log('✅ Seed đơn vị tính HQ hoàn tất!');
    } catch (error) {
        console.error('❌ Lỗi seed:', error);
    }
    process.exit();
};

seedDonViTinhHQ();