'use strict';

const db = require('./models');
const HaiQuan = db.HaiQuan;

const seedHaiQuan = async () => {
    try {
        const account = {
            ten_hq: 'Hải quan quản trị',
            email: 'admin@sxxk.local',
            sdt: '0900000000',
            tai_khoan: 'admin',
            mat_khau: 'admin123'
        };

        const existing = await HaiQuan.findOne({ where: { tai_khoan: account.tai_khoan } });
        if (!existing) {
            await HaiQuan.create(account);
            console.log(`✅ Created HảiQuan: ${account.tai_khoan}`);
        } else {
            console.log(`⏭️  Already exists HảiQuan: ${account.tai_khoan}`);
        }
    } catch (error) {
        console.error('❌ Lỗi seed HảiQuan:', error);
        process.exit(1);
    }

    process.exit(0);
};

seedHaiQuan();
