# 📊 Giant Superstore - Business Intelligence & Analytics Dashboard

> **Capstone Project — Team 14 Section Surabaya (RevoU Studi Independen Bersertifikat)**  
> An interactive web-based Business Intelligence dashboard and transaction explorer inspired by Google Looker Studio, analyzing 9,993 retail transactions to uncover revenue drivers, regional growth opportunities, customer segmentation behavior, and discount impact.

---

## 🎯 Executive Summary & Case Background

**Giant Superstore** is a nationwide US retail enterprise specializing in three core product categories: *Furniture*, *Office Supplies*, and *Technology Products*. Operating across Central, East, South, and West regions, the company faced cut-throat market competition and needed deep data-driven visibility into:
1. **Profitability vs. Volume Trade-offs**: Identifying high-volume product categories that suffer negative profit margins due to excessive discounts.
2. **Customer Segmentation & Loyalty**: Classifying customers into behavioral tiers (*Buyer*, *Discount Hunter*, *Royal Buyer*) to tailor retention campaigns.
3. **Geographic Growth & Market Optimization**: Pinpointing top-grossing vs. underperforming metropolitan markets.

This project delivers a **full-stack analytical dashboard** featuring dynamic multi-dimensional filtering, real-time metrics calculation, responsive interactive data visualizations, and an enterprise transaction data table.

---

## 🚀 Key Features & Capabilities

### 1. 🔍 Looker Studio Interactive Control Bar
- **Multi-Dimensional Dropdown Filters**:
  - **Year Filter**: `All Years (2014 - 2017)`, `2014`, `2015`, `2016`, `2017`
  - **Region Filter**: `All Regions`, `Central`, `East`, `South`, `West`
  - **Segment Filter**: `All Segments`, `Consumer`, `Corporate`, `Home Office`
  - **Category Filter**: `All Categories`, `Furniture`, `Office Supplies`, `Technology`
  - **Customer Tier Filter**: `All Tiers`, `Buyer`, `Discount Hunter`, `Royal Buyer`
- **Instant Client-Side Query Re-aggregation**: Filtering any dimension dynamically re-computes all 13 visualizations and 5 KPI scorecards on the fly with zero page reload.
- **One-Click Filter Reset & Active Record Counter**: Live status badge displaying exact count of filtered records (e.g. `● 2,587 Records Filtered`).

### 2. 📈 Executive Scorecards (KPI Metrics)
- **Total Orders**: Dynamic count of distinct transaction orders.
- **Total Customers**: Count of unique active customer IDs.
- **Total Sales Revenue**: Compact currency formatting (`$1,028.0M`).
- **Total Net Profit**: Compact profit calculation (`$4,577.9M`).
- **Profit Margin (%)**: Real-time margin efficiency indicator (`445.3%`).

### 3. 📊 13 Comprehensive Business Visualizations
| Section | Visualizations Included | Chart Type |
|---|---|---|
| **Customer Intelligence** | Customer Distribution by Behavioral Tier | Doughnut Chart |
| **Financial Trajectory** | Quarterly Net Profit Trajectory (2014–2017) by Tier | Multi-Line Chart |
| **Product Volume** | Category Quantity Purchased across Customer Tiers | Grouped Bar Chart |
| **Product Hierarchy** | Top 5 Sub-Categories by Sales & Top 5 by Profit | Horizontal Bar Charts |
| **Regional Analytics** | Customer Volume by Region across Customer Tiers | Grouped Bar Chart |
| **Metropolitan Markets** | Top 5 Cities by Sales Revenue & Top 5 by Net Profit | Horizontal Bar Charts |
| **Market Segmentation** | Order Volume, Total Sales, Total Profit & Customer Count by Segment | Doughnut & Bar Charts |
| **Pricing & Margin Risk** | Order Volume across Discount Brackets (0% – 80%) by Tier | Stacked Bar Chart |

### 4. 🗂️ High-Performance Transaction Data Grid
- **Wide Column Layout (`min-width: 1500px`)**: Displays all 15 transaction attributes without text clipping or squeezing.
- **Sticky Column Headers**: Table header locks to the top during vertical scroll.
- **Instant Search**: Sub-millisecond text search across Order IDs, Customer Names, Products, Cities, and Categories.
- **Dynamic Pagination**: Configurable rows per page (10, 25, 50, 100) with jump-to-page input.
- **Visual Status Badges**: Outlier detection flags (`badge-normal` / `badge-outlier`), category tags, and color-coded financial metrics.

### 5. 🔄 Life Cycle of Data Analysis Project
Interactive documentation of the 6-stage CRISP-DM methodology:
1. **Business Issue Understanding (BUI)**
2. **Data Understanding (DU)**
3. **Data Preparation (DP)**
4. **Exploratory Analysis & Modeling (EAM)**
5. **Validation (V)**
6. **Visualization & Presentation (VP)**

---

## 💡 Key Analytical Insights & Business Recommendations

1. **The Discount Trap**:
   - Customers classified as *Discount Hunters* generate significant order frequency in high discount brackets (0.4–0.8), but contribute negative net margins in sub-categories such as *Tables* and *Bookcases*.
   - **Recommendation**: Cap automated discounts at a 20% ceiling and restrict aggressive discounting to high-margin accessories.

