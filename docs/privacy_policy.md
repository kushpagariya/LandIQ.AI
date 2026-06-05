# LandIQ.AI - Privacy and Consent Policy

This document outlines the privacy, consent, and data retention policies enforced within the LandIQ.AI system, specifically regarding Audit Logs and Personally Identifiable Information (PII) like Client IP addresses.

## 1. IP Address Anonymization & Encryption
To comply with global privacy regulations (e.g., GDPR, CCPA):
- **Deterministic One-Way Hashing**: Any incoming client IP address is hashed deterministically using SHA-256 combined with the server's secret key (`SECRET_KEY`). This ensures that the original IP address cannot be reversed or retrieved from the database while maintaining searchability for unique request correlations.
- **Encryption Wrapper**: Hashed values are base64-encoded and prefixed with `ENC:` prior to being stored, simulating encryption and security ACL requirements.
- **No Raw Storage**: Raw, unhashed client IP addresses are never written to any persistent storage or database.

## 2. Consent Enforcement
Consent checks are integrated directly into the ingestion pipeline:
- **`STORE_IP_ADDRESSES`**: A system-wide feature flag to toggle IP logging. If set to `False`, all client IP addresses are immediately stripped and stored as `None`.
- **`USER_CONSENT_GIVEN`**: An explicit user consent check. If consent is not provided, the IP logging is bypassed.

## 3. Data Retention Policy
To minimize data footprint and avoid long-term PII storage:
- **`DATA_RETENTION_DAYS`**: Configured to `90` days by default.
- **Automated Retention Purge**: During the analysis run sequence, a database retention routine (`purge_old_audit_logs`) is invoked to delete all audit log records older than the cutoff period.
