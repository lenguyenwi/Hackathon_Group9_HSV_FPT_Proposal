/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScoringCriterionConfig } from '../types';

export const DEFAULT_SCORING_CRITERIA: ScoringCriterionConfig[] = [
  {
    id: 'problem_understanding',
    name: 'Problem Understanding',
    description: "Does the proposal correctly reflect the client's actual stated problem and goals from the RFP instead of giving a generic pitch?",
    weight: 15,
    enabled: true,
  },
  {
    id: 'scope_deliverables',
    name: 'Scope & Deliverables Clarity',
    description: 'Are deliverables specific and unambiguous? Is it clear what is included and excluded?',
    weight: 15,
    enabled: true,
  },
  {
    id: 'pricing_clarity',
    name: 'Pricing Clarity',
    description: 'Is pricing clearly stated, broken down and understandable? Avoids vague statements such as "pricing on request".',
    weight: 15,
    enabled: true,
  },
  {
    id: 'timeline_clarity',
    name: 'Timeline Clarity',
    description: 'Are dates, phases and milestones concrete instead of vague wording such as "as soon as possible"?',
    weight: 15,
    enabled: true,
  },
  {
    id: 'completeness',
    name: 'Completeness vs RFP Requirements',
    description: 'Does the proposal address all explicit RFP requirements?',
    weight: 20,
    enabled: true,
  },
  {
    id: 'tone_persuasiveness',
    name: 'Tone & Persuasiveness',
    description: 'Is the writing confident, client-focused and professional without being generic boilerplate?',
    weight: 10,
    enabled: true,
  },
  {
    id: 'risk_transparency',
    name: 'Risk / Assumptions Transparency',
    description: 'Are assumptions, dependencies and risks clearly disclosed?',
    weight: 10,
    enabled: true,
  },
];

export const DEMO_RFP_TEXT = `# REQUEST FOR PROPOSAL (RFP)
## Project: Multi-Warehouse Real-Time Inventory Management Platform (LogiTrack 360)
**Issuer:** GlobalLogix Distribution Group SE  
**RFP ID:** GLX-2025-INV-09  
**Submission Deadline:** November 15, 2025  
**Estimated Budget:** €80,000 to €120,000 (inclusive of implementation and Year 1 maintenance)

---

### 1. Executive Summary & Business Objectives
GlobalLogix operates six central distribution hubs across Western and Central Europe (Berlin, Lyon, Warsaw, Madrid, Milan, and Rotterdam). Currently, stock reconciliation between warehouse management systems (WMS) relies on batch CSV exports, leading to inventory discrepancies, stockouts, and delayed order fulfillment. GlobalLogix invites vendor proposals to deploy a unified, real-time inventory monitoring platform.

### 2. Functional Requirements
* **REQ-01 [Mandatory]: Real-Time Multi-Warehouse Inventory Dashboard**
  The platform must aggregate stock counts across all six regional warehouses simultaneously with sub-second synchronization upon receiving barcode/RFID scanner updates.
* **REQ-02 [Mandatory]: Automated Low-Stock Alerting Engine**
  Configurable reorder thresholds per SKU and warehouse location. System must dispatch immediate automated notifications via email and SMS to assigned supply chain dispatchers.
* **REQ-03 [Important]: Role-Based Access Control (RBAC)**
  Strict separation of roles: Warehouse Worker (read/scan only), Shift Supervisor (stock adjustment approval), and Global Supply Chain Director (full system configuration, reporting, audit logs). Must integrate with enterprise Azure AD via SAML 2.0 / OAuth2.

### 3. Technical Constraints & Architecture
* **REQ-04 [Mandatory / Critical Constraint]: Existing PostgreSQL Database Retention**
  GlobalLogix maintains a central PostgreSQL 15 database running on internal bare-metal clusters with existing enterprise ERP hooks. The solution MUST integrate directly with this existing PostgreSQL database. **Database migration or replacement is strictly NOT allowed** due to regulatory audit compliance and legacy ERP bindings.
* **REQ-05 [Important]: High Availability & SLA**
  Target 99.9% uptime during operational peak hours (06:00 - 22:00 CET).

### 4. Implementation Timeline & Phased Rollout
* **REQ-06 [Mandatory]: Phased Deployment Schedule**
  - **Phase 1 Pilot:** The pilot deployment must be completed and fully verified in the Berlin warehouse within 3 months of contract signing.
  - **Phase 2 Full Rollout:** The remaining five warehouses (Lyon, Warsaw, Madrid, Milan, Rotterdam) must be fully operational within 6 months of contract signing.

### 5. Support & Maintenance
* **REQ-07 [Mandatory]: Post-Go-Live Support**
  Supplier must provide one year (12 months) of 24/7 Level-2/Level-3 post-go-live technical support and software maintenance included within the base commercial offer. Response time must be under 30 minutes for Critical severity tickets.

### 6. Commercial Terms & Pricing
* **REQ-08 [Mandatory]: Commercial Ceiling & Transparent Breakdown**
  Total proposed costs must be fixed-bid between €80,000 and €120,000. The proposal must provide a line-item pricing breakdown including licensing, configuration, training, and Year 1 support.

### 7. Governance, Assumptions & Risks
* **REQ-09 [Important]: Transparency on Risks & Assumptions**
  Bidders must document all technical assumptions, external network dependencies, data migration prerequisites, and identified project risks along with mitigation plans.
`;