2. **Technology is the Growth Engine**:
   - Technology products (*Phones*, *Copiers*, *Accessories*) yield the highest profit-to-sales conversion ratio compared to Furniture.
   - **Recommendation**: Bundle office furniture with tech peripherals to lift overall cart profitability.

3. **Geographic Focus**:
   - *New York City*, *Los Angeles*, and *Seattle* account for over 60% of positive profit flow, whereas cities like *Houston* and *Philadelphia* suffer high sales with compressed margins due to heavy local promotions.

---

## 🏗️ System Architecture & Engineering Design

The platform is designed following **Clean Architecture principles** with high **locality**, minimal surface **interfaces**, and decoupled **seams**:

```
├── js/
│   ├── dataset.js     # [Seam] Normalization & Storage Adapters (Fetch, Cache, Fixtures)
│   ├── metrics.js     # [Deep Module] Dynamic Aggregation Engine & Dimensional Querying
│   ├── dashboard.js   # [View Module] Chart.js Lifecycle & Scorecard DOM Rendering
│   ├── table.js       # [Deep Module] Transaction Grid, Pagination Arithmetic & Search
│   ├── router.js      # [Deep Module] Section Navigation & Lifecycle Animation Hooks
│   ├── carousel.js    # [UI Module] Controllable Infinite Slider with Pause/Resume API
│   └── app.js         # [Orchestrator] Application Bootstrap & Filter State Controller
├── css/
│   └── style.css      # Looker Studio UI Theme, Data Table, and Responsive Breakpoints
├── index.html         # Application Shell & Presentation Markup
├── Superstore.json    # Retail Transaction Dataset (9,993 Records)
└── test_architecture.js # Headless Unit Test Suite
```

### Architectural Principles Applied:
- **Dataset Provider Seam (`js/dataset.js`)**: Normalizes messy raw strings (`"$468.90"` → `468.90`, date parsing) at the ingestion boundary with in-memory session caching. Provides a Memory Adapter for offline unit tests.
- **Deep Metrics Engine (`js/metrics.js`)**: Replaced 13 shallow, hardcoded script files with one high-leverage query interface (`computeMetrics(orders, options)`).
- **Deletion Test**: Eliminated duplicate, conflicting table script listeners, concentrating complexity into modular testable units.

---

## 🛠️ Technology Stack

- **Frontend & Core**: Vanilla JavaScript (ES6+ Modules), HTML5 Semantic Shell, Modern CSS3 (CSS Grid & Flexbox)
- **Visualization Library**: [Chart.js](https://www.chartjs.org/) (v3.8.0), Chart.js Datalabels Plugin
- **Design Language**: Google Looker Studio / Data Studio UI Patterns
- **Icons**: [Boxicons](https://boxicons.com/), [FontAwesome](https://fontawesome.com/)
- **Testing**: Node.js Automated Architecture Test Runner

---

## ⚡ Quick Start & Local Setup

Because the application fetches the 6.5MB `Superstore.json` via asynchronous JavaScript, it should be served over an HTTP server to avoid browser `file://` CORS restrictions.

### Option 1: Python HTTP Server (Recommended)
```bash
# Navigate to the project root directory
cd "Studi Independent"

# Start a local web server on port 8000
python3 -m http.server 8000
```
Open your browser at **`http://localhost:8000`**.

### Option 2: Node.js / NPX
```bash
# Using npx serve
npx serve .

# Or using http-server
npx http-server -p 8000
```

### Option 3: VS Code Live Server
- Install the **Live Server** extension in Visual Studio Code.
- Right-click `index.html` and select **"Open with Live Server"**.

### Running the Test Suite
```bash
node test_architecture.js
```

---

## 👥 Team & Mentorship Credits

### Mentors
- 👨‍🏫 **Dally Kharisma Muhammad** — *Data Analyst Mentor*
- 👨‍🏫 **Andra Adhiatma Nugraha** — *Software Engineering Mentor*

### Team 14 Members (Section Surabaya)
| Member Name | University / Institution | Role Focus |
|---|---|---|
| **Rahmat Hanif Purnama** | IIB Darmajaya | Software Engineering & Architecture |
| **Reynhard Powiwi** | Telkom University | Data Analysis & Visualization |
| **Alfika Putri Dewinta Seodibjo** | Universitas Semarang | Data Analysis |
| **K. Ayu Diah Permata Sari** | Universitas Udayana | Data Preparation & Insights |
| **Gusti Ken' O Rama Dewa** | Universitas Airlangga | Exploratory Analysis |
| **Haya Q. Luthfiyaningsih** | Institut Teknologi PLN | Data Understanding & Metrics |
| **Katherine Regina Hermawan** | Universitas Indonesia | Business Understanding & Reporting |
| **Nayla Nur Alifah** | IPB University | Validation & Presentation |
| **Salma Dara Canita** | Universitas Lampung | Data Analysis |
| **Salsabila Yonita** | IPB University | Data Visualization |
| **Tedy Pawer Sihombing** | Universitas Muhammadiyah Riau | Data Analytics |
| **Angger Tri Prasetyo** | Institut Teknologi Surabaya | Data Modeling |

---

## 📄 License & Copyright

Hak Cipta © 2024–2025 **Team 14 Surabaya — RevoU**. All rights reserved.
