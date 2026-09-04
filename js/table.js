/**
 * Superstore Table Module
 * Encapsulates table pagination arithmetic, multi-column search filtering,
 * rows-per-page dynamic sizing, and DOM row rendering behind an initialization interface.
 */
(function (global) {
  "use strict";

  function formatCurrency(num) {
    if (typeof num !== "number") return num;
    return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function createTableController(elements, initialOrders = [], options = {}) {
    const {
      tableBody,
      searchInput,
      btnClearSearch,
      rowsSelect,
      prevBtn,
      nextBtn,
      firstBtn,
      lastBtn,
      pageInput,
      pageTotalLabel,
      recordCountEl,
      paginationSummaryEl,
    } = elements;

    let rowsPerPage = options.rowsPerPage || 10;
    let data = [...initialOrders];
    let filteredData = [...initialOrders];
    let currentPage = 1;
    let totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

    function renderRow(item) {
      const tr = document.createElement("tr");

      const isOutlier = item.Outlier === "Outlier";
      const statusBadge = `<span class="badge-tag ${isOutlier ? "badge-outlier" : "badge-normal"}">${item.Outlier}</span>`;
      const catBadge = `<span class="cat-tag cat-${String(item.Category).toLowerCase().replace(/\s+/g, "-")}">${item.Category}</span>`;

      tr.innerHTML = `
        <td class="col-id font-mono">${item.Order_ID}</td>
        <td class="col-date">${item.Order_Date}</td>
        <td class="col-date">${item.Ship_Date}</td>
        <td class="col-mode">${item.Ship_Mode}</td>
        <td class="col-cust-id font-mono">${item.Customer_ID}</td>
        <td class="col-name font-medium">${item.Customer_Name}</td>
        <td class="col-id font-mono">${item.Product_ID}</td>
        <td class="col-cat">${catBadge}</td>
        <td class="col-subcat">${item.Sub_Category || item["Sub-Category"]}</td>
        <td class="col-prod-name" title="${item.Product_Name}">${item.Product_Name}</td>
        <td class="col-num font-mono font-medium">${formatCurrency(item.Sales)}</td>
        <td class="col-num font-mono">${item.Quantity}</td>
        <td class="col-num font-mono">${(item.Discount * 100).toFixed(0)}%</td>
        <td class="col-num font-mono font-medium ${item.Profit < 0 ? "text-negative" : "text-positive"}">${formatCurrency(item.Profit)}</td>
        <td class="col-status">${statusBadge}</td>
      `;
      return tr;
    }

    function updateControls() {
      totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
      currentPage = Math.max(1, Math.min(currentPage, totalPages));

      if (pageInput) {
        pageInput.value = currentPage;
        pageInput.max = totalPages;
      }
      if (pageTotalLabel) {
        pageTotalLabel.textContent = `of ${totalPages.toLocaleString()}`;
      }
      if (paginationSummaryEl) {
        paginationSummaryEl.textContent = `Page ${currentPage.toLocaleString()} of ${totalPages.toLocaleString()}`;
      }
      if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
      }
      if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
      }
      if (firstBtn) {
        firstBtn.disabled = currentPage === 1;
      }
      if (lastBtn) {
        lastBtn.disabled = currentPage === totalPages || totalPages === 0;
      }

      if (recordCountEl) {
        if (filteredData.length === 0) {
          recordCountEl.textContent = "No transactions found";
        } else {
          const start = (currentPage - 1) * rowsPerPage + 1;
          const end = Math.min(currentPage * rowsPerPage, filteredData.length);
          recordCountEl.textContent = `Showing ${start.toLocaleString()} to ${end.toLocaleString()} of ${filteredData.length.toLocaleString()} transactions`;
        }
      }
    }

    function displayPage(page) {
      totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
      currentPage = Math.max(1, Math.min(page, totalPages));
      if (!tableBody) return;

      tableBody.innerHTML = "";

      if (filteredData.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="15" class="table-empty-state"><i class="bx bx-search-alt"></i> No transaction records match your search.</td>`;
        tableBody.appendChild(emptyRow);
      } else {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = filteredData.slice(start, end);

        const fragment = document.createDocumentFragment();
        for (const item of pageData) {
          fragment.appendChild(renderRow(item));
        }
        tableBody.appendChild(fragment);
      }

      updateControls();
    }

    function setQuery(query) {
      const q = String(query).toLowerCase().trim();
      if (btnClearSearch) {
        if (q.length > 0) {
          btnClearSearch.classList.remove("hidden");
        } else {
          btnClearSearch.classList.add("hidden");
        }
      }

      if (!q) {
        filteredData = [...data];
      } else {
        filteredData = data.filter((item) => {
          return (
            item.Order_ID.toLowerCase().includes(q) ||
            item.Customer_Name.toLowerCase().includes(q) ||
            item.Customer_ID.toLowerCase().includes(q) ||
            item.Product_Name.toLowerCase().includes(q) ||
            item.Product_ID.toLowerCase().includes(q) ||
            item.Category.toLowerCase().includes(q) ||
            (item.Sub_Category && item.Sub_Category.toLowerCase().includes(q)) ||
            item.City.toLowerCase().includes(q) ||
            item.State.toLowerCase().includes(q) ||
            item.Segment.toLowerCase().includes(q) ||
            item.Ship_Mode.toLowerCase().includes(q)
          );
        });
      }
      currentPage = 1;
      displayPage(currentPage);
    }

    function setRowsPerPage(num) {
      rowsPerPage = Math.max(1, parseInt(num, 10) || 10);
      currentPage = 1;
      displayPage(currentPage);
    }

    function setOrders(orders) {
      data = [...orders];
      filteredData = [...orders];
      currentPage = 1;
      displayPage(currentPage);
    }

    // Attach event listeners
    if (searchInput) {
      searchInput.addEventListener("input", (e) => setQuery(e.target.value));
    }

    if (btnClearSearch && searchInput) {
      btnClearSearch.addEventListener("click", () => {
        searchInput.value = "";
        setQuery("");
        searchInput.focus();
      });
    }

    if (rowsSelect) {
      rowsSelect.addEventListener("change", (e) => {
        setRowsPerPage(e.target.value);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) displayPage(currentPage - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) displayPage(currentPage + 1);
      });
    }

    if (firstBtn) {
      firstBtn.addEventListener("click", () => {
        if (currentPage !== 1) displayPage(1);
      });
    }

    if (lastBtn) {
      lastBtn.addEventListener("click", () => {
        if (currentPage !== totalPages) displayPage(totalPages);
      });
    }

    if (pageInput) {
      pageInput.addEventListener("change", (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1 && val <= totalPages) {
          displayPage(val);
        } else {
          pageInput.value = currentPage;
        }
      });
      pageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          pageInput.blur();
        }
      });
    }

    // Initial render
    displayPage(currentPage);

    return {
      setOrders,
      setQuery,
      setRowsPerPage,
      displayPage,
      getCurrentPage: () => currentPage,
      getTotalPages: () => totalPages,
      getFilteredCount: () => filteredData.length,
    };
  }

  const SuperstoreTable = {
    mount: createTableController,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = SuperstoreTable;
  } else {
    global.SuperstoreTable = SuperstoreTable;
  }
})(typeof window !== "undefined" ? window : globalThis);