export const DEMO_PROPOSAL_TEXT = `# PROPOSAL IN RESPONSE TO GLOBALLOGIX RFP GLX-2025-INV-09
## "OmniInventory Enterprise: Next-Gen Supply Chain Intelligence"
**Vendor:** OmniTech Solutions BV  
**Date:** November 10, 2025  
**Prepared For:** GlobalLogix Distribution Group SE  

---

### 1. Executive Summary & Our Understanding
OmniTech Solutions is delighted to submit this proposal for GlobalLogix. We recognize the operational challenges faced by your six distribution hubs in Berlin, Lyon, Warsaw, Madrid, Milan, and Rotterdam. OmniInventory Enterprise is an industry-acclaimed cloud-first solution engineered to eliminate inventory blindness and streamline fulfillment operations across Europe.

### 2. Proposed Solution & Features
* **Real-Time Visibility Dashboard:**
  OmniInventory provides a single-pane-of-glass dashboard displaying active SKU levels across all six distribution centers. Stock levels synchronize instantly whenever warehouse barcode scanners submit transaction telemetry.
* **Intelligent Stock Alerts:**
  Our notification module monitors stock thresholds and automatically triggers priority email notifications when minimum buffers are breached.
* **Enterprise Security & SSO:**
  We support enterprise role-based authorization (RBAC) with prebuilt connectors for Azure Active Directory via SAML 2.0 and OAuth2, granting segregated access for warehouse operatives, supervisors, and executive directors.
* **Bonus Feature - Autonomous Drone Scanning:**
  As an added value bonus, OmniTech will bundle three experimental autonomous inventory drones for warehouse aisle optical scanning at zero extra cost.

### 3. Technical Architecture & Database Strategy
To provide maximum scalability, real-time streaming throughput, and leverage our proprietary AI analytics engine, OmniTech will migrate GlobalLogix's existing PostgreSQL database into our proprietary cloud NoSQL cluster (OmniCloud Dynamo Store). Our engineers will handle the entire schema re-architecture and database conversion during Week 4.

### 4. Implementation Methodology & Timeline
OmniTech follows an Agile Scrum methodology. We believe rigid Gantt charts impede innovation. Phased rollout will begin promptly following contract execution, and project delivery will happen in a timely manner through continuous 2-week sprint increments until all facilities are live.

### 5. Support & Maintenance
OmniTech takes pride in high customer satisfaction. Our customer success managers are available during normal office hours to assist your team with onboarding and general queries.

### 6. Commercial Proposal
* **Core Solution Implementation:** €95,000 (fixed software setup, UI configuration, and end-user training).
* **Support & Ongoing Services:** Pricing for annual ongoing technical support, SLAs, and maintenance packages will be provided after discovery and system scoping.

### 7. Project Assumptions & Risks
We assume GlobalLogix will provide uninterrupted broadband connectivity across all six warehouses.
`;

export const DEFAULT_RFP_TEXT = DEMO_RFP_TEXT;
export const DEFAULT_PROPOSAL_TEXT = DEMO_PROPOSAL_TEXT;

