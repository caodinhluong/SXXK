'use strict';

const db = require('./models');
const TienTe = db.TienTe;

const seedTienTe = async () => {
    const currencies = [
        { ma_tt: 'VND', ten_tt: 'Việt Nam Đồng' },
        { ma_tt: 'USD', ten_tt: 'US Dollar' },
        { ma_tt: 'EUR', ten_tt: 'Euro' },
        { ma_tt: 'JPY', ten_tt: 'Japanese Yen' },
        { ma_tt: 'CNY', ten_tt: 'Chinese Yuan' },
        { ma_tt: 'GBP', ten_tt: 'British Pound' },
        { ma_tt: 'AUD', ten_tt: 'Australian Dollar' },
        { ma_tt: 'CAD', ten_tt: 'Canadian Dollar' },
        { ma_tt: 'SGD', ten_tt: 'Singapore Dollar' },
        { ma_tt: 'KRW', ten_tt: 'South Korean Won' },
        { ma_tt: 'THB', ten_tt: 'Thai Baht' },
        { ma_tt: 'MYR', ten_tt: 'Malaysian Ringgit' },
        { ma_tt: 'PHP', ten_tt: 'Philippine Peso' },
        { ma_tt: 'INR', ten_tt: 'Indian Rupee' },
        { ma_tt: 'HKD', ten_tt: 'Hong Kong Dollar' },
    ];

    try {
        for (const currency of currencies) {
            const existing = await TienTe.findOne({ where: { ma_tt: currency.ma_tt } });
            if (!existing) {
                await TienTe.create(currency);
                console.log(`✅ Created: ${currency.ma_tt} - ${currency.ten_tt}`);
            } else {
                console.log(`⏭️  Already exists: ${currency.ma_tt}`);
            }
        }
        console.log('✅ Seed tiền tệ hoàn tất!');
    } catch (error) {
        console.error('❌ Lỗi seed:', error);
    }
    process.exit();
};

seedTienTe();