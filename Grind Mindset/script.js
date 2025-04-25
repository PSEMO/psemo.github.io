// --- Logger ---
const Logger = {
    enabled: true, // Toggle logging on/off easily
    log: (message, level = 'INFO') => {
        if (!Logger.enabled) return;
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}][${level}] ${message}`);
    },
    info: (message) => Logger.log(message, 'INFO'),
    warn: (message) => Logger.log(message, 'WARN'),
    error: (message) => Logger.log(message, 'ERROR'),
    action: (message) => Logger.log(message, 'PLAYER ACTION')
};

// --- Configuration ---
const CONFIG = {
    SAVE_KEY: 'grindMindsetSaveData_v7', // <<<< INCREMENT VERSION for special upgrade changes
    AUTO_SAVE_INTERVAL_MS: 10000,
    GAME_TICK_INTERVAL_MS: 1000,
    INITIAL_CITY_COUNT: 5,
    ABSOLUTE_MAX_CITIES: 10,
    MAX_BUILDINGS_PER_CITY: 48,
    BUILD_CITY_COST: 100000000,
    NEW_BUILDING_MIN_COST: 100000,
    NEW_BUILDING_MAX_COST: 1000000,
    NEW_BUILD_ADD_COST_PER_BUILD: 500000,
    INFLATION_RATE: 1.075,
    WORK_COOLDOWN_MS: 350,
    INFLATION_MSG_DURATION_MS: 6000,
    STARTING_MONEY: 0,
    SAVE_VERSION: 7, // <<<< INCREMENT VERSION number
    PRESTIGE_MONEY_REQUIREMENT: 10000000000, // 10 Billion
    PRESTIGE_RECOMMENDED_MONEY: 40000000000, // 40 Billion (for tooltip)
    PRESTIGE_INVESTOR_DIVISOR: 10000000000,
    BUILDING_GENERATION: {
        residentialPossibility: 0.30,
        commercialPossibility: 0.30,
        industrialPossibility: 0.25,
        logisticsPossibility: 0.15,
        canWorkPossibility: 0.7,
        cityBaseMultiplierIncrement: 0.1,
    },
    BUILDING_DEFS: [
        {
            type: 'residential', color: 'green',
            basePrice: 300000, priceRange: 300000 * 1.5, baseRevenue: 300000 / 500, revenueRange: 300000 / 500,
            workBoost: 1.5, isWorkable: false, baseUpgradeCost: 300000 / 2, upgradeCostMult: 1.15, upgradeRevInc: 300000 / 1000
        },
        {
            type: 'commercial', color: 'blue',
            basePrice: 100000, priceRange: 100000 * 1.5, baseRevenue: 100000 / 500, revenueRange: 100000 / 500,
            workBoost: 1.6, isWorkable: true, baseUpgradeCost: 100000 / 2, upgradeCostMult: 1.18, upgradeRevInc: 100000 / 1000
        },
        {
            type: 'industrial', color: 'yellow',
            basePrice: 1000000, priceRange: 1000000 * 1.5, baseRevenue: 1000000 / 500, revenueRange: 1000000 / 500,
            workBoost: 1.8, isWorkable: false, baseUpgradeCost: 1000000 / 2, upgradeCostMult: 1.20, upgradeRevInc: 1000000 / 1000
        },
        {
            type: 'logistics', color: 'purple',
            basePrice: 2000000, priceRange: 2000000 * 1.5, baseRevenue: 0.10, revenueRange: 0.10,
            workBoost: 0.06, isWorkable: false, baseUpgradeCost: 2000000 / 2, upgradeCostMult: 1.22, upgradeRevInc: 0.02 // +2% boost per level
        }
    ],

    // Regular Upgrades
    UPGRADE_DEFS: (state) => [
        // ... (keep existing regular upgrades) ...
        {
            id: 'mult1', name: 'Intern Training', description: 'Doubles money earned from working at non-owned Commercial buildings.',
            cost: 10000, type: 'multiplier', value: 2, image: './images/TrainingIcon.png', isBought: false
        },
        {
            id: 'mult2', name: 'Efficiency Methods', description: 'Doubles money earned from working at non-owned Commercial buildings again.',
            cost: 40000, type: 'multiplier', value: 2, image: './images/EfficiencyIcon.png', isBought: false
        },
        {
            id: 'mult3', name: 'Synergy Secrets', description: 'One more doubling of money earned from working at non-owned Commercial buildings.',
            cost: 160000, type: 'multiplier', value: 2, image: './images/SynergyIcon.png', isBought: false
        },
        {
            id: 'perc1', name: 'Market Analysis', description: 'Increases total passive income per second by 10%.',
            cost: 20000, type: 'percentage', value: 0.10, image: './images/MarketIcon.png', isBought: false
        },
        {
            id: 'perc2', name: 'Tax Loophole', description: 'Increases total passive income per second by another 10%.',
            cost: 80000, type: 'percentage', value: 0.10, image: './images/TaxIcon.png', isBought: false
        },
        {
            id: 'perc3', name: 'Global Outreach', description: 'Increases total passive income per second by a final 10%.',
            cost: 320000, type: 'percentage', value: 0.10, image: './images/GlobalIcon.png', isBought: false
        },
        {
            id: 'city1', name: 'Expand East', description: 'Unlocks City 2, allowing travel and investment there.',
            cost: 100000, type: 'city', value: 2, image: './images/ExpandIcon.png', isBought: false
        },
        {
            id: 'city2', name: 'Advance West', description: 'Unlocks City 3.',
            cost: 400000, type: 'city', value: 3, image: './images/AddIcon.png', isBought: false
        },
        {
            id: 'city3', name: 'Grow North', description: 'Unlocks City 4.',
            cost: 1600000, type: 'city', value: 4, image: './images/GrowIcon.png', isBought: false
        },
        {
            id: 'city4', name: 'Reach South', description: 'Unlocks City 5.',
            cost: 6400000, type: 'city', value: 5, image: './images/ReachIcon.png', isBought: false
        },
        {
            id: 'cityCreator', name: 'City Planning Permit', description: `Allows establishing new cities.`,
            cost: 1000000000, type: 'feature_unlock', value: 'cityBuilding', image: './images/CityIcon.png', isBought: false,
            condition: (currentState) => {
                if (!currentState || !currentState.gameUpgrades) return false;
                const initialCityUnlockUpgradeIds = ['city1', 'city2', 'city3', 'city4'];
                return initialCityUnlockUpgradeIds.every(id => {
                    const upgrade = currentState.gameUpgrades.find(u => u.id === id);
                    return upgrade && upgrade.isBought;
                });
            }
        }
    ],

    // --- NEW: Prestige Upgrades (Now with Levels) ---
    SPECIAL_UPGRADES_DEFS: [
        {
            id: 'commercialIncomeDoubler',
            name: 'Commercial Focus',
            description: 'Multiplies income from owned Commercial buildings.',
            costs: [1, 2, 3], // Cost for level 1, 2, 3
            maxLevel: 3,
            image: './images/CommercialIcon.png',
            type: 'income_multiplier',
            targetType: 'commercial'
        },
        {
            id: 'residentialIncomeDoubler',
            name: 'Residential Boom',
            description: 'Multiplies income from owned Residential buildings.',
            costs: [1, 2, 3],
            maxLevel: 3,
            image: './images/ResidentalIcon.png',
            type: 'income_multiplier',
            targetType: 'residential'
        },
        {
            id: 'industrialIncomeDoubler',
            name: 'Industrial Revolution',
            description: 'Multiplies income from owned Industrial buildings.',
            costs: [1, 2, 3],
            maxLevel: 3,
            image: './images/IndustryIcon.png',
            type: 'income_multiplier',
            targetType: 'industrial'
        },
        { // NEW Logistics Upgrade
            id: 'logisticsBoostDoubler',
            name: 'Logistics Network',
            description: 'Multiplies the percentage boost from owned Logistics buildings.',
            costs: [1, 2, 3],
            maxLevel: 3,
            image: './images/LogisticIcon.png', // Added image path
            type: 'boost_multiplier',
            targetType: 'logistics'
        }
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
        investors: document.getElementById('investors'), // Investor display
        currentWork: document.getElementById('current-work'),
        saveStatus: document.getElementById('save-status'),
        restartButton: document.getElementById('restart-button'),
        darkModeButton: document.getElementById('dark-mode-button'),
        saveButton: document.getElementById('save-button'),
        prestigeButton: document.getElementById('prestige-button'), // Prestige button
        cityNavigation: document.getElementById('city-navigation'),
        prevCityButton: document.getElementById('prev-city-button'),
        nextCityButton: document.getElementById('next-city-button'),
        buildCityButton: document.getElementById('build-city-button'), // Build City '+' button
        currentCityDisplay: document.getElementById('current-city-display'),
        mainContent: document.getElementById('main-content'),
        stats: document.getElementById('stats'),
        controls: document.getElementById('controls'),
        endGameScreen: document.getElementById('end-game-screen'),
        modal: document.getElementById('building-modal'),
        modalCloseButton: document.querySelector('#building-modal .close-button'),
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
        modalSecondHr: document.getElementById('modal-second-hr'),
        modalUpgradeSection: document.getElementById('modal-upgrade-section'),
        modalUpgradeCost: document.getElementById('modal-upgrade-cost'),
        modalUpgradeBenefit: document.getElementById('modal-upgrade-benefit'),
        modalUpgradeBenefitUnit: document.getElementById('modal-upgrade-benefit-unit'),
        modalUpgradeButton: document.getElementById('modal-upgrade-button'),
        modalBuyButton: document.getElementById('modal-buy-button'),
        modalWorkButton: document.getElementById('modal-work-button'),
        modalInflationMessage: document.getElementById('inflation-message'),
        prestigeModal: document.getElementById('prestige-modal'),
        prestigeGainedInvestors: document.getElementById('prestige-gained-investors'),
        prestigeTotalInvestors: document.getElementById('prestige-total-investors'),
        prestigeUpgradesContainer: document.getElementById('prestige-upgrades-container'),
        prestigeContinueButton: document.getElementById('prestige-continue-button')
    };

    // --- Game State Variables ---
    const gameState = {
        playerMoney: CONFIG.STARTING_MONEY,
        totalIncomeRate: 0,
        investors: 0,
        currentlyWorkingBuildingId: null,
        currentCity: 1,
        unlockedCities: [1],
        workClickMultiplier: 1,
        percentageIncomeBoost: 0,
        buildings: [],
        gameUpgrades: [],
        specialUpgrades: {}, // NEW: Holds prestige upgrade levels { id: currentLevel }
        currentModalBuildingId: null,
        inflationMessageTimeoutId: null,
        saveStatusTimeoutId: null,
        gameLoopIntervalId: null,
        autoSaveIntervalId: null,
        isGameEnded: false
    };
    window.gameState = gameState; // For debugging


    // --- Utility Functions ---

    /** Checks if all defined special upgrades have reached their max level. */
    function canAchieveSingularity() {
        if (!gameState.specialUpgrades) return false;
        // Ensure all defined upgrades have an entry and are at max level
        return CONFIG.SPECIAL_UPGRADES_DEFS.every(def =>
            (gameState.specialUpgrades[def.id] ?? 0) === def.maxLevel
        );
    }

    /** Finds a building object by its unique ID. */
    function findBuildingById(id) {
        return gameState.buildings.find(b => b.id === id);
    }

    /** Finds an upgrade object by its unique ID. */
    function findUpgradeById(id) {
        if (!gameState.gameUpgrades || gameState.gameUpgrades.length === 0) {
            const defs = CONFIG.UPGRADE_DEFS(gameState);
            return defs.find(u => u.id === id);
        }
        return gameState.gameUpgrades.find(u => u.id === id);
    }

    /** Finds a special (prestige) upgrade definition by ID */
    function findSpecialUpgradeDefById(id) {
        return CONFIG.SPECIAL_UPGRADES_DEFS.find(su => su.id === id);
    }

    /** Formats a number into a compact money representation (e.g., 1.23M, 5.67B). */
    function formatMoney(amount) {
        if (amount === null || amount === undefined) return 'N/A';
        if (Math.abs(amount) < 0.01 && amount !== 0) return amount.toFixed(2);
        if (amount >= 1e12) return (amount / 1e12).toFixed(2) + 'T';
        if (amount >= 1e9) return (amount / 1e9).toFixed(2) + 'B';
        if (amount >= 1e6) return (amount / 1e6).toFixed(2) + 'M';
        return amount >= 1000 ? Math.floor(amount).toLocaleString() : Math.floor(amount).toString();
    }


    /** Formats a decimal number into a percentage string (e.g., 0.1 -> 10.0%). */
    function formatPercent(amount) {
        if (amount === null || amount === undefined) return 'N/A';
        return (amount * 100).toFixed(1);
    }

    /** Generates a random integer between min (inclusive) and max (inclusive). */
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /** Calculates the multiplier from a special upgrade level (1x, 2x, 4x, 8x) */
    function getSpecialUpgradeMultiplier(level) {
        return Math.pow(2, level); // 2^0=1, 2^1=2, 2^2=4, 2^3=8
    }

    /**
    * Generates a single building object based on type definition and city multiplier.
    * (No changes needed in this function for the requested features)
    */
    function generateSingleBuilding(typeChoice, cityId, uniqueIdSuffix, isOwned = false) {
        const genConfig = CONFIG.BUILDING_GENERATION;
        const cityMultiplier = 1 + (cityId - 1) * genConfig.cityBaseMultiplierIncrement;

        const namePrefixes = {
            residential: ['Apt', 'Duplex', 'Condo', 'House'],
            commercial: ['Shop', 'Office', 'Cafe', 'Store'],
            industrial: ['Factory', 'Plant', 'Mill', 'Works'],
            logistics: ['Depot', 'Hub', 'Storage', 'Center']
        };
        const prefixes = namePrefixes[typeChoice.type] || [typeChoice.type.charAt(0).toUpperCase() + typeChoice.type.slice(1)];
        let name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} (C${cityId})`;
        const uniqueId = `c${cityId}-${typeChoice.type.substring(0, 3)}${uniqueIdSuffix}`;

        let price = Math.floor((typeChoice.basePrice + Math.random() * typeChoice.priceRange) * cityMultiplier);
        let baseRevenue = (typeChoice.baseRevenue + Math.random() * typeChoice.revenueRange);
        if (typeChoice.type !== 'logistics') baseRevenue = Math.floor(baseRevenue * cityMultiplier);
        else baseRevenue *= cityMultiplier; // Keep logistics as percentage

        if (isOwned) { // Adjust price if added via build city button
            price = getRandomInt(CONFIG.NEW_BUILDING_MIN_COST, CONFIG.NEW_BUILDING_MAX_COST);
            // Note: actual cost is calculated later with fees
        }

        let isLooking = false;
        let workerPay = 0;
        if (!isOwned && typeChoice.type === 'commercial' && typeChoice.isWorkable) {
            // Generate base pay first
            workerPay = Math.floor((150 + Math.random() * 150) * cityMultiplier);
            if (Math.random() < genConfig.canWorkPossibility) {
                isLooking = true;
                // Maybe slightly higher pay if looking? Or keep it simple.
                // workerPay = Math.floor((200 + Math.random() * 200) * cityMultiplier);
            }
        }

        return {
            id: uniqueId,
            cityId: cityId,
            name: name,
            type: typeChoice.type,
            color: typeChoice.color,
            price: price,
            baseRevenue: Math.max((typeChoice.type === 'logistics' ? 0.001 : 1), baseRevenue), // Ensure > 0
            isOwned: isOwned,
            level: 1,
            upgradeBaseCost: Math.floor((typeChoice.baseUpgradeCost + Math.random() * typeChoice.baseUpgradeCost * 0.5) * cityMultiplier),
            upgradeCostMultiplier: typeChoice.upgradeCostMult + (Math.random() - 0.5) * 0.04,
            upgradeRevenueIncrease: (typeChoice.type !== 'logistics' ? Math.max(1, Math.floor(typeChoice.upgradeRevInc * cityMultiplier)) : Math.max(0.001, typeChoice.upgradeRevInc * cityMultiplier)),
            workBoostMultiplier: typeChoice.workBoost,
            isWorkable: typeChoice.isWorkable,
            isLookingForWorker: isLooking,
            workerPay: Math.max(1, workerPay), // Ensure > 0
        };
    }


    /**
    * Generates the initial set of buildings.
    * (No changes needed in this function for the requested features)
    */
    function generateInitialBuildings() {
        const allBuildingData = [];
        const genConfig = CONFIG.BUILDING_GENERATION;
        const buildDefs = CONFIG.BUILDING_DEFS;
        const initialCities = CONFIG.INITIAL_CITY_COUNT;
        const buildingsPerCity = CONFIG.MAX_BUILDINGS_PER_CITY;
        const totalBuildingsToGenerate = initialCities * buildingsPerCity;

        Logger.info(`Generating ${totalBuildingsToGenerate} initial buildings (${buildingsPerCity} per city for first ${initialCities} cities)...`);

        const cumulativeProbabilities = [
            genConfig.residentialPossibility,
            genConfig.residentialPossibility + genConfig.commercialPossibility,
            genConfig.residentialPossibility + genConfig.commercialPossibility + genConfig.industrialPossibility,
            1.0 // Logistics
        ];

        for (let i = 0; i < totalBuildingsToGenerate; i++) {
            const cityId = Math.floor(i / buildingsPerCity) + 1;
            const indexInCity = (i % buildingsPerCity) + 1;
            const idSuffix = indexInCity.toString().padStart(3, '0');

            let typeChoice;

            // --- Force First Building (Overall Index 0) ---
            if (i === 0) {
                typeChoice = buildDefs.find(def => def.type === 'commercial' && def.isWorkable);
                if (!typeChoice) {
                    Logger.warn("Could not find workable commercial definition for first building, using fallback.");
                    typeChoice = buildDefs.find(def => def.type === 'commercial') || buildDefs[1];
                }
                const firstBuilding = generateSingleBuilding(typeChoice, 1, `001`, false);
                firstBuilding.isLookingForWorker = true; // Guarantee hirable
                firstBuilding.workerPay = Math.max(1, Math.floor((150 + Math.random() * 150)));
                allBuildingData.push(firstBuilding);
                continue; // Skip rest of loop for the first building
            }

            // --- Generate Random Buildings (for i > 0) ---
            const rand = Math.random();
            if (rand < cumulativeProbabilities[0]) typeChoice = buildDefs[0]; // residential
            else if (rand < cumulativeProbabilities[1]) typeChoice = buildDefs[1]; // commercial
            else if (rand < cumulativeProbabilities[2]) typeChoice = buildDefs[2]; // industrial
            else typeChoice = buildDefs[3]; // logistics

            const randomBuilding = generateSingleBuilding(typeChoice, cityId, idSuffix, false);
            allBuildingData.push(randomBuilding);
        }

        const cityCounts = {};
        for (let c = 1; c <= initialCities; c++) {
            cityCounts[c] = allBuildingData.filter(b => b.cityId === c).length;
        }
        Logger.info(`Finished generation. Total buildings: ${allBuildingData.length}. Buildings per initial city: ${JSON.stringify(cityCounts)}`);

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
        nameSpan.textContent = building.name.replace(` (C${building.cityId})`, '').trim();
        div.appendChild(nameSpan);

        div.addEventListener('click', () => openBuildingMenu(building.id));
        return div;
    }

    /** Creates a DOM element for a single upgrade. */
    function createUpgradeElement(upgrade, index) {
        const div = document.createElement('div');
        div.id = `upgrade-${upgrade.id}`;
        div.classList.add('upgrade-item');

        if (index === 2 || index === 5 || index === 9 || index === 10) {
            div.classList.add('upgrade-spacing');
        }

        div.title = `${upgrade.name}\nCost: $${formatMoney(upgrade.cost)}\n${upgrade.description}`;

        const img = document.createElement('img');
        img.src = upgrade.image || 'images/default_icon.png';
        img.alt = upgrade.name;
        img.onerror = () => { img.src = 'images/default_icon.png'; };
        div.appendChild(img);

        const textSpan = document.createElement('span');
        textSpan.classList.add('upgrade-text');
        textSpan.textContent = upgrade.name;
        div.appendChild(textSpan);

        if (!upgrade.isBought) {
            div.addEventListener('click', () => buyUpgrade(upgrade.id));
        }
        return div;
    }

    /** Displays buildings for the currently selected city. Adds 'Add Building' button if applicable. */
    function displayCityBuildings() {
        DOM.gameArea.innerHTML = ''; // Clear existing buildings and buttons
        const currentCityId = gameState.currentCity;
        const buildingsInCurrentCity = gameState.buildings.filter(b => b.cityId === currentCityId);
        const isBuiltCity = currentCityId > CONFIG.INITIAL_CITY_COUNT;
        const cityBuildingCount = buildingsInCurrentCity.length;

        if (cityBuildingCount === 0 && !isBuiltCity && currentCityId <= CONFIG.INITIAL_CITY_COUNT) {
            if (buildingsInCurrentCity.length === 0) {
                DOM.gameArea.innerHTML = '<p style="text-align: center; width: 100%;">Loading city...</p>';
                Logger.warn(`No buildings found for initial city ${currentCityId}, potentially during reset.`);
                return;
            }
        }

        // Display existing buildings
        buildingsInCurrentCity.forEach(building => {
            const buildingEl = createBuildingElement(building);
            DOM.gameArea.appendChild(buildingEl);
        });

        // Add the "Add Building" button (+) if it's a player-built city and not full
        const canAddMoreBuildings = cityBuildingCount < CONFIG.MAX_BUILDINGS_PER_CITY;

        if (isBuiltCity && canAddMoreBuildings) {
            const addButton = document.createElement('button');
            addButton.id = 'add-building-button';
            addButton.textContent = '+';

            const nextBuildingIndex = cityBuildingCount;
            const incrementalCost = nextBuildingIndex * CONFIG.NEW_BUILD_ADD_COST_PER_BUILD;
            const approxBaseCost = (CONFIG.NEW_BUILDING_MIN_COST + CONFIG.NEW_BUILDING_MAX_COST) / 2;
            const approximateTotalCost = approxBaseCost + incrementalCost;
            const minPossibleNextCost = CONFIG.NEW_BUILDING_MIN_COST + incrementalCost;

            addButton.title = `Build Random Building\nEst. Cost: ~$${formatMoney(approximateTotalCost)}\n(Base: ${formatMoney(CONFIG.NEW_BUILDING_MIN_COST)}-${formatMoney(CONFIG.NEW_BUILDING_MAX_COST)} + ${formatMoney(incrementalCost)} fee)`;
            addButton.addEventListener('click', addRandomBuildingToCity);
            addButton.disabled = gameState.playerMoney < minPossibleNextCost;

            DOM.gameArea.appendChild(addButton);
        } else if (isBuiltCity && !canAddMoreBuildings) {
            const fullMessage = document.createElement('p');
            fullMessage.textContent = `City is full (${CONFIG.MAX_BUILDINGS_PER_CITY}/${CONFIG.MAX_BUILDINGS_PER_CITY} buildings).`;
            fullMessage.style.textAlign = "center";
            fullMessage.style.width = "100%";
            fullMessage.style.marginTop = "20px";
            fullMessage.style.alignSelf = "flex-start";
            DOM.gameArea.appendChild(fullMessage);
        }

        updateBuildingVisuals();
    }


    /** Displays available and relevant upgrades in the upgrades container. */
    function displayUpgrades() {
        DOM.upgradesContainer.innerHTML = '';
        const currentUpgrades = CONFIG.UPGRADE_DEFS(gameState).map(defUpgrade => {
            const stateUpgrade = gameState.gameUpgrades?.find(su => su.id === defUpgrade.id);
            return { ...defUpgrade, isBought: stateUpgrade ? stateUpgrade.isBought : false };
        });

        let displayedCount = 0;
        currentUpgrades.forEach((upgrade) => {
            // Check condition if it exists
            if (upgrade.condition && !upgrade.condition(gameState)) {
                return; // Skip displaying this upgrade if condition not met
            }
            const upgradeEl = createUpgradeElement(upgrade, displayedCount);
            DOM.upgradesContainer.appendChild(upgradeEl);
            displayedCount++;
        });
        updateUpgradeVisuals();
    }


    /** Updates visual indicators (Owned, Working) on buildings currently displayed. */
    function updateBuildingVisuals() {
        const buildingsInCurrentCity = gameState.buildings.filter(b => b.cityId === gameState.currentCity);
        buildingsInCurrentCity.forEach(building => {
            const buildingEl = document.getElementById(building.id);
            if (!buildingEl) return;

            buildingEl.classList.remove('working-indicator');
            const existingOwned = buildingEl.querySelector('.owned-indicator');
            if (existingOwned) existingOwned.remove();

            const levelIndicator = buildingEl.querySelector('.building-level');
            if (levelIndicator) levelIndicator.textContent = `Lvl ${building.level}`;

            if (building.isOwned) {
                const indicator = document.createElement('span');
                indicator.classList.add('owned-indicator');
                indicator.textContent = 'Owned';
                buildingEl.appendChild(indicator);
                if (levelIndicator) levelIndicator.style.zIndex = '0'; // Keep level below owned
            }

            if (building.id === gameState.currentlyWorkingBuildingId) {
                buildingEl.classList.add('working-indicator');
            }
        });
    }

    /** Updates visual state (Bought, Affordability) of upgrade items. */
    function updateUpgradeVisuals() {
        const upgradeElements = DOM.upgradesContainer.querySelectorAll('.upgrade-item');
        upgradeElements.forEach(upgradeEl => {
            const upgradeId = upgradeEl.id.replace('upgrade-', '');
            const upgrade = findUpgradeById(upgradeId); // Finds from gameState.gameUpgrades

            if (!upgrade) {
                // This might happen if the upgrade definition was removed or ID changed
                // Logger.warn(`Could not find upgrade state for element ID: ${upgradeEl.id}`);
                upgradeEl.style.display = 'none'; // Hide it if state is missing
                return;
            }

            upgradeEl.classList.toggle('bought', upgrade.isBought);
            upgradeEl.title = `${upgrade.name}\nCost: $${formatMoney(upgrade.cost)}\n${upgrade.description}`;

            // Update opacity based on affordability only if not bought
            if (upgrade.isBought) {
                upgradeEl.style.opacity = ''; // Use CSS class styling for bought items
            } else {
                // Check affordability
                upgradeEl.style.opacity = gameState.playerMoney < upgrade.cost ? '0.7' : '1';
                // Ensure click listener is present if not bought
                if (!upgradeEl.onclick) {
                    upgradeEl.onclick = () => buyUpgrade(upgrade.id);
                }
            }
        });
    }


    /** Updates the main UI elements (money, income rate, current work, investors, prestige button). */
    function updateUI(fullUpdate = true) {
        // If game ended, don't update normal UI elements
        if (gameState.isGameEnded) {
            return;
        }

        DOM.money.textContent = formatMoney(gameState.playerMoney);
        DOM.investors.textContent = gameState.investors.toLocaleString();

        // --- Prestige/Singularity Button Logic ---
        const canReachSingularity = canAchieveSingularity();

        if (canReachSingularity) {
            // Change to Singularity button
            DOM.prestigeButton.textContent = "Singularity";
            DOM.prestigeButton.title = "Achieve Singularity - End the game";
            DOM.prestigeButton.disabled = false; // Always enabled once reachable
            DOM.prestigeButton.style.backgroundColor = '#8e44ad'; // Make it purple?
            DOM.prestigeButton.style.borderColor = '#7d3c98';
        } else {
            // Normal Prestige button logic
            DOM.prestigeButton.textContent = "Prestige";
            DOM.prestigeButton.style.backgroundColor = ''; // Revert style
            DOM.prestigeButton.style.borderColor = '';

            const canPrestige = gameState.playerMoney >= CONFIG.PRESTIGE_MONEY_REQUIREMENT;
            DOM.prestigeButton.disabled = !canPrestige;

            if (canPrestige) {
                const potentialInvestors = Math.floor(gameState.playerMoney / CONFIG.PRESTIGE_INVESTOR_DIVISOR);
                // *** MODIFIED TITLE TEXT ***
                DOM.prestigeButton.title = `Prestige now for ${potentialInvestors.toLocaleString()} Investors! (Recommended at ${formatMoney(CONFIG.PRESTIGE_RECOMMENDED_MONEY)} for a better start)`;
            } else {
                // *** MODIFIED TITLE TEXT ***
                DOM.prestigeButton.title = `Requires ${formatMoney(CONFIG.PRESTIGE_MONEY_REQUIREMENT)} to Prestige (Recommended at ${formatMoney(CONFIG.PRESTIGE_RECOMMENDED_MONEY)} for a better start)`;
            }
        }
        // --- End Prestige/Singularity Button Logic ---


        if (fullUpdate) {
            DOM.incomeRate.textContent = formatMoney(gameState.totalIncomeRate);

            if (gameState.currentlyWorkingBuildingId) {
                const workingBuilding = findBuildingById(gameState.currentlyWorkingBuildingId);
                DOM.currentWork.textContent = workingBuilding ? `Working: ${workingBuilding.name.replace(` (C${workingBuilding.cityId})`, '').trim()}` : 'Working: None';
            } else {
                DOM.currentWork.textContent = `Working: None`;
            }

            updateBuildingVisuals(); // Visuals for buildings in current city
            displayUpgrades(); // Re-renders the upgrade list (handles conditions)
            // updateUpgradeVisuals(); // Called within displayUpgrades now
            updateCityNavigation(); // Update city nav including build button state
        }
        // Update Add Building button affordability if it exists
        const addBuildingButton = document.getElementById('add-building-button');
        if (addBuildingButton) {
            const buildingsInCity = gameState.buildings.filter(b => b.cityId === gameState.currentCity).length;
            const incrementalCost = buildingsInCity * CONFIG.NEW_BUILD_ADD_COST_PER_BUILD;
            const minPossibleNextCost = CONFIG.NEW_BUILDING_MIN_COST + incrementalCost;
            addBuildingButton.disabled = gameState.playerMoney < minPossibleNextCost;
        }
    }

    /** Updates the visibility and state of city navigation buttons, including the build city button. */
    function updateCityNavigation() {
        const numUnlocked = gameState.unlockedCities.length;
        const canPotentiallyBuildMore = numUnlocked < CONFIG.ABSOLUTE_MAX_CITIES;

        // Show nav if more than one city OR if the City Creator upgrade exists and allows building more
        const cityCreatorUpgrade = findUpgradeById('cityCreator');
        const canPotentiallyUnlockBuild = cityCreatorUpgrade; // Check if the upgrade exists at all

        if (numUnlocked > 1 || (canPotentiallyUnlockBuild && canPotentiallyBuildMore)) {
            DOM.cityNavigation.style.display = 'flex';
            DOM.currentCityDisplay.textContent = `City ${gameState.currentCity}`;

            const sortedUnlocked = [...gameState.unlockedCities].sort((a, b) => a - b);
            const currentIndex = sortedUnlocked.indexOf(gameState.currentCity);
            const maxUnlockedCity = sortedUnlocked[sortedUnlocked.length - 1];

            DOM.prevCityButton.disabled = currentIndex <= 0;

            const isViewingLastUnlockedCity = gameState.currentCity === maxUnlockedCity;
            const hasMetConditionForBuildButton = cityCreatorUpgrade?.condition(gameState); // Check if initial cities unlocked

            // Determine if the 'Build City' button should be shown
            const shouldShowBuildButton = hasMetConditionForBuildButton && isViewingLastUnlockedCity && canPotentiallyBuildMore;

            if (shouldShowBuildButton) {
                DOM.nextCityButton.style.display = 'none';
                DOM.buildCityButton.style.display = 'inline-block';

                const hasBoughtPermit = cityCreatorUpgrade && cityCreatorUpgrade.isBought;

                if (hasBoughtPermit) {
                    DOM.buildCityButton.title = `Build Next City\nCost: ${formatMoney(CONFIG.BUILD_CITY_COST)}`;
                    DOM.buildCityButton.disabled = gameState.playerMoney < CONFIG.BUILD_CITY_COST;
                } else {
                    const permitCost = cityCreatorUpgrade ? cityCreatorUpgrade.cost : CONFIG.BUILD_CITY_COST; // Fallback
                    DOM.buildCityButton.title = `Requires 'City Planning Permit' (${formatMoney(permitCost)}) to build.\n(City Cost: ${formatMoney(CONFIG.BUILD_CITY_COST)})`;
                    DOM.buildCityButton.disabled = true;
                }
            } else {
                DOM.buildCityButton.style.display = 'none';
                DOM.nextCityButton.style.display = 'inline-block';
                DOM.nextCityButton.disabled = currentIndex >= sortedUnlocked.length - 1;
            }

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
        }, 3000);
    }

    /** Shows a temporary inflation message in the modal. */
    function showInflationMessage(cityId) {
        if (!DOM.modal || DOM.modal.style.display !== 'block') return;

        DOM.modalInflationMessage.innerHTML = `<hr>Inflation Alert! Building prices in <strong>City ${cityId}</strong> have increased due to your recent purchase.`;
        DOM.modalInflationMessage.style.display = 'block';

        if (gameState.inflationMessageTimeoutId) clearTimeout(gameState.inflationMessageTimeoutId);
        gameState.inflationMessageTimeoutId = setTimeout(() => {
            if (DOM.modalInflationMessage) {
                DOM.modalInflationMessage.style.display = 'none';
                DOM.modalInflationMessage.innerHTML = '';
            }
        }, CONFIG.INFLATION_MSG_DURATION_MS);
    }


    // --- Modal Management ---

    /** Opens and populates the building detail modal. */
    function openBuildingMenu(buildingId) {
        if (gameState.isGameEnded) return;

        const building = findBuildingById(buildingId);
        if (!building) {
            Logger.error(`Building with ID ${buildingId} not found.`);
            return;
        }

        gameState.currentModalBuildingId = buildingId;

        if (gameState.inflationMessageTimeoutId) clearTimeout(gameState.inflationMessageTimeoutId);
        DOM.modalInflationMessage.style.display = 'none';
        DOM.modalInflationMessage.innerHTML = '';

        DOM.modalBuildingName.textContent = building.name.replace(` (C${building.cityId})`, '').trim();
        DOM.modalBuildingType.textContent = building.type.charAt(0).toUpperCase() + building.type.slice(1);
        DOM.modalBuildingLevel.textContent = building.level;
        DOM.modalBuildingPrice.textContent = formatMoney(building.price);
        DOM.modalBuildingCity.textContent = building.cityId;

        // Use helper that includes prestige multipliers for owned non-logistics
        let currentRevenue = calculateEffectiveBuildingRevenue(building);
        let upgradeBenefitValue = building.upgradeRevenueIncrease;
        let isPercentage = building.type === 'logistics';

        // For display, apply special multipliers to logistics boost as well
        if (isPercentage) {
            const logisticsUpgradeId = 'logisticsBoostDoubler';
            const logisticsLevel = gameState.specialUpgrades[logisticsUpgradeId] || 0;
            const logisticsMultiplier = getSpecialUpgradeMultiplier(logisticsLevel);
            currentRevenue *= logisticsMultiplier; // Adjust displayed boost %
            upgradeBenefitValue *= logisticsMultiplier; // Adjust displayed upgrade benefit %
        }


        DOM.modalBuildingRevenue.textContent = isPercentage ? formatPercent(currentRevenue) : formatMoney(currentRevenue);
        DOM.modalRevenueUnit.textContent = isPercentage ? '% Boost' : '/sec';
        DOM.modalUpgradeBenefit.textContent = isPercentage ? formatPercent(upgradeBenefitValue) : formatMoney(upgradeBenefitValue);
        DOM.modalUpgradeBenefitUnit.textContent = isPercentage ? '% Boost' : '/sec';

        const showWorkerInfo = !building.isOwned && building.isWorkable;
        DOM.modalWorkerInfo.style.display = showWorkerInfo ? 'block' : 'none';
        if (showWorkerInfo) {
            DOM.modalLookingWorker.textContent = building.isLookingForWorker ? 'Yes' : 'No';
            const effectivePay = building.workerPay * gameState.workClickMultiplier;
            DOM.modalWorkerPay.textContent = `${formatMoney(effectivePay)} ($${formatMoney(building.workerPay)} base)`;
        }
        DOM.modalSecondHr.style.display = showWorkerInfo ? 'block' : 'none';

        const showUpgradeSection = building.isOwned;
        DOM.modalUpgradeSection.style.display = showUpgradeSection ? 'block' : 'none';
        if (showUpgradeSection) {
            const nextUpgradeCost = calculateUpgradeCost(building);
            DOM.modalUpgradeCost.textContent = formatMoney(nextUpgradeCost);
            DOM.modalUpgradeButton.disabled = gameState.playerMoney < nextUpgradeCost;
        }

        DOM.modalBuyButton.style.display = building.isOwned ? 'none' : 'inline-block';
        DOM.modalBuyButton.disabled = building.isOwned || gameState.playerMoney < building.price;

        DOM.modalWorkButton.classList.remove('stop-working');
        DOM.modalWorkButton.disabled = false;
        DOM.modalWorkButton.style.display = 'none';

        if (building.isOwned) {
            DOM.modalWorkButton.style.display = 'inline-block';
            if (gameState.currentlyWorkingBuildingId === building.id) {
                DOM.modalWorkButton.textContent = "Stop Working";
                DOM.modalWorkButton.classList.add('stop-working');
            } else {
                let workText = "Work (Boost)";
                if (isPercentage) {
                    // Show the raw boost from working (before special multipliers)
                    workText = `Work (+${formatPercent(building.workBoostMultiplier)}% Base Boost)`;
                } else {
                    workText = `Work (x${building.workBoostMultiplier.toFixed(1)} Income)`;
                }
                DOM.modalWorkButton.textContent = workText;
            }
        } else if (building.isWorkable) {
            DOM.modalWorkButton.style.display = 'inline-block';
            if (building.isLookingForWorker) {
                const effectivePay = building.workerPay * gameState.workClickMultiplier;
                DOM.modalWorkButton.textContent = `Work ($${formatMoney(effectivePay)}/click)`;
            } else {
                DOM.modalWorkButton.textContent = "Not Hiring";
                DOM.modalWorkButton.disabled = true;
            }
        }

        DOM.modal.style.display = 'block';
    }

    /** Closes the building detail modal. */
    function closeModal() {
        if (DOM.modal.style.display !== 'none') {
            DOM.modal.style.display = 'none';
            gameState.currentModalBuildingId = null;
            if (gameState.inflationMessageTimeoutId) clearTimeout(gameState.inflationMessageTimeoutId);
            DOM.modalInflationMessage.style.display = 'none';
            DOM.modalInflationMessage.innerHTML = '';
        }
    }

    // --- Core Game Logic ---

    /** Calculates the cost of the next upgrade for a building. */
    function calculateUpgradeCost(building) {
        if (!building || !building.isOwned) return Infinity;
        // Cost scales with level
        return Math.floor(building.upgradeBaseCost * Math.pow(building.upgradeCostMultiplier, building.level - 1));
    }

    /** Calculates the effective base revenue of a building, including prestige multipliers */
    function calculateEffectiveBuildingRevenue(building) {
        let revenue = building.baseRevenue; // Start with the building's base stat
        if (!building.isOwned || building.type === 'logistics') {
            // Prestige multipliers only apply to owned, non-logistics buildings
            return revenue;
        }

        let multiplier = 1;
        // Find the corresponding special upgrade definition
        const upgradeDef = CONFIG.SPECIAL_UPGRADES_DEFS.find(def => def.targetType === building.type && def.type === 'income_multiplier');

        if (upgradeDef) {
            const level = gameState.specialUpgrades[upgradeDef.id] || 0; // Get current level (default 0)
            multiplier = getSpecialUpgradeMultiplier(level); // Get 1x, 2x, 4x, or 8x
        }

        return revenue * multiplier; // Apply the multiplier
    }

    /** Calculates the total income per second from all sources. */
    function calculateTotalIncomeRate() {
        let rate = 0;
        let totalLogisticsBoost = 0;

        // Get the logistics boost multiplier from special upgrades
        const logisticsUpgradeId = 'logisticsBoostDoubler';
        const logisticsLevel = gameState.specialUpgrades[logisticsUpgradeId] || 0;
        const logisticsMultiplier = getSpecialUpgradeMultiplier(logisticsLevel);

        // Pass 1: Calculate total boost from owned Logistics buildings in *unlocked* cities
        gameState.buildings.forEach(building => {
            if (building.isOwned && gameState.unlockedCities.includes(building.cityId) && building.type === 'logistics') {
                let currentBoost = building.baseRevenue; // Base percentage from building level
                if (gameState.currentlyWorkingBuildingId === building.id) {
                    currentBoost += building.workBoostMultiplier; // Additive work boost
                }
                // Apply the SPECIAL upgrade multiplier to this building's boost
                totalLogisticsBoost += (currentBoost * logisticsMultiplier);
            }
        });

        // Pass 2: Calculate income from owned non-Logistics buildings in *unlocked* cities, applying boosts
        gameState.buildings.forEach(building => {
            if (building.isOwned && gameState.unlockedCities.includes(building.cityId) && building.type !== 'logistics') {
                // Start with base revenue potentially modified by its specific prestige upgrade (e.g., commercialIncomeDoubler)
                let buildingIncome = calculateEffectiveBuildingRevenue(building); // This ALREADY includes the specific type multiplier

                // Apply work boost if working here (multiplicative for non-logistics)
                if (gameState.currentlyWorkingBuildingId === building.id) {
                    buildingIncome *= building.workBoostMultiplier;
                }

                // Apply total logistics boost multiplicatively
                buildingIncome *= (1 + totalLogisticsBoost);

                rate += buildingIncome; // Add this building's contribution
            }
        });

        // Apply global percentage boost from regular upgrades
        rate *= (1 + gameState.percentageIncomeBoost);

        gameState.totalIncomeRate = rate;
        // Logger.info(`Recalculated Income Rate: ${formatMoney(rate)}/sec (Logistics Boost: +${formatPercent(totalLogisticsBoost)}% [Base Multiplier: x${logisticsMultiplier.toFixed(1)}], Global Boost: +${formatPercent(gameState.percentageIncomeBoost)}%)`);
    }


    /** Increases prices of all buildings in a specific city due to inflation. */
    function increaseBuildingPricesInCity(cityId) {
        Logger.info(`Applying building price inflation in City ${cityId} (Rate: x${CONFIG.INFLATION_RATE})...`);
        let buildingsAffected = 0;

        gameState.buildings.forEach(building => {
            if (building.cityId === cityId && !building.isOwned) {
                const oldPrice = building.price;
                const oldUpgradeCost = building.upgradeBaseCost; // Also inflate base cost for upgrades
                building.price = Math.max(1, Math.floor(oldPrice * CONFIG.INFLATION_RATE));
                // Inflate the BASE cost for future upgrades
                building.upgradeBaseCost = Math.max(1, Math.floor(oldUpgradeCost * CONFIG.INFLATION_RATE));
                if (building.price !== oldPrice || building.upgradeBaseCost !== oldUpgradeCost) {
                    buildingsAffected++;
                }
                // Update building title if displayed? No, title is generated on display.
            }
        });

        Logger.info(`Inflation applied in City ${cityId}. ${buildingsAffected} unowned building prices/base upgrade costs potentially updated.`);

        // Refresh display only if the affected city is the current one
        if (gameState.currentCity === cityId) {
            displayCityBuildings(); // Re-render to show new prices in tooltips
        }
    }


    // --- Player Actions ---

    /** Buys the building currently displayed in the modal. */
    function buyBuilding() {
        const buildingId = gameState.currentModalBuildingId;
        if (!buildingId) return;
        const building = findBuildingById(buildingId);

        if (!building) { Logger.error("Buy action failed: Building not found."); return; }
        if (building.isOwned) { Logger.warn("Buy action failed: Building already owned."); return; }
        if (gameState.playerMoney < building.price) { Logger.warn("Buy action failed: Not enough money."); return; }

        const cityOfPurchase = building.cityId;
        const purchasePrice = building.price;
        const buildingName = building.name.replace(` (C${cityOfPurchase})`, '').trim();

        gameState.playerMoney -= purchasePrice;
        building.isOwned = true;
        Logger.action(`Bought '${buildingName}' in City ${cityOfPurchase} for $${formatMoney(purchasePrice)}. Applying inflation.`);

        increaseBuildingPricesInCity(cityOfPurchase);
        calculateTotalIncomeRate(); // Income changes when a building is owned
        updateUI(true); // Update UI including income rate
        openBuildingMenu(buildingId); // Re-open modal to reflect owned state & inflation effect
        showInflationMessage(cityOfPurchase); // Show inflation message in modal
    }

    /** Handles the "Work Here" / "Stop Working" button click. */
    function workAtBuilding() {
        const buildingId = gameState.currentModalBuildingId;
        if (!buildingId) return;
        const building = findBuildingById(buildingId);

        if (!building) { Logger.error("Work action failed: Building not found."); return; }

        const wasWorkingId = gameState.currentlyWorkingBuildingId;
        const buildingName = building.name.replace(` (C${building.cityId})`, '').trim();
        const cityId = building.cityId;

        if (building.isOwned) {
            // Toggle working at OWNED building (boosts passive income)
            if (wasWorkingId === building.id) {
                gameState.currentlyWorkingBuildingId = null; // Stop working
                Logger.action(`Stopped working at own building '${buildingName}' in City ${cityId}.`);
            } else {
                if (wasWorkingId) {
                    const prevBuilding = findBuildingById(wasWorkingId);
                    Logger.action(`Stopped working at '${prevBuilding?.name.replace(` (C${prevBuilding?.cityId})`, '').trim() || 'unknown'}' to start at '${buildingName}'.`);
                } else {
                    Logger.action(`Started working at own building '${buildingName}' in City ${cityId}.`);
                }
                gameState.currentlyWorkingBuildingId = building.id; // Start working here
            }
            // Recalculate income rate ONLY if the working status actually changed
            if (wasWorkingId !== gameState.currentlyWorkingBuildingId) {
                calculateTotalIncomeRate();
                updateUI(true); // Full UI update needed to show income change and working indicator
            }
            openBuildingMenu(buildingId); // Refresh modal button text/state

        } else {
            // Work at NON-OWNED building (click for money)
            if (building.isWorkable && building.isLookingForWorker) {
                const earnings = building.workerPay * gameState.workClickMultiplier;
                gameState.playerMoney += earnings;
                Logger.action(`Worked at non-owned '${buildingName}' in City ${cityId}, earned $${formatMoney(earnings)}.`);
                updateUI(false); // Quick money update only

                // Disable button for cooldown
                DOM.modalWorkButton.disabled = true;
                setTimeout(() => {
                    // Re-enable button only if modal is still open for this building AND it's still hiring
                    if (DOM.modal.style.display === 'block' && gameState.currentModalBuildingId === buildingId) {
                        const currentBuildingState = findBuildingById(buildingId); // Re-check state
                        if (currentBuildingState) {
                            DOM.modalWorkButton.disabled = !(currentBuildingState.isLookingForWorker);
                            // Update text if they stopped hiring during cooldown
                            if (!currentBuildingState.isLookingForWorker && DOM.modalWorkButton.textContent.startsWith("Work")) {
                                DOM.modalWorkButton.textContent = "Not Hiring";
                            }
                        } else {
                            DOM.modalWorkButton.disabled = true; // Building disappeared? Disable.
                        }
                    }
                }, CONFIG.WORK_COOLDOWN_MS);
            } else {
                Logger.warn(`Attempted to work at non-owned '${buildingName}', but cannot (not workable or not hiring).`);
            }
        }
    }

    /** Upgrades the building currently displayed in the modal. */
    function upgradeBuilding() {
        const buildingId = gameState.currentModalBuildingId;
        if (!buildingId) return;
        const building = findBuildingById(buildingId);

        if (!building) { Logger.error("Upgrade action failed: Building not found."); return; }
        if (!building.isOwned) { Logger.warn("Upgrade action failed: Building not owned."); return; }

        const cost = calculateUpgradeCost(building);
        const buildingName = building.name.replace(` (C${building.cityId})`, '').trim();
        const cityId = building.cityId;

        if (gameState.playerMoney >= cost) {
            gameState.playerMoney -= cost;
            const oldLevel = building.level;
            building.level++;
            // IMPORTANT: Increase BASE revenue/boost. The calculation functions handle multipliers.
            building.baseRevenue += building.upgradeRevenueIncrease;

            Logger.action(`Upgraded '${buildingName}' in City ${cityId} from Lvl ${oldLevel} to Lvl ${building.level} for $${formatMoney(cost)}.`);

            calculateTotalIncomeRate(); // Recalculate income with new base revenue
            updateUI(true); // Full UI update
            openBuildingMenu(buildingId); // Refresh modal to show new level, cost, revenue

        } else {
            Logger.warn(`Attempted to upgrade '${buildingName}', but not enough money (Need $${formatMoney(cost)}).`);
        }
    }

    /** Buys the specified regular upgrade. */
    function buyUpgrade(upgradeId) {
        // Find the definition first to get cost, type etc.
        const upgradeDef = CONFIG.UPGRADE_DEFS(gameState).find(u => u.id === upgradeId);
        if (!upgradeDef) { Logger.error(`Upgrade action failed: Definition for '${upgradeId}' not found.`); return; }

        // Find the current state of the upgrade
        const upgradeState = gameState.gameUpgrades.find(u => u.id === upgradeId);
        if (!upgradeState) { Logger.error(`Upgrade state not found for ID '${upgradeId}'. Cannot buy.`); return; }

        if (upgradeState.isBought) { Logger.warn(`Upgrade action failed: '${upgradeDef.name}' already bought.`); return; }
        if (gameState.playerMoney < upgradeDef.cost) { Logger.warn(`Upgrade action failed: Not enough money for '${upgradeDef.name}'.`); return; }

        const upgradeCost = upgradeDef.cost;
        const upgradeName = upgradeDef.name;

        gameState.playerMoney -= upgradeCost;
        upgradeState.isBought = true; // Update the state
        Logger.action(`Bought upgrade: '${upgradeName}' for $${formatMoney(upgradeCost)}.`);

        let incomeRateChanged = false;
        let cityStateChanged = false;
        let fullUIUpdateNeeded = true; // Assume true unless specific cases

        // Apply the upgrade effect
        switch (upgradeDef.type) {
            case 'multiplier':
                gameState.workClickMultiplier *= upgradeDef.value;
                // Refresh modal worker pay if open
                if (DOM.modal.style.display === 'block' && gameState.currentModalBuildingId) {
                    openBuildingMenu(gameState.currentModalBuildingId);
                }
                fullUIUpdateNeeded = false; // Only money potentially changes, handled by tick
                break;
            case 'percentage':
                gameState.percentageIncomeBoost += upgradeDef.value;
                incomeRateChanged = true;
                break;
            case 'city':
                if (!gameState.unlockedCities.includes(upgradeDef.value) && upgradeDef.value <= CONFIG.INITIAL_CITY_COUNT) {
                    gameState.unlockedCities.push(upgradeDef.value);
                    gameState.unlockedCities.sort((a, b) => a - b); // Keep sorted
                    cityStateChanged = true;
                    incomeRateChanged = true; // Recalculate income as new city buildings contribute
                } else {
                    Logger.warn(`City upgrade '${upgradeName}' for City ${upgradeDef.value} already unlocked or invalid.`);
                    fullUIUpdateNeeded = false; // No state change happened
                }
                break;
            case 'feature_unlock':
                // Effect is handled by checks elsewhere (e.g., city building button)
                cityStateChanged = true; // Need to update nav potentially
                break;
            default:
                Logger.warn(`Unknown upgrade type '${upgradeDef.type}' for upgrade '${upgradeName}'.`);
                fullUIUpdateNeeded = false; // No known effect applied
        }

        // Recalculate and Update UI as needed
        if (incomeRateChanged) calculateTotalIncomeRate();
        // Update city nav if state changed OR if it was a feature unlock (might enable build button)
        if (cityStateChanged) updateCityNavigation();

        // Perform a full UI update if needed (income changed, city unlocked, feature unlocked)
        // Also forces update of upgrade visuals
        if (fullUIUpdateNeeded || incomeRateChanged || cityStateChanged) {
            updateUI(true);
        } else {
            updateUpgradeVisuals(); // Just update visuals if only money changed
        }
    }


    /** Navigates to the previous or next unlocked city. */
    function navigateCity(direction) { // -1 for prev, 1 for next
        const sortedUnlocked = [...gameState.unlockedCities].sort((a, b) => a - b);
        const currentIndex = sortedUnlocked.indexOf(gameState.currentCity);
        const nextIndex = currentIndex + direction;

        if (nextIndex >= 0 && nextIndex < sortedUnlocked.length) {
            const previousCity = gameState.currentCity;
            gameState.currentCity = sortedUnlocked[nextIndex];
            Logger.action(`Navigated from City ${previousCity} to City ${gameState.currentCity}.`);
            closeModal(); // Close any open building modal from the previous city
            displayCityBuildings(); // Show buildings for the new city
            updateCityNavigation(); // Update nav buttons state
        } else {
            Logger.info(`Attempted navigation from City ${gameState.currentCity}, but reached boundary.`);
        }
    }

    /** Builds a new city if conditions are met. */
    function buildCity() {
        if (gameState.unlockedCities.length >= CONFIG.ABSOLUTE_MAX_CITIES) {
            Logger.warn("Cannot build city: Maximum number of cities reached.");
            showSaveStatus("Maximum cities reached!");
            return;
        }
        const cityCreatorUpgrade = findUpgradeById('cityCreator');
        if (!cityCreatorUpgrade || !cityCreatorUpgrade.isBought) {
            Logger.warn("Cannot build city: 'City Planning Permit' upgrade not purchased.");
            showSaveStatus("Requires 'City Planning Permit' upgrade!");
            return;
        }
        if (gameState.playerMoney < CONFIG.BUILD_CITY_COST) {
            Logger.warn(`Cannot build city: Not enough money. Need ${formatMoney(CONFIG.BUILD_CITY_COST)}.`);
            showSaveStatus(`Need ${formatMoney(CONFIG.BUILD_CITY_COST)} to build city!`);
            return;
        }

        gameState.playerMoney -= CONFIG.BUILD_CITY_COST;
        const newCityId = Math.max(...gameState.unlockedCities) + 1; // Next sequential ID
        gameState.unlockedCities.push(newCityId);
        gameState.unlockedCities.sort((a, b) => a - b); // Keep sorted

        Logger.action(`Built City ${newCityId} for ${formatMoney(CONFIG.BUILD_CITY_COST)}.`);

        // Navigate to the newly built city automatically
        gameState.currentCity = newCityId;
        closeModal(); // Close modal if open
        displayCityBuildings(); // Show the (initially empty) grid + add button
        calculateTotalIncomeRate(); // Income doesn't change yet, but good practice
        updateUI(true); // Full update to show new city nav state
        showSaveStatus(`Established City ${newCityId}!`);
    }


    /** Adds a random, owned building to the current city if it's a player-built city. */
    function addRandomBuildingToCity() {
        const cityId = gameState.currentCity;
        // Ensure it's a player-built city
        if (cityId <= CONFIG.INITIAL_CITY_COUNT) {
            Logger.error(`Attempted to add random building to initial city ${cityId}. Aborted.`);
            return;
        }

        const cityBuildingCount = gameState.buildings.filter(b => b.cityId === cityId).length;
        if (cityBuildingCount >= CONFIG.MAX_BUILDINGS_PER_CITY) {
            Logger.warn(`Attempted to add building to full city ${cityId}.`);
            showSaveStatus(`City ${cityId} is full!`);
            const addButton = document.getElementById('add-building-button');
            if (addButton) addButton.disabled = true; // Disable the add button visually
            return;
        }

        // Calculate cost: Random base + fee per existing building
        const baseCost = getRandomInt(CONFIG.NEW_BUILDING_MIN_COST, CONFIG.NEW_BUILDING_MAX_COST);
        const incrementalCost = cityBuildingCount * CONFIG.NEW_BUILD_ADD_COST_PER_BUILD;
        const totalCost = baseCost + incrementalCost;

        if (gameState.playerMoney < totalCost) {
            Logger.warn(`Cannot add building to city ${cityId}: Need ${formatMoney(totalCost)}.`);
            showSaveStatus(`Need $${formatMoney(totalCost)}`);
            const addButton = document.getElementById('add-building-button');
            if (addButton) addButton.disabled = true; // Disable visually if cannot afford
            return;
        }

        gameState.playerMoney -= totalCost;

        // Generate a random building type
        const buildDefs = CONFIG.BUILDING_DEFS;
        const genConfig = CONFIG.BUILDING_GENERATION;
        const cumulativeProbabilities = [
            genConfig.residentialPossibility,
            genConfig.residentialPossibility + genConfig.commercialPossibility,
            genConfig.residentialPossibility + genConfig.commercialPossibility + genConfig.industrialPossibility,
            1.0 // Logistics
        ];
        const rand = Math.random();
        let typeChoice;
        if (rand < cumulativeProbabilities[0]) typeChoice = buildDefs[0];
        else if (rand < cumulativeProbabilities[1]) typeChoice = buildDefs[1];
        else if (rand < cumulativeProbabilities[2]) typeChoice = buildDefs[2];
        else typeChoice = buildDefs[3];

        // Generate the building data (marked as owned)
        // Use a more unique suffix for built cities
        const suffix = `built-${cityBuildingCount + 1}-${Math.random().toString(36).substring(2, 5)}`;
        const newBuilding = generateSingleBuilding(typeChoice, cityId, suffix, true);
        newBuilding.price = totalCost; // Override generated price with actual cost paid

        gameState.buildings.push(newBuilding);
        const buildingName = newBuilding.name.replace(` (C${cityId})`, '').trim();
        Logger.action(`Added new ${newBuilding.type} building '${buildingName}' to City ${cityId} for $${formatMoney(totalCost)}.`);

        calculateTotalIncomeRate(); // Income potentially changes
        displayCityBuildings(); // Refresh grid to show the new building
        updateUI(true); // Full UI update
        showSaveStatus(`Built ${buildingName}!`);
    }


    /** Toggles dark mode on/off. */
    function toggleDarkMode() {
        DOM.body.classList.toggle('dark-mode');
        const isEnabled = DOM.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isEnabled ? 'enabled' : 'disabled');
        Logger.action(`Toggled Dark Mode ${isEnabled ? 'ON' : 'OFF'}.`);
        updateUpgradeVisuals(); // Ensure upgrade visuals adapt
        // Update prestige modal styles if open
        if (DOM.prestigeModal.style.display === 'block') {
            openPrestigeMenu(0); // Re-populate to apply dark mode styles correctly
        }
    }

    // --- Game Loop ---
    /** Executes one tick of the game loop (earning passive income, updating UI). */
    function gameTick() {
        if (gameState.isGameEnded) {
            if (gameState.gameLoopIntervalId) {
                clearInterval(gameState.gameLoopIntervalId);
                gameState.gameLoopIntervalId = null;
                Logger.info("Game tick loop stopped due to game end.");
            }
            return;
        }

        const incomeThisTick = gameState.totalIncomeRate * (CONFIG.GAME_TICK_INTERVAL_MS / 1000);
        if (incomeThisTick > 0) {
            gameState.playerMoney += incomeThisTick;
            updateUI(false); // Quick update for money, investors, prestige button state
        }

        // --- Update Button Disabled States ---

        // Building Modal Buttons (if open)
        if (DOM.modal.style.display === 'block' && gameState.currentModalBuildingId) {
            const building = findBuildingById(gameState.currentModalBuildingId);
            if (building) {
                if (building.isOwned) {
                    // Upgrade button affordability
                    const nextUpgradeCost = calculateUpgradeCost(building);
                    DOM.modalUpgradeButton.disabled = gameState.playerMoney < nextUpgradeCost;
                } else {
                    // Buy button affordability
                    DOM.modalBuyButton.disabled = gameState.playerMoney < building.price;
                }
                // Work button state is handled more dynamically on open/action
            }
        }

        // Prestige Modal Buttons (if open)
        if (DOM.prestigeModal.style.display === 'block') {
            const upgradeButtons = DOM.prestigeUpgradesContainer.querySelectorAll('.prestige-upgrade-buy');
            upgradeButtons.forEach(button => {
                const upgradeId = button.dataset.upgradeId;
                const upgradeDef = findSpecialUpgradeDefById(upgradeId);
                if (upgradeDef) {
                    const currentLevel = gameState.specialUpgrades[upgradeId] || 0;
                    if (currentLevel < upgradeDef.maxLevel) {
                        const cost = upgradeDef.costs[currentLevel];
                        button.disabled = gameState.investors < cost;
                    } else {
                        button.disabled = true; // Should be hidden or replaced anyway
                    }
                }
            });
        }

        // Game Area Buttons (Add Building, Build City)
        const addBuildingButton = document.getElementById('add-building-button');
        if (addBuildingButton) {
            const buildingsInCity = gameState.buildings.filter(b => b.cityId === gameState.currentCity).length;
            const incrementalCost = buildingsInCity * CONFIG.NEW_BUILD_ADD_COST_PER_BUILD;
            const minPossibleNextCost = CONFIG.NEW_BUILDING_MIN_COST + incrementalCost;
            addBuildingButton.disabled = gameState.playerMoney < minPossibleNextCost;
        }

        if (DOM.buildCityButton.style.display !== 'none') {
            const cityCreatorUpgrade = findUpgradeById('cityCreator');
            const canBuildCities = cityCreatorUpgrade && cityCreatorUpgrade.isBought;
            DOM.buildCityButton.disabled = !canBuildCities || gameState.playerMoney < CONFIG.BUILD_CITY_COST;
        }

        // Regular Upgrade Affordability (less critical for tick, done in full update)
        // updateUpgradeVisuals(); // Can uncomment if needed, but potentially heavy for every tick
    }


    // --- Saving and Loading ---

    /** Saves the current game state to localStorage. */
    function saveGame(isAutoSave = false) {
        if (gameState.isGameEnded) {
            if (!isAutoSave) showSaveStatus('Game has ended. Cannot save.');
            return;
        }

        try {
            // Only save necessary upgrade data
            const upgradesToSave = gameState.gameUpgrades.map(u => ({ id: u.id, isBought: u.isBought }));

            const saveData = {
                version: CONFIG.SAVE_VERSION,
                saveTimestamp: Date.now(),
                playerMoney: gameState.playerMoney,
                currentlyWorkingBuildingId: gameState.currentlyWorkingBuildingId,
                currentCity: gameState.currentCity,
                unlockedCities: gameState.unlockedCities,
                workClickMultiplier: gameState.workClickMultiplier,
                percentageIncomeBoost: gameState.percentageIncomeBoost,
                buildings: gameState.buildings, // Consider optimizing if state gets huge
                gameUpgrades: upgradesToSave,
                investors: gameState.investors,
                specialUpgrades: gameState.specialUpgrades, // Save levels {id: level}
                isGameEnded: gameState.isGameEnded
            };

            localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(saveData));

            if (!isAutoSave) {
                showSaveStatus('Game Saved!');
                Logger.action('Game Saved!');
            }

        } catch (error) {
            Logger.error(`Error saving game: ${error.message}`);
            console.error("Detailed save error:", error);
            showSaveStatus("Error saving game!");
            if (error.name === 'QuotaExceededError') {
                alert("Error saving game: Local storage is full. Cannot save progress.");
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

            // Version Check - Crucial for handling structural changes
            if (!savedData.version || savedData.version < CONFIG.SAVE_VERSION) {
                Logger.warn(`Save data is from an older version (v${savedData.version || 'unknown'}). Current v${CONFIG.SAVE_VERSION}. Clearing old save and starting fresh.`);
                localStorage.removeItem(CONFIG.SAVE_KEY);
                showSaveStatus("Old save version detected. Starting fresh.");
                return false; // Force new game
            }

            // Restore Core State
            gameState.playerMoney = savedData.playerMoney ?? CONFIG.STARTING_MONEY;
            gameState.currentlyWorkingBuildingId = savedData.currentlyWorkingBuildingId ?? null;
            gameState.currentCity = savedData.currentCity ?? 1;
            gameState.unlockedCities = (Array.isArray(savedData.unlockedCities) && savedData.unlockedCities.length > 0 && savedData.unlockedCities.includes(1))
                ? [...new Set(savedData.unlockedCities)].sort((a, b) => a - b)
                : [1];
            gameState.workClickMultiplier = savedData.workClickMultiplier ?? 1;
            gameState.percentageIncomeBoost = savedData.percentageIncomeBoost ?? 0;
            gameState.investors = savedData.investors ?? 0;
            gameState.specialUpgrades = savedData.specialUpgrades ?? {}; // Load special upgrade levels
            gameState.isGameEnded = savedData.isGameEnded ?? false;

            // Restore Buildings
            if (!Array.isArray(savedData.buildings)) {
                Logger.warn("Loaded save data has invalid or missing 'buildings' array. Regenerating initial buildings.");
                gameState.buildings = generateInitialBuildings();
            } else {
                // Basic validation + potential migration point
                gameState.buildings = savedData.buildings.filter(b => b && b.id && b.hasOwnProperty('type') && b.hasOwnProperty('cityId'));
                // Add migration logic here if building structure changes significantly
            }

            // Restore Regular Upgrades based on current definitions
            const definedUpgrades = CONFIG.UPGRADE_DEFS(gameState);
            gameState.gameUpgrades = definedUpgrades.map(defUpgrade => {
                const savedStatus = savedData.gameUpgrades?.find(su => su.id === defUpgrade.id);
                // Return the full definition merged with saved 'isBought' status
                return { ...defUpgrade, isBought: savedStatus ? savedStatus.isBought : false };
            });

            // --- Data Validation & Sanitization ---
            // Validate City State
            if (!gameState.unlockedCities.includes(gameState.currentCity)) {
                Logger.warn(`Loaded current city (${gameState.currentCity}) which is not unlocked. Resetting to City 1.`);
                gameState.currentCity = 1;
            }
            // Validate Working Building
            if (gameState.currentlyWorkingBuildingId) {
                const workingBuilding = findBuildingById(gameState.currentlyWorkingBuildingId);
                if (!workingBuilding || (!workingBuilding.isOwned && !workingBuilding.isLookingForWorker)) {
                    Logger.warn(`Loaded working building ID (${gameState.currentlyWorkingBuildingId}) is invalid or no longer valid. Resetting.`);
                    gameState.currentlyWorkingBuildingId = null;
                }
            }
            // Validate Special Upgrade Levels
            const validSpecialUpgradeIds = CONFIG.SPECIAL_UPGRADES_DEFS.map(def => def.id);
            for (const id in gameState.specialUpgrades) {
                if (!validSpecialUpgradeIds.includes(id)) {
                    Logger.warn(`Removing unknown special upgrade '${id}' from loaded state.`);
                    delete gameState.specialUpgrades[id];
                } else {
                    const def = findSpecialUpgradeDefById(id);
                    const level = gameState.specialUpgrades[id];
                    if (typeof level !== 'number' || level < 0 || level > def.maxLevel) {
                        Logger.warn(`Invalid level (${level}) loaded for special upgrade '${id}'. Resetting to 0.`);
                        gameState.specialUpgrades[id] = 0;
                    }
                }
            }
            // Ensure all defined special upgrades have an entry (default to 0)
            CONFIG.SPECIAL_UPGRADES_DEFS.forEach(def => {
                if (!(def.id in gameState.specialUpgrades)) {
                    gameState.specialUpgrades[def.id] = 0;
                }
            });


            Logger.info(`Game loaded successfully from save data (v${savedData.version}, Timestamp: ${new Date(savedData.saveTimestamp).toLocaleString()}).`);
            if (!gameState.isGameEnded) {
                showSaveStatus("Game loaded.");
            }
            return true;

        } catch (error) {
            Logger.error(`Error parsing saved game data: ${error.message}. Clearing corrupted save.`);
            console.error("Detailed load error:", error);
            localStorage.removeItem(CONFIG.SAVE_KEY);
            showSaveStatus("Error loading save. Starting new game.");
            return false;
        }
    }

    // --- Prestige Functions ---

    /** Resets non-persistent game state for prestige. */
    function prestigeResetState() {
        // Preserves investors and special upgrades (already in gameState)
        Logger.info("Performing Prestige reset...");

        // Reset transient state
        gameState.playerMoney = CONFIG.STARTING_MONEY;
        gameState.totalIncomeRate = 0;
        gameState.currentlyWorkingBuildingId = null;
        gameState.currentCity = 1;
        gameState.unlockedCities = [1];
        gameState.workClickMultiplier = 1;
        gameState.percentageIncomeBoost = 0;

        // Reset regular upgrades (get fresh definitions including conditions)
        gameState.gameUpgrades = CONFIG.UPGRADE_DEFS(gameState).map(def => ({ ...def, isBought: false }));

        // Regenerate initial buildings
        gameState.buildings = generateInitialBuildings();

        // Keep gameState.investors
        // Keep gameState.specialUpgrades

        Logger.info("Game state reset for Prestige, preserving Investors and Special Upgrades.");
    }

    /** Handles the Prestige/Singularity button click. */
    function handlePrestigeClick() {
        const isSingularity = DOM.prestigeButton.textContent === "Singularity";

        if (isSingularity) {
            handleSingularityClick();
        } else {
            // Normal Prestige Logic
            if (gameState.playerMoney < CONFIG.PRESTIGE_MONEY_REQUIREMENT) {
                Logger.warn("Prestige attempt failed: Not enough money.");
                showSaveStatus(`Need ${formatMoney(CONFIG.PRESTIGE_MONEY_REQUIREMENT)} to prestige.`);
                return;
            }

            const potentialInvestors = Math.floor(gameState.playerMoney / CONFIG.PRESTIGE_INVESTOR_DIVISOR);
            if (!confirm(`Are you sure you want to Prestige? This will reset your money ($${formatMoney(gameState.playerMoney)}), buildings, regular upgrades, and cities. \nYou will gain ${potentialInvestors.toLocaleString()} Investors. \n\nInvestor upgrades and total Investors will be kept.`)) {
                Logger.action("User cancelled Prestige.");
                return;
            }
            performPrestige();
        }
    }

    /** Handles the Singularity button click */
    function handleSingularityClick() {
        Logger.action("Singularity button clicked.");
        if (confirm("Achieving Singularity requires having ALL Investor Upgrades at Max Level and will END the current game permanently. Are you sure you want to complete the Grind Mindset?")) {
            if (canAchieveSingularity()) {
                Logger.action("User confirmed Singularity. Ending game.");
                endGame();
            } else {
                Logger.warn("Singularity confirmation passed, but conditions not met (not all special upgrades maxed).");
                alert("Cannot achieve Singularity yet! You must purchase all Investor Upgrades to their maximum level (x8 boost).");
            }
        } else {
            Logger.action("User cancelled Singularity.");
        }
    }


    /** Executes the prestige process. */
    function performPrestige() {
        Logger.action("Performing Prestige...");

        // Stop game loops briefly
        if (gameState.gameLoopIntervalId) clearInterval(gameState.gameLoopIntervalId);
        if (gameState.autoSaveIntervalId) clearInterval(gameState.autoSaveIntervalId);
        gameState.gameLoopIntervalId = null;
        gameState.autoSaveIntervalId = null;
        Logger.info("Game loops stopped for Prestige.");

        // Calculate gained investors BEFORE resetting money
        const gainedInvestors = Math.floor(gameState.playerMoney / CONFIG.PRESTIGE_INVESTOR_DIVISOR);
        gameState.investors += gainedInvestors;

        Logger.info(`Gained ${gainedInvestors} Investors. Total: ${gameState.investors}.`);

        // Reset game state (preserves investors/special upgrades)
        prestigeResetState();

        // Close building modal if open
        closeModal();

        // Open the prestige menu to spend investors
        openPrestigeMenu(gainedInvestors); // Pass gained investors for display

        // Save the reset state immediately (important!)
        saveGame(false);
        Logger.info("Game state saved after Prestige reset.");
        // Loops will be restarted when prestige menu is closed
    }

    /** Populates and shows the Prestige menu modal. */
    function openPrestigeMenu(gainedInvestors) {
        DOM.prestigeGainedInvestors.textContent = gainedInvestors.toLocaleString();
        DOM.prestigeTotalInvestors.textContent = gameState.investors.toLocaleString();
        DOM.prestigeUpgradesContainer.innerHTML = ''; // Clear previous items

        CONFIG.SPECIAL_UPGRADES_DEFS.forEach(upgradeDef => {
            const currentLevel = gameState.specialUpgrades[upgradeDef.id] || 0;
            const isMaxLevel = currentLevel >= upgradeDef.maxLevel;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('prestige-upgrade-item');

            const img = document.createElement('img');
            img.src = upgradeDef.image || 'images/default_icon.png';
            img.alt = upgradeDef.name;
            img.onerror = () => { img.src = 'images/default_icon.png'; };

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('prestige-upgrade-info');

            const currentMultiplier = getSpecialUpgradeMultiplier(currentLevel);
            let descriptionText = upgradeDef.description;
            let costText = "";
            let titleText = `${upgradeDef.name} (Level ${currentLevel}/${upgradeDef.maxLevel})`;

            if (isMaxLevel) {
                descriptionText += ` (Current: x${currentMultiplier.toFixed(0)})`;
                costText = "Max Level Reached";
            } else {
                const nextLevel = currentLevel + 1;
                const nextMultiplier = getSpecialUpgradeMultiplier(nextLevel);
                const cost = upgradeDef.costs[currentLevel]; // Cost for the *next* level
                descriptionText += ` (Current: x${currentMultiplier.toFixed(0)}, Next: x${nextMultiplier.toFixed(0)})`;
                costText = `Next Level Cost: ${cost} Investor${cost === 1 ? '' : 's'}`;
            }

            infoDiv.innerHTML = `
                <h4>${titleText}</h4>
                <p>${descriptionText}</p>
                <p class="upgrade-cost">${costText}</p>
            `;

            itemDiv.appendChild(img);
            itemDiv.appendChild(infoDiv);

            if (isMaxLevel) {
                const maxLevelSpan = document.createElement('span');
                maxLevelSpan.classList.add('prestige-upgrade-bought'); // Use 'bought' class for styling max level text
                maxLevelSpan.textContent = `Max Level (x${currentMultiplier.toFixed(0)})`;
                itemDiv.appendChild(maxLevelSpan);
            } else {
                const buyButton = document.createElement('button');
                buyButton.classList.add('prestige-upgrade-buy');
                buyButton.dataset.upgradeId = upgradeDef.id; // Store base ID
                buyButton.textContent = `Buy Level ${currentLevel + 1}`;
                const cost = upgradeDef.costs[currentLevel];
                buyButton.disabled = gameState.investors < cost;
                buyButton.addEventListener('click', () => buySpecialUpgrade(upgradeDef.id));
                itemDiv.appendChild(buyButton);
            }

            DOM.prestigeUpgradesContainer.appendChild(itemDiv);
        });

        DOM.prestigeModal.style.display = 'block';
    }

    /** Handles buying a special upgrade level from the prestige menu. */
    function buySpecialUpgrade(upgradeId) {
        const upgradeDef = findSpecialUpgradeDefById(upgradeId);
        if (!upgradeDef) {
            Logger.error(`Cannot buy special upgrade: Definition not found for ID ${upgradeId}`);
            return;
        }

        const currentLevel = gameState.specialUpgrades[upgradeId] || 0;
        if (currentLevel >= upgradeDef.maxLevel) {
            Logger.warn(`Cannot buy special upgrade: '${upgradeDef.name}' is already at max level (${currentLevel}).`);
            return;
        }

        const cost = upgradeDef.costs[currentLevel]; // Cost for the next level
        if (gameState.investors < cost) {
            Logger.warn(`Cannot buy special upgrade: Not enough investors for '${upgradeDef.name}' Level ${currentLevel + 1}. Need ${cost}, have ${gameState.investors}.`);
            showSaveStatus("Not enough Investors!"); // Consider showing in modal
            return;
        }

        // Purchase successful
        gameState.investors -= cost;
        gameState.specialUpgrades[upgradeId] = currentLevel + 1; // Increment level

        Logger.action(`Bought special upgrade: '${upgradeDef.name}' Level ${currentLevel + 1} for ${cost} Investors.`);

        // Re-render the prestige menu immediately to show updated state and costs
        openPrestigeMenu(0); // Pass 0 gained investors as we're just updating

        // Save game state after purchase
        saveGame(false);

        // Check if this purchase enabled Singularity
        if (canAchieveSingularity()) {
            updateUI(true); // Update main UI to show Singularity button potentially
        }
    }

    /** Closes the prestige menu and resumes the game. */
    function closePrestigeMenu() {
        DOM.prestigeModal.style.display = 'none';
        Logger.info("Continuing run after Prestige.");

        // Recalculate income based on reset state + potential new special upgrades
        calculateTotalIncomeRate();

        // Refresh the main UI fully
        displayCityBuildings(); // Display buildings for City 1
        updateUI(true); // Full update including prestige button state

        // Restart game loops if they are not already running
        if (!gameState.gameLoopIntervalId) {
            gameState.gameLoopIntervalId = setInterval(gameTick, CONFIG.GAME_TICK_INTERVAL_MS);
            Logger.info("Game tick loop restarted.");
        }
        if (!gameState.autoSaveIntervalId) {
            gameState.autoSaveIntervalId = setInterval(() => saveGame(true), CONFIG.AUTO_SAVE_INTERVAL_MS);
            Logger.info("Auto-save loop restarted.");
        }
        showSaveStatus("Prestige complete. Welcome back!");
    }

    /** Ends the game, displaying the congratulations screen. */
    function endGame() {
        gameState.isGameEnded = true;
        Logger.info("Game Ended - Singularity Reached.");

        // Stop intervals permanently for this session
        if (gameState.gameLoopIntervalId) clearInterval(gameState.gameLoopIntervalId);
        if (gameState.autoSaveIntervalId) clearInterval(gameState.autoSaveIntervalId);
        gameState.gameLoopIntervalId = null;
        gameState.autoSaveIntervalId = null;
        Logger.info("Game loops stopped permanently.");

        // Close any open modals
        closeModal();
        DOM.prestigeModal.style.display = 'none';

        // Hide main game elements
        DOM.stats.style.display = 'none';
        DOM.mainContent.style.display = 'none';
        DOM.cityNavigation.style.display = 'none';

        // Configure controls for end game (only restart visible)
        DOM.controls.classList.add('game-ended');

        // Show end game screen
        DOM.endGameScreen.style.display = 'block';

        // Clear save data as the game is over
        localStorage.removeItem(CONFIG.SAVE_KEY);
        Logger.info("Cleared save data after game end.");
        showSaveStatus("Game Complete! Save data cleared.");

        // Update UI one last time to reflect the end state (e.g., hiding elements)
        // updateUI(true); // Not needed as elements are hidden manually
    }


    // --- Game Initialization and Control ---

    /** Resets the game state COMPLETELY, clearing ALL save data. */
    function restartGame() {
        // If game ended, restart is simpler (just reload)
        if (gameState.isGameEnded) {
            Logger.action("Restarting after game end.");
            // No confirmation needed - it's the only path forward besides closing tab
            window.location.reload();
            return;
        }

        // Normal full restart confirmation
        if (!confirm("Are you sure you want to COMPLETELY restart? All progress, including Investors and Prestige Upgrades, will be lost permanently! This is not Prestige.")) {
            Logger.action("User cancelled FULL game restart.");
            return;
        }
        Logger.action("User confirmed. Performing FULL WIPE restart.");

        // Stop loops
        if (gameState.gameLoopIntervalId) clearInterval(gameState.gameLoopIntervalId);
        if (gameState.autoSaveIntervalId) clearInterval(gameState.autoSaveIntervalId);
        gameState.gameLoopIntervalId = null;
        gameState.autoSaveIntervalId = null;

        closeModal(); // Close building modal
        DOM.prestigeModal.style.display = 'none'; // Close prestige modal

        // Clear Save Data FIRST
        localStorage.removeItem(CONFIG.SAVE_KEY);
        Logger.info("Cleared ALL saved game data.");

        // Reset ALL Game State Variables
        gameState.playerMoney = CONFIG.STARTING_MONEY;
        gameState.totalIncomeRate = 0;
        gameState.currentlyWorkingBuildingId = null;
        gameState.currentCity = 1;
        gameState.unlockedCities = [1];
        gameState.workClickMultiplier = 1;
        gameState.percentageIncomeBoost = 0;
        gameState.investors = 0; // Reset investors
        gameState.specialUpgrades = {}; // Reset special upgrades (levels to 0)
        CONFIG.SPECIAL_UPGRADES_DEFS.forEach(def => { gameState.specialUpgrades[def.id] = 0; }); // Explicitly set levels to 0
        gameState.isGameEnded = false; // Ensure game end flag is off

        // Reset Game Data (Buildings, Regular Upgrades)
        gameState.buildings = generateInitialBuildings();
        gameState.gameUpgrades = CONFIG.UPGRADE_DEFS(gameState).map(def => ({ ...def, isBought: false }));

        // Restore UI Visibility if it was hidden by end game state
        DOM.stats.style.display = 'block';
        DOM.mainContent.style.display = 'flex'; // Or its default display type
        DOM.endGameScreen.style.display = 'none';
        DOM.controls.classList.remove('game-ended');

        // Refresh Display Fully
        calculateTotalIncomeRate();
        displayCityBuildings();
        updateUI(true);

        showSaveStatus("Game Reset. All progress wiped.");

        // Restart game loops
        gameState.gameLoopIntervalId = setInterval(gameTick, CONFIG.GAME_TICK_INTERVAL_MS);
        gameState.autoSaveIntervalId = setInterval(() => saveGame(true), CONFIG.AUTO_SAVE_INTERVAL_MS);
        Logger.info("Game restarted successfully after full wipe.");
    }

    /** Initializes the game: loads data or starts fresh, sets up UI and loops. */
    function initGame() {
        Logger.info(`Initializing Grind Mindset v${CONFIG.SAVE_VERSION}...`);

        // Apply dark mode preference early
        if (localStorage.getItem('darkMode') === 'enabled') {
            DOM.body.classList.add('dark-mode');
        }

        const loadedSuccessfully = loadGame();

        if (!loadedSuccessfully) {
            // Initialize fresh state if load failed or no save/old version
            gameState.playerMoney = CONFIG.STARTING_MONEY;
            gameState.currentlyWorkingBuildingId = null;
            gameState.currentCity = 1;
            gameState.unlockedCities = [1];
            gameState.workClickMultiplier = 1;
            gameState.percentageIncomeBoost = 0;
            gameState.investors = 0;
            gameState.specialUpgrades = {}; // Initialize empty
            CONFIG.SPECIAL_UPGRADES_DEFS.forEach(def => { gameState.specialUpgrades[def.id] = 0; }); // Set all levels to 0
            gameState.isGameEnded = false;
            gameState.buildings = generateInitialBuildings();
            gameState.gameUpgrades = CONFIG.UPGRADE_DEFS(gameState).map(def => ({ ...def, isBought: false }));
            Logger.info("Initialized new game state.");
        }

        // --- Handle Game End State On Load ---
        if (gameState.isGameEnded) {
            Logger.info("Loaded game state indicates game has already ended.");
            // Stop intervals immediately if somehow running
            if (gameState.gameLoopIntervalId) clearInterval(gameState.gameLoopIntervalId);
            if (gameState.autoSaveIntervalId) clearInterval(gameState.autoSaveIntervalId);
            gameState.gameLoopIntervalId = null;
            gameState.autoSaveIntervalId = null;

            // Setup End Game UI
            DOM.stats.style.display = 'none';
            DOM.mainContent.style.display = 'none';
            DOM.cityNavigation.style.display = 'none';
            DOM.controls.classList.add('game-ended');
            DOM.endGameScreen.style.display = 'block';

            // Setup only essential listeners for end game screen
            DOM.restartButton.addEventListener('click', restartGame); // Will trigger reload
            DOM.darkModeButton.addEventListener('click', toggleDarkMode);

            Logger.info("Displaying end game screen based on loaded state. Normal init skipped.");
            return; // Stop further normal initialization
        }


        // --- Initial Setup for Active Game ---
        calculateTotalIncomeRate(); // Calculate initial income based on loaded/new state
        displayCityBuildings(); // Display buildings for the starting/loaded city
        updateUI(true); // Perform a full UI update

        // --- Setup Event Listeners ---
        DOM.modalCloseButton.addEventListener('click', closeModal);
        DOM.modalBuyButton.addEventListener('click', buyBuilding);
        DOM.modalWorkButton.addEventListener('click', workAtBuilding);
        DOM.modalUpgradeButton.addEventListener('click', upgradeBuilding);
        DOM.restartButton.addEventListener('click', restartGame); // Full Wipe Restart
        DOM.darkModeButton.addEventListener('click', toggleDarkMode);
        DOM.saveButton.addEventListener('click', () => saveGame(false)); // Manual Save
        DOM.prestigeButton.addEventListener('click', handlePrestigeClick); // Handles Prestige & Singularity
        DOM.prevCityButton.addEventListener('click', () => navigateCity(-1));
        DOM.nextCityButton.addEventListener('click', () => navigateCity(1));
        DOM.buildCityButton.addEventListener('click', buildCity);
        DOM.prestigeContinueButton.addEventListener('click', closePrestigeMenu); // Continue from prestige modal

        // Global click listener for closing building modal (but not prestige modal)
        window.addEventListener('click', (event) => {
            if (event.target === DOM.modal) closeModal();
        });
        // Prevent prestige modal closing on outside click
        DOM.prestigeModal.addEventListener('click', (event) => {
            if (event.target === DOM.prestigeModal) {
                event.stopPropagation(); // Stop click from reaching window listener
            }
        });


        // --- Start Game Loops ---
        // Clear any potentially orphaned intervals before starting new ones
        if (gameState.gameLoopIntervalId) clearInterval(gameState.gameLoopIntervalId);
        if (gameState.autoSaveIntervalId) clearInterval(gameState.autoSaveIntervalId);

        gameState.gameLoopIntervalId = setInterval(gameTick, CONFIG.GAME_TICK_INTERVAL_MS);
        gameState.autoSaveIntervalId = setInterval(() => saveGame(true), CONFIG.AUTO_SAVE_INTERVAL_MS);

        Logger.info("Grind Mindset initialized and running!");
    }

    // --- Start the game ---
    initGame();

}); // End DOMContentLoaded