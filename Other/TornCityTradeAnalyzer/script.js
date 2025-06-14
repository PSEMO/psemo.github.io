document.addEventListener('DOMContentLoaded', () => {
    // --- DOM element references ---
    const apiKeyInput = document.getElementById('apiKeyInput');
    const fetchLogsBtn = document.getElementById('fetchLogsBtn');
    const fetchSpinner = document.getElementById('fetchSpinner');
    const fetchBtnText = document.getElementById('fetchBtnText');
    const resultsSection = document.getElementById('resultsSection');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // --- State ---
    let itemDataCache = null;

    function initialize() {
        fetchLogsBtn.addEventListener('click', handleFetchAndProcessLogs);
    }

    function setButtonLoading(isLoading) {
        fetchLogsBtn.disabled = isLoading;
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
            if (!itemDataCache) {
                const itemApiUrl = `https://api.torn.com/torn/?selections=items&key=${apiKey}&comment=TornTradeAnalyzer`;
                const itemsResponse = await fetchApiData(itemApiUrl);
                itemDataCache = itemsResponse.items;
            }

            console.log("Fetching market/bazaar logs (cat 11)...");
            const logApiUrl11 = `https://api.torn.com/user/?selections=log&cat=11&limit=1000&key=${apiKey}&comment=TornTradeAnalyzer`;
            const logResponse11 = await fetchApiData(logApiUrl11);

            console.log("Waiting for 1 second before next request...");
            await delay(1000);

            console.log("Fetching item management logs (cat 15)...");
            const logApiUrl15 = `https://api.torn.com/user/?selections=log&cat=15&limit=1000&key=${apiKey}&comment=TornTradeAnalyzer`;
            const logResponse15 = await fetchApiData(logApiUrl15);

            const combinedLog = { ...logResponse11.log, ...logResponse15.log };
            const transactions = parseApiData(combinedLog, itemDataCache);

            if (transactions.length === 0) {
                noResultsMessage.textContent = "No trade data (buy/sell) found in your recent logs.";
                noResultsMessage.style.display = 'block';
                return;
            }

            transactions.sort((a, b) => a.datetime - b.datetime);
            displayResults(transactions);
            resultsSection.style.display = 'block';

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
                        console.warn(`API Error Code 17 received. Retrying in ${RETRY_DELAY_MS / 1000}s... (Attempt ${attempt}/${MAX_RETRIES})`);
                        await delay(RETRY_DELAY_MS);
                        continue;
                    }
                    throw new Error(`API Error: ${data.error.error} (Code ${data.error.code})`);
                }
                return data;
            } catch (error) {
                if (attempt === MAX_RETRIES) {
                    throw error;
                }
            }
        }
    }

    /**
     * Parses the log data object from the Torn API into a structured array of transactions.
     * This version correctly handles the different JSON structures for various log types.
     * @param {object} apiLog - The 'log' object from the API response.
     * @param {object} itemMap - The 'items' object from the API for ID-to-name mapping.
     * @returns {Array<object>} - An array of transaction objects.
     */
    function parseApiData(apiLog, itemMap) {
        const transactions = [];

        for (const logEntry of Object.values(apiLog)) {
            const { title, timestamp, data } = logEntry;
            if (!data) continue; // Skip logs without a data object (e.g., price edits)

            const datetime = new Date(timestamp * 1000);
            let transaction = null;

            switch (title) {
                case 'Item market buy':
                case 'Bazaar buy':
                    // These logs use an array `data.items`
                    if (!data.items || data.items.length === 0) continue;
                    transaction = {
                        type: 'buy',
                        itemName: itemMap[data.items[0].id]?.name || `Unknown Item ID ${data.items[0].id}`,
                        quantity: data.items[0].qty,
                        pricePerItem: data.cost_each,
                        totalAmount: data.cost_total,
                        fees: 0,
                        netAmount: -data.cost_total
                    };
                    break;
                
                case 'Item shop buy':
                case 'Item abroad buy':
                    // These logs use a single `data.item` and `data.quantity`
                    transaction = {
                        type: 'buy',
                        itemName: itemMap[data.item]?.name || `Unknown Item ID ${data.item}`,
                        quantity: data.quantity,
                        pricePerItem: data.cost_each,
                        totalAmount: data.cost_total,
                        fees: 0,
                        netAmount: -data.cost_total
                    };
                    break;
                
                case 'Item market sell':
                    // These logs use an array `data.items`
                    if (!data.items || data.items.length === 0) continue;
                    transaction = {
                        type: 'sell',
                        itemName: itemMap[data.items[0].id]?.name || `Unknown Item ID ${data.items[0].id}`,
                        quantity: data.items[0].qty,
                        pricePerItem: data.cost_each,
                        totalAmount: data.cost_total + data.fee,
                        fees: data.fee,
                        netAmount: data.cost_total
                    };
                    break;

                case 'Bazaar sell':
                    // These logs use an array `data.items`
                    if (!data.items || data.items.length === 0) continue;
                     transaction = {
                        type: 'sell',
                        itemName: itemMap[data.items[0].id]?.name || `Unknown Item ID ${data.items[0].id}`,
                        quantity: data.items[0].qty,
                        pricePerItem: data.cost_each,
                        totalAmount: data.cost_total,
                        fees: 0,
                        netAmount: data.cost_total
                    };
                    break;
                
                case 'Item shop sell':
                     // These logs use a single `data.item` and `data.quantity`
                     transaction = {
                        type: 'sell',
                        itemName: itemMap[data.item]?.name || `Unknown Item ID ${data.item}`,
                        quantity: data.quantity,
                        pricePerItem: data.value_each, // Item shop uses 'value_each'
                        totalAmount: data.total_value, // and 'total_value'
                        fees: 0,
                        netAmount: data.total_value
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

    function formatCurrency(amount) {
        if (isNaN(amount)) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
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
        return {
            totalTrades: buyTrades + sellTrades,
            totalSpent,
            totalRevenue,
            totalFees,
            netProfit: totalRevenue - totalSpent
        };
    }

    function updateSummaryDOM(prefix, stats) {
        document.getElementById(`${prefix}_totalTrades`).textContent = stats.totalTrades.toLocaleString();
        document.getElementById(`${prefix}_totalSpent`).textContent = formatCurrency(stats.totalSpent);
        document.getElementById(`${prefix}_totalRevenue`).textContent = formatCurrency(stats.totalRevenue);
        document.getElementById(`${prefix}_totalFees`).textContent = formatCurrency(stats.totalFees);

        const profitElem = document.getElementById(`${prefix}_netProfit`);
        profitElem.textContent = formatCurrency(stats.netProfit);
        
        profitElem.classList.remove('profit', 'loss', 'neutral');
        if (stats.netProfit > 0) {
            profitElem.classList.add('profit');
        } else if (stats.netProfit < 0) {
            profitElem.classList.add('loss');
        } else {
            profitElem.classList.add('neutral');
        }
    }
    
    function populateProductTable(allTransactions) {
        const productData = {};

        for (const t of allTransactions) {
            if (!productData[t.itemName]) {
                productData[t.itemName] = {
                    name: t.itemName,
                    qtyBought: 0, totalSpentOnBuys: 0,
                    qtySold: 0, totalRevenueFromSellsNet: 0,
                };
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

        Object.values(productData)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(item => {
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

    // --- Start the application ---
    initialize();
});