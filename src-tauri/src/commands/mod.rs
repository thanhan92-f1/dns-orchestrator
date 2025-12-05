pub mod account;
pub mod dns;
pub mod domain;

// Toolbox 模块依赖 hickory_resolver 和 whois_rust，这些在 Android 上不可用
#[cfg(not(target_os = "android"))]
pub mod toolbox;
