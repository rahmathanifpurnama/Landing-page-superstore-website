/**
 * Architecture & Filter Engine Unit Tests
 */
const assert = require("assert");
const DatasetProvider = require("./js/dataset.js");
const MetricsEngine = require("./js/metrics.js");

console.log("Running comprehensive architecture tests...\n");

// 1. Data Ingestion Seam
console.log("1. Testing DatasetProvider Normalization Seam...");
const rawOrder = {
  Order_ID: "CA-2016-123456",
  Order_Date: "05/20/2016",
  Customer_ID: "CG-12520",
  Customer_Name: "Claire Gute",
  Segment: "Consumer",
  Region: "South",
  City: "Fort Lauderdale",
  Category: "Furniture",
  "Sub-Category": "Bookcases",
  Sales: "$261.96",
  Quantity: "2",
  Discount: "0.2",
  Profit: "$41.91",
  Outlier: "Bukan Outlier",
};

const norm = DatasetProvider.normalizeOrder(rawOrder);
assert.strictEqual(norm.Sales, 261.96);
assert.strictEqual(norm.Profit, 41.91);
assert.strictEqual(norm.Quantity, 2);
assert.strictEqual(norm.Discount, 0.2);
assert.strictEqual(norm._parsedDate.getFullYear(), 2016);
console.log("✓ Field parsing and normalization verified.");

// 2. Metrics Engine Aggregation & Filtering
console.log("\n2. Testing MetricsEngine & Dynamic Year Slicing...");
const orders = [
  { ...norm, Order_ID: "O1", Sales: 500, Profit: 100, _parsedDate: new Date(2016, 1, 1), Category: "Furniture", Sub_Category: "Chairs" },
  { ...norm, Order_ID: "O2", Sales: 300, Profit: 50, _parsedDate: new Date(2016, 5, 1), Category: "Technology", Sub_Category: "Phones" },
  { ...norm, Order_ID: "O3", Sales: 200, Profit: -20, _parsedDate: new Date(2017, 2, 1), Category: "Office Supplies", Sub_Category: "Paper" },
];

const metrics2016 = MetricsEngine.computeMetrics(
  orders.filter((o) => o._parsedDate.getFullYear() === 2016),
  { selectedYear: "2016" }
);

assert.strictEqual(metrics2016.summary.totalOrders, 2);
assert.strictEqual(metrics2016.summary.totalSales, 800);
assert.strictEqual(metrics2016.summary.totalProfit, 150);
assert.strictEqual(metrics2016.quarterlyProfit.labels.length, 4);
console.log("✓ Dynamic Year Slicing and KPI metrics verified.");

console.log("\nAll Architecture & Looker Studio Engine Tests Passed Successfully!");
