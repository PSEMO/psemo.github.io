document.addEventListener('DOMContentLoaded', () => {
    // DOM element references
    const logInput = document.getElementById('logInput');
    const processLogsBtn = document.getElementById('processLogsBtn');
    const resultsSection = document.getElementById('resultsSection');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Regex for parsing transaction logs - defined once for efficiency
    const REGEX_PATTERNS = {
        bazaarSell: /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*You sold (?:(\d+)x\s*)?some\s*([^:]+?)(?:\s*:\s*([^ ]+))?\s*on your bazaar to .*? at \$([\d,]+) each for a total of \$([\d,]+)/,
        bazaarSellSimple: /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*You sold some\s*([^:]+?)\s*on your bazaar to .*? at \$([\d,]+) each for a total of \$([\d,]+)/,
        marketBuyWithDate: /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*You bought (?:(\d+)x\s*)?(?:some\s*)?(.+?)\s*on the item market from .*? at \$([\d,]+) each for a total of \$([\d,]+)/,
        marketBuyNoDate: /You bought (?:(\d+)x\s*)?(?:some\s*)?(.+?)\s*on the item market from .*? at \$([\d,]+) each for a total of \$([\d,]+)/,
        npcShopBuyWithDate: /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*You bought (?:(\d+)x\s*)?(?:a |an |some )?(.+?)\s*at \$([\d,]+) each for a total of \$([\d,]+) from .*?/,
        npcShopBuyNoDate: /You bought (?:(\d+)x\s*)?(?:a |an |some )?(.+?)\s*at \$([\d,]+) each for a total of \$([\d,]+) from .*?/,
        marketSellWithDate: /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*You sold (?:(\d+)x\s*)?(?:a |an |some )(.+?)\s*on the item market to .*? at \$([\d,]+) each for a total of \$([\d,]+) after \$([\d,]+) in fees/,
        marketSellNoDate: /You sold (?:(\d+)x\s*)?(?:a |an |some )(.+?)\s*on the item market to .*? at \$([\d,]+) each for a total of \$([\d,]+) after \$([\d,]+) in fees/,
        dateAndTime: /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})/,
        daysAgo: /\d+ (DAYS?|HOURS?|MINUTES?) AGO/i
    };

    /**
     * Attaches event listener to the process button.
     */
    function initialize() {
        processLogsBtn.addEventListener('click', handleProcessLogs);
    }

    /**
     * Handles the click event for the "Process Logs" button.
     * Orchestrates parsing, calculation, and display of results.
     */
    function handleProcessLogs() {
        const logs = logInput.value;
        if (!logs.trim()) {
            alert("Please paste some logs.");
            return;
        }
        try {
            const transactions = parseLogs(logs);
            if (transactions.length === 0) {
                resultsSection.style.display = 'none';
                noResultsMessage.style.display = 'block';
                return;
            }
            transactions.sort((a, b) => a.datetime - b.datetime);
            displayResults(transactions);
            resultsSection.style.display = 'block';
            noResultsMessage.style.display = 'none';
        } catch (error) {
            console.error("Error processing logs:", error);
            resultsSection.style.display = 'none';
            noResultsMessage.style.display = 'block';
            alert("An error occurred while processing the logs. Check the console for details.");
        }
    }

    /**
     * Parses the raw log text into a structured array of transaction objects.
     * Iterates through lines, attempts to match various transaction patterns,
     * and handles date association for multi-line log entries.
     */
    function parseLogs(logText) {
        const lines = logText.split('\n');
        const transactions = [];
        let lastDateTime = null;

        for (const rawLine of lines) {
            const line = rawLine.trim();

            if (!line || REGEX_PATTERNS.daysAgo.test(line)) {
                if (REGEX_PATTERNS.daysAgo.test(line)) lastDateTime = null; // Reset date context
                continue;
            }

            let match;
            let timeStr, dateStr, quantityStr, itemName, itemNameVariant, pricePerItemStr, totalStr, feesStr;
            let quantity = 1;
            let currentLineDateTime = null;

            const dateTimeMatch = line.match(REGEX_PATTERNS.dateAndTime);
            if (dateTimeMatch) {
                currentLineDateTime = { time: dateTimeMatch[1], date: dateTimeMatch[2] };
            }

            // Attempt to match sell patterns with inline date
            if (currentLineDateTime) {
                match = line.match(REGEX_PATTERNS.bazaarSell) || line.match(REGEX_PATTERNS.bazaarSellSimple);
                if (match) {
                    if (match.length === 8 && match[4]) { // bazaarSell (with variant)
                        [_, timeStr, dateStr, quantityStr, itemName, itemNameVariant, pricePerItemStr, totalStr] = match;
                    } else { // bazaarSellSimple or bazaarSell without variant
                        [_, timeStr, dateStr, itemName, pricePerItemStr, totalStr] = match;
                         if(match.length === 7){ // bazaarSell with quantity but no variant
                            quantityStr = match[3];
                            itemName = match[4];
                            pricePerItemStr = match[5];
                            totalStr = match[6];
                        } else { // bazaarSellSimple
                            quantityStr = "1"; itemNameVariant = null;
                        }
                    }
                    const itemFullName = itemNameVariant ? `${itemName.trim()} : ${itemNameVariant.trim()}` : itemName.trim();
                    quantity = quantityStr ? parseInt(quantityStr) : 1;
                    transactions.push({
                        type: 'sell', datetime: parseDateTime(dateStr, timeStr), itemName: itemFullName,
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')), fees: 0,
                        netAmount: parseFloat(totalStr.replace(/,/g, ''))
                    });
                    lastDateTime = null; continue;
                }

                match = line.match(REGEX_PATTERNS.marketSellWithDate);
                if (match) {
                    [_, timeStr, dateStr, quantityStr, itemName, pricePerItemStr, totalStr, feesStr] = match;
                    quantity = quantityStr ? parseInt(quantityStr) : 1;
                    transactions.push({
                        type: 'sell', datetime: parseDateTime(dateStr, timeStr), itemName: itemName.trim(),
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')),
                        fees: parseFloat(feesStr.replace(/,/g, '')),
                        netAmount: parseFloat(totalStr.replace(/,/g, ''))
                    });
                    lastDateTime = null; continue;
                }
            }

            // Attempt to match buy patterns with inline date
            if (currentLineDateTime) {
                match = line.match(REGEX_PATTERNS.marketBuyWithDate) || line.match(REGEX_PATTERNS.npcShopBuyWithDate);
                if (match) {
                    [_, timeStr, dateStr, quantityStr, itemName, pricePerItemStr, totalStr] = match;
                    quantity = quantityStr ? parseInt(quantityStr) : 1;
                    transactions.push({
                        type: 'buy', datetime: parseDateTime(dateStr, timeStr), itemName: itemName.trim(),
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')), fees: 0,
                        netAmount: -parseFloat(totalStr.replace(/,/g, ''))
                    });
                    lastDateTime = null; continue;
                }
            }

            // If date was on a previous line, store it for next line's potential transaction
            if (currentLineDateTime) {
                lastDateTime = currentLineDateTime;
            }

            // Attempt to match patterns that use a previously captured date
            if (lastDateTime) {
                match = line.match(REGEX_PATTERNS.marketSellNoDate);
                if (match) {
                    [_, quantityStr, itemName, pricePerItemStr, totalStr, feesStr] = match;
                    quantity = quantityStr ? parseInt(quantityStr) : 1;
                    transactions.push({
                        type: 'sell', datetime: parseDateTime(lastDateTime.date, lastDateTime.time), itemName: itemName.trim(),
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')),
                        fees: parseFloat(feesStr.replace(/,/g, '')),
                        netAmount: parseFloat(totalStr.replace(/,/g, ''))
                    });
                    lastDateTime = null; continue;
                }

                match = line.match(REGEX_PATTERNS.marketBuyNoDate) || line.match(REGEX_PATTERNS.npcShopBuyNoDate);
                if (match) {
                    [_, quantityStr, itemName, pricePerItemStr, totalStr] = match;
                    quantity = quantityStr ? parseInt(quantityStr) : 1;
                    transactions.push({
                        type: 'buy', datetime: parseDateTime(lastDateTime.date, lastDateTime.time), itemName: itemName.trim(),
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')), fees: 0,
                        netAmount: -parseFloat(totalStr.replace(/,/g, ''))
                    });
                    lastDateTime = null; continue;
                }
            }
        }
        return transactions;
    }

    /**
     * Converts DD/MM/YY date string and HH:MM:SS time string into a JavaScript Date object.
     */
    function parseDateTime(dateStr, timeStr) {
        const [day, month, yearSuffix] = dateStr.split('/');
        const [hours, minutes, seconds] = timeStr.split(':');
        const year = parseInt(yearSuffix, 10) + 2000;
        return new Date(year, parseInt(month, 10) - 1, parseInt(day, 10),
                        parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10));
    }

    /**
     * Formats a numeric amount into a USD currency string.
     */
    function formatCurrency(amount) {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    /**
     * Calculates and displays all summary statistics and the product table.
     */
    function displayResults(transactions) {
        updateSummaryDOM('lt', calculateStatsForPeriod(transactions));

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        updateSummaryDOM('d7', calculateStatsForPeriod(transactions.filter(t => t.datetime >= sevenDaysAgo)));

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        updateSummaryDOM('d30', calculateStatsForPeriod(transactions.filter(t => t.datetime >= thirtyDaysAgo)));

        populateProductTable(transactions);
    }

    /**
     * Calculates aggregate statistics (spent, revenue, fees, profit) for a given set of transactions.
     */
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
            totalSpent, totalRevenue, totalFees,
            netProfit: totalRevenue - totalSpent
        };
    }

    /**
     * Updates the summary section in the DOM with calculated statistics.
     */
    function updateSummaryDOM(prefix, stats) {
        document.getElementById(`${prefix}_totalTrades`).textContent = stats.totalTrades;
        document.getElementById(`${prefix}_totalSpent`).textContent = formatCurrency(stats.totalSpent);
        document.getElementById(`${prefix}_totalRevenue`).textContent = formatCurrency(stats.totalRevenue);
        document.getElementById(`${prefix}_totalFees`).textContent = formatCurrency(stats.totalFees);
        const profitElem = document.getElementById(`${prefix}_netProfit`);
        profitElem.textContent = formatCurrency(stats.netProfit);
        profitElem.className = stats.netProfit >= 0 ? 'profit' : (stats.netProfit < 0 ? 'loss' : 'neutral');
    }

    /**
     * Populates the per-product analysis table in the DOM.
     */
    function populateProductTable(allTransactions) {
        const productData = {};

        for (const t of allTransactions) {
            if (!productData[t.itemName]) {
                productData[t.itemName] = {
                    name: t.itemName,
                    qtyBought: 0, totalSpent: 0,
                    qtySold: 0, totalRevenueNet: 0,
                };
            }
            const item = productData[t.itemName];
            if (t.type === 'buy') {
                item.qtyBought += t.quantity;
                item.totalSpent += t.totalAmount;
            } else if (t.type === 'sell') {
                item.qtySold += t.quantity;
                item.totalRevenueNet += t.netAmount;
            }
        }

        const tableBody = document.getElementById('productTableBody');
        tableBody.innerHTML = ''; // Clear previous data

        const fragment = document.createDocumentFragment();
        Object.values(productData)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(item => {
                const avgBuyPrice = item.qtyBought > 0 ? item.totalSpent / item.qtyBought : 0;
                const avgSellPrice = item.qtySold > 0 ? item.totalRevenueNet / item.qtySold : 0;
                const netProfit = item.totalRevenueNet - item.totalSpent;

                const row = tableBody.insertRow();
                row.insertCell().textContent = item.name;
                row.insertCell().textContent = item.qtyBought;
                row.insertCell().textContent = formatCurrency(avgBuyPrice);
                row.insertCell().textContent = formatCurrency(item.totalSpent);
                row.insertCell().textContent = item.qtySold;
                row.insertCell().textContent = formatCurrency(avgSellPrice);
                row.insertCell().textContent = formatCurrency(item.totalRevenueNet);
                const profitCell = row.insertCell();
                profitCell.textContent = formatCurrency(netProfit);
                profitCell.className = netProfit > 0 ? 'profit' : (netProfit < 0 ? 'loss' : 'neutral');
                fragment.appendChild(row);
            });
        tableBody.appendChild(fragment);
    }

    initialize(); // Start the application
});