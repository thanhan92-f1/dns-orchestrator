use serde::Serialize;
use thiserror::Error;

// ============ Re-export 库错误类型 ============

pub use dns_orchestrator_provider::{
    // Provider 错误
    ProviderError,
    // 库层 DNS 错误（重命名避免冲突）
    DnsError as LibDnsError,
};

// ============ 应用层错误类型 ============

#[derive(Error, Debug, Serialize)]
#[serde(tag = "code", content = "details")]
pub enum DnsError {
    #[error("Provider not found: {0}")]
    ProviderNotFound(String),

    #[error("Account not found: {0}")]
    AccountNotFound(String),

    #[error("Domain not found: {0}")]
    DomainNotFound(String),

    #[error("Record not found: {0}")]
    RecordNotFound(String),

    #[error("Credential error: {0}")]
    CredentialError(String),

    #[error("API error: {provider} - {message}")]
    ApiError { provider: String, message: String },

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Import/Export error: {0}")]
    ImportExportError(String),

    /// Provider 错误（从库转换）
    #[error("{0}")]
    Provider(#[from] ProviderError),

    /// 库层错误（从库转换）
    #[error("{0}")]
    Library(#[from] LibDnsError),
}

pub type Result<T> = std::result::Result<T, DnsError>;
