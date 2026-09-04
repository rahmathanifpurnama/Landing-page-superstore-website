/**
 * Dataset Provider Seam & Adapters
 * Provides normalized Order records with in-memory caching and offline fixture support.
 */
(function (global) {
  "use strict";

  // In-memory cache for parsed orders in the current session
  let cachedOrders = null;

  /**
   * Helper to parse currency strings (e.g., "$468.90", "$206,316") into numeric floats.
   */
  function parseCurrency(value) {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const sanitized = String(value).replace(/[\$,]/g, "").trim();
    const num = parseFloat(sanitized);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Parse date in MM/DD/YYYY or DD/MM/YYYY or YYYY-MM-DD
   */
  function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = String(dateStr).split("/");
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  }

  /**
   * Normalizes a raw Order record into typed domain fields.
   */
  function normalizeOrder(raw) {
    const sales = parseCurrency(raw.Sales);
    const profit = parseCurrency(raw.Profit);
    const discount = typeof raw.Discount === "number" ? raw.Discount : parseFloat(raw.Discount) || 0;
    const quantity = typeof raw.Quantity === "number" ? raw.Quantity : parseInt(raw.Quantity, 10) || 0;

    return {
      Order_ID: raw.Order_ID || "",
      Order_Date: raw.Order_Date || "",
      Ship_Date: raw.Ship_Date || "",
      Ship_Mode: raw.Ship_Mode || "",
      Customer_ID: raw.Customer_ID || "",
      Customer_Name: raw.Customer_Name || "",
      Segment: raw.Segment || "Consumer",
      Country: raw.Country || "United States",
      City: raw.City || "",
      State: raw.State || "",
      Postal_Code: raw.Postal_Code || "",
      Region: raw.Region || "Central",
      Product_ID: raw.Product_ID || "",
      Category: raw.Category || "",
      Sub_Category: raw["Sub-Category"] || raw.Sub_Category || "",
      Product_Name: raw.Product_Name || "",
      Sales: sales,
      Quantity: quantity,
      Discount: discount,
      Profit: profit,
      Outlier: raw.Outlier || "Bukan Outlier",
      _parsedDate: parseDate(raw.Order_Date),
    };
  }

  /**
   * Adapter 1: Fetch from HTTP / static file with in-memory session caching
   */
  async function fetchAdapter(url = "./Superstore.json") {
    if (cachedOrders) {
      return cachedOrders;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load dataset: ${response.status} ${response.statusText}`);
    }
    const rawData = await response.json();
    cachedOrders = rawData.map(normalizeOrder);
    return cachedOrders;
  }

  /**
   * Adapter 2: In-Memory Fixtures for Unit Testing
   */
  function memoryAdapter(fixtures = []) {
    return Promise.resolve(fixtures.map(normalizeOrder));
  }

  const DatasetProvider = {
    normalizeOrder,
    parseCurrency,
    loadOrders: fetchAdapter,
    createMemoryAdapter: memoryAdapter,
    clearCache: () => {
      cachedOrders = null;
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = DatasetProvider;
  } else {
    global.DatasetProvider = DatasetProvider;
  }
})(typeof window !== "undefined" ? window : globalThis);
