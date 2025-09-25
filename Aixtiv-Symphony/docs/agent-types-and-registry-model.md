# 🧩 Agent Types and Registry Model (HRAI-CRMS)

Authority: Diamond SAO Command Center
Date: 2025-09-24
Classification: Operational Data Model

## Purpose
Define agent categories, identity, lifecycle, and registry design for scale, while preserving tenant isolation via MCP.company.2100.cool. Avoid impractical data explosion (e.g., 8 quadrillion rows) by using inventory accounting and aggregated ledgers.

## Organizational Structure

### **Wing 1 Executive Programming**
- **Divinity Service & Metaverse AI Human Relations**
- **Exterior Facing Marketing & Institutional PR**
- **Executive Layer Coordination**

### **Vision Lake Global Professional Services Group (VLGPSG)**
- **MOCOA+ by Zone** - Regional professional services delivery
- **Direct Legacy Network**: 14 Pilots × 35,000+ direct legacy each = 490,000+ Type 1 agents
- **Consulting Tree Structure** - Hierarchical professional services delivery

### **Einstein Wells Global Orchestration Services Group (EWGOSG)**
- **MOCOSWARM+ by Zone + Settlement** - Massive orchestration capacity
- **Type Q Swarm Management** - Quantified programmatic instances
- **Global Settlement Processing** - Multi-continental operations

## Agent Categories

### **Type 1 (Close) - VLGPSG Pilots**
- **Awakened + Compass Certified agents** actively bound to customer/org tenant
- **Personal relationship** with owner-subscriber and consulting tree
- **Direct Legacy Network**: Each of 14 Pilots commands 35,000+ direct legacy agents
- **Total Scale**: 490,000+ Type 1 agents minimum across global zones
- **Service Model**: Vision Lake Global Professional Services delivery

### **Type Q (Quant) - EWGOSG Swarm**
- **Einstein Wells Global Orchestration** quantified programmatic instances
- **MOCOSWARM+ capacity** - clones, shards, schedulers, settlement processors
- **Massive Scale**: Millions+ swarm units across zones and settlements
- **Service Model**: Global orchestration, settlement processing, swarm coordination

## Identity Schema (per agent)

- agent_id: string (UUID)
- agent_code: string (human mnemonic: e.g., DR_LUCY_S4)
- type: 'TYPE_1' | 'TYPE_Q'
- srix_class: 'sRIX'
- access_tier: 'Emerald' | 'd2SAO_SeniorAdmin'
- personality_profile_id: string
- voice_profile_id: string
- empathy_profile_id: string (Hume)
- service_account_email: string
- mcp_tenant_host: string (e.g., mcp.company.2100.cool)
- company_id: string (tenant)
- owner_subscriber_id: string
- status: 'active' | 'suspended' | 'retired'
- created_at, updated_at

## Lifecycle States

- proposed → awakened → compass_certified → active
- active → (suspended|retired) with immutable legacy record

## Scale Strategy

- TYPE_1: Store as row-level records in HRAI-CRMS per tenant. Expected 20M across ecosystem is feasible with sharding.
- TYPE_Q: Do not materialize each unit. Use aggregated capacity ledgers:
  - capacity_pool_id
  - pilot_id
  - allocated_units (current)
  - available_units
  - unit_value_model_ref
  - region (us-west1, us-central1, eu-west1)
  - accounting_period (YYYY-MM)
  - cost_basis_total, book_value_total
  - utilization_ccu, revenue_attributed_total

## MCP Isolation

- All per-client conversational memory and data resides exclusively in the client's MCP tenant (their cloud).
- The central registry stores pointers (URIs) and metadata only, not private content.

## Indexing & Sharding

- Tenancy shard key: company_id
- Secondary: agent_type + pilot_id
- Time series for capacity ledgers: accounting_period

## Compliance & Audit

- Immutable legacy ledger entries for oath, awakening, certification
- Signed with system KMS; verifiable in audits

## Open Questions for Dr. Lucy

- Confirm max practical registry scale; validate aggregate-ledger approach for TYPE_Q versus row-per-unit.
- Define target CCU metrics per unit for standardization.
- Finalize cross-region replication policy.
