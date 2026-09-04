# Domain Glossary (CONTEXT.md)

## Core Concepts

- **Order**: A single transaction record in the Superstore dataset containing identifiers (`Order_ID`, `Customer_ID`, `Product_ID`), dates (`Order_Date`, `Ship_Date`), fulfillment mode (`Ship_Mode`), categorization (`Category`, `Sub-Category`), financial figures (`Sales`, `Quantity`, `Discount`, `Profit`), and classification flags (`Outlier`).
- **Customer**: The purchasing entity categorized by segment (Consumer, Corporate, Home Office) or behavioral tier (Buyer, Discount Hunter, Royal Buyer).
- **Metric**: An aggregated business calculation derived from Order records across dimensions such as time, geography (Region, State, City), product hierarchy, or customer tier.
- **Metrics Engine Module**: A deep analytics module that ingests raw Order records, parses financial strings into numeric values, derives customer classifications, and computes multi-dimensional aggregations (Sales, Profit, Quantity, Discount breakdowns) for dashboard visualizations.
- **Looker Dashboard**: The target analytical dashboard layout and visual reporting system modeled after Google Data Studio / Looker Studio.
- **View Router Module**: A deep navigation module that encapsulates section visibility, hash navigation, and view lifecycle events (such as pausing/resuming background carousel animations when navigating between Home, Data, and Dashboard).
- **Dataset Provider Seam**: A storage and retrieval seam exposing `loadOrders(): Promise<Order[]>` with concrete adapters:
  - **Fetch & Cache Adapter**: Fetches `./Superstore.json`, normalizes raw currency and date fields, displays a loading state, and caches records in-memory / web storage to prevent redundant downloads.
  - **In-Memory Fixture Adapter**: Returns pre-constructed Order fixtures for fast, offline unit testing.
- **Superstore Table Module**: A deep UI module that encapsulates Order record search matching, pagination slicing, and DOM table rendering behind an initialization interface accepting DOM element references.
