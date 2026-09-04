/**
 * Main Application Orchestrator
 * Bootstraps the DatasetProvider seam, SuperstoreTable module,
 * MetricsEngine, DashboardView, FilterBar, CarouselModule, and ViewRouter.
 */
document.addEventListener("DOMContentLoaded", async function () {
  "use strict";

  // 1. Initialize Member Carousel
  const carouselWrapper = document.querySelector(".wrapper");
  const carouselElement = document.querySelector(".carousel");
  const carousel = CarouselModule.init(carouselWrapper, carouselElement);

  // 2. Initialize View Router
  const homeSections = [
    document.querySelector(".background"),
    document.querySelector(".definition"),
    document.querySelector(".member"),
  ].filter(Boolean);

  const dashboardSection = document.getElementById("dashboard");
  const tableSection = document.getElementById("table");

  const router = ViewRouter.init({
    routes: {
      home: homeSections,
      dashboard: [dashboardSection],
      data: [tableSection],
    },
    navLinks: {
      home: document.getElementById("home-link"),
      data: document.getElementById("data-link"),
      dashboard: document.getElementById("dashboard-link"),
    },
    burgerBtn: document.querySelector(".burger"),
    navbarEl: document.querySelector(".navbar"),
    initialRoute: "home",
    onNavigate: (viewName) => {
      if (carousel) {
        if (viewName === "home") {
          carousel.resume();
        } else {
          carousel.pause();
        }
      }
    },
  });

  // 3. Load Normalized Orders Dataset
  try {
    const allOrders = await DatasetProvider.loadOrders("./Superstore.json");

    // Pre-calculate customer behavioral tiers once across full dataset
    const { customerTiers } = MetricsEngine.buildCustomerProfiles(allOrders);

    // 4. Mount Superstore Table Module
    const tableElements = {
      tableBody: document.querySelector("#Superstore-table tbody"),
      searchInput: document.getElementById("search"),
      btnClearSearch: document.getElementById("btn-clear-search"),
      rowsSelect: document.getElementById("rows-per-page"),
      prevBtn: document.getElementById("prev"),
      nextBtn: document.getElementById("next"),
      firstBtn: document.getElementById("first-page"),
      lastBtn: document.getElementById("last-page"),
      pageInput: document.getElementById("page-input"),
      pageTotalLabel: document.getElementById("page-total-label"),
      recordCountEl: document.getElementById("table-record-count"),
      paginationSummaryEl: document.getElementById("pagination-summary"),
    };

    const tableController = SuperstoreTable.mount(tableElements, allOrders, { rowsPerPage: 10 });

    // 5. Looker Studio Filter Controller
    const selectYear = document.getElementById("filter-year");
    const selectRegion = document.getElementById("filter-region");
    const selectSegment = document.getElementById("filter-segment");
    const selectCategory = document.getElementById("filter-category");
    const selectTier = document.getElementById("filter-tier");
    const btnReset = document.getElementById("btn-reset-filters");
    const statusBadge = document.getElementById("dataset-status-badge");
    const filterBadge = document.getElementById("active-filter-badge");

    function applyFilters() {
      const year = selectYear ? selectYear.value : "all";
      const region = selectRegion ? selectRegion.value : "all";
      const segment = selectSegment ? selectSegment.value : "all";
      const category = selectCategory ? selectCategory.value : "all";
      const tier = selectTier ? selectTier.value : "all";

      const hasActiveFilters =
        year !== "all" ||
        region !== "all" ||
        segment !== "all" ||
        category !== "all" ||
        tier !== "all";

      const filteredOrders = allOrders.filter((order) => {
        if (year !== "all") {
          if (!order._parsedDate || String(order._parsedDate.getFullYear()) !== year) {
            return false;
          }
        }
        if (region !== "all" && order.Region !== region) {
          return false;
        }
        if (segment !== "all" && order.Segment !== segment) {
          return false;
        }
        if (category !== "all" && order.Category !== category) {
          return false;
        }
        if (tier !== "all" && customerTiers[order.Customer_ID] !== tier) {
          return false;
        }
        return true;
      });

      // Update Header Badges
      if (statusBadge) {
        statusBadge.innerHTML = `<i class="bx bx-check-circle"></i> ${filteredOrders.length.toLocaleString()} Records ${hasActiveFilters ? "Filtered" : "Loaded"}`;
      }
      if (filterBadge) {
        if (hasActiveFilters) {
          filterBadge.classList.remove("hidden");
        } else {
          filterBadge.classList.add("hidden");
        }
      }

      // Compute metrics on filtered subset and re-render dashboard
      const metrics = MetricsEngine.computeMetrics(filteredOrders, { selectedYear: year });
      DashboardView.render(metrics);
    }

    // Bind filter change events
    [selectYear, selectRegion, selectSegment, selectCategory, selectTier].forEach((sel) => {
      if (sel) {
        sel.addEventListener("change", applyFilters);
      }
    });

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (selectYear) selectYear.value = "all";
        if (selectRegion) selectRegion.value = "all";
        if (selectSegment) selectSegment.value = "all";
        if (selectCategory) selectCategory.value = "all";
        if (selectTier) selectTier.value = "all";
        applyFilters();
      });
    }

    // Initial Dashboard Render
    applyFilters();

  } catch (error) {
    console.error("Error initializing Superstore application:", error);
  }
});
