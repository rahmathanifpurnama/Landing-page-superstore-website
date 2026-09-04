/**
 * Metrics Engine Module
 * Deep analytics engine that computes multi-dimensional aggregations and
 * Chart.js dataset configurations from normalized Order records.
 */
(function (global) {
  "use strict";

  function getQuarterKey(date) {
    if (!date || isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `K${quarter}, ${year}`;
  }

  const DEFAULT_QUARTERS = [
    "K1, 2014", "K2, 2014", "K3, 2014", "K4, 2014",
    "K1, 2015", "K2, 2015", "K3, 2015", "K4, 2015",
    "K1, 2016", "K2, 2016", "K3, 2016", "K4, 2016",
    "K1, 2017", "K2, 2017", "K3, 2017", "K4, 2017",
  ];

  /**
   * Derive customer behavioral tiers based on purchasing and discount habits.
   */
  function buildCustomerProfiles(orders) {
    const customerStats = {};

    for (const order of orders) {
      const cid = order.Customer_ID;
      if (!customerStats[cid]) {
        customerStats[cid] = {
          id: cid,
          name: order.Customer_Name,
          orderCount: 0,
          totalSales: 0,
          totalProfit: 0,
          discounts: [],
        };
      }
      customerStats[cid].orderCount += 1;
      customerStats[cid].totalSales += order.Sales;
      customerStats[cid].totalProfit += order.Profit;
      customerStats[cid].discounts.push(order.Discount);
    }

    const customerTiers = {};
    for (const cid in customerStats) {
      const c = customerStats[cid];
      const avgDiscount = c.discounts.reduce((a, b) => a + b, 0) / c.discounts.length;
      const maxDiscount = Math.max(...c.discounts);

      if (maxDiscount >= 0.4 || avgDiscount >= 0.25) {
        customerTiers[cid] = "Discount Hunter";
      } else if (c.orderCount >= 12 || c.totalSales >= 3000000) {
        customerTiers[cid] = "Royal Buyer";
      } else {
        customerTiers[cid] = "Buyer";
      }
    }

    return { customerStats, customerTiers };
  }

  function computeMetrics(orders, options = {}) {
    const { customerStats, customerTiers } = buildCustomerProfiles(orders);

    // 1. KPI Summary
    const uniqueOrders = new Set();
    let totalSales = 0;
    let totalProfit = 0;
    let totalQuantity = 0;

    for (const o of orders) {
      uniqueOrders.add(o.Order_ID);
      totalSales += o.Sales;
      totalProfit += o.Profit;
      totalQuantity += o.Quantity;
    }

    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    const summary = {
      totalOrders: uniqueOrders.size,
      totalCustomers: Object.keys(customerStats).length,
      totalSales: totalSales,
      totalProfit: totalProfit,
      totalQuantity: totalQuantity,
      profitMargin: profitMargin,
    };

    // 2. Customer Tier Totals (doughnut1)
    const tierCounts = { "Buyer": 0, "Discount Hunter": 0, "Royal Buyer": 0 };
    for (const cid in customerTiers) {
      const tier = customerTiers[cid];
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    }

    // 3. Dynamic Quarterly Profit (lineChart)
    // Determine active quarters based on filtered orders or selected year
    let quarters = DEFAULT_QUARTERS;
    if (options.selectedYear && options.selectedYear !== "all") {
      quarters = [
        `K1, ${options.selectedYear}`,
        `K2, ${options.selectedYear}`,
        `K3, ${options.selectedYear}`,
        `K4, ${options.selectedYear}`,
      ];
    }

    const quarterlyProfit = {};
    for (const q of quarters) {
      quarterlyProfit[q] = { "Royal Buyer": 0, "Buyer": 0, "Diskon": 0 };
    }

    for (const o of orders) {
      const qKey = getQuarterKey(o._parsedDate);
      if (qKey && quarterlyProfit[qKey]) {
        const tier = customerTiers[o.Customer_ID] || "Buyer";
        const key = tier === "Discount Hunter" ? "Diskon" : tier;
        quarterlyProfit[qKey][key] = (quarterlyProfit[qKey][key] || 0) + o.Profit;
      }
    }

    // 4. Quantity Category by Customer Tier (quantityChart)
    const categories = ["Office Supplies", "Furniture", "Technology"];
    const catQuantity = {
      "Buyer": { "Office Supplies": 0, "Furniture": 0, "Technology": 0 },
      "Discount Hunter": { "Office Supplies": 0, "Furniture": 0, "Technology": 0 },
      "Royal Buyer": { "Office Supplies": 0, "Furniture": 0, "Technology": 0 },
    };

    for (const o of orders) {
      const tier = customerTiers[o.Customer_ID] || "Buyer";
      const cat = o.Category;
      if (catQuantity[tier] && catQuantity[tier][cat] !== undefined) {
        catQuantity[tier][cat] += o.Quantity;
      }
    }

    // 5. Best Seller of Sub-Category (Sales & Profit) (bestSellerChart & bestProfitChart)
    const subCatSales = {};
    const subCatProfit = {};
    for (const o of orders) {
      const sub = o.Sub_Category || "Other";
      subCatSales[sub] = (subCatSales[sub] || 0) + o.Sales;
      subCatProfit[sub] = (subCatProfit[sub] || 0) + o.Profit;
    }
    const top5SubSales = Object.entries(subCatSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const top5SubProfit = Object.entries(subCatProfit)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 6. Region Breakdown by Tier (customerRegionChart)
    const regions = ["West", "East", "Central", "South"];
    const regionTierCounts = {
      "Buyer": { "West": 0, "East": 0, "Central": 0, "South": 0 },
      "Discount Hunter": { "West": 0, "East": 0, "Central": 0, "South": 0 },
      "Royal Buyer": { "West": 0, "East": 0, "Central": 0, "South": 0 },
    };
    for (const o of orders) {
      const tier = customerTiers[o.Customer_ID] || "Buyer";
      const reg = o.Region;
      if (regionTierCounts[tier] && regionTierCounts[tier][reg] !== undefined) {
        regionTierCounts[tier][reg] += 1;
      }
    }

    // 7. City Breakdown (bestSellerCityChart & topProfitableCityChart)
    const citySales = {};
    const cityProfit = {};
    for (const o of orders) {
      citySales[o.City] = (citySales[o.City] || 0) + o.Sales;
      cityProfit[o.City] = (cityProfit[o.City] || 0) + o.Profit;
    }
    const top5CitySales = Object.entries(citySales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const top5CityProfit = Object.entries(cityProfit)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 8. Segment Breakdowns (doughnut2, salesbySegmentChart, profitbySegmentChart, customerSegmentChart)
    const segments = ["Consumer", "Corporate", "Home Office"];
    const segmentOrders = { "Consumer": 0, "Corporate": 0, "Home Office": 0 };
    const segmentSales = { "Consumer": 0, "Corporate": 0, "Home Office": 0 };
    const segmentProfit = { "Consumer": 0, "Corporate": 0, "Home Office": 0 };
    const segmentCustomers = { "Consumer": new Set(), "Corporate": new Set(), "Home Office": new Set() };

    for (const o of orders) {
      const seg = o.Segment;
      if (segmentOrders[seg] !== undefined) {
        segmentOrders[seg] += 1;
        segmentSales[seg] += o.Sales;
        segmentProfit[seg] += o.Profit;
        segmentCustomers[seg].add(o.Customer_ID);
      }
    }

    // 9. Discount Brackets Breakdown (bestDiscountChart)
    const discountBrackets = ["0.1", "0.15", "0.2", "0.3", "0.32", "0.4", "0.5", "0.6", "0.7", "0.8"];
    const discountTiers = {
      "Buyer": {},
      "Discount Hunter": {},
      "Royal Buyer": {},
    };
    discountBrackets.forEach((b) => {
      discountTiers["Buyer"][b] = 0;
      discountTiers["Discount Hunter"][b] = 0;
      discountTiers["Royal Buyer"][b] = 0;
    });

    for (const o of orders) {
      const discStr = o.Discount.toString();
      const tier = customerTiers[o.Customer_ID] || "Buyer";
      if (discountTiers[tier] && discountTiers[tier][discStr] !== undefined) {
        discountTiers[tier][discStr] += 1;
      }
    }

    return {
      summary,
      customerTiers: {
        labels: ["Buyer", "Discount Hunter", "Royal Buyer"],
        data: [tierCounts["Buyer"], tierCounts["Discount Hunter"], tierCounts["Royal Buyer"]],
      },
      quarterlyProfit: {
        labels: quarters,
        royalBuyer: quarters.map((q) => quarterlyProfit[q]["Royal Buyer"]),
        buyer: quarters.map((q) => quarterlyProfit[q]["Buyer"]),
        diskon: quarters.map((q) => quarterlyProfit[q]["Diskon"]),
      },
      categoryQuantity: {
        categories,
        buyer: categories.map((c) => catQuantity["Buyer"][c]),
        discountHunter: categories.map((c) => catQuantity["Discount Hunter"][c]),
        royalBuyer: categories.map((c) => catQuantity["Royal Buyer"][c]),
      },
      topSubCategories: {
        sales: {
          labels: top5SubSales.map((x) => x[0]),
          data: top5SubSales.map((x) => x[1]),
        },
        profit: {
          labels: top5SubProfit.map((x) => x[0]),
          data: top5SubProfit.map((x) => x[1]),
        },
      },
      regionDistribution: {
        regions,
        buyer: regions.map((r) => regionTierCounts["Buyer"][r]),
        discountHunter: regions.map((r) => regionTierCounts["Discount Hunter"][r]),
        royalBuyer: regions.map((r) => regionTierCounts["Royal Buyer"][r]),
      },
      topCities: {
        sales: {
          labels: top5CitySales.map((x) => x[0]),
          data: top5CitySales.map((x) => x[1]),
        },
        profit: {
          labels: top5CityProfit.map((x) => x[0]),
          data: top5CityProfit.map((x) => x[1]),
        },
      },
      segmentation: {
        segments,
        orderCounts: segments.map((s) => segmentOrders[s]),
        sales: segments.map((s) => segmentSales[s]),
        profit: segments.map((s) => segmentProfit[s]),
        customerCounts: segments.map((s) => segmentCustomers[s].size),
      },
      discountDistribution: {
        labels: discountBrackets,
        buyer: discountBrackets.map((b) => discountTiers["Buyer"][b]),
        discountHunter: discountBrackets.map((b) => discountTiers["Discount Hunter"][b]),
        royalBuyer: discountBrackets.map((b) => discountTiers["Royal Buyer"][b]),
      },
    };
  }

  const MetricsEngine = {
    computeMetrics,
    buildCustomerProfiles,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = MetricsEngine;
  } else {
    global.MetricsEngine = MetricsEngine;
  }
})(typeof window !== "undefined" ? window : globalThis);
