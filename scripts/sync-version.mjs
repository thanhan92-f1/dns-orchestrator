/**
 * 同步 package.json 的版本号到 tauri.conf.json 和 Cargo.toml
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// 读取 package.json 版本
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
const version = packageJson.version;

console.log(`同步版本号: ${version}`);

// 更新 tauri.conf.json
const tauriConfPath = resolve(root, 'src-tauri/tauri.conf.json');
const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf-8'));
tauriConf.version = version;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log('✓ tauri.conf.json');

// 更新 Cargo.toml
const cargoTomlPath = resolve(root, 'src-tauri/Cargo.toml');
let cargoToml = readFileSync(cargoTomlPath, 'utf-8');
cargoToml = cargoToml.replace(/^version\s*=\s*"[^"]*"/m, `version = "${version}"`);
writeFileSync(cargoTomlPath, cargoToml);
console.log('✓ Cargo.toml');

console.log('版本同步完成');
