# TowerBlock Chain — Constitutional Ledger Model

Purpose
Provide cryptographic provenance, governance events, and enforceable policy rails for Civilization AI.

Data Model (Event Types)
- CHARTER_PUBLISH: Charter hash, signers, KMS proofs
- BOUNDARY_DRAFT/FINAL: Zone maps, diff hashes, comment windows
- COURT_CASE: Docket, filings, opinions, remedies
- POLICY_RAIL_UPDATE: Safety rule versions and activation scopes
- CONNECTOR_APPROVAL: Data governance connectors and tier changes
- AMENDMENT_VOTE: Proposal, ballots, quorum, outcome

Security & Compliance
- Multi-region replication (us-west1, us-central1, eu-west1)
- KMS-backed signing; Merkle anchoring; rotation policies
- Public metadata only; private artifacts remain in-tenant with URIs

Interfaces
- Read API (public metadata, proofs)
- Write API (governance actors only)
- Audit API (verifiers, regulators)

Rollout
- Phase 1: Testnet governance space for boundary drafts
- Phase 2: Main governance ledger for court opinions and policy rails
- Phase 3: Cross-republic anchoring and interop bridges
