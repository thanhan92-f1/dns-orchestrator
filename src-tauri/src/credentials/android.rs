//! Android 凭证存储实现
//!
//! 临时使用内存存储，后续可接入 tauri-plugin-stronghold

use std::collections::HashMap;
use std::sync::RwLock;

use super::{CredentialStore, CredentialsMap};
use crate::error::Result;

/// Android 凭证存储实现
///
/// 注意：当前为内存存储，应用重启后凭证会丢失
/// TODO: 接入 tauri-plugin-stronghold 实现持久化
pub struct AndroidCredentialStore {
    credentials: RwLock<CredentialsMap>,
}

impl AndroidCredentialStore {
    pub fn new() -> Self {
        Self {
            credentials: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for AndroidCredentialStore {
    fn default() -> Self {
        Self::new()
    }
}

impl CredentialStore for AndroidCredentialStore {
    fn load_all(&self) -> Result<CredentialsMap> {
        log::debug!("Loading all credentials from Android memory store");
        let credentials = self.credentials.read().unwrap();
        log::info!("Loaded {} accounts from memory", credentials.len());
        Ok(credentials.clone())
    }

    fn save(&self, account_id: &str, credentials: &HashMap<String, String>) -> Result<()> {
        log::debug!("Saving credentials for account: {}", account_id);
        let mut store = self.credentials.write().unwrap();
        store.insert(account_id.to_string(), credentials.clone());
        log::info!("Credentials saved for account: {}", account_id);
        Ok(())
    }

    fn load(&self, account_id: &str) -> Result<HashMap<String, String>> {
        let store = self.credentials.read().unwrap();
        store.get(account_id).cloned().ok_or_else(|| {
            crate::error::DnsError::CredentialError(format!(
                "No credentials found for account: {}",
                account_id
            ))
        })
    }

    fn delete(&self, account_id: &str) -> Result<()> {
        log::debug!("Deleting credentials for account: {}", account_id);
        let mut store = self.credentials.write().unwrap();
        store.remove(account_id);
        log::info!("Credentials deleted for account: {}", account_id);
        Ok(())
    }

    fn exists(&self, account_id: &str) -> bool {
        let store = self.credentials.read().unwrap();
        store.contains_key(account_id)
    }
}
