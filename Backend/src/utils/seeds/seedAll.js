'use strict';

const { execSync } = require('child_process');
const path = require('path');

const SEEDS_DIR = __dirname;
const BACKEND_ROOT = path.resolve(SEEDS_DIR, '..', '..', '..');
const SEED_FILES = [
    path.join('src', 'seed-tiente.js'),
    path.join('src', 'seed-dvthq.js'),
    path.join('src', 'seed-haiquan.js'),
    path.join('src', 'seed-nghiep-vu.js'),
    path.join('src', 'seed-them.js')
];

async function runSeed(file) {
    console.log(`\n🚀 Running ${file}...`);
    try {
        execSync(`node ${path.join(BACKEND_ROOT, file)}`, { stdio: 'inherit', cwd: BACKEND_ROOT });
        console.log(`✅ ${file} completed`);
    } catch (error) {
        console.error(`❌ ${file} failed:`, error.message);
        process.exit(1);
    }
}

async function main() {
    console.log('🌱 Starting ALL seeds in order...\n');
    console.log('Make sure:');
    console.log('- Server DB connected');
    console.log('- Models synced');
    console.log('- Run from Backend/\n');

    for (const file of SEED_FILES) {
        await runSeed(file);
    }

    console.log('\n🎉 ALL SEEDS COMPLETED SUCCESSFULLY!');
    console.log('Run individual: node src/utils/seeds/XX-seed-YY.js');
    console.log('DB ready for testing!');
}

main();

