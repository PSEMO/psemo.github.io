document.addEventListener('DOMContentLoaded', () => {
    // DOM element references
    const logInput = document.getElementById('logInput');
    const processLogsBtn = document.getElementById('processLogsBtn');
    const resultsSection = document.getElementById('resultsSection');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // --- Regex Building Blocks ---
    // Using String.raw to avoid excessive backslash escaping.
    // CG = Capturing Group
    const R_PARTS = {
        // ---- Foundational Elements ----
        TIME: String.raw`(\d{2}:\d{2}:\d{2})`,                 // CG: HH:MM:SS
        DATE: String.raw`(\d{2}\/\d{2}\/\d{2})`,                 // CG: DD/MM/YY

        // ---- Combined Elements ----
        // Full timestamp pattern. CG1: Time, CG2: Date
        TIMESTAMP_FULL: String.raw`(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})`,

        // ---- Quantity Specifiers (these define capture groups for quantity if present) ----
        // Optional "Nx " (e.g., "2x "). CG1: N (the number).
        OPTIONAL_NX_PREFIX: String.raw`(?:(\d+)x\s*)?`,
        // "Nx " OR "some ". CG1: N (if "Nx" is present). Includes trailing space.
        BAZAAR_QUANTITY_PREFIX: String.raw`(?:(?:(\d+)x\s*)|(?:some\s*))`,
        // Optional "Nx ", then optional "a/an/some ". CG1: N (if "Nx" is present). Includes trailing space from "some " or "Nx ".
        GENERAL_QUANTITY_PREFIX: String.raw`(?:(\d+)x\s*)?(?:a |an |some )?`,

        // ---- Item Name Patterns (these define capture groups for item name/variant) ----
        // Captures item name (e.g., "Kevlar Vest", "Morphine"). Non-greedy. CG1: ItemName.
        ITEM_NAME_SIMPLE: String.raw`(.+?)`,
        // Captures base item name and optionally a variant (e.g., "Spray Paint" : "Red").
        // CG1: Base Name, Optional CG2: Variant
        ITEM_NAME_WITH_VARIANT: String.raw`([^:]+?)(?:\s*:\s*([^ ]+))?`,

        // ---- Transaction Details (define capture groups for monetary values) ----
        // "at $price each for a total of $total". CG1: PriceEach, CG2: Total
        PRICE_AND_TOTAL: String.raw`at \$([\d,]+) each for a total of \$([\d,]+)`,
        // "after $fees in fees". CG1: Fees
        FEES_SUFFIX: String.raw`after \$([\d,]+) in fees`,

        // ---- Keywords with required trailing space (non-capturing structure) ----
        KEYWORD_YOU_SOLD_SP: String.raw`You sold\s+`,
        KEYWORD_YOU_BOUGHT_SP: String.raw`You bought\s+`,

        // ---- Contextual Phrases (non-capturing structure) ----
        CONTEXT_ON_BAZAAR_TO: String.raw`on your bazaar to .*?`,
        CONTEXT_ON_MARKET_TO: String.raw`on the item market to .*?`,
        CONTEXT_ON_MARKET_FROM: String.raw`on the item market from .*?`,
        CONTEXT_FROM_NPC_SHOP: String.raw`from .*?`, // e.g., "from Bits 'n' Bobs"

        // ---- Spacers (non-capturing structure) ----
        SP_OPT: String.raw`\s*`, // 0 or more whitespace characters
        SP_REQ: String.raw`\s+`  // 1 or more whitespace characters
    };

    // Regex for parsing transaction logs, built from R_PARTS
    // The order of concatenation and capture groups is critical for the parseLogs function.
    const REGEX_PATTERNS = {
        // Sell logs
        bazaarSell: new RegExp(
            R_PARTS.TIMESTAMP_FULL +            // CG1: Time, CG2: Date
            R_PARTS.SP_OPT +
            R_PARTS.KEYWORD_YOU_SOLD_SP +       // "You sold "
            R_PARTS.BAZAAR_QUANTITY_PREFIX +    // CG3: Quantity (from Nx)
            R_PARTS.ITEM_NAME_WITH_VARIANT +    // CG4: ItemNameBase, CG5: ItemNameVariant
            R_PARTS.SP_OPT +
            R_PARTS.CONTEXT_ON_BAZAAR_TO +
            R_PARTS.SP_OPT +
            R_PARTS.PRICE_AND_TOTAL             // CG6: PriceEach, CG7: Total
        ),
        marketSellWithDate: new RegExp(
            R_PARTS.TIMESTAMP_FULL +            // CG1: Time, CG2: Date
            R_PARTS.SP_OPT +
            R_PARTS.KEYWORD_YOU_SOLD_SP +       // "You sold "
            R_PARTS.GENERAL_QUANTITY_PREFIX +   // CG3: Quantity (from Nx)
            R_PARTS.ITEM_NAME_SIMPLE +          // CG4: ItemName (full)
            R_PARTS.SP_REQ +                    // Required space before "on the item market"
            R_PARTS.CONTEXT_ON_MARKET_TO +
            R_PARTS.SP_OPT +
            R_PARTS.PRICE_AND_TOTAL +           // CG5: PriceEach, CG6: Total
            R_PARTS.SP_OPT +
            R_PARTS.FEES_SUFFIX                 // CG7: Fees
        ),
        marketSellNoDate: new RegExp(
            R_PARTS.KEYWORD_YOU_SOLD_SP +       // "You sold "
            R_PARTS.GENERAL_QUANTITY_PREFIX +   // CG1: Quantity (from Nx)
            R_PARTS.ITEM_NAME_SIMPLE +          // CG2: ItemName (full)
            R_PARTS.SP_REQ +                    // Required space before "on the item market"
            R_PARTS.CONTEXT_ON_MARKET_TO +
            R_PARTS.SP_OPT +
            R_PARTS.PRICE_AND_TOTAL +           // CG3: PriceEach, CG4: Total
            R_PARTS.SP_OPT +
            R_PARTS.FEES_SUFFIX                 // CG5: Fees
        ),

        // Buy logs
        marketBuyWithDate: new RegExp(
            R_PARTS.TIMESTAMP_FULL +            // CG1: Time, CG2: Date
            R_PARTS.SP_OPT +
            R_PARTS.KEYWORD_YOU_BOUGHT_SP +     // "You bought "
            R_PARTS.GENERAL_QUANTITY_PREFIX +   // CG3: Quantity (from Nx)
            R_PARTS.ITEM_NAME_WITH_VARIANT +    // CG4: ItemNameBase, CG5: ItemNameVariant
            R_PARTS.SP_OPT +
            R_PARTS.CONTEXT_ON_MARKET_FROM +
            R_PARTS.SP_OPT +
            R_PARTS.PRICE_AND_TOTAL             // CG6: PriceEach, CG7: Total
        ),
        marketBuyNoDate: new RegExp(
            R_PARTS.KEYWORD_YOU_BOUGHT_SP +     // "You bought "
            R_PARTS.GENERAL_QUANTITY_PREFIX +   // CG1: Quantity (from Nx)
            R_PARTS.ITEM_NAME_WITH_VARIANT +    // CG2: ItemNameBase, CG3: ItemNameVariant
            R_PARTS.SP_OPT +
            R_PARTS.CONTEXT_ON_MARKET_FROM +
            R_PARTS.SP_OPT +
            R_PARTS.PRICE_AND_TOTAL             // CG4: PriceEach, CG5: Total
        ),
        npcShopBuyWithDate: new RegExp(
            R_PARTS.TIMESTAMP_FULL +            // CG1: Time, CG2: Date
            R_PARTS.SP_OPT +
            R_PARTS.KEYWORD_YOU_BOUGHT_SP +     // "You bought "
            R_PARTS.GENERAL_QUANTITY_PREFIX +   // CG3: Quantity (from Nx)
            R_PARTS.ITEM_NAME_SIMPLE +          // CG4: ItemName (full)
            R_PARTS.SP_OPT +                    // Optional space before "at $"
            R_PARTS.PRICE_AND_TOTAL +           // CG5: PriceEach, CG6: Total
            R_PARTS.SP_OPT +
            R_PARTS.CONTEXT_FROM_NPC_SHOP
        ),
        npcShopBuyNoDate: new RegExp(
            R_PARTS.KEYWORD_YOU_BOUGHT_SP +     // "You bought "
            R_PARTS.GENERAL_QUANTITY_PREFIX +   // CG1: Quantity (from Nx)
            R_PARTS.ITEM_NAME_SIMPLE +          // CG2: ItemName (full)
            R_PARTS.SP_OPT +                    // Optional space before "at $"
            R_PARTS.PRICE_AND_TOTAL +           // CG3: PriceEach, CG4: Total
            R_PARTS.SP_OPT +
            R_PARTS.CONTEXT_FROM_NPC_SHOP
        ),

        // Utility
        dateAndTime: new RegExp(R_PARTS.TIMESTAMP_FULL), // CG1: Time, CG2: Date
        daysAgo: /\d+ (DAYS?|HOURS?|MINUTES?) AGO/i
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

            transactions.sort((a, b) => a.datetime - b.datetime);
            displayResults(transactions);
            resultsSection.style.display = 'block';

        } catch (error)            {
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

            if (!line) continue;

            if (REGEX_PATTERNS.daysAgo.test(line)) {
                lastDateTime = null;
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

            // --- SELL TRANSACTIONS ---
            if (currentLineDateTime) {
                match = line.match(REGEX_PATTERNS.bazaarSell);
                if (match) {
                    // CGs from bazaarSell: 1:time, 2:date, 3:quantity(Nx), 4:itemNameBase, 5:itemVariant, 6:pricePer, 7:total
                    [_, timeStr, dateStr, quantityStr, itemName, itemNameVariant, pricePerItemStr, totalStr] = match;
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
                    // CGs from marketSellWithDate: 1:time, 2:date, 3:quantity(Nx), 4:itemName(full), 5:pricePer, 6:total, 7:fees
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

            // --- BUY TRANSACTIONS ---
            if (currentLineDateTime) {
                match = line.match(REGEX_PATTERNS.marketBuyWithDate);
                if (match) {
                    // CGs from marketBuyWithDate: 1:time, 2:date, 3:quantity(Nx), 4:itemNameBase, 5:itemVariant, 6:pricePer, 7:total
                    [_, timeStr, dateStr, quantityStr, itemName, itemNameVariant, pricePerItemStr, totalStr] = match;
                    const itemFullName = itemNameVariant ? `${itemName.trim()} : ${itemNameVariant.trim()}` : itemName.trim();
                    quantity = quantityStr ? parseInt(quantityStr) : 1;
                    transactions.push({
                        type: 'buy', datetime: parseDateTime(dateStr, timeStr), itemName: itemFullName,
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')), fees: 0,
                        netAmount: -parseFloat(totalStr.replace(/,/g, ''))
                    });
                    lastDateTime = null; continue;
                }

                match = line.match(REGEX_PATTERNS.npcShopBuyWithDate);
                if (match) {
                    // CGs from npcShopBuyWithDate: 1:time, 2:date, 3:quantity(Nx), 4:itemName(full), 5:pricePer, 6:total
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

            if (currentLineDateTime) {
                lastDateTime = currentLineDateTime;
            }

            // --- TRANSACTIONS WITHOUT EMBEDDED DATE (using lastDateTime) ---
            if (lastDateTime) {
                match = line.match(REGEX_PATTERNS.marketSellNoDate);
                if (match) {
                    // CGs from marketSellNoDate: 1:quantity(Nx), 2:itemName(full), 3:pricePer, 4:total, 5:fees
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

                match = line.match(REGEX_PATTERNS.marketBuyNoDate);
                if (match) {
                    // CGs from marketBuyNoDate: 1:quantity(Nx), 2:itemNameBase, 3:itemVariant, 4:pricePer, 5:total
                    [_, quantityStr, itemName, itemNameVariant, pricePerItemStr, totalStr] = match;
                    const itemFullName = itemNameVariant ? `${itemName.trim()} : ${itemNameVariant.trim()}` : itemName.trim();
                    quantity = quantityStr ? parseInt(quantityStr) : 1;
                    transactions.push({
                        type: 'buy', datetime: parseDateTime(lastDateTime.date, lastDateTime.time), itemName: itemFullName,
                        quantity, pricePerItem: parseFloat(pricePerItemStr.replace(/,/g, '')),
                        totalAmount: parseFloat(totalStr.replace(/,/g, '')), fees: 0,
                        netAmount: -parseFloat(totalStr.replace(/,/g, ''))
                    });
                    lastDateTime = null; continue;
                }

                match = line.match(REGEX_PATTERNS.npcShopBuyNoDate);
                if (match) {
                    // CGs from npcShopBuyNoDate: 1:quantity(Nx), 2:itemName(full), 3:pricePer, 4:total
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

    function parseDateTime(dateStr, timeStr) {
        const [day, month, yearSuffix] = dateStr.split('/');
        const [hours, minutes, seconds] = timeStr.split(':');
        const year = parseInt(yearSuffix, 10) + 2000;
        return new Date(year, parseInt(month, 10) - 1, parseInt(day, 10),
                        parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10));
    }

    function formatCurrency(amount) {
        if (isNaN(amount)) return '$0.00';
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function displayResults(transactions) {
        updateSummaryDOM('lt', calculateStatsForPeriod(transactions));

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const sevenDaysAgoStart = new Date(todayStart);
        sevenDaysAgoStart.setDate(todayStart.getDate() - 7);
        updateSummaryDOM('d7', calculateStatsForPeriod(transactions.filter(t => t.datetime >= sevenDaysAgoStart)));

        const thirtyDaysAgoStart = new Date(todayStart);
        thirtyDaysAgoStart.setDate(todayStart.getDate() - 30);
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
        document.getElementById(`${prefix}_totalTrades`).textContent = stats.totalTrades;
        document.getElementById(`${prefix}_totalSpent`).textContent = formatCurrency(stats.totalSpent);
        document.getElementById(`${prefix}_totalRevenue`).textContent = formatCurrency(stats.totalRevenue);
        document.getElementById(`${prefix}_totalFees`).textContent = formatCurrency(stats.totalFees);

        const profitElem = document.getElementById(`${prefix}_netProfit`);
        profitElem.textContent = formatCurrency(stats.netProfit);

        profitElem.classList.remove('text-success', 'text-danger', 'text-body', 'neutral');
        if (stats.netProfit > 0) {
            profitElem.classList.add('text-success');
        } else if (stats.netProfit < 0) {
            profitElem.classList.add('text-danger');
        } else {
            profitElem.classList.add('text-body');
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
                    cell.textContent = isCurrency ? formatCurrency(content) : content;
                    if (profitStatus) {
                        cell.classList.remove('text-success', 'text-danger', 'text-body');
                        if (profitStatus === 'profit') cell.classList.add('text-success');
                        else if (profitStatus === 'loss') cell.classList.add('text-danger');
                        else cell.classList.add('text-body');
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
