document.addEventListener('DOMContentLoaded', () => {
    // DOM element references
    const logInput = document.getElementById('logInput');
    const processLogsBtn = document.getElementById('processLogsBtn');
    const resultsSection = document.getElementById('resultsSection');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Regex for parsing transaction logs
    const REGEX_PATTERNS = {
        // Sell logs
        bazaarSell:         /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*You sold (?:(\d+)x\s*)?some\s*([^:]+?)(?:\s*:\s*([^ ]+))?\s*on your bazaar to .*? at \$([\d,]+) each for a total of \$([\d,]+)/,
        marketSellWithDate: /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*You sold (?:(\d+)x\s*)?(?:a |an |some )?(.+?)\s+on the item market to .*? at \$([\d,]+) each for a total of \$([\d,]+) after \$([\d,]+) in fees/,
        marketSellNoDate:   /You sold (?:(\d+)x\s*)?(?:a |an |some )?(.+?)\s+on the item market to .*? at \$([\d,]+) each for a total of \$([\d,]+) after \$([\d,]+) in fees/,

        // Buy logs - Updated to better handle "a", "an", "some"
        marketBuyWithDate:  /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*You bought (?:(\d+)x\s*)?(?:a |an |some )?(.+?)\s*on the item market from .*? at \$([\d,]+) each for a total of \$([\d,]+)/,
        marketBuyNoDate:    /You bought (?:(\d+)x\s*)?(?:a |an |some )?(.+?)\s*on the item market from .*? at \$([\d,]+) each for a total of \$([\d,]+)/,
        npcShopBuyWithDate: /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})\s*You bought (?:(\d+)x\s*)?(?:a |an |some )?(.+?)\s*at \$([\d,]+) each for a total of \$([\d,]+) from .*?/,
        npcShopBuyNoDate:   /You bought (?:(\d+)x\s*)?(?:a |an |some )?(.+?)\s*at \$([\d,]+) each for a total of \$([\d,]+) from .*?/,

        // Utility
        dateAndTime: /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})/,
        daysAgo: /\d+ (DAYS?|HOURS?|MINUTES?) AGO/i // Case insensitive for units
    };

    function initialize() {
        processLogsBtn.addEventListener('click', handleProcessLogs);
    }

    function handleProcessLogs() {
        const logs = logInput.value;
        if (!logs.trim()) {
            alert("Please paste some logs.");
            return;
        }

        resultsSection.style.display = 'none';
        noResultsMessage.style.display = 'none';

        try {
            const transactions = parseLogs(logs);

            if (transactions.length === 0) {
                noResultsMessage.textContent = "No trade data (buy/sell) found in the provided logs.";
                noResultsMessage.style.display = 'block';
                return;
            }

            transactions.sort((a, b) => a.datetime - b.datetime); // Sort by date ascending
            displayResults(transactions);
            resultsSection.style.display = 'block';

        } catch (error) {
            console.error("Error processing logs:", error);
            noResultsMessage.textContent = "An error occurred during processing: " + error.message;
            noResultsMessage.style.display = 'block';
        }
    }

    function parseLogs(logText) {
        const lines = logText.split('\n');
        const transactions = [];
        let lastDateTime = null;

        for (const rawLine of lines) {
            const line = rawLine.trim();

            if (!line) continue; // Skip empty lines

            // Discard "X days/hours/minutes ago" lines and reset lastDateTime if it was a date marker
            if (REGEX_PATTERNS.daysAgo.test(line)) {
                lastDateTime = null; // This line itself is not a transaction and resets date context
                continue;
            }

            let match;
            let timeStr, dateStr, quantityStr, itemName, itemNameVariant, pricePerItemStr, totalStr, feesStr;
            let quantity = 1;
            let currentLineDateTime = null; // Date/time found on the current line itself

            const dateTimeMatch = line.match(REGEX_PATTERNS.dateAndTime);
            if (dateTimeMatch) {
                currentLineDateTime = { time: dateTimeMatch[1], date: dateTimeMatch[2] };
            }

            // --- SELL TRANSACTIONS ---
            // Attempt to match logs that HAVE their own timestamp first
            if (currentLineDateTime) {
                match = line.match(REGEX_PATTERNS.bazaarSell);
                if (match) {
                    [_, timeStr, dateStr, quantityStr, itemName, itemNameVariant, pricePerItemStr, totalStr] = match;
                    const itemFullName = itemNameVariant ? `${itemName.trim()} : ${itemNameVariant.trim()}` : itemName.trim();
                    quantity = quantityStr ? parseInt(quantityStr) : 1; // "some" implies 1 if no Nx prefix
                    transactions.push({
                        type: 'sell', datetime: parseDateTime(dateStr, timeStr), itemName: itemFullName,
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')), fees: 0, // Bazaar sales in this format don't show fees directly, net is total
                        netAmount: parseFloat(totalStr.replace(/,/g, ''))
                    });
                    lastDateTime = null; continue; // Transaction found and processed
                }

                match = line.match(REGEX_PATTERNS.marketSellWithDate);
                if (match) {
                    [_, timeStr, dateStr, quantityStr, itemName, pricePerItemStr, totalStr, feesStr] = match;
                    quantity = quantityStr ? parseInt(quantityStr) : 1;
                    transactions.push({
                        type: 'sell', datetime: parseDateTime(dateStr, timeStr), itemName: itemName.trim(),
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')), // This is net amount for player
                        fees: parseFloat(feesStr.replace(/,/g, '')),
                        netAmount: parseFloat(totalStr.replace(/,/g, ''))
                    });
                    lastDateTime = null; continue;
                }
            }

            // --- BUY TRANSACTIONS ---
            // Attempt to match logs that HAVE their own timestamp first
            if (currentLineDateTime) {
                // Combine market and NPC shop buys as their structure is similar here
                match = line.match(REGEX_PATTERNS.marketBuyWithDate) || line.match(REGEX_PATTERNS.npcShopBuyWithDate);
                if (match) {
                    [_, timeStr, dateStr, quantityStr, itemName, pricePerItemStr, totalStr] = match;
                    quantity = quantityStr ? parseInt(quantityStr) : 1;
                    transactions.push({
                        type: 'buy', datetime: parseDateTime(dateStr, timeStr), itemName: itemName.trim(),
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')), fees: 0,
                        netAmount: -parseFloat(totalStr.replace(/,/g, '')) // Cost, so negative for profit calculation
                    });
                    lastDateTime = null; continue;
                }
            }

            // If the current line had a timestamp but wasn't a transaction, it becomes the lastDateTime
            // for subsequent lines that might not have their own timestamp.
            if (currentLineDateTime) {
                lastDateTime = currentLineDateTime;
            }

            // --- TRANSACTIONS WITHOUT EMBEDDED DATE (using lastDateTime) ---
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
                    lastDateTime = null; continue; // Used lastDateTime, so clear it
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
                    lastDateTime = null; continue; // Used lastDateTime, so clear it
                }
            }
        }
        return transactions;
    }

    function parseDateTime(dateStr, timeStr) {
        const [day, month, yearSuffix] = dateStr.split('/');
        const [hours, minutes, seconds] = timeStr.split(':');
        const year = parseInt(yearSuffix, 10) + 2000; // Assuming 21st century
        // Month is 0-indexed in JavaScript Date
        return new Date(year, parseInt(month, 10) - 1, parseInt(day, 10),
                        parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10));
    }

    function formatCurrency(amount) {
        if (isNaN(amount)) return '$0.00'; // Handle potential NaN issues gracefully
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function displayResults(transactions) {
        updateSummaryDOM('lt', calculateStatsForPeriod(transactions));

        const now = new Date();
        // Ensure "today" is set to the beginning of the day for consistent comparison
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const sevenDaysAgoStart = new Date(todayStart);
        sevenDaysAgoStart.setDate(todayStart.getDate() - 7); // Will correctly handle month/year rollovers
        updateSummaryDOM('d7', calculateStatsForPeriod(transactions.filter(t => t.datetime >= sevenDaysAgoStart)));

        const thirtyDaysAgoStart = new Date(todayStart);
        thirtyDaysAgoStart.setDate(todayStart.getDate() - 30); // Will correctly handle month/year rollovers
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
                totalRevenue += t.netAmount; // netAmount is already after fees for sells
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
        document.getElementById(`${prefix}_totalTrades`).textContent = stats.totalTrades;
        document.getElementById(`${prefix}_totalSpent`).textContent = formatCurrency(stats.totalSpent);
        document.getElementById(`${prefix}_totalRevenue`).textContent = formatCurrency(stats.totalRevenue);
        document.getElementById(`${prefix}_totalFees`).textContent = formatCurrency(stats.totalFees);

        const profitElem = document.getElementById(`${prefix}_netProfit`);
        profitElem.textContent = formatCurrency(stats.netProfit);

        // Use Bootstrap's text color utility classes
        profitElem.classList.remove('text-success', 'text-danger', 'text-body', 'neutral'); // Clear existing
        if (stats.netProfit > 0) {
            profitElem.classList.add('text-success');
        } else if (stats.netProfit < 0) {
            profitElem.classList.add('text-danger');
        } else {
            profitElem.classList.add('text-body'); // Or 'text-muted' or your 'neutral' class if preferred
        }
    }

    function populateProductTable(allTransactions) {
        const productData = {}; // Accumulate data per product

        for (const t of allTransactions) {
            if (!productData[t.itemName]) {
                productData[t.itemName] = {
                    name: t.itemName,
                    qtyBought: 0, totalSpentOnBuys: 0, // Renamed for clarity
                    qtySold: 0, totalRevenueFromSellsNet: 0, // Renamed for clarity
                };
            }
            const itemEntry = productData[t.itemName];
            if (t.type === 'buy') {
                itemEntry.qtyBought += t.quantity;
                itemEntry.totalSpentOnBuys += t.totalAmount;
            } else if (t.type === 'sell') {
                itemEntry.qtySold += t.quantity;
                itemEntry.totalRevenueFromSellsNet += t.netAmount; // netAmount is already after fees
            }
        }

        const tableBody = document.getElementById('productTableBody');
        tableBody.innerHTML = ''; // Clear previous results
        const fragment = document.createDocumentFragment(); // For performance

        Object.values(productData)
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort by item name
            .forEach(item => {
                const avgBuyPrice = item.qtyBought > 0 ? item.totalSpentOnBuys / item.qtyBought : 0;
                const avgSellPriceNet = item.qtySold > 0 ? item.totalRevenueFromSellsNet / item.qtySold : 0;
                // Net profit for this item considers all buys and all sells of this item
                const netProfit = item.totalRevenueFromSellsNet - item.totalSpentOnBuys;

                const row = document.createElement('tr');

                const createCell = (content, isCurrency = false, profitStatus = null) => {
                    const cell = document.createElement('td');
                    cell.textContent = isCurrency ? formatCurrency(content) : content;
                    if (profitStatus) {
                        cell.classList.remove('text-success', 'text-danger', 'text-body');
                        if (profitStatus === 'profit') cell.classList.add('text-success');
                        else if (profitStatus === 'loss') cell.classList.add('text-danger');
                        else cell.classList.add('text-body'); // Neutral
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

    initialize(); // Start the application
});