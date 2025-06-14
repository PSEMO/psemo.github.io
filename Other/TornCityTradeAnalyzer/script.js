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
    const CACHE_KEY = 'tradeAnalyzerCache';
    let itemDataCache = null;

    function initialize() {
        fetchLogsBtn.addEventListener('click', handleFetchAndProcessLogs);
        clearCacheBtn.addEventListener('click', handleClearCache);
    }

    function handleClearCache() {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem('itemDataCache'); // Also clear item cache
        itemDataCache = null;
        resultsSection.style.display = 'none';
        noResultsMessage.style.display = 'none';
        alert('Cache has been cleared. Click "Fetch & Analyze" to start over.');
    }

    function setButtonLoading(isLoading) {
        fetchLogsBtn.disabled = isLoading;
        clearCacheBtn.disabled = isLoading;
        if (isLoading) {
            fetchSpinner.style.display = 'inline-block';
            fetchBtnText.textContent = 'Fetching...';
        } else {
            fetchSpinner.style.display = 'none';
            fetchBtnText.textContent = 'Fetch & Analyze Logs';
        }
    }

    async function handleFetchAndProcessLogs() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert("Please enter a valid Torn API key.");
            return;
        }

        setButtonLoading(true);
        resultsSection.style.display = 'none';
        noResultsMessage.style.display = 'none';

        try {
            // 1. Load cached item data or fetch if needed
            itemDataCache = JSON.parse(localStorage.getItem('itemDataCache'));
            if (!itemDataCache) {
                console.log("Fetching new item list...");
                const itemApiUrl = `https://api.torn.com/torn/?selections=items&key=${apiKey}&comment=TornTradeAnalyzer`;
                const itemsResponse = await fetchApiData(itemApiUrl);
                itemDataCache = itemsResponse.items;
                localStorage.setItem('itemDataCache', JSON.stringify(itemDataCache));
            }

            // 2. Load cached logs and determine the 'from' timestamp
            const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY)) || { logs: {}, lastTimestamp: 0 };
            const fromTimestamp = cachedData.lastTimestamp;
            
            let logApiUrl11 = `https://api.torn.com/user/?selections=log&cat=11&limit=1000&key=${apiKey}&comment=TornTradeAnalyzer`;
            let logApiUrl15 = `https://api.torn.com/user/?selections=log&cat=15&limit=1000&key=${apiKey}&comment=TornTradeAnalyzer`;

            if (fromTimestamp) {
                console.log(`Fetching new logs since timestamp: ${fromTimestamp}`);
                // Add 1 second to 'from' to avoid re-fetching the last exact log entry
                const fetchFrom = fromTimestamp + 1;
                logApiUrl11 += `&from=${fetchFrom}`;
                logApiUrl15 += `&from=${fetchFrom}`;
            } else {
                console.log("No cache found. Performing full log fetch.");
            }

            // 3. Fetch new logs
            const logResponse11 = await fetchApiData(logApiUrl11);
            await delay(1000); // Delay between requests
            const logResponse15 = await fetchApiData(logApiUrl15);

            const newLogs = { ...logResponse11.log, ...logResponse15.log };
            
            // 4. Find the highest timestamp from the new logs
            let newHighestTimestamp = fromTimestamp;
            for (const log of Object.values(newLogs)) {
                if (log.timestamp > newHighestTimestamp) {
                    newHighestTimestamp = log.timestamp;
                }
            }

            // 5. Merge cached logs with new logs
            const combinedLog = { ...cachedData.logs, ...newLogs };
            
            // 6. Parse and display
            const transactions = parseApiData(combinedLog, itemDataCache);

            if (transactions.length === 0) {
                noResultsMessage.textContent = "No trade data found in your logs.";
                noResultsMessage.style.display = 'block';
            } else {
                transactions.sort((a, b) => a.datetime - b.datetime);
                displayResults(transactions);
                resultsSection.style.display = 'block';

                // 7. Save the updated logs and timestamp to cache
                const newCache = {
                    logs: combinedLog,
                    lastTimestamp: newHighestTimestamp
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
                console.log(`Cache updated. Last timestamp is now: ${newHighestTimestamp}`);
            }

        } catch (error) {
            console.error("Error during API processing:", error);
            noResultsMessage.textContent = `An error occurred: ${error.message}`;
            noResultsMessage.style.display = 'block';
        } finally {
            setButtonLoading(false);
        }
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function fetchApiData(url) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 2000;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Network error: ${response.status} - ${response.statusText}`);
                }
                const data = await response.json();
                
                if (data.error) {
                    if (data.error.code === 17 && attempt < MAX_RETRIES) {
                        console.warn(`API Error Code 17 received. Retrying... (Attempt ${attempt})`);
                        await delay(RETRY_DELAY_MS);
                        continue;
                    }
                    throw new Error(`API Error: ${data.error.error} (Code ${data.error.code})`);
                }
                return data;
            } catch (error) {
                if (attempt === MAX_RETRIES) throw error;
            }
        }
    }

    function parseApiData(apiLog, itemMap) {
        const transactions = [];

        for (const logEntry of Object.values(apiLog)) {
            const { title, timestamp, data } = logEntry;
            if (!data) continue;

            const datetime = new Date(timestamp * 1000);
            let transaction = null;

            switch (title) {
                case 'Item market buy':
                case 'Bazaar buy':
                    if (!data.items || data.items.length === 0) continue;
                    transaction = {
                        type: 'buy',
                        itemName: itemMap[data.items[0].id]?.name || `Unknown Item ID ${data.items[0].id}`,
                        quantity: data.items[0].qty,
                        pricePerItem: data.cost_each,
                        totalAmount: data.cost_total, fees: 0, netAmount: -data.cost_total
                    };
                    break;
                case 'Item shop buy':
                case 'Item abroad buy':
                    transaction = {
                        type: 'buy',
                        itemName: itemMap[data.item]?.name || `Unknown Item ID ${data.item}`,
                        quantity: data.quantity,
                        pricePerItem: data.cost_each,
                        totalAmount: data.cost_total, fees: 0, netAmount: -data.cost_total
                    };
                    break;
                case 'Item market sell':
                    if (!data.items || data.items.length === 0) continue;
                    transaction = {
                        type: 'sell',
                        itemName: itemMap[data.items[0].id]?.name || `Unknown Item ID ${data.items[0].id}`,
                        quantity: data.items[0].qty,
                        pricePerItem: data.cost_each,
                        totalAmount: data.cost_total + data.fee, fees: data.fee, netAmount: data.cost_total
                    };
                    break;
                case 'Bazaar sell':
                    if (!data.items || data.items.length === 0) continue;
                     transaction = {
                        type: 'sell',
                        itemName: itemMap[data.items[0].id]?.name || `Unknown Item ID ${data.items[0].id}`,
                        quantity: data.items[0].qty,
                        pricePerItem: data.cost_each,
                        totalAmount: data.cost_total, fees: 0, netAmount: data.cost_total
                    };
                    break;
                case 'Item shop sell':
                     transaction = {
                        type: 'sell',
                        itemName: itemMap[data.item]?.name || `Unknown Item ID ${data.item}`,
                        quantity: data.quantity,
                        pricePerItem: data.value_each,
                        totalAmount: data.total_value, fees: 0, netAmount: data.total_value
                    };
                    break;
            }

            if (transaction) {
                transaction.datetime = datetime;
                transactions.push(transaction);
            }
        }
        return transactions;
    }

    // --- All other functions (formatCurrency, displayResults, etc.) are unchanged ---

    function formatCurrency(amount) {
        if (isNaN(amount)) return '$0';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    }

    function displayResults(transactions) {
        updateSummaryDOM('lt', calculateStatsForPeriod(transactions));
        const now = new Date();
        const sevenDaysAgoStart = new Date(now);
        sevenDaysAgoStart.setDate(now.getDate() - 7);
        updateSummaryDOM('d7', calculateStatsForPeriod(transactions.filter(t => t.datetime >= sevenDaysAgoStart)));
        const thirtyDaysAgoStart = new Date(now);
        thirtyDaysAgoStart.setDate(now.getDate() - 30);
        updateSummaryDOM('d30', calculateStatsForPeriod(transactions.filter(t => t.datetime >= thirtyDaysAgoStart)));
        populateProductTable(transactions);
    }

    function calculateStatsForPeriod(periodTransactions) {
        let totalSpent = 0, totalRevenue = 0, totalFees = 0;
        let buyTrades = 0, sellTrades = 0;
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
        const profitElem = document.getElementById(`${prefix}_netProfit`);
        profitElem.textContent = formatCurrency(stats.netProfit);
        profitElem.classList.remove('profit', 'loss', 'neutral');
        if (stats.netProfit > 0) profitElem.classList.add('profit');
        else if (stats.netProfit < 0) profitElem.classList.add('loss');
        else profitElem.classList.add('neutral');
    }
    
    function populateProductTable(allTransactions) {
        const productData = {};
        for (const t of allTransactions) {
            if (!productData[t.itemName]) {
                productData[t.itemName] = { name: t.itemName, qtyBought: 0, totalSpentOnBuys: 0, qtySold: 0, totalRevenueFromSellsNet: 0 };
            }
            const itemEntry = productData[t.itemName];
            if (t.type === 'buy') {
                itemEntry.qtyBought += t.quantity;
                itemEntry.totalSpentOnBuys += t.totalAmount;
            } else if (t.type === 'sell') {
                itemEntry.qtySold += t.quantity;
                itemEntry.totalRevenueFromSellsNet += t.netAmount;
            }
        }
        const tableBody = document.getElementById('productTableBody');
        tableBody.innerHTML = '';
        const fragment = document.createDocumentFragment();
        Object.values(productData).sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
            const avgBuyPrice = item.qtyBought > 0 ? item.totalSpentOnBuys / item.qtyBought : 0;
            const avgSellPriceNet = item.qtySold > 0 ? item.totalRevenueFromSellsNet / item.qtySold : 0;
            const netProfit = item.totalRevenueFromSellsNet - item.totalSpentOnBuys;
            const row = document.createElement('tr');
            const createCell = (content, isCurrency = false, profitStatus = null) => {
                const cell = document.createElement('td');
                cell.textContent = isCurrency ? formatCurrency(content) : content.toLocaleString();
                if (profitStatus) {
                    cell.classList.remove('profit', 'loss', 'neutral');
                    if (profitStatus === 'profit') cell.classList.add('profit');
                    else if (profitStatus === 'loss') cell.classList.add('loss');
                    else cell.classList.add('neutral');
                }
                return cell;
            };
            row.appendChild(createCell(item.name));
            row.appendChild(createCell(item.qtyBought));
            row.appendChild(createCell(avgBuyPrice, true));
            row.appendChild(createCell(item.totalSpentOnBuys, true));
            row.appendChild(createCell(item.qtySold));
            row.appendChild(createCell(avgSellPriceNet, true));
            row.appendChild(createCell(item.totalRevenueFromSellsNet, true));
            let profitClass = null;
            if (netProfit > 0) profitClass = 'profit';
            else if (netProfit < 0) profitClass = 'loss';
            row.appendChild(createCell(netProfit, true, profitClass));
            fragment.appendChild(row);
        });
        tableBody.appendChild(fragment);
    }

    initialize();
});