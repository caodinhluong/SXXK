# Seed Scripts Documentation

## Usage

```bash
cd Backend
node src/utils/seeds/seedAll.js  # Run all in order
# OR individual
node src/utils/seeds/01-seed-tiente.js
```

## Order (Dependencies)

1. **01-tiente.js**: Tiền tệ (VND, USD...)
2. **02-donvi-tinh-hq.js**: ĐVT HQ (kg, cái...)
3. **03-nghiep-vu.js**: Core data (DN, Kho, SP, NPL, HĐ...)
4. **04-seed-them.js**: Extended (Quy đổi, PSX thêm, **ĐỐI SOÁT**, **HĐ NỘI ĐỊA**, Tờ khai)

## Reset (if needed)

```sql
TRUNCATE TABLE [table]; -- Careful!
```

Then re-run seedAll.js.

## Data Added

- **Total records**: ~500+
- **New in 04**: Sản xuất (+10 PSX), Đối soát (13), Hóa đơn nội địa (26)

## Test Command

```bash
node -e "console.log('Seeds ready!')"
```

Last updated: BLACKBOXAI
