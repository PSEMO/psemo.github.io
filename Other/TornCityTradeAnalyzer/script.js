document.addEventListener('DOMContentLoaded', () => {
    // --- DOM element references ---
    const apiKeyInput = document.getElementById('apiKeyInput');
    const fetchLogsBtn = document.getElementById('fetchLogsBtn');
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const fetchSpinner = document.getElementById('fetchSpinner');
    const fetchBtnText = document.getElementById('fetchBtnText');
    const resultsSection = document.getElementById('resultsSection');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // --- State and Constants ---
    const CACHE_KEY_LOGS = 'tradeAnalyzerLogCache';
    const CACHE_KEY_ITEMS = 'tradeAnalyzerItemCache';
    let itemDataCache = null;

    function initialize() {
        fetchLogsBtn.addEventListener('click', handleFetchAndProcessLogs);
        clearCacheBtn.addEventListener('click', handleClearCache);
    }

    function handleClearCache() {
        localStorage.removeItem(CACHE_KEY_LOGS);
        localStorage.removeItem(CACHE_KEY_ITEMS);
        itemDataCache = null;
        resultsSection.style.display = 'none';
        noResultsMessage.style.display = 'none';
        resetUI();
        alert('Cache has been cleared. Click "Fetch & Analyze" to start over.');
    }

    function setButtonLoading(isLoading) {
        fetchLogsBtn.disabled = isLoading;
        clearCacheBtn.disabled = isLoading;
        fetchSpinner.style.display = isLoading ? 'inline-block' : 'none';
        fetchBtnText.textContent = isLoading ? 'Fetching...' : 'Fetch & Analyze Logs';
    }

    async function handleFetchAndProcessLogs() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert("Please enter a valid Torn API key.");
            return;
        }

        setButtonLoading(true);
        resetUI();

        try {
            // 1. Load cached item data or fetch if needed
            itemDataCache = JSON.parse(localStorage.getItem(CACHE_KEY_ITEMS));
            if (!itemDataCache) {
                console.log("Fetching new item list...");
                const itemApiUrl = `https://api.torn.com/torn/?selections=items&key=${apiKey}&comment=TornTradeAnalyzer`;
                const itemsResponse = await fetchApiData(itemApiUrl);
                itemDataCache = itemsResponse.items;
                localStorage.setItem(CACHE_KEY_ITEMS, JSON.stringify(itemDataCache));
            }

            // 2. Load cached logs and determine 'from' timestamp
            const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY_LOGS)) || { logs: {}, lastTimestamp: 0 };
            const fromTimestamp = cachedData.lastTimestamp;
            
            let logApiUrl11 = `https://api.torn.com/user/?selections=log&cat=11&limit=1000&key=${apiKey}&comment=TornTradeAnalyzer`;
            let logApiUrl15 = `https://api.torn.com/user/?selections=log&cat=15&limit=1000&key=${apiKey}&comment=TornTradeAnalyzer`;

            if (fromTimestamp) {
                console.log(`Fetching new logs since timestamp: ${fromTimestamp}`);
                const fetchFrom = fromTimestamp + 1; // Avoid re-fetching the last exact log
                logApiUrl11 += `&from=${fetchFrom}`;
                logApiUrl15 += `&from=${fetchFrom}`;
            } else {
                console.log("No cache found. Performing full log fetch.");
            }

            // 3. Fetch new logs
            const [logResponse11, logResponse15] = await Promise.all([
                fetchApiData(logApiUrl11),
                fetchApiData(logApiUrl15)
            ]);

            const newLogs = { ...logResponse11.log, ...logResponse15.log };
            
            // 4. Find the highest timestamp from the new logs
            let newHighestTimestamp = fromTimestamp;
            Object.values(newLogs).forEach(log => {
                if (log.timestamp > newHighestTimestamp) newHighestTimestamp = log.timestamp;
            });

            // 5. Merge and parse
            const combinedLog = { ...cachedData.logs, ...newLogs };
            const transactions = parseApiData(combinedLog, itemDataCache);

            if (transactions.length === 0) {
                noResultsMessage.textContent = "No trade data found in your logs.";
                noResultsMessage.style.display = 'block';
            } else {
                transactions.sort((a, b) => a.datetime - b.datetime);
                displayAllResults(transactions);
                resultsSection.style.display = 'block';

                // 6. Save updated cache
                localStorage.setItem(CACHE_KEY_LOGS, JSON.stringify({ logs: combinedLog, lastTimestamp: newHighestTimestamp }));
                console.log(`Cache updated. Last timestamp is now: ${newHighestTimestamp}`);
            }

        } catch (error) {
            console.error("Error during API processing:", error);
            noResultsMessage.textContent = `An error occurred: ${error.message}. Check your API key and permissions.`;
            noResultsMessage.style.display = 'block';
        } finally {
            setButtonLoading(false);
        }
    }

    async function fetchApiData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network error: ${response.status} - ${response.statusText}`);
        const data = await response.json();
        if (data.error) throw new Error(`API Error: ${data.error.error} (Code ${data.error.code})`);
        return data;
    }

    function parseApiData(apiLog, itemMap) {
        return Object.values(apiLog).map(logEntry => {
            const { title, timestamp, data } = logEntry;
            if (!data) return null;

            let transaction = null;
            const common = { datetime: new Date(timestamp * 1000) };

            switch (title) {
                case 'Item market buy':
                case 'Bazaar buy':
                    if (data.items && data.items.length > 0) {
                        transaction = { ...common, type: 'buy', itemName: itemMap[data.items[0].id]?.name || `Item#${data.items[0].id}`, quantity: data.items[0].qty, pricePerItem: data.cost_each, totalAmount: data.cost_total, fees: 0, netAmount: -data.cost_total };
                    }
                    break;
                case 'Item shop buy':
                case 'Item abroad buy':
                    transaction = { ...common, type: 'buy', itemName: itemMap[data.item]?.name || `Item#${data.item}`, quantity: data.quantity, pricePerItem: data.cost_each, totalAmount: data.cost_total, fees: 0, netAmount: -data.cost_total };
                    break;
                case 'Item market sell':
                    if (data.items && data.items.length > 0) {
                        transaction = { ...common, type: 'sell', itemName: itemMap[data.items[0].id]?.name || `Item#${data.items[0].id}`, quantity: data.items[0].qty, pricePerItem: data.cost_each, totalAmount: data.cost_total + data.fee, fees: data.fee, netAmount: data.cost_total };
                    }
                    break;
                case 'Bazaar sell':
                     if (data.items && data.items.length > 0) {
                        transaction = { ...common, type: 'sell', itemName: itemMap[data.items[0].id]?.name || `Item#${data.items[0].id}`, quantity: data.items[0].qty, pricePerItem: data.cost_each, totalAmount: data.cost_total, fees: 0, netAmount: data.cost_total };
                    }
                    break;
                case 'Item shop sell':
                     transaction = { ...common, type: 'sell', itemName: itemMap[data.item]?.name || `Item#${data.item}`, quantity: data.quantity, pricePerItem: data.value_each, totalAmount: data.total_value, fees: 0, netAmount: data.total_value };
                    break;
            }
            return transaction;
        }).filter(t => t !== null);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    }
    
    function formatProfit(element, value) {
        element.textContent = formatCurrency(value);
        element.className = 'fw-bold'; // Reset classes
        if (value > 0) element.classList.add('profit');
        else if (value < 0) element.classList.add('loss');
        else element.classList.add('neutral');
    }
    
    function resetUI() {
        resultsSection.style.display = 'none';
        noResultsMessage.style.display = 'none';
        document.getElementById('productTableBody').innerHTML = '';
        document.getElementById('topProfitItems').innerHTML = '';
        document.getElementById('topLossItems').innerHTML = '';
    }

    // --- Main Display Orchestrator ---
    function displayAllResults(transactions) {
        // Time-based summaries
        const lifetimeStats = calculateStatsForPeriod(transactions);
        updateSummaryDOM('lt', lifetimeStats);
        
        const now = new Date();
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        updateSummaryDOM('d7', calculateStatsForPeriod(transactions.filter(t => t.datetime >= sevenDaysAgo)));
        
        now.setDate(now.getDate() + 7); // Reset date
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        updateSummaryDOM('d30', calculateStatsForPeriod(transactions.filter(t => t.datetime >= thirtyDaysAgo)));
        
        // Product-based analysis (lifetime only)
        const productStats = analyzeProducts(transactions);
        populateProductTable(productStats);
        displayTopMovers(productStats);
        displayAdvancedMetrics(lifetimeStats, productStats);
    }

    function calculateStatsForPeriod(periodTransactions) {
        let totalSpent = 0, totalRevenue = 0, totalFees = 0, buyTrades = 0, sellTrades = 0;
        for (const t of periodTransactions) {
            if (t.type === 'buy') {
                totalSpent += t.totalAmount;
                buyTrades++;
            } else if (t.type === 'sell') {
                totalRevenue += t.netAmount;
                totalFees += t.fees;
                sellTrades++;
            }
        }
        return { totalTrades: buyTrades + sellTrades, totalSpent, totalRevenue, totalFees, netProfit: totalRevenue - totalSpent };
    }

    function updateSummaryDOM(prefix, stats) {
        document.getElementById(`${prefix}_totalTrades`).textContent = stats.totalTrades.toLocaleString();
        document.getElementById(`${prefix}_totalSpent`).textContent = formatCurrency(stats.totalSpent);
        document.getElementById(`${prefix}_totalRevenue`).textContent = formatCurrency(stats.totalRevenue);
        document.getElementById(`${prefix}_totalFees`).textContent = formatCurrency(stats.totalFees);
        formatProfit(document.getElementById(`${prefix}_netProfit`), stats.netProfit);
    }

    function analyzeProducts(allTransactions) {
        const productData = {};
        for (const t of allTransactions) {
            if (!productData[t.itemName]) {
                productData[t.itemName] = { name: t.itemName, qtyBought: 0, totalSpent: 0, qtySold: 0, totalRevenue: 0 };
            }
            const item = productData[t.itemName];
            if (t.type === 'buy') {
                item.qtyBought += t.quantity;
                item.totalSpent += t.totalAmount;
            } else if (t.type === 'sell') {
                item.qtySold += t.quantity;
                item.totalRevenue += t.netAmount;
            }
        }
        
        // Calculate derived stats for each product
        return Object.values(productData).map(item => {
            item.avgBuyPrice = item.qtyBought > 0 ? item.totalSpent / item.qtyBought : 0;
            item.avgSellPrice = item.qtySold > 0 ? item.totalRevenue / item.qtySold : 0;
            item.netProfit = item.totalRevenue - item.totalSpent;
            item.roi = item.totalSpent > 0 ? (item.netProfit / item.totalSpent) * 100 : 0;
            return item;
        });
    }
    
    function populateProductTable(productStats) {
        const tableBody = document.getElementById('productTableBody');
        const fragment = document.createDocumentFragment();

        productStats.forEach(item => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.qtyBought.toLocaleString()}</td>
                <td>${formatCurrency(item.avgBuyPrice)}</td>
                <td>${formatCurrency(item.totalSpent)}</td>
                <td>${item.qtySold.toLocaleString()}</td>
                <td>${formatCurrency(item.avgSellPrice)}</td>
                <td>${formatCurrency(item.totalRevenue)}</td>
                <td>${item.roi.toFixed(2)}%</td>
                <td>${formatCurrency(item.netProfit)}</td>
            `;

            // Color ROI and Net Profit cells
            const roiCell = row.cells[7];
            const profitCell = row.cells[8];

            if (item.roi > 0) roiCell.classList.add('profit');
            else if (item.roi < 0) roiCell.classList.add('loss');

            if (item.netProfit > 0) profitCell.classList.add('profit');
            else if (item.netProfit < 0) profitCell.classList.add('loss');

            fragment.appendChild(row);
        });
        tableBody.appendChild(fragment);
        makeTableSortable('productTable');
    }

    function displayTopMovers(productStats) {
        const topProfitContainer = document.getElementById('topProfitItems');
        const topLossContainer = document.getElementById('topLossItems');

        // Top 5 Profitable
        const profitable = [...productStats].filter(p => p.netProfit > 0).sort((a, b) => b.netProfit - a.netProfit);
        topProfitContainer.innerHTML = profitable.slice(0, 5).map(item => 
            `<li class="list-group-item d-flex justify-content-between align-items-center">
                ${item.name}
                <span class="badge bg-success rounded-pill">${formatCurrency(item.netProfit)}</span>
            </li>`
        ).join('') || '<li class="list-group-item">No profitable items found.</li>';
        
        // Top 5 Losses
        const losses = [...productStats].filter(p => p.netProfit < 0).sort((a, b) => a.netProfit - b.netProfit);
        topLossContainer.innerHTML = losses.slice(0, 5).map(item => 
            `<li class="list-group-item d-flex justify-content-between align-items-center">
                ${item.name}
                <span class="badge bg-danger rounded-pill">${formatCurrency(item.netProfit)}</span>
            </li>`
        ).join('') || '<li class="list-group-item">No losing items found.</li>';
    }

    function displayAdvancedMetrics(lifetimeStats, productStats) {
        const overallRoi = lifetimeStats.totalSpent > 0 ? (lifetimeStats.netProfit / lifetimeStats.totalSpent) * 100 : 0;
        const avgProfitPerTrade = lifetimeStats.totalTrades > 0 ? lifetimeStats.netProfit / lifetimeStats.totalTrades : 0;
        const profitableItems = productStats.filter(p => p.netProfit > 0).length;
        const losingItems = productStats.filter(p => p.netProfit < 0).length;
        const winLossRatio = losingItems > 0 ? (profitableItems / losingItems).toFixed(2) : (profitableItems > 0 ? '∞' : 'N/A');

        document.getElementById('adv_roi').textContent = `${overallRoi.toFixed(2)}%`;
        formatProfit(document.getElementById('adv_avgProfitPerTrade'), avgProfitPerTrade);
        document.getElementById('adv_profitableItems').textContent = profitableItems.toLocaleString();
        document.getElementById('adv_losingItems').textContent = losingItems.toLocaleString();
        document.getElementById('adv_winLossRatio').textContent = winLossRatio;
    }

    function makeTableSortable(tableId) {
        const table = document.getElementById(tableId);
        const headers = table.querySelectorAll('th.sortable');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const sortKey = header.dataset.sort;
                const sortDir = header.dataset.sortDir === 'asc' ? 'desc' : 'asc';
                const colIndex = Array.from(header.parentNode.children).indexOf(header);

                const rows = Array.from(table.querySelector('tbody').rows);
                
                rows.sort((a, b) => {
                    let valA = a.cells[colIndex].textContent.trim();
                    let valB = b.cells[colIndex].textContent.trim();
                    
                    // Parse numbers from strings
                    if (['qtyBought', 'qtySold', 'avgBuyPrice', 'totalSpent', 'avgSellPrice', 'totalRevenue', 'roi', 'netProfit'].includes(sortKey)) {
                       valA = parseFloat(valA.replace(/[$,%]/g, ''));
                       valB = parseFloat(valB.replace(/[$,%]/g, ''));
                    }
                    
                    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                    return 0;
                });
                
                // Update UI
                headers.forEach(h => h.removeAttribute('data-sort-dir'));
                header.setAttribute('data-sort-dir', sortDir);
                rows.forEach(row => table.querySelector('tbody').appendChild(row));
            });
        });
    }

    initialize();
});