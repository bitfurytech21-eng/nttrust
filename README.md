# Northern Trust — Private Wealth & Institutional Banking Portal

An enterprise-grade online banking and treasury management platform with high-security clearance workflows, institutional compliance tools, real-time clearing feeds, tax ledger management, and responsive 3D animated financial data wave visuals.

---

## 🏛 Features Overview

### 1. Private Client Banking Enclave
- **Real-Time Financial Dashboard**: Multi-asset depository reserves overview, credit utilization gauges, live settlement tickers, and quick action toolbars (Fedwire, Domestic ACH, Remote Check Deposit, Bill Pay, Official Statements, Wiring Slips).
- **Certified Tax & Regulatory Filing Center**:
  - Multi-year tax metrics (2023–2026) covering interest income (1099-INT), dividend proceeds (1099-DIV), capital gains (1099-B), and Schedule K-1 trust allocations.
  - Interactive **Recharts 3-Year Comparative Bar Chart** for Federal EFTPS, CA State Franchise, and statutory withholdings.
  - Searchable, filterable tax transaction ledger with one-click printable official remittance receipts.
  - Decoupled **Tax Deadline & Documentation Notification Badge** for upcoming quarterly filings and FinCEN W-9 recertifications.
- **Dynamic 3D Digital Wave Visual Layer**:
  - Continuously undulating, canvas-driven harmonic wave animation representing live financial data streams.
  - Fully responsive with battery-conscious frame pacing and automatic `prefers-reduced-motion` compliance.

### 2. Banking Operations & Security
- **Multi-Factor Authentication & Device Enclave**: Hardware token integration, biometric verification prompts, and trusted device fingerprinting.
- **Institutional Administrative Portal**: Staff clearance management, multi-role access controls (RBAC), and FinCEN/AML audit logging.
- **Card Security & Protected Disclosure Controls**: Dynamic card masking, instant lock/unlock controls, and daily spend limits.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Motion & UI Dynamics**: [Motion (Framer Motion)](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR Code Generation**: [QRCode](https://github.com/soldair/node-qrcode)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Local Development
To launch the local development server on port 3000:
```bash
npm run dev
```

### Production Build
To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 🔒 Security & Compliance
- Compliant with WCAG 2.1 AA accessibility standards (aria-labels on all banking controls and verification dialogs).
- Isolated client-side authentication and mock ledger protocols ensuring strict data boundaries.
