// 桌面端使用系统 Keychain
#[cfg(not(target_os = "android"))]
mod keychain;
#[cfg(not(target_os = "android"))]
pub use keychain::KeychainStore;

// Android 端使用内存存储（临时方案，后续可接入 Stronghold）
#[cfg(target_os = "android")]
mod android;
#[cfg(target_os = "android")]
pub use android::AndroidCredentialStore;

use crate::error::Result;
use std::collections::HashMap;

/// 凭证映射类型：account_id -> credentials
pub type CredentialsMap = HashMap<String, HashMap<String, String>>;

/// 凭证存储 Trait
pub trait CredentialStore: Send + Sync {
    /// 一次性加载所有凭证（启动时使用，只访问一次 Keychain）
    fn load_all(&self) -> Result<CredentialsMap>;

    /// 保存凭证（会读取-修改-写入整个凭证存储）
    fn save(&self, account_id: &str, credentials: &HashMap<String, String>) -> Result<()>;

    /// 加载单个账户凭证
    fn load(&self, account_id: &str) -> Result<HashMap<String, String>>;

    /// 删除凭证（会读取-修改-写入整个凭证存储）
    fn delete(&self, account_id: &str) -> Result<()>;

    /// 检查凭证是否存在
    fn exists(&self, account_id: &str) -> bool;
}
