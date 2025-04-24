// --- Logger ---
const Logger = {
    enabled: true, // Toggle logging on/off easily
    log: (message, level = 'INFO') => {
        if (!Logger.enabled) return;
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}][${level}] ${message}`);
    },
    // Example of different levels (could be expanded)
    info: (message) => Logger.log(message, 'INFO'),
    warn: (message) => Logger.log(message, 'WARN'),
    error: (message) => Logger.log(message, 'ERROR'),
    action: (message) => Logger.log(message, 'PLAYER ACTION') // Specific level for player actions
};

// --- Configuration ---
const CONFIG = {
    SAVE_KEY: 'grindMindsetSaveData_v2',
    AUTO_SAVE_INTERVAL_MS: 10000,
    GAME_TICK_INTERVAL_MS: 1000,
    MAX_CITIES: 5,
    GRID_WIDTH: 8,
    GRID_HEIGHT: 6,
    INFLATION_RATE: 1.075, // e.g., 7.5% increase
    WORK_COOLDOWN_MS: 350,
    INFLATION_MSG_DURATION_MS: 6000,
    STARTING_MONEY: 0, // Set to 0 for release, keep higher for testing
    SAVE_VERSION: 2,
    BUILDING_GENERATION: {
        residentialPossibility: 0.30,
        commercialPossibility: 0.40,
        industrialPossibility: 0.20,
        logisticsPossibility: 0.10,
        canWorkPossibility: 0.7, // Chance a commercial building is looking for workers
        cityBaseMultiplierIncrement: 0.2, // e.g., City 2 base stats are 1.2x City 1
        guaranteeWorkableInCity1: true,
    },
    BUILDING_DEFS: [
        { type: 'residential', color: 'green', basePrice: 300000, priceRange: 300000 * 1.5, baseRevenue: 300000 / 500, revenueRange: 300000 / 500, workBoost: 1.5, isWorkable: false, baseUpgradeCost: 300000 / 2, upgradeCostMult: 1.15, upgradeRevInc: 300000 / 1000 },
        { type: 'commercial', color: 'blue', basePrice: 100000, priceRange: 100000 * 1.5, baseRevenue: 100000 / 500, revenueRange: 100000 / 500, workBoost: 1.6, isWorkable: true, baseUpgradeCost: 100000 / 2, upgradeCostMult: 1.18, upgradeRevInc: 100000 / 1000 },
        { type: 'industrial', color: 'yellow', basePrice: 1000000, priceRange: 1000000 * 1.5, baseRevenue: 1000000 / 500, revenueRange: 1000000 / 500, workBoost: 1.8, isWorkable: false, baseUpgradeCost: 1000000 / 2, upgradeCostMult: 1.20, upgradeRevInc: 1000000 / 1000 },
        { type: 'logistics', color: 'purple', basePrice: 2000000, priceRange: 2000000 * 1.5, baseRevenue: 0.10, revenueRange: 0.10, workBoost: 0.06, isWorkable: false, baseUpgradeCost: 2000000 / 2, upgradeCostMult: 1.22, upgradeRevInc: 0.02 }
    ],
    UPGRADE_DEFS: () => [ // Use function to ensure fresh copy if needed
        // Multipliers
        { id: 'mult1', name: 'Intern Training', description: 'Doubles money earned from working at non-owned Commercial buildings.', cost: 10000, type: 'multiplier', value: 2, image: './images/TrainingIcon.png', isBought: false },
        { id: 'mult2', name: 'Efficiency Methods', description: 'Doubles money earned from working at non-owned Commercial buildings again.', cost: 40000, type: 'multiplier', value: 2, image: './images/EfficiencyIcon.png', isBought: false },
        { id: 'mult3', name: 'Synergy Secrets', description: 'One more doubling of money earned from working at non-owned Commercial buildings.', cost: 160000, type: 'multiplier', value: 2, image: './images/SynergyIcon.png', isBought: false },
        // Percentage Income
        { id: 'perc1', name: 'Market Analysis', description: 'Increases total passive income per second by 10%.', cost: 20000, type: 'percentage', value: 0.10, image: './images/MarketIcon.png', isBought: false },
        { id: 'perc2', name: 'Tax Loophole', description: 'Increases total passive income per second by another 10%.', cost: 80000, type: 'percentage', value: 0.10, image: './images/TaxIcon.png', isBought: false },
        { id: 'perc3', name: 'Global Outreach', description: 'Increases total passive income per second by a final 10%.', cost: 320000, type: 'percentage', value: 0.10, image: './images/GlobalIcon.png', isBought: false },
        // City Unlocks
        { id: 'city1', name: 'Expand East', description: 'Unlocks City 2, allowing travel and investment there.', cost: 100000, type: 'city', value: 2, image: './images/ExpandIcon.png', isBought: false },
        { id: 'city2', name: 'Advance West', description: 'Unlocks City 3.', cost: 400000, type: 'city', value: 3, image: './images/AddIcon.png', isBought: false },
        { id: 'city3', name: 'Grow North', description: 'Unlocks City 4.', cost: 1600000, type: 'city', value: 4, image: './images/GrowIcon.png', isBought: false },
        { id: 'city4', name: 'Reach South', description: 'Unlocks City 5.', cost: 6400000, type: 'city', value: 5, image: './images/ReachIcon.png', isBought: false },
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const DOM = {
        body: document.body,
        gameArea: document.getElementById('game-area'),
        upgradesContainer: document.getElementById('upgrades-container'),
        money: document.getElementById('money'),
        incomeRate: document.getElementById('income-rate'),
        currentWork: document.getElementById('current-work'),
        saveStatus: document.getElementById('save-status'),
        restartButton: document.getElementById('restart-button'),
        darkModeButton: document.getElementById('dark-mode-button'),
        saveButton: document.getElementById('save-button'),
        cityNavigation: document.getElementById('city-navigation'),
        prevCityButton: document.getElementById('prev-city-button'),
        nextCityButton: document.getElementById('next-city-button'),
        currentCityDisplay: document.getElementById('current-city-display'),
        // Modal Elements
        modal: document.getElementById('building-modal'),
        modalCloseButton: document.querySelector('.modal .close-button'),
        modalBuildingName: document.getElementById('modal-building-name'),
        modalBuildingType: document.getElementById('modal-building-type'),
        modalBuildingLevel: document.getElementById('modal-building-level'),
        modalBuildingPrice: document.getElementById('modal-building-price'),
        modalBuildingRevenue: document.getElementById('modal-building-revenue'),
        modalRevenueUnit: document.getElementById('modal-revenue-unit'),
        modalBuildingCity: document.getElementById('modal-building-city'),
        modalWorkerInfo: document.getElementById('modal-worker-info'),
        modalLookingWorker: document.getElementById('modal-looking-worker'),
        modalWorkerPay: document.getElementById('modal-worker-pay'),
        modalSecondHr: document.getElementById('modal-second-hr'), // The conditional HR
        modalUpgradeSection: document.getElementById('modal-upgrade-section'),
        modalUpgradeCost: document.getElementById('modal-upgrade-cost'),
        modalUpgradeBenefit: document.getElementById('modal-upgrade-benefit'),
        modalUpgradeBenefitUnit: document.getElementById('modal-upgrade-benefit-unit'),
        modalUpgradeButton: document.getElementById('modal-upgrade-button'),
        modalBuyButton: document.getElementById('modal-buy-button'),
        modalWorkButton: document.getElementById('modal-work-button'),
        modalInflationMessage: document.getElementById('inflation-message')
    };

    // --- Game State Variables ---
    const gameState = {
        playerMoney: CONFIG.STARTING_MONEY,
        totalIncomeRate: 0,
        currentlyWorkingBuildingId: null,
        currentCity: 1,
        unlockedCities: [1],
        workClickMultiplier: 1,
        percentageIncomeBoost: 0,
        buildings: [], // Holds data for ALL buildings across ALL cities
        gameUpgrades: [], // Holds data for ALL upgrades
        currentModalBuildingId: null, // ID of building currently shown in modal
        inflationMessageTimeoutId: null, // Timeout for hiding inflation message
        saveStatusTimeoutId: null,
        gameLoopIntervalId: null,
        autoSaveIntervalId: null
    };

    // --- Utility Functions ---

    /**
     * Finds a building object by its unique ID.
     * @param {string} id - The ID of the building to find.
     * @returns {object | undefined} The building object or undefined if not found.
     */
    function findBuildingById(id) {
        return gameState.buildings.find(b => b.id === id);
    }

    /**
     * Finds an upgrade object by its unique ID.
     * @param {string} id - The ID of the upgrade to find.
     * @returns {object | undefined} The upgrade object or undefined if not found.
     */
    function findUpgradeById(id) {
        return gameState.gameUpgrades.find(u => u.id === id);
    }

    /**
     * Formats a number into a compact money representation (e.g., 1.23M, 5.67B).
     * @param {number} amount - The number to format.
     * @returns {string} The formatted string.
     */
    function formatMoney(amount) {
        if (amount === null || amount === undefined) return 'N/A';
        if (amount < 1 && amount > 0) return amount.toFixed(2);
        if (amount >= 1e12) return (amount / 1e12).toFixed(2) + 'T';
        if (amount >= 1e9) return (amount / 1e9).toFixed(2) + 'B';
        if (amount >= 1e6) return (amount / 1e6).toFixed(2) + 'M';
        return Math.floor(amount).toLocaleString();
    }

    /**
     * Formats a decimal number into a percentage string (e.g., 0.1 -> 10.0%).
     * @param {number} amount - The decimal number (e.g., 0.1 for 10%).
     * @returns {string} The formatted percentage string.
     */
    function formatPercent(amount) {
        if (amount === null || amount === undefined) return 'N/A';
        return (amount * 100).toFixed(1);
    }

    // --- Building Generation ---
    /**
     * Generates building data for all cities based on CONFIG settings.
     * @returns {Array<object>} An array of building data objects.
     */
    function generateBuildings() {
        const allBuildingData = [];
        let buildingIndex = 0;
        const numBuildingsPerCity = CONFIG.GRID_WIDTH * CONFIG.GRID_HEIGHT;
        const genConfig = CONFIG.BUILDING_GENERATION;
        const buildDefs = CONFIG.BUILDING_DEFS;

        // Pre-calculate cumulative probabilities for type selection
        const cumulativeProbabilities = [
            genConfig.residentialPossibility,
            genConfig.residentialPossibility + genConfig.commercialPossibility,
            genConfig.residentialPossibility + genConfig.commercialPossibility + genConfig.industrialPossibility,
            1.0 // Logistics fills the rest
        ];

        // Pre-defined name fragments (optional enhancement)
        const namePrefixes = {
            residential: ['Apt', 'Duplex', 'Condo', 'House'],
            commercial: ['Shop', 'Office', 'Cafe', 'Store'],
            industrial: ['Factory', 'Plant', 'Mill', 'Works'],
            logistics: ['Depot', 'Hub', 'Storage', 'Center']
        };

        for (let cityId = 1; cityId <= CONFIG.MAX_CITIES; cityId++) {
            let cityHasWorkableCommercial = false;
            for (let i = 0; i < numBuildingsPerCity; i++) {
                buildingIndex++;

                // Weighted random selection of building type
                const rand = Math.random();
                let typeChoice;
                if (rand < cumulativeProbabilities[0]) typeChoice = buildDefs[0];
                else if (rand < cumulativeProbabilities[1]) typeChoice = buildDefs[1];
                else if (rand < cumulativeProbabilities[2]) typeChoice = buildDefs[2];
                else typeChoice = buildDefs[3];

                const uniqueId = `c${cityId}-${typeChoice.type.substring(0, 3)}${buildingIndex}`;
                // Generate name using prefixes
                const prefixes = namePrefixes[typeChoice.type] || [typeChoice.type.charAt(0).toUpperCase() + typeChoice.type.slice(1)];
                let name = prefixes[Math.floor(Math.random() * prefixes.length)] + ` #${buildingIndex} (C${cityId})`;

                // Calculate city-based multiplier
                const cityMultiplier = 1 + (cityId - 1) * genConfig.cityBaseMultiplierIncrement;

                // Calculate price and revenue with city scaling
                const price = Math.floor((typeChoice.basePrice + Math.random() * typeChoice.priceRange) * cityMultiplier);
                let baseRevenue = (typeChoice.baseRevenue + Math.random() * typeChoice.revenueRange);
                if (typeChoice.type !== 'logistics') baseRevenue = Math.floor(baseRevenue * cityMultiplier);
                else baseRevenue *= cityMultiplier; // Apply multiplier to logistics base %

                // Determine worker status for commercial buildings
                let isLooking = false;
                let workerPay = 0;
                if (typeChoice.type === 'commercial' && typeChoice.isWorkable) {
                    workerPay = Math.floor((200 + Math.random() * 200) * cityMultiplier); // Base pay even if not looking
                    if (Math.random() < genConfig.canWorkPossibility) {
                        isLooking = true;
                        // Use a slightly lower pay range if actively looking? (optional tweak)
                        workerPay = Math.floor((150 + Math.random() * 150) * cityMultiplier);
                        cityHasWorkableCommercial = true;
                    }
                }

                allBuildingData.push({
                    id: uniqueId,
                    cityId: cityId,
                    name: name,
                    type: typeChoice.type,
                    color: typeChoice.color,
                    price: price,
                    baseRevenue: baseRevenue,
                    // initialBaseRevenue: baseRevenue, // Keep if needed for resets, otherwise save space
                    isOwned: false,
                    level: 1,
                    upgradeBaseCost: Math.floor((typeChoice.baseUpgradeCost + Math.random() * typeChoice.baseUpgradeCost * 0.5) * cityMultiplier),
                    upgradeCostMultiplier: typeChoice.upgradeCostMult + (Math.random() - 0.5) * 0.04, // Add slight variance
                    upgradeRevenueIncrease: (typeChoice.type !== 'logistics' ? Math.max(1, Math.floor(typeChoice.upgradeRevInc * cityMultiplier)) : typeChoice.upgradeRevInc * cityMultiplier),
                    workBoostMultiplier: typeChoice.workBoost,
                    isWorkable: typeChoice.isWorkable,
                    isLookingForWorker: isLooking,
                    workerPay: Math.max(1, workerPay), // Ensure minimum pay of 1
                });
            }

            // Guarantee at least one workable place in City 1 if configured
            if (genConfig.guaranteeWorkableInCity1 && cityId === 1 && !cityHasWorkableCommercial) {
                const commercialBuildingsInCity1 = allBuildingData.filter(b => b.cityId === 1 && b.type === 'commercial' && b.isWorkable);
                if (commercialBuildingsInCity1.length > 0) {
                    const chosenBuilding = commercialBuildingsInCity1[Math.floor(Math.random() * commercialBuildingsInCity1.length)];
                    chosenBuilding.isLookingForWorker = true;
                    // Ensure it has some pay if it was generated with 0
                    if (chosenBuilding.workerPay <= 0) {
                        chosenBuilding.workerPay = Math.max(1, Math.floor((150 + Math.random() * 150))); // Use base city 1 multiplier implicitly
                    }
                    Logger.info(`Ensured at least one workable commercial building in City 1: ${chosenBuilding.name}`);
                } else {
                    Logger.warn(`Could not guarantee a workable commercial building in City 1 - none were generated!`);
                }
            }
        }
        Logger.info(`Generated ${allBuildingData.length} total buildings across ${CONFIG.MAX_CITIES} cities.`);
        return allBuildingData;
    }


    // --- Display Functions ---

    /** Creates a DOM element for a single building. */
    function createBuildingElement(building) {
        const div = document.createElement('div');
        div.id = building.id;
        div.classList.add('building', building.color);
        div.title = `Price: $${formatMoney(building.price)}\nType: ${building.type}\nCity: ${building.cityId}`;

        const levelSpan = document.createElement('span');
        levelSpan.classList.add('building-level');
        levelSpan.textContent = `Lvl ${building.level}`;
        div.appendChild(levelSpan);

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('building-name');
        nameSpan.textContent = building.name.replace(` (C${building.cityId})`, ''); // Clean name for display
        div.appendChild(nameSpan);

        div.addEventListener('click', () => openBuildingMenu(building.id));
        return div;
    }

    /** Creates a DOM element for a single upgrade. */
    function createUpgradeElement(upgrade, index) {
        const div = document.createElement('div');
        div.id = `upgrade-${upgrade.id}`;
        div.classList.add('upgrade-item');

        // Add spacing class for layout (every 3rd item)
        if ((index + 1) % 3 === 0 && index !== gameState.gameUpgrades.length - 1) {
            div.classList.add('upgrade-spacing');
        }

        div.title = `${upgrade.name}\nCost: $${formatMoney(upgrade.cost)}\n${upgrade.description}`;

        const img = document.createElement('img');
        img.src = upgrade.image || 'images/default_icon.png'; // Fallback image
        img.alt = upgrade.name;
        img.onerror = () => { img.src = 'images/default_icon.png'; }; // Handle image loading errors
        div.appendChild(img);

        // Text span (will be hidden by CSS if .bought is added)
        const textSpan = document.createElement('span');
        textSpan.classList.add('upgrade-text');
        textSpan.textContent = upgrade.name;
        div.appendChild(textSpan);

        // Add click listener only if the upgrade isn't already bought.
        // The 'bought' class managed by CSS will handle disabling interaction visually.
        if (!upgrade.isBought) {
            div.addEventListener('click', () => buyUpgrade(upgrade.id));
        }
        return div;
    }

    /** Displays buildings for the currently selected city in the game area. */
    function displayCityBuildings() {
        DOM.gameArea.innerHTML = ''; // Clear existing buildings
        const buildingsInCurrentCity = gameState.buildings.filter(b => b.cityId === gameState.currentCity);

        if (buildingsInCurrentCity.length === 0) {
            DOM.gameArea.innerHTML = '<p style="text-align: center; width: 100%;">No buildings generated for this city.</p>';
            return;
        }

        buildingsInCurrentCity.forEach(building => {
            const buildingEl = createBuildingElement(building);
            DOM.gameArea.appendChild(buildingEl);
        });
        updateBuildingVisuals(); // Apply owned/working status
    }

    /** Displays all available upgrades in the upgrades container. */
    function displayUpgrades() {
        DOM.upgradesContainer.innerHTML = ''; // Clear existing
        gameState.gameUpgrades.forEach((upgrade, index) => {
            const upgradeEl = createUpgradeElement(upgrade, index);
            DOM.upgradesContainer.appendChild(upgradeEl);
        });
        updateUpgradeVisuals(); // Apply bought/affordability status
    }

    /** Updates visual indicators (Owned, Working) on buildings currently displayed. */
    function updateBuildingVisuals() {
        const buildingsInCurrentCity = gameState.buildings.filter(b => b.cityId === gameState.currentCity);
        buildingsInCurrentCity.forEach(building => {
            const buildingEl = document.getElementById(building.id); // Get element fresh each time
            if (!buildingEl) return;

            // Reset indicators
            buildingEl.classList.remove('working-indicator');
            buildingEl.querySelector('.owned-indicator')?.remove(); // Remove existing owned indicator if present

            // Update level display
            const levelIndicator = buildingEl.querySelector('.building-level');
            if (levelIndicator) levelIndicator.textContent = `Lvl ${building.level}`;

            // Add 'Owned' indicator if applicable
            if (building.isOwned) {
                const indicator = document.createElement('span');
                indicator.classList.add('owned-indicator');
                indicator.textContent = 'Owned';
                buildingEl.appendChild(indicator);
                if (levelIndicator) levelIndicator.style.zIndex = '0'; // Ensure level is behind indicator
            }

            // Add 'Working' indicator if applicable
            if (building.id === gameState.currentlyWorkingBuildingId) {
                buildingEl.classList.add('working-indicator');
            }
        });
    }

    /** Updates visual state (Bought, Affordability) of upgrade items. */
    function updateUpgradeVisuals() {
        gameState.gameUpgrades.forEach(upgrade => {
            const upgradeEl = document.getElementById(`upgrade-${upgrade.id}`);
            if (!upgradeEl) return;

            // Toggle 'bought' class based on state
            upgradeEl.classList.toggle('bought', upgrade.isBought);

            // Set opacity: Dim if bought, slightly dim if unaffordable, full if affordable
            if (upgrade.isBought) {
                // Opacity is handled by the .bought CSS rule, including dark mode differences
                upgradeEl.style.opacity = ''; // Let CSS handle it
            } else {
                upgradeEl.style.opacity = gameState.playerMoney < upgrade.cost ? '0.7' : '1';
            }
        });
    }

    /** Updates the main UI elements (money, income rate, current work). */
    function updateUI(fullUpdate = true) {
        DOM.money.textContent = formatMoney(gameState.playerMoney);
        if (fullUpdate) {
            DOM.incomeRate.textContent = formatMoney(gameState.totalIncomeRate);

            // Update "Currently Working" text
            if (gameState.currentlyWorkingBuildingId) {
                const workingBuilding = findBuildingById(gameState.currentlyWorkingBuildingId);
                DOM.currentWork.textContent = workingBuilding ? `Working: ${workingBuilding.name.replace(` (C${workingBuilding.cityId})`, '')}` : 'Working: None';
            } else {
                DOM.currentWork.textContent = `Working: None`;
            }

            // Update visuals that depend on full state
            updateBuildingVisuals();
            updateUpgradeVisuals();
            updateCityNavigation();
        }
    }

    /** Updates the visibility and state of city navigation buttons. */
    function updateCityNavigation() {
        if (gameState.unlockedCities.length > 1) {
            DOM.cityNavigation.style.display = 'block';
            DOM.currentCityDisplay.textContent = `City ${gameState.currentCity}`;

            const sortedUnlocked = [...gameState.unlockedCities].sort((a, b) => a - b);
            const currentIndex = sortedUnlocked.indexOf(gameState.currentCity);

            DOM.prevCityButton.disabled = currentIndex <= 0;
            DOM.nextCityButton.disabled = currentIndex >= sortedUnlocked.length - 1;
        } else {
            DOM.cityNavigation.style.display = 'none';
        }
    }

    /** Shows a temporary message in the save status area. */
    function showSaveStatus(message) {
        DOM.saveStatus.textContent = message;
        DOM.saveStatus.classList.add('visible');
        if (gameState.saveStatusTimeoutId) clearTimeout(gameState.saveStatusTimeoutId);
        gameState.saveStatusTimeoutId = setTimeout(() => {
            DOM.saveStatus.classList.remove('visible');
        }, 3000); // Message visible for 3 seconds
    }

    /** Shows a temporary inflation message in the modal. */
    function showInflationMessage(cityId) {
        if (!DOM.modal || DOM.modal.style.display !== 'block') return;

        // Use textContent for safety, but add HR via innerHTML if needed
        DOM.modalInflationMessage.innerHTML = `<hr>Inflation Alert! Building prices in <strong>City ${cityId}</strong> have increased due to your recent purchase.`; // Added HR and bold
        DOM.modalInflationMessage.style.display = 'block';

        if (gameState.inflationMessageTimeoutId) clearTimeout(gameState.inflationMessageTimeoutId);
        gameState.inflationMessageTimeoutId = setTimeout(() => {
            DOM.modalInflationMessage.style.display = 'none';
            DOM.modalInflationMessage.innerHTML = ''; // Clear content
        }, CONFIG.INFLATION_MSG_DURATION_MS);
    }


    // --- Modal Management ---

    /** Opens and populates the building detail modal. */
    function openBuildingMenu(buildingId) {
        const building = findBuildingById(buildingId);
        if (!building) {
            Logger.error(`Building with ID ${buildingId} not found.`);
            return;
        }
        if (building.cityId !== gameState.currentCity) {
            Logger.warn(`Attempted to open modal for building ${buildingId} from city ${building.cityId} while viewing city ${gameState.currentCity}. Action prevented.`);
            return;
        }

        gameState.currentModalBuildingId = buildingId;

        // --- Clear previous dynamic content / state ---
        if (gameState.inflationMessageTimeoutId) clearTimeout(gameState.inflationMessageTimeoutId);
        DOM.modalInflationMessage.style.display = 'none';
        DOM.modalInflationMessage.innerHTML = '';

        // --- Populate Static Info ---
        DOM.modalBuildingName.textContent = building.name;
        DOM.modalBuildingType.textContent = building.type.charAt(0).toUpperCase() + building.type.slice(1);
        DOM.modalBuildingLevel.textContent = building.level;
        DOM.modalBuildingPrice.textContent = formatMoney(building.price);
        DOM.modalBuildingCity.textContent = building.cityId;

        // --- Populate Revenue/Boost Info ---
        let currentRevenue = building.baseRevenue;
        let upgradeBenefitValue = building.upgradeRevenueIncrease;
        let isPercentage = building.type === 'logistics';

        // Apply work boost directly to display value if working at this *owned* building
        if (gameState.currentlyWorkingBuildingId === building.id && building.isOwned) {
            if (isPercentage) {
                currentRevenue += building.workBoostMultiplier; // Additive boost
            } else {
                currentRevenue *= building.workBoostMultiplier; // Multiplicative boost
            }
        }

        DOM.modalBuildingRevenue.textContent = isPercentage ? formatPercent(currentRevenue) : formatMoney(currentRevenue);
        DOM.modalRevenueUnit.textContent = isPercentage ? '% Boost' : '/sec';
        DOM.modalUpgradeBenefit.textContent = isPercentage ? formatPercent(upgradeBenefitValue) : formatMoney(upgradeBenefitValue);
        DOM.modalUpgradeBenefitUnit.textContent = isPercentage ? '% Boost' : '/sec';

        // --- Set Visibility and Content of Conditional Sections ---

        // Worker Info Section (Visible only for non-owned, workable buildings)
        const showWorkerInfo = !building.isOwned && building.isWorkable;
        DOM.modalWorkerInfo.style.display = showWorkerInfo ? 'block' : 'none';
        if (showWorkerInfo) {
            DOM.modalLookingWorker.textContent = building.isLookingForWorker ? 'Yes' : 'No';
            const effectivePay = building.workerPay * gameState.workClickMultiplier;
            DOM.modalWorkerPay.textContent = `${formatMoney(effectivePay)} ($${formatMoney(building.workerPay)} base)`;
        }

        // Second HR (Visible only if Worker Info is visible)
        DOM.modalSecondHr.style.display = showWorkerInfo ? 'block' : 'none';

        // Upgrade Section (Visible only for owned buildings)
        const showUpgradeSection = building.isOwned;
        DOM.modalUpgradeSection.style.display = showUpgradeSection ? 'block' : 'none';
        if (showUpgradeSection) {
            const nextUpgradeCost = calculateUpgradeCost(building);
            DOM.modalUpgradeCost.textContent = formatMoney(nextUpgradeCost);
            DOM.modalUpgradeButton.disabled = gameState.playerMoney < nextUpgradeCost;
        }


        // --- Configure Action Buttons ---
        DOM.modalBuyButton.style.display = building.isOwned ? 'none' : 'inline-block';
        DOM.modalBuyButton.disabled = building.isOwned || gameState.playerMoney < building.price;

        // Work Button Logic
        DOM.modalWorkButton.classList.remove('stop-working');
        DOM.modalWorkButton.disabled = false;
        DOM.modalWorkButton.style.display = 'none'; // Hide initially

        if (building.isOwned) {
            // Always show work button for owned buildings (start/stop boost)
            DOM.modalWorkButton.style.display = 'inline-block';
            if (gameState.currentlyWorkingBuildingId === building.id) {
                DOM.modalWorkButton.textContent = "Stop Working";
                DOM.modalWorkButton.classList.add('stop-working');
            } else {
                // Show boost details
                let workText = "Work (Boost)";
                if (building.type === 'logistics') {
                    workText = `Work (+${formatPercent(building.workBoostMultiplier)}% Boost)`;
                } else {
                    workText = `Work (x${building.workBoostMultiplier.toFixed(1)} Income)`;
                }
                DOM.modalWorkButton.textContent = workText;
            }
        } else if (building.isWorkable) {
            // Show work button for non-owned workable buildings
            DOM.modalWorkButton.style.display = 'inline-block';
            if (building.isLookingForWorker) {
                const effectivePay = building.workerPay * gameState.workClickMultiplier;
                DOM.modalWorkButton.textContent = `Work ($${formatMoney(effectivePay)}/click)`;
                DOM.modalWorkButton.disabled = false;
            } else {
                DOM.modalWorkButton.textContent = "Not Hiring";
                DOM.modalWorkButton.disabled = true;
            }
        } // Else (not owned, not workable) - button remains hidden


        // --- Show Modal ---
        DOM.modal.style.display = 'block';
    }

    /** Closes the building detail modal. */
    function closeModal() {
        if (DOM.modal.style.display !== 'none') {
            DOM.modal.style.display = 'none';
            gameState.currentModalBuildingId = null; // Clear context

            // Clear any active inflation message timeout
            if (gameState.inflationMessageTimeoutId) clearTimeout(gameState.inflationMessageTimeoutId);
            DOM.modalInflationMessage.style.display = 'none';
            DOM.modalInflationMessage.innerHTML = '';
        }
    }

    // --- Core Game Logic ---

    /** Calculates the cost of the next upgrade for a building. */
    function calculateUpgradeCost(building) {
        if (!building || !building.isOwned) return Infinity;
        const effectiveLevel = Math.max(1, building.level); // Level 1 cost uses base
        return Math.floor(building.upgradeBaseCost * Math.pow(building.upgradeCostMultiplier, effectiveLevel - 1));
    }

    /** Calculates the total income per second from all sources. */
    function calculateTotalIncomeRate() {
        let rate = 0;
        let totalLogisticsBoost = 0; // Additive boost percentage from all logistics

        // Pass 1: Calculate total boost from owned Logistics buildings in unlocked cities
        gameState.buildings.forEach(building => {
            if (building.isOwned && gameState.unlockedCities.includes(building.cityId) && building.type === 'logistics') {
                let currentBoost = building.baseRevenue; // Base percentage
                if (gameState.currentlyWorkingBuildingId === building.id) {
                    currentBoost += building.workBoostMultiplier; // Add work boost
                }
                totalLogisticsBoost += currentBoost;
            }
        });

        // Pass 2: Calculate income from owned non-Logistics buildings, applying boosts
        gameState.buildings.forEach(building => {
            if (building.isOwned && gameState.unlockedCities.includes(building.cityId) && building.type !== 'logistics') {
                let buildingIncome = building.baseRevenue; // Base income/sec
                // Apply work boost if working here
                if (gameState.currentlyWorkingBuildingId === building.id) {
                    buildingIncome *= building.workBoostMultiplier;
                }
                // Apply total logistics boost multiplicatively
                buildingIncome *= (1 + totalLogisticsBoost);
                rate += buildingIncome;
            }
        });

        // Apply global percentage boost from upgrades
        rate *= (1 + gameState.percentageIncomeBoost);

        gameState.totalIncomeRate = rate; // Update game state
    }

    /** Increases prices of all buildings in a specific city due to inflation. */
    function increaseBuildingPricesInCity(cityId) {
        Logger.info(`Applying building price inflation in City ${cityId} (Rate: x${CONFIG.INFLATION_RATE})...`);
        let buildingsAffected = 0;

        gameState.buildings.forEach(building => {
            if (building.cityId === cityId) {
                const oldPrice = building.price;
                const oldUpgradeCost = building.upgradeBaseCost;

                // Increase price (min 1)
                building.price = Math.max(1, Math.floor(oldPrice * CONFIG.INFLATION_RATE));
                // Increase base upgrade cost (min 1)
                building.upgradeBaseCost = Math.max(1, Math.floor(oldUpgradeCost * CONFIG.INFLATION_RATE));

                if (building.price !== oldPrice || building.upgradeBaseCost !== oldUpgradeCost) {
                    buildingsAffected++;
                }
            }
        });

        Logger.info(`Inflation applied in City ${cityId}. ${buildingsAffected} building prices/upgrade costs potentially updated.`);

        // Refresh grid display if the inflated city is the current one
        if (gameState.currentCity === cityId) {
            displayCityBuildings(); // Update tooltips with new prices
        }
        // Note: Modal refresh happens *after* this in the buyBuilding flow
    }


    // --- Player Actions ---

    /** Buys the building currently displayed in the modal. */
    function buyBuilding() {
        const buildingId = gameState.currentModalBuildingId;
        if (!buildingId) return;
        const building = findBuildingById(buildingId);

        // Validation
        if (!building) { Logger.error("Buy action failed: Building not found."); return; }
        if (building.isOwned) { Logger.warn("Buy action failed: Building already owned."); return; }
        if (gameState.playerMoney < building.price) { Logger.warn("Buy action failed: Not enough money."); return; }

        const cityOfPurchase = building.cityId;
        const purchasePrice = building.price;
        const buildingName = building.name;

        // Update State
        gameState.playerMoney -= purchasePrice;
        building.isOwned = true;
        Logger.action(`Bought '${buildingName}' in City ${cityOfPurchase} for $${formatMoney(purchasePrice)}. Inflation applied.`);

        // Apply Inflation
        increaseBuildingPricesInCity(cityOfPurchase);

        // Update Game State & UI
        calculateTotalIncomeRate();
        updateUI(true); // Full update for grid + stats

        // Refresh Modal (shows owned state, new upgrade cost, clears old messages)
        openBuildingMenu(buildingId);

        // Show Inflation Message (on the refreshed modal)
        showInflationMessage(cityOfPurchase);
    }

    /** Handles the "Work Here" / "Stop Working" button click. */
    function workAtBuilding() {
        const buildingId = gameState.currentModalBuildingId;
        if (!buildingId) return;
        const building = findBuildingById(buildingId);

        if (!building) { Logger.error("Work action failed: Building not found."); return; }

        const wasWorkingId = gameState.currentlyWorkingBuildingId;
        const buildingName = building.name;
        const cityId = building.cityId;

        if (building.isOwned) {
            // Toggle working at OWNED building (for boost)
            if (wasWorkingId === building.id) {
                // Stop working here
                gameState.currentlyWorkingBuildingId = null;
                Logger.action(`Stopped working at own building '${buildingName}' in City ${cityId}.`);
            } else {
                // Start working here (stop working elsewhere if needed)
                if (wasWorkingId) {
                    const prevBuilding = findBuildingById(wasWorkingId);
                    Logger.action(`Stopped working at '${prevBuilding?.name || 'unknown'}' to start at '${buildingName}'.`);
                } else {
                    Logger.action(`Started working at own building '${buildingName}' in City ${cityId}.`);
                }
                gameState.currentlyWorkingBuildingId = building.id;
            }

            // Recalculate income and update UI if work state changed
            if (wasWorkingId !== gameState.currentlyWorkingBuildingId) {
                calculateTotalIncomeRate();
                updateUI(true);
            }
            openBuildingMenu(buildingId); // Refresh modal button state/text

        } else {
            // Work at NON-OWNED building (click for pay)
            if (building.isWorkable && building.isLookingForWorker) {
                const earnings = building.workerPay * gameState.workClickMultiplier;
                gameState.playerMoney += earnings;
                Logger.action(`Worked at non-owned '${buildingName}' in City ${cityId}, earned $${formatMoney(earnings)}.`);
                updateUI(false); // Quick money update

                // Brief cooldown on the work button
                DOM.modalWorkButton.disabled = true;
                setTimeout(() => {
                    // Re-enable only if modal is still open for the same building AND it's still looking
                    if (DOM.modal.style.display === 'block' && gameState.currentModalBuildingId === buildingId) {
                        const currentBuildingState = findBuildingById(buildingId); // Get fresh state
                        DOM.modalWorkButton.disabled = !(currentBuildingState?.isLookingForWorker); // Disable if not looking
                        if (!currentBuildingState?.isLookingForWorker && DOM.modalWorkButton.textContent.startsWith("Work")) {
                            DOM.modalWorkButton.textContent = "Not Hiring"; // Update text if changed
                        }
                    }
                }, CONFIG.WORK_COOLDOWN_MS);
            } else {
                Logger.warn(`Attempted to work at non-owned '${buildingName}', but cannot (Not workable or not hiring).`);
            }
        }
    }

    /** Upgrades the building currently displayed in the modal. */
    function upgradeBuilding() {
        const buildingId = gameState.currentModalBuildingId;
        if (!buildingId) return;
        const building = findBuildingById(buildingId);

        // Validation
        if (!building) { Logger.error("Upgrade action failed: Building not found."); return; }
        if (!building.isOwned) { Logger.warn("Upgrade action failed: Building not owned."); return; }

        const cost = calculateUpgradeCost(building);
        const buildingName = building.name;
        const cityId = building.cityId;

        if (gameState.playerMoney >= cost) {
            // Update State
            gameState.playerMoney -= cost;
            const oldLevel = building.level;
            building.level++;
            // Apply revenue increase based on type
            building.baseRevenue += building.upgradeRevenueIncrease; // Works for both flat and percentage increases

            Logger.action(`Upgraded '${buildingName}' in City ${cityId} from Lvl ${oldLevel} to Lvl ${building.level} for $${formatMoney(cost)}.`);

            // Update Game State & UI
            calculateTotalIncomeRate();
            updateUI(true);
            openBuildingMenu(buildingId); // Refresh modal

        } else {
            Logger.warn(`Attempted to upgrade '${buildingName}', but not enough money (Need $${formatMoney(cost)}).`);
        }
    }

    /** Buys the specified upgrade. */
    function buyUpgrade(upgradeId) {
        const upgrade = findUpgradeById(upgradeId);

        // Validation
        if (!upgrade) { Logger.error(`Upgrade action failed: Upgrade ID '${upgradeId}' not found.`); return; }
        if (upgrade.isBought) { Logger.warn(`Upgrade action failed: '${upgrade.name}' already bought.`); return; }
        if (gameState.playerMoney < upgrade.cost) { Logger.warn(`Upgrade action failed: Not enough money for '${upgrade.name}'.`); return; }

        const upgradeCost = upgrade.cost;
        const upgradeName = upgrade.name;

        // Update State
        gameState.playerMoney -= upgradeCost;
        upgrade.isBought = true;
        Logger.action(`Bought upgrade: '${upgradeName}' for $${formatMoney(upgradeCost)}.`);

        // Apply upgrade effect
        let incomeRateChanged = false;
        switch (upgrade.type) {
            case 'multiplier':
                const oldMultiplier = gameState.workClickMultiplier;
                gameState.workClickMultiplier *= upgrade.value;
                Logger.info(`  Effect: Work click multiplier x${oldMultiplier.toFixed(2)} -> x${gameState.workClickMultiplier.toFixed(2)}.`);
                break;
            case 'percentage':
                const oldBoost = gameState.percentageIncomeBoost;
                gameState.percentageIncomeBoost += upgrade.value;
                Logger.info(`  Effect: Global income boost +${formatPercent(oldBoost)}% -> +${formatPercent(gameState.percentageIncomeBoost)}%.`);
                incomeRateChanged = true;
                break;
            case 'city':
                if (!gameState.unlockedCities.includes(upgrade.value)) {
                    gameState.unlockedCities.push(upgrade.value);
                    gameState.unlockedCities.sort((a, b) => a - b); // Keep sorted
                    Logger.info(`  Effect: Unlocked City ${upgrade.value}. Unlocked: [${gameState.unlockedCities.join(', ')}]`);
                    // Income might change if loaded save had buildings there, recalculate just in case
                    incomeRateChanged = true;
                    updateCityNavigation(); // Update nav immediately
                } else {
                    Logger.info(`  Effect: City ${upgrade.value} was already unlocked.`);
                }
                break;
            default:
                Logger.warn(`  Effect: Unknown upgrade type '${upgrade.type}' for upgrade '${upgradeName}'.`);
        }

        // Update Game State & UI
        if (incomeRateChanged) {
            calculateTotalIncomeRate();
        }
        updateUI(true); // Reflects cost deduction, income change, and upgrade visual state
    }

    /** Navigates to the previous or next unlocked city. */
    function navigateCity(direction) { // -1 for prev, 1 for next
        const sortedUnlocked = [...gameState.unlockedCities].sort((a, b) => a - b);
        const currentIndex = sortedUnlocked.indexOf(gameState.currentCity);
        const nextIndex = currentIndex + direction;

        // Check if the next index is valid within the sorted list
        if (nextIndex >= 0 && nextIndex < sortedUnlocked.length) {
            const previousCity = gameState.currentCity;
            gameState.currentCity = sortedUnlocked[nextIndex];
            Logger.action(`Navigated from City ${previousCity} to City ${gameState.currentCity}.`);

            closeModal(); // Close modal when switching cities
            displayCityBuildings(); // Display buildings for the new city
            updateCityNavigation(); // Update button states/display
        } else {
            Logger.info(`Attempted navigation from City ${gameState.currentCity}, but reached boundary.`);
        }
    }

    /** Toggles dark mode on/off. */
    function toggleDarkMode() {
        DOM.body.classList.toggle('dark-mode');
        const isEnabled = DOM.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isEnabled ? 'enabled' : 'disabled');
        Logger.action(`Toggled Dark Mode ${isEnabled ? 'ON' : 'OFF'}.`);
        updateUpgradeVisuals(); // Refresh visuals affected by theme
    }

    // --- Game Loop ---
    /** Executes one tick of the game loop (earning passive income, updating UI). */
    function gameTick() {
        const incomeThisTick = gameState.totalIncomeRate * (CONFIG.GAME_TICK_INTERVAL_MS / 1000);
        gameState.playerMoney += incomeThisTick;
        updateUI(false); // Only update money display frequently

        // Update button disabled states in modal if open
        if (DOM.modal.style.display === 'block' && gameState.currentModalBuildingId) {
            const building = findBuildingById(gameState.currentModalBuildingId);
            if (building) {
                // Update upgrade button affordability
                if (building.isOwned) {
                    const nextUpgradeCost = calculateUpgradeCost(building);
                    DOM.modalUpgradeButton.disabled = gameState.playerMoney < nextUpgradeCost;
                }
                // Update buy button affordability (though usually hidden if owned)
                else {
                    DOM.modalBuyButton.disabled = gameState.playerMoney < building.price;
                }
                // Could add logic here to disable work button if money gets *very* high? (Optional anti-cheat)
            } else {
                Logger.warn("Game tick found modal open but building context lost. Closing modal.");
                closeModal();
            }
        }

        // Update upgrade affordability visuals periodically
        // Doing it here is more responsive than waiting for a full updateUI
        if (gameState.gameUpgrades.length > 0) {
            updateUpgradeVisuals();
        }
    }


    // --- Saving and Loading ---

    /** Saves the current game state to localStorage. */
    function saveGame(isAutoSave = false) {
        try {
            // Prepare data for saving (exclude volatile/large unnecessary data)
            const buildingsToSave = gameState.buildings.map(b => {
                // Example: Exclude data that can be recalculated or isn't needed
                // const { initialBaseRevenue, someTempValue, ...rest } = b;
                // return rest;
                // For now, let's save everything except the potentially large initialBaseRevenue if it exists
                const { initialBaseRevenue, ...rest } = b;
                return rest;
            });

            const saveData = {
                version: CONFIG.SAVE_VERSION,
                saveTimestamp: Date.now(),
                // Core game state
                playerMoney: gameState.playerMoney,
                currentlyWorkingBuildingId: gameState.currentlyWorkingBuildingId,
                currentCity: gameState.currentCity,
                unlockedCities: gameState.unlockedCities,
                workClickMultiplier: gameState.workClickMultiplier,
                percentageIncomeBoost: gameState.percentageIncomeBoost,
                // Game data
                buildings: buildingsToSave,
                gameUpgrades: gameState.gameUpgrades.map(u => ({ id: u.id, isBought: u.isBought })), // Save only ID and status
            };

            localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(saveData));

            if (!isAutoSave) {
                const message = 'Game Saved!';
                Logger.action(message);
                showSaveStatus(message);
            } else {
                // Optionally show a subtle auto-save indicator, but don't log spam
                // showSaveStatus('Auto-saved.');
            }

        } catch (error) {
            Logger.error(`Error saving game: ${error.message}`);
            console.error("Detailed save error:", error); // Log full error for debugging
            showSaveStatus("Error saving game!");
            if (error.name === 'QuotaExceededError') {
                alert("Error saving game: Local storage is full. Cannot save progress.");
                // Consider disabling auto-save here if needed
            }
        }
    }

    /** Loads game state from localStorage. Returns true if successful, false otherwise. */
    function loadGame() {
        const savedDataString = localStorage.getItem(CONFIG.SAVE_KEY);
        if (!savedDataString) {
            Logger.info("No save data found.");
            return false;
        }

        try {
            const savedData = JSON.parse(savedDataString);

            // --- Version Check ---
            if (!savedData.version || savedData.version < CONFIG.SAVE_VERSION) {
                Logger.warn(`Save data is from an older version (v${savedData.version || 'unknown'}). Current v${CONFIG.SAVE_VERSION}. Clearing old save.`);
                localStorage.removeItem(CONFIG.SAVE_KEY);
                showSaveStatus("Old save version. Starting fresh.");
                return false; // Force new game for incompatible versions
            }

            // --- Restore Core State (with defaults) ---
            gameState.playerMoney = savedData.playerMoney ?? CONFIG.STARTING_MONEY;
            gameState.currentlyWorkingBuildingId = savedData.currentlyWorkingBuildingId ?? null;
            gameState.currentCity = savedData.currentCity ?? 1;
            gameState.unlockedCities = savedData.unlockedCities ?? [1];
            gameState.workClickMultiplier = savedData.workClickMultiplier ?? 1;
            gameState.percentageIncomeBoost = savedData.percentageIncomeBoost ?? 0;

            // --- Restore Buildings ---
            // Basic validation: is it an array?
            if (!Array.isArray(savedData.buildings)) {
                Logger.warn("Loaded save data has invalid or missing 'buildings' array. Regenerating buildings.");
                gameState.buildings = generateBuildings();
            } else {
                gameState.buildings = savedData.buildings;
                // Optional: Add back any data excluded during save if needed (e.g., initialBaseRevenue)
                // gameState.buildings.forEach(b => { /* add back data */ });
            }

            // --- Restore Upgrades (Merge with definitions) ---
            const definedUpgrades = CONFIG.UPGRADE_DEFS();
            if (!Array.isArray(savedData.gameUpgrades)) {
                Logger.warn("Loaded save data has invalid or missing 'gameUpgrades' array. Resetting upgrades.");
                gameState.gameUpgrades = definedUpgrades; // Already has isBought: false
            } else {
                // Merge saved 'isBought' status into the current definitions
                gameState.gameUpgrades = definedUpgrades.map(defUpgrade => {
                    const savedUpgrade = savedData.gameUpgrades.find(su => su.id === defUpgrade.id);
                    return { ...defUpgrade, isBought: savedUpgrade ? savedUpgrade.isBought : false };
                });
                // Optional: Check for count mismatch if definitions change drastically
                if (gameState.gameUpgrades.length !== definedUpgrades.length) {
                    Logger.warn("Mismatch between defined and loaded upgrade count. Some loaded states might be ignored or defaults used.");
                }
            }

            // --- Validate City State ---
            if (!Array.isArray(gameState.unlockedCities) || gameState.unlockedCities.length === 0 || !gameState.unlockedCities.includes(1)) {
                Logger.warn("Loaded city data was invalid. Resetting cities.");
                gameState.currentCity = 1;
                gameState.unlockedCities = [1];
            }
            // Ensure current city is actually unlocked
            if (!gameState.unlockedCities.includes(gameState.currentCity)) {
                Logger.warn(`Loaded current city (${gameState.currentCity}) which is not unlocked. Setting to City 1.`);
                gameState.currentCity = gameState.unlockedCities.includes(1) ? 1 : (gameState.unlockedCities[0] || 1);
            }

            Logger.info(`Game loaded successfully from save data (Timestamp: ${new Date(savedData.saveTimestamp).toLocaleString()}).`);
            showSaveStatus("Game loaded.");
            return true;

        } catch (error) {
            Logger.error(`Error parsing saved game data: ${error.message}. Clearing corrupted save.`);
            console.error("Detailed load error:", error);
            localStorage.removeItem(CONFIG.SAVE_KEY);
            showSaveStatus("Error loading save. Starting new game.");
            return false;
        }
    }

    // --- Game Initialization and Control ---

    /** Resets the game state to its initial values and clears save data. */
    function restartGame() {
        if (!confirm("Are you sure you want to restart? All progress will be lost (including saved data).")) {
            Logger.action("User cancelled game restart.");
            return;
        }
        Logger.action("User confirmed. Restarting game and clearing save data.");

        // Stop game loops
        if (gameState.gameLoopIntervalId) clearInterval(gameState.gameLoopIntervalId);
        if (gameState.autoSaveIntervalId) clearInterval(gameState.autoSaveIntervalId);
        gameState.gameLoopIntervalId = null;
        gameState.autoSaveIntervalId = null;

        closeModal();

        // Reset Core State
        gameState.playerMoney = CONFIG.STARTING_MONEY; // Use config value
        gameState.totalIncomeRate = 0;
        gameState.currentlyWorkingBuildingId = null;
        gameState.currentCity = 1;
        gameState.unlockedCities = [1];
        gameState.workClickMultiplier = 1;
        gameState.percentageIncomeBoost = 0;

        // Reset Game Data
        gameState.gameUpgrades = CONFIG.UPGRADE_DEFS(); // Get fresh definitions
        gameState.buildings = generateBuildings(); // Generate new buildings

        // Clear Save Data
        localStorage.removeItem(CONFIG.SAVE_KEY);
        Logger.info("Cleared saved game data.");

        // Refresh Display
        displayCityBuildings();
        displayUpgrades();
        calculateTotalIncomeRate(); // Recalculate income based on reset state
        updateUI(true);

        showSaveStatus("Game Reset. Save cleared.");

        // Restart game loops
        gameState.gameLoopIntervalId = setInterval(gameTick, CONFIG.GAME_TICK_INTERVAL_MS);
        gameState.autoSaveIntervalId = setInterval(() => saveGame(true), CONFIG.AUTO_SAVE_INTERVAL_MS);
        Logger.info("Game restarted successfully.");
    }

    /** Initializes the game: loads data or starts fresh, sets up UI and loops. */
    function initGame() {
        Logger.info("Initializing Grind Mindset...");

        // Apply dark mode preference from localStorage
        if (localStorage.getItem('darkMode') === 'enabled') {
            DOM.body.classList.add('dark-mode');
        }

        // Load game data or initialize fresh state
        const loadedSuccessfully = loadGame();

        if (!loadedSuccessfully) {
            // If load failed or no save existed, ensure state is default
            gameState.playerMoney = CONFIG.STARTING_MONEY;
            gameState.currentlyWorkingBuildingId = null;
            gameState.currentCity = 1;
            gameState.unlockedCities = [1];
            gameState.workClickMultiplier = 1;
            gameState.percentageIncomeBoost = 0;
            gameState.gameUpgrades = CONFIG.UPGRADE_DEFS();
            gameState.buildings = generateBuildings();
            Logger.info("Initialized new game state.");
        }

        // --- Initial Setup ---
        calculateTotalIncomeRate(); // Calculate initial income
        displayCityBuildings();     // Display buildings for starting city
        displayUpgrades();          // Display upgrades
        updateUI(true);             // Update all UI elements

        // --- Setup Event Listeners ---
        DOM.modalCloseButton.addEventListener('click', closeModal);
        DOM.modalBuyButton.addEventListener('click', buyBuilding);
        DOM.modalWorkButton.addEventListener('click', workAtBuilding);
        DOM.modalUpgradeButton.addEventListener('click', upgradeBuilding);
        DOM.restartButton.addEventListener('click', restartGame);
        DOM.darkModeButton.addEventListener('click', toggleDarkMode);
        DOM.saveButton.addEventListener('click', () => saveGame(false)); // Manual save
        DOM.prevCityButton.addEventListener('click', () => navigateCity(-1));
        DOM.nextCityButton.addEventListener('click', () => navigateCity(1));

        // Click outside modal to close
        window.addEventListener('click', (event) => {
            if (event.target === DOM.modal) {
                closeModal();
            }
        });

        // --- Start Game Loops ---
        if (gameState.gameLoopIntervalId) clearInterval(gameState.gameLoopIntervalId);
        if (gameState.autoSaveIntervalId) clearInterval(gameState.autoSaveIntervalId);

        gameState.gameLoopIntervalId = setInterval(gameTick, CONFIG.GAME_TICK_INTERVAL_MS);
        gameState.autoSaveIntervalId = setInterval(() => saveGame(true), CONFIG.AUTO_SAVE_INTERVAL_MS); // Auto-save

        Logger.info("Grind Mindset initialized and running!");
    }

    // --- Start the game ---
    initGame();

}); // End DOMContentLoaded
