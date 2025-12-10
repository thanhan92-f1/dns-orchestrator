//! Provider 模块
//!
//! 此模块提供 Provider 注册表（应用层管理）和从库的 re-export。

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

// Re-export from library
pub use dns_orchestrator_provider::{create_provider, get_all_provider_metadata, DnsProvider};

/// Provider 注册表 - 管理所有已注册的 Provider 实例
/// 按 `account_id` 索引 Provider 实例
#[derive(Clone)]
pub struct ProviderRegistry {
    providers: Arc<RwLock<HashMap<String, Arc<dyn DnsProvider>>>>,
}

impl ProviderRegistry {
    pub fn new() -> Self {
        Self {
            providers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// 注册提供商实例 (按 `account_id`)
    pub async fn register(&self, account_id: String, provider: Arc<dyn DnsProvider>) {
        self.providers.write().await.insert(account_id, provider);
    }

    /// 注销提供商
    pub async fn unregister(&self, account_id: &str) {
        self.providers.write().await.remove(account_id);
    }

    /// 获取提供商实例
    pub async fn get(&self, account_id: &str) -> Option<Arc<dyn DnsProvider>> {
        self.providers.read().await.get(account_id).cloned()
    }

    /// 获取所有已注册的 `account_id`
    pub async fn list_account_ids(&self) -> Vec<String> {
        self.providers.read().await.keys().cloned().collect()
    }
}

impl Default for ProviderRegistry {
    fn default() -> Self {
        Self::new()
    }
}
