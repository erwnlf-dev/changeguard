# ChangeGuard [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Cloud-native change risk scoring and approval workflow platform for DevOps and IT teams.

## Features

* **Automated Risk Scoring:** Real-time 1-100 risk calculation based on change attributes and historical patterns.
* **Approval Workflows:** Multi-stage gates with auto-escalation rules and organizational risk thresholds.
* **Dependency Mapping:** Cross-service dependency visualization for impact analysis.
* **Timeline Tracking:** Implementation status monitoring with verification checkpoints and rollback plans.
* **Failure Analysis:** Root cause categorization and pattern analysis across deployments.
* **Compliance Reporting:** Filterable reports by team, risk level, and time period.

## Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State Management:** React Context Store
* **Deployment:** Cloudflare Pages

## Getting Started

### Prerequisites

* Node.js 18+
* npm / pnpm / yarn

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/changeguard.git
cd changeguard

# Install dependencies
npm install

# Start development server
npm run dev
```

Build production bundle:

```bash
npm run build
```

## Project Structure

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── changes/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Change request detail & approval view
│   │   │   └── page.tsx          # Change request creation & list
│   │   ├── services/
│   │   │   └── page.tsx          # Dependency map & service registry
│   │   ├── settings/
│   │   │   └── page.tsx          # Risk thresholds & workflow rules
│   │   ├── layout.tsx            # Dashboard shell & navigation
│   │   └── page.tsx              # Main analytics dashboard
│   ├── layout.tsx                # Root layout & providers
│   └── page.tsx                  # Marketing landing page
└── lib/
    ├── store.tsx                 # Global state & business logic
    ├── types.ts                  # TypeScript interfaces
    └── utils.tsx                 # Risk calculators & helpers
```

## License

This project is licensed under the MIT License.