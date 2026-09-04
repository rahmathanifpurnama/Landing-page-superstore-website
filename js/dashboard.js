/**
 * Dashboard View Module
 * Renders and updates all Looker Studio Chart.js visualizations and Scorecards
 * using data from the MetricsEngine.
 */
(function (global) {
  "use strict";

  let chartInstances = {};

  function destroyExistingCharts() {
    Object.keys(chartInstances).forEach((id) => {
      if (chartInstances[id] && typeof chartInstances[id].destroy === "function") {
        chartInstances[id].destroy();
      }
    });
    chartInstances = {};
  }

  function formatCurrencyCompact(val) {
    if (typeof val !== "number") return "$0";
    if (Math.abs(val) >= 1e9) {
      return "$" + (val / 1e9).toFixed(1) + "B";
    }
    if (Math.abs(val) >= 1e6) {
      return "$" + (val / 1e6).toFixed(1) + "M";
    }
    if (Math.abs(val) >= 1e3) {
      return "$" + (val / 1e3).toFixed(1) + "K";
    }
    return "$" + val.toFixed(2);
  }

  function updateKpiCards(summary) {
    if (!summary) return;

    const elOrders = document.getElementById("kpi-orders");
    const elCustomers = document.getElementById("kpi-customers");
    const elSales = document.getElementById("kpi-sales");
    const elProfit = document.getElementById("kpi-profit");
    const elMargin = document.getElementById("kpi-margin");

    if (elOrders) elOrders.textContent = summary.totalOrders.toLocaleString();
    if (elCustomers) elCustomers.textContent = summary.totalCustomers.toLocaleString();
    if (elSales) elSales.textContent = formatCurrencyCompact(summary.totalSales);
    if (elProfit) elProfit.textContent = formatCurrencyCompact(summary.totalProfit);
    if (elMargin) elMargin.textContent = summary.profitMargin.toFixed(1) + "%";
  }

  function renderDashboard(metrics) {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js is not loaded.");
      return;
    }

    destroyExistingCharts();
    updateKpiCards(metrics.summary);

    // Chart Global Defaults
    Chart.defaults.font.family = "'Poppins', 'Segoe UI', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = "#475569";

    // 1. Doughnut 1: Customer Distribution by Tier
    const d1Canvas = document.getElementById("doughnut1");
    if (d1Canvas) {
      chartInstances.d1 = new Chart(d1Canvas.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: metrics.customerTiers.labels,
          datasets: [
            {
              label: "Customers",
              data: metrics.customerTiers.data,
              backgroundColor: ["#1f674a", "#eab308", "#334155"],
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 14, padding: 12 } },
          },
        },
      });
    }

    // 2. Line Chart: Quarterly Profit Trajectory
    const lineCanvas = document.getElementById("lineChart");
    if (lineCanvas) {
      chartInstances.line = new Chart(lineCanvas.getContext("2d"), {
        type: "line",
        data: {
          labels: metrics.quarterlyProfit.labels,
          datasets: [
            {
              label: "Royal Buyer",
              backgroundColor: "rgba(31, 103, 74, 0.15)",
              borderColor: "#1f674a",
              data: metrics.quarterlyProfit.royalBuyer,
              borderWidth: 2.5,
              tension: 0.3,
              fill: true,
            },
            {
              label: "Buyer",
              backgroundColor: "rgba(14, 165, 233, 0.15)",
              borderColor: "#0ea5e9",
              data: metrics.quarterlyProfit.buyer,
              borderWidth: 2.5,
              tension: 0.3,
              fill: true,
            },
            {
              label: "Discount Hunter",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "#ef4444",
              data: metrics.quarterlyProfit.diskon,
              borderWidth: 2.5,
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 14, padding: 12 } },
          },
          scales: {
            y: {
              ticks: {
                callback: (val) => formatCurrencyCompact(val),
              },
            },
          },
        },
      });
    }

    // 3. Quantity Chart: Category by Customer Tier
    const qtyCanvas = document.getElementById("quantityChart");
    if (qtyCanvas) {
      chartInstances.qty = new Chart(qtyCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.categoryQuantity.categories,
          datasets: [
            {
              label: "Buyer",
              backgroundColor: "#0ea5e9",
              data: metrics.categoryQuantity.buyer,
            },
            {
              label: "Discount Hunter",
              backgroundColor: "#ef4444",
              data: metrics.categoryQuantity.discountHunter,
            },
            {
              label: "Royal Buyer",
              backgroundColor: "#1f674a",
              data: metrics.categoryQuantity.royalBuyer,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 14 } },
          },
          scales: { x: { beginAtZero: true } },
        },
      });
    }

    // 4. Best Seller Chart: Top 5 Sub-Categories by Sales
    const bsCanvas = document.getElementById("bestSellerChart");
    if (bsCanvas) {
      chartInstances.bs = new Chart(bsCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.topSubCategories.sales.labels,
          datasets: [
            {
              label: "Sales Revenue",
              backgroundColor: "#1f674a",
              data: metrics.topSubCategories.sales.data,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              ticks: { callback: (val) => formatCurrencyCompact(val) },
            },
          },
        },
      });
    }

    // 5. Best Profit Chart: Top 5 Sub-Categories by Profit
    const bpCanvas = document.getElementById("bestProfitChart");
    if (bpCanvas) {
      chartInstances.bp = new Chart(bpCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.topSubCategories.profit.labels,
          datasets: [
            {
              label: "Net Profit",
              backgroundColor: "#10b981",
              data: metrics.topSubCategories.profit.data,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              ticks: { callback: (val) => formatCurrencyCompact(val) },
            },
          },
        },
      });
    }

    // 6. Customer Region Chart
    const crCanvas = document.getElementById("customerRegionChart");
    if (crCanvas) {
      chartInstances.cr = new Chart(crCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.regionDistribution.regions,
          datasets: [
            {
              label: "Buyer",
              backgroundColor: "#0ea5e9",
              data: metrics.regionDistribution.buyer,
            },
            {
              label: "Discount Hunter",
              backgroundColor: "#ef4444",
              data: metrics.regionDistribution.discountHunter,
            },
            {
              label: "Royal Buyer",
              backgroundColor: "#1f674a",
              data: metrics.regionDistribution.royalBuyer,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 14 } },
          },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    // 7. Best Seller City Chart
    const bscCanvas = document.getElementById("bestSellerCityChart");
    if (bscCanvas) {
      chartInstances.bsc = new Chart(bscCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.topCities.sales.labels,
          datasets: [
            {
              label: "Sales Revenue",
              backgroundColor: "#3b82f6",
              data: metrics.topCities.sales.data,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              ticks: { callback: (val) => formatCurrencyCompact(val) },
            },
          },
        },
      });
    }

    // 8. Top Profitable City Chart
    const tpcCanvas = document.getElementById("topProfitableCityChart");
    if (tpcCanvas) {
      chartInstances.tpc = new Chart(tpcCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.topCities.profit.labels,
          datasets: [
            {
              label: "Net Profit",
              backgroundColor: "#059669",
              data: metrics.topCities.profit.data,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              ticks: { callback: (val) => formatCurrencyCompact(val) },
            },
          },
        },
      });
    }

    // 9. Doughnut 2: Order Distribution by Segment
    const d2Canvas = document.getElementById("doughnut2");
    if (d2Canvas) {
      chartInstances.d2 = new Chart(d2Canvas.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: metrics.segmentation.segments,
          datasets: [
            {
              label: "Orders",
              data: metrics.segmentation.orderCounts,
              backgroundColor: ["#1f674a", "#6366f1", "#f59e0b"],
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 14 } },
          },
        },
      });
    }

    // 10. Sales by Segment Chart
    const sbsCanvas = document.getElementById("salesbySegmentChart");
    if (sbsCanvas) {
      chartInstances.sbs = new Chart(sbsCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.segmentation.segments,
          datasets: [
            {
              label: "Sales",
              backgroundColor: "#1f674a",
              data: metrics.segmentation.sales,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { callback: (val) => formatCurrencyCompact(val) } },
          },
        },
      });
    }

    // 11. Profit by Segment Chart
    const pbsCanvas = document.getElementById("profitbySegmentChart");
    if (pbsCanvas) {
      chartInstances.pbs = new Chart(pbsCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.segmentation.segments,
          datasets: [
            {
              label: "Profit",
              backgroundColor: "#10b981",
              data: metrics.segmentation.profit,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { callback: (val) => formatCurrencyCompact(val) } },
          },
        },
      });
    }

    // 12. Customer Count by Segment Chart
    const csCanvas = document.getElementById("customerSegmentChart");
    if (csCanvas) {
      chartInstances.cs = new Chart(csCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.segmentation.segments,
          datasets: [
            {
              label: "Customers",
              backgroundColor: "#6366f1",
              data: metrics.segmentation.customerCounts,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    // 13. Best Discount Chart: Rate Distribution by Customer Tier
    const bdCanvas = document.getElementById("bestDiscountChart");
    if (bdCanvas) {
      chartInstances.bd = new Chart(bdCanvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: metrics.discountDistribution.labels.map((l) => (parseFloat(l) * 100).toFixed(0) + "%"),
          datasets: [
            {
              label: "Buyer",
              backgroundColor: "#0ea5e9",
              data: metrics.discountDistribution.buyer,
              borderRadius: 4,
            },
            {
              label: "Discount Hunter",
              backgroundColor: "#ef4444",
              data: metrics.discountDistribution.discountHunter,
              borderRadius: 4,
            },
            {
              label: "Royal Buyer",
              backgroundColor: "#1f674a",
              data: metrics.discountDistribution.royalBuyer,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 14 } },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }
  }

  const DashboardView = {
    render: renderDashboard,
    destroy: destroyExistingCharts,
    formatCurrencyCompact,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = DashboardView;
  } else {
    global.DashboardView = DashboardView;
  }
})(typeof window !== "undefined" ? window : globalThis);
