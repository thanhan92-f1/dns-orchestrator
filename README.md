# DNS Orchestrator

跨平台桌面应用，统一管理多个 DNS 服务商的域名解析记录。

## 支持的 DNS 服务商

- Cloudflare
- 阿里云 DNS
- 腾讯云 DNSPod

## 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS + Zustand
- **后端**: Rust + Tauri 2
- **凭证存储**: 系统钥匙串 (macOS Keychain / Windows Credential Manager / Linux Secret Service)

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm tauri dev

# 构建应用
pnpm tauri build

# 同步版本号 (package.json → tauri.conf.json + Cargo.toml)
pnpm sync-version
```

## 功能

- 多账号管理
- 域名列表查看
- DNS 记录增删改查
- 支持 A/AAAA/CNAME/MX/TXT/NS/SRV/CAA 记录类型
- 深色/浅色主题
- 中/英/日多语言

## 系统要求

- macOS 10.13+
- Windows 10+
- Linux (需要 DBus Secret Service)

## 许可证

MIT
