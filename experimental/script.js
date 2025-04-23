document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const SAVE_KEY = 'grindMindsetSaveData'; // Key for localStorage
    const AUTO_SAVE_INTERVAL = 10000; // Auto-save every 30 seconds (30000 ms)
    let autoSaveIntervalId = null; // To store the auto-save interval ID

    // --- Game State ---
    let playerMoney = 0; // starting money //TODO CHANGE TO 0
    let totalIncomeRate = 0;
    let currentlyWorkingBuildingId = null;
    let gameLoopIntervalId = null; // To store the interval ID for stopping/starting
    const gameTickInterval = 1000; // 1 second

    // --- Building Data ---
    let buildings = []; // Initialize as empty array

    // --- Building Generation Parameters ---
    const gridWidth = 10;
    const gridHeight = 5; // Creates 50 building slots (adjust if needed)
    const numBuildings = gridWidth * gridHeight; // Total buildings

    // Spawn Rate Percentages (MUST SUM TO 1.0)
    const residentialPossibility = 0.30;
    const commercialPossibility = 0.40; // Slightly higher chance for commercial
    const industrialPossibility = 0.20;
    const logisticsPossibility = 0.10;

    const buildingTypeDefinitions = [
        // Scaled base values - these might need adjustment based on game balance
        {
            type: 'residential', color: 'green',
            basePrice: 300000, priceRange: 300000 * 1.5, baseRevenue: 300000 / 500, revenueRange: 300000 / 500, workBoost: 1.5,
            isWorkable: false, baseUpgradeCost: 300000 / 2, upgradeCostMult: 1.15, upgradeRevInc: 2
        },
        {
            type: 'commercial', color: 'blue',
            basePrice: 100000, priceRange: 100000 * 1.5, baseRevenue: 100000 / 500, revenueRange: 100000 / 500, workBoost: 1.6,
            isWorkable: true, baseUpgradeCost: 100000 / 2, upgradeCostMult: 1.18, upgradeRevInc: 0.40
        },
        {
            type: 'industrial', color: 'yellow',
            basePrice: 1000000, priceRange: 1000000 * 1.5, baseRevenue: 1000000 / 500, revenueRange: 1000000 / 500, workBoost: 1.8,
            isWorkable: false, baseUpgradeCost: 1000000 / 2, upgradeCostMult: 1.20, upgradeRevInc: 15
        },
        {
            type: 'logistics', color: 'purple',
            basePrice: 2000000, priceRange: 2000000 * 1.5, baseRevenue: 0.10, revenueRange: 0.10, workBoost: 0.06,
            isWorkable: false, baseUpgradeCost: 2000000 / 2, upgradeCostMult: 1.22, upgradeRevInc: 0.02
        }
    ];
    // Chance for a commercial building to be initially available for work
    const canWorkPossibility = 0.7; // Use this variable

    // --- Function to Generate Buildings ---
    function generateBuildings() {
        const buildingData = [];
        let buildingIndex = 0;
        let hasWorkableCommercial = false; // Flag to track if we created one

        // Cumulative probabilities for weighted selection
        const cumulativeProbabilities = [
            residentialPossibility,
            residentialPossibility + commercialPossibility,
            residentialPossibility + commercialPossibility + industrialPossibility,
            residentialPossibility + commercialPossibility + industrialPossibility + logisticsPossibility // Should sum to 1
        ];

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                buildingIndex++;

                // Weighted random selection
                const rand = Math.random();
                let typeChoice;
                if (rand < cumulativeProbabilities[0]) {
                    typeChoice = buildingTypeDefinitions[0]; // Residential
                } else if (rand < cumulativeProbabilities[1]) {
                    typeChoice = buildingTypeDefinitions[1]; // Commercial
                } else if (rand < cumulativeProbabilities[2]) {
                    typeChoice = buildingTypeDefinitions[2]; // Industrial
                } else {
                    typeChoice = buildingTypeDefinitions[3]; // Logistics
                }

                const uniqueId = `${typeChoice.type.substring(0, 3)}${buildingIndex}`;
                let name = `${typeChoice.type.charAt(0).toUpperCase() + typeChoice.type.slice(1)} #${buildingIndex}`; // Simple name

                // Add more specific names (Optional Enhancement)
                if (typeChoice.type === 'residential') name = ['Apt', 'Duplex', 'Condo', 'House'][Math.floor(Math.random() * 4)] + ` #${buildingIndex}`;
                if (typeChoice.type === 'commercial') name = ['Shop', 'Office', 'Cafe', 'Store'][Math.floor(Math.random() * 4)] + ` #${buildingIndex}`;
                if (typeChoice.type === 'industrial') name = ['Factory', 'Plant', 'Mill', 'Works'][Math.floor(Math.random() * 4)] + ` #${buildingIndex}`;
                if (typeChoice.type === 'logistics') name = ['Depot', 'Hub', 'Storage', 'Center'][Math.floor(Math.random() * 4)] + ` #${buildingIndex}`;

                const price = Math.floor(typeChoice.basePrice + Math.random() * typeChoice.priceRange);
                let baseRevenue = typeChoice.baseRevenue + Math.random() * typeChoice.revenueRange;
                if (typeChoice.type !== 'logistics') baseRevenue = Math.floor(baseRevenue); // Keep non-boost whole numbers

                // Commercial specific work details
                let isLooking = false;
                let workerPay = 0;
                if (typeChoice.type === 'commercial' && typeChoice.isWorkable) {
                    // Use the canWorkPossibility variable here
                    if (Math.random() < canWorkPossibility) {
                        isLooking = true;
                        workerPay = Math.floor(150 + Math.random() * 150); // Random pay (scaled slightly)
                        hasWorkableCommercial = true; // Mark that we found one
                    } else {
                        // Assign pay even if not looking now, might become available later?
                        workerPay = Math.floor(200 + Math.random() * 200);
                    }
                }


                buildingData.push({
                    id: uniqueId,
                    name: name,
                    type: typeChoice.type,
                    color: typeChoice.color,
                    price: price,
                    baseRevenue: baseRevenue,
                    initialBaseRevenue: baseRevenue, // Store original for reset
                    isOwned: false,
                    level: 1,
                    upgradeBaseCost: Math.floor(typeChoice.baseUpgradeCost + Math.random() * typeChoice.baseUpgradeCost * 0.5),
                    upgradeCostMultiplier: typeChoice.upgradeCostMult + (Math.random() - 0.5) * 0.04,
                    upgradeRevenueIncrease: typeChoice.upgradeRevInc,
                    workBoostMultiplier: typeChoice.workBoost, // Boost multiplier when *you* work here (if owned)
                    isWorkable: typeChoice.isWorkable, // Can this type *ever* be worked at?
                    isLookingForWorker: isLooking, // Is it currently offering work?
                    workerPay: workerPay, // Pay per click if working for non-owner
                });
            }
        }

        // --- Guarantee at least one workable place ---
        if (!hasWorkableCommercial) {
            const commercialBuildings = buildingData.filter(b => b.type === 'commercial' && b.isWorkable);
            if (commercialBuildings.length > 0) {
                const chosenBuilding = commercialBuildings[Math.floor(Math.random() * commercialBuildings.length)]; // Pick a random commercial one
                chosenBuilding.isLookingForWorker = true;
                // Ensure it has non-zero pay if it didn't before
                if (chosenBuilding.workerPay <= 0) {
                    chosenBuilding.workerPay = Math.floor(5 + Math.random() * 15 * (numBuildings / 50));
                }
                //console.log(`Ensured at least one workable commercial building: ${chosenBuilding.name}`);
            } else {
                console.warn("Could not guarantee a workable commercial building - none were generated!");
            }
        }

        return buildingData;
    }


    // --- DOM References ---
    const gameArea = document.getElementById('game-area');
    const moneyEl = document.getElementById('money');
    const incomeRateEl = document.getElementById('income-rate');
    const currentWorkEl = document.getElementById('current-work');
    const saveStatusEl = document.getElementById('save-status'); // New Ref
    const bodyEl = document.body; // Reference to body for dark mode
    const restartButton = document.getElementById('restart-button');
    const darkModeButton = document.getElementById('dark-mode-button');
    const saveButton = document.getElementById('save-button'); // New Ref


    const modal = document.getElementById('building-modal');
    const modalBuildingName = document.getElementById('modal-building-name');
    const modalBuildingType = document.getElementById('modal-building-type');
    const modalBuildingLevel = document.getElementById('modal-building-level');
    const modalBuildingPrice = document.getElementById('modal-building-price');
    const modalBuildingRevenue = document.getElementById('modal-building-revenue');
    const modalRevenueUnit = document.getElementById('modal-revenue-unit');
    const modalWorkerInfo = document.getElementById('modal-worker-info');
    const modalLookingWorker = document.getElementById('modal-looking-worker');
    const modalWorkerPay = document.getElementById('modal-worker-pay');
    const modalBuyButton = document.getElementById('modal-buy-button');
    const modalWorkButton = document.getElementById('modal-work-button');
    const modalOwnedMessage = document.getElementById('modal-owned-message');
    const closeModalButton = document.querySelector('.close-button');
    const modalUpgradeSection = document.getElementById('modal-upgrade-section');
    const modalUpgradeCost = document.getElementById('modal-upgrade-cost');
    const modalUpgradeBenefit = document.getElementById('modal-upgrade-benefit');
    const modalUpgradeBenefitUnit = document.getElementById('modal-upgrade-benefit-unit');
    const modalUpgradeButton = document.getElementById('modal-upgrade-button');

    let currentBuildingId = null;

    // --- Functions ---

    function findBuildingById(id) {
        return buildings.find(b => b.id === id);
    }

    function formatMoney(amount) {
        if (amount < 1 && amount > 0) {
            return amount.toFixed(2); // Show decimals for small amounts
        }
        return Math.floor(amount).toLocaleString();
    }
    function formatPercent(amount) {
        return (amount * 100).toFixed(1); // One decimal place for percentages
    }

    function updateBuildingVisuals() {
        buildings.forEach(building => {
            const buildingEl = document.getElementById(building.id);
            if (!buildingEl) return;

            buildingEl.classList.remove('working-indicator');
            // Remove existing owned indicator before potentially adding a new one
            const existingOwnedIndicator = buildingEl.querySelector('.owned-indicator');
            if (existingOwnedIndicator) existingOwnedIndicator.remove();

            const levelIndicator = buildingEl.querySelector('.building-level');
            if (levelIndicator) levelIndicator.textContent = `Lvl ${building.level}`;

            if (building.isOwned) {
                const indicator = document.createElement('span');
                indicator.classList.add('owned-indicator');
                indicator.textContent = 'Owned';
                buildingEl.appendChild(indicator);
                if (levelIndicator) levelIndicator.style.zIndex = '0'; // Make sure level is behind owned text
            }

            if (building.id === currentlyWorkingBuildingId) {
                buildingEl.classList.add('working-indicator');
            }
        });
    }

    function calculateUpgradeCost(building) {
        if (!building) return Infinity;
        return Math.floor(building.upgradeBaseCost * Math.pow(building.upgradeCostMultiplier, building.level - 1));
    }

    function calculateTotalIncomeRate() {
        let rate = 0;
        let totalPurpleBoost = 0;

        buildings.forEach(building => {
            if (building.isOwned && building.type === 'logistics') {
                let currentBoost = building.baseRevenue; // Base boost includes upgrades
                if (currentlyWorkingBuildingId === building.id) {
                    // Logistics boost is additive percentage based on its *specific* workBoostMultiplier
                    currentBoost += building.workBoostMultiplier; // Use the stored multiplier directly
                }
                totalPurpleBoost += currentBoost;
            }
        });

        buildings.forEach(building => {
            if (building.isOwned && building.type !== 'logistics') {
                let buildingIncome = building.baseRevenue; // Base revenue includes upgrades
                if (currentlyWorkingBuildingId === building.id) {
                    // Apply multiplicative boost for non-logistics
                    buildingIncome *= building.workBoostMultiplier;
                }
                // Apply total purple boost multiplicatively
                buildingIncome *= (1 + totalPurpleBoost);
                rate += buildingIncome;
            }
        });

        totalIncomeRate = rate;
        // No updateUI here, called separately or by game loop
    }

    function updateUI(fullUpdate = true) {
        moneyEl.textContent = formatMoney(playerMoney);
        if (fullUpdate) { // Only update rate/work status if needed
            incomeRateEl.textContent = formatMoney(totalIncomeRate); // Use formatMoney
            if (currentlyWorkingBuildingId) {
                const workingBuilding = findBuildingById(currentlyWorkingBuildingId);
                // Check if building still exists (might happen briefly during restart)
                currentWorkEl.textContent = workingBuilding ? `Working: ${workingBuilding.name}` : 'Working: None';
            } else {
                currentWorkEl.textContent = `Working: None`;
            }
            updateBuildingVisuals(); // Update owned/working indicators
        }
    }


    function openBuildingMenu(buildingId) {
        const building = findBuildingById(buildingId);
        if (!building) return;

        currentBuildingId = buildingId; // Set this regardless of modal display state

        modalBuildingName.textContent = building.name;
        modalBuildingType.textContent = building.type.charAt(0).toUpperCase() + building.type.slice(1);
        modalBuildingLevel.textContent = building.level;
        modalBuildingPrice.textContent = formatMoney(building.price);

        let currentRevenue = building.baseRevenue;
        let benefitUnit = '/sec';
        let upgradeBenefitUnit = '/sec';
        let upgradeBenefitValue = building.upgradeRevenueIncrease;

        if (building.type === 'logistics') {
            modalBuildingRevenue.textContent = `${formatPercent(currentRevenue)}`;
            modalRevenueUnit.textContent = '% Boost';
            benefitUnit = '% Boost';
            upgradeBenefitUnit = '% Boost';
            modalUpgradeBenefit.textContent = formatPercent(upgradeBenefitValue); // Format upgrade %
        } else {
            modalBuildingRevenue.textContent = formatMoney(currentRevenue);
            modalRevenueUnit.textContent = '/sec';
            modalUpgradeBenefit.textContent = formatMoney(upgradeBenefitValue); // Format upgrade $
        }
        modalUpgradeBenefitUnit.textContent = upgradeBenefitUnit;

        if (!building.isOwned && building.isWorkable) {
            modalWorkerInfo.style.display = 'block';
            modalLookingWorker.textContent = building.isLookingForWorker ? 'Yes' : 'No';
            modalWorkerPay.textContent = formatMoney(building.workerPay);
        } else {
            modalWorkerInfo.style.display = 'none';
        }

        modalOwnedMessage.style.display = building.isOwned ? 'block' : 'none';
        modalUpgradeSection.style.display = building.isOwned ? 'block' : 'none';

        if (building.isOwned) {
            const nextUpgradeCost = calculateUpgradeCost(building);
            modalUpgradeCost.textContent = formatMoney(nextUpgradeCost);
            modalUpgradeButton.disabled = playerMoney < nextUpgradeCost;
        }

        modalBuyButton.disabled = building.isOwned || playerMoney < building.price;
        modalBuyButton.style.display = building.isOwned ? 'none' : 'inline-block';

        modalWorkButton.disabled = false; // Reset disabled state
        modalWorkButton.classList.remove('stop-working');
        modalWorkButton.textContent = "Work Here";

        if (building.isOwned) {
            modalWorkButton.style.display = 'inline-block';
            if (currentlyWorkingBuildingId === building.id) {
                modalWorkButton.textContent = "Stop Working";
                modalWorkButton.classList.add('stop-working');
            } else {
                let workText = "Work Here (Boost Income)";
                // Provide more specific boost info
                if (building.type === 'logistics') {
                    workText = `Work (Boost Rate +${formatPercent(building.workBoostMultiplier)}%)`;
                } else {
                    workText = `Work (Boost Income x${building.workBoostMultiplier.toFixed(1)})`;
                }
                modalWorkButton.textContent = workText;
            }
        } else { // Not owned
            if (building.isWorkable && building.isLookingForWorker) {
                modalWorkButton.style.display = 'inline-block';
                modalWorkButton.textContent = `Work (Earn $${formatMoney(building.workerPay)})`;
                modalWorkButton.disabled = false; // Ensure enabled if looking
            } else {
                // Hide or disable button if not looking for worker
                modalWorkButton.style.display = 'inline-block'; // Keep visible
                modalWorkButton.textContent = "Cannot Work Here";
                modalWorkButton.disabled = true; // Disable it
                // Alternatively hide: modalWorkButton.style.display = 'none';
            }
        }

        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
        currentBuildingId = null;
    }

    function buyBuilding() {
        if (!currentBuildingId) return;
        const building = findBuildingById(currentBuildingId);
        if (!building || building.isOwned || playerMoney < building.price) return;

        playerMoney -= building.price;
        building.isOwned = true;
        increaseAllBuildingPrices();

        //console.log(`Bought ${building.name} for $${formatMoney(building.price)}`);

        calculateTotalIncomeRate(); // Update rates now that building is owned
        updateUI(true); // Full UI update needed
        openBuildingMenu(currentBuildingId); // Refresh modal
    }

    function increaseAllBuildingPrices() {
        const inflationRate = 1.075;
        console.log(`Applying building price inflation (Rate: x${inflationRate})...`);

        let buildingsAffected = 0;
        buildings.forEach(building => {
            // You might only want to increase the price of buildings NOT yet owned,
            // or maybe all of them for future purchases or balancing.
            // Let's assume we increase *all* base prices for simplicity as requested.

            const oldPrice = building.price;
            const newPrice = Math.floor(oldPrice * inflationRate);

            // Prevent price from becoming zero or less if it started very low
            building.price = Math.max(1, newPrice);

            if (building.price !== oldPrice) {
                buildingsAffected++;
                // Optional: Log individual changes for debugging
                // console.log(` - ${building.name} price: $${oldPrice} -> $${building.price}`);
            }
        });

        console.log(`Inflation applied. ${buildingsAffected} building prices potentially updated.`);

        // --- Crucial: Update UI if Modal is Open ---
        // If a building's menu is currently open, we need to refresh
        // the price displayed in the modal.
        if (modal.style.display === 'block' && currentBuildingId) {
            const currentlyViewedBuilding = findBuildingById(currentBuildingId);
            if (currentlyViewedBuilding) {
                // Refresh the relevant parts of the open modal
                modalBuildingPrice.textContent = formatMoney(currentlyViewedBuilding.price);
                // Re-check if the player can now afford it (or can no longer afford it)
                modalBuyButton.disabled = currentlyViewedBuilding.isOwned || playerMoney < currentlyViewedBuilding.price;
                console.log(`Refreshed open modal price for ${currentlyViewedBuilding.name}.`);
            }
        }
    }

    function workAtBuilding() {
        if (!currentBuildingId) return;
        const building = findBuildingById(currentBuildingId);
        if (!building) return;

        const wasWorkingId = currentlyWorkingBuildingId; // Store previous state

        if (building.isOwned) {
            // Toggle working at OWNED building
            if (currentlyWorkingBuildingId === building.id) {
                currentlyWorkingBuildingId = null; // Stop working
                //console.log(`Stopped working at ${building.name}`);
            } else {
                if (currentlyWorkingBuildingId) {
                    //console.log(`Stopped working at ${findBuildingById(currentlyWorkingBuildingId)?.name || 'previous location'}`);
                }
                currentlyWorkingBuildingId = building.id; // Start working here
                //console.log(`Started working at owned ${building.name}`);
            }
        } else {
            // Working at NON-OWNED building (Click for pay)
            if (building.isWorkable && building.isLookingForWorker) {
                playerMoney += building.workerPay;
                //console.log(`Worked at ${building.name} and earned $${formatMoney(building.workerPay)}`);
                updateUI(false); // Only update money display
                // No need to update income rate or building visuals for non-owned work click
                // Optional: add cooldown here if desired
            } else {
                //console.log(`Cannot work at non-owned ${building.name} right now.`);
                return; // Exit early if cannot work
            }
        }

        // Only recalculate and update visuals if work *status* changed income rate
        if (building.isOwned && wasWorkingId !== currentlyWorkingBuildingId) {
            calculateTotalIncomeRate();
            updateUI(true); // Full update including visuals
        } else if (!building.isOwned) {
            // If working at non-owned, just update the button state in modal
            openBuildingMenu(currentBuildingId);
            return; // No need for full UI update
        }

        // Refresh modal after state change (owned buildings only)
        if (building.isOwned) {
            openBuildingMenu(currentBuildingId);
        }
    }


    function upgradeBuilding() {
        if (!currentBuildingId) return;
        const building = findBuildingById(currentBuildingId);
        if (!building || !building.isOwned) return;

        const cost = calculateUpgradeCost(building);

        if (playerMoney >= cost) {
            playerMoney -= cost;
            building.level++;
            building.baseRevenue += building.upgradeRevenueIncrease; // Increase base revenue/boost

            //console.log(`Upgraded ${building.name} to Level ${building.level} for $${formatMoney(cost)}`);

            calculateTotalIncomeRate(); // Recalculate income
            updateUI(true); // Update everything
            openBuildingMenu(currentBuildingId); // Refresh modal
        } else {
            //console.log(`Not enough money to upgrade ${building.name}. Need $${formatMoney(cost)}`);
            // Maybe flash the cost red briefly? (UI enhancement)
        }
    }

    // --- Game Loop ---
    function gameTick() {
        playerMoney += totalIncomeRate;
        updateUI(false); // Update only money display per tick for performance

        // Occasionally update button states in modal if open
        if (modal.style.display === 'block' && currentBuildingId) {
            const building = findBuildingById(currentBuildingId);
            if (building?.isOwned) {
                const nextUpgradeCost = calculateUpgradeCost(building);
                modalUpgradeButton.disabled = playerMoney < nextUpgradeCost;
            }
            // Also check if buy button should be enabled/disabled if player gains enough money
            if (building && !building.isOwned) {
                modalBuyButton.disabled = playerMoney < building.price;
            }
        }
    }

    // --- Dark Mode ---
    function toggleDarkMode() {
        bodyEl.classList.toggle('dark-mode');
        // Save preference to localStorage
        if (bodyEl.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            //console.log("Dark Mode Enabled");
        } else {
            localStorage.setItem('darkMode', 'disabled');
            //console.log("Dark Mode Disabled");
        }
    }

    // --- Initialization ---
    function createBuildingElement(building) {
        const div = document.createElement('div');
        div.id = building.id;
        div.classList.add('building', building.color);

        const levelSpan = document.createElement('span');
        levelSpan.classList.add('building-level');
        levelSpan.textContent = `Lvl ${building.level}`;
        div.appendChild(levelSpan);

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('building-name');
        nameSpan.textContent = building.name;
        div.appendChild(nameSpan); // Name at bottom

        div.addEventListener('click', () => openBuildingMenu(building.id));
        return div;
    }

    function initGame() {
        //console.log("Initializing Grind Mindset game...");
        // Check for dark mode preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            bodyEl.classList.add('dark-mode');
        }

        // Generate the building data
        buildings = generateBuildings();
        //console.log(`Generated ${buildings.length} buildings.`);

        // Create building elements
        gameArea.innerHTML = ''; // Clear any previous elements
        buildings.forEach(building => {
            const buildingEl = createBuildingElement(building);
            gameArea.appendChild(buildingEl);
        });

        // Setup Event Listeners
        closeModalButton.addEventListener('click', closeModal);
        modalBuyButton.addEventListener('click', buyBuilding);
        modalWorkButton.addEventListener('click', workAtBuilding);
        modalUpgradeButton.addEventListener('click', upgradeBuilding);
        restartButton.addEventListener('click', restartGame);
        darkModeButton.addEventListener('click', toggleDarkMode);

        // Close modal if clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });

        // Initial UI setup and start loop
        calculateTotalIncomeRate();
        updateUI(true); // Full initial UI update
        gameLoopIntervalId = setInterval(gameTick, gameTickInterval); // Start the loop

        //console.log("Grind Mindset game initialized!");
    }

    // --- Saving and Loading ---

    let saveStatusTimeout; // To manage the visibility of the save status message
    function showSaveStatus(message) {
        saveStatusEl.textContent = message;
        saveStatusEl.classList.add('visible');

        // Clear any previous timeout to avoid premature fading
        if (saveStatusTimeout) clearTimeout(saveStatusTimeout);

        // Set a timeout to hide the message after a few seconds
        saveStatusTimeout = setTimeout(() => {
            saveStatusEl.classList.remove('visible');
        }, 3000); // Hide after 3 seconds
    }

    function saveGame(isAutoSave = false) {
        try {
            const saveData = {
                playerMoney: playerMoney,
                currentlyWorkingBuildingId: currentlyWorkingBuildingId,
                buildings: buildings, // Save the entire buildings array
                saveTimestamp: Date.now()
            };

            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

            const message = isAutoSave ? 'Game auto-saved.' : 'Game Saved!';
            showSaveStatus(message);
            // //console.log(message); // Keep for debugging if needed

        } catch (error) {
            console.error("Error saving game:", error);
            showSaveStatus("Error saving game!");
            // Could potentially notify the user more prominently if saving fails
            if (error.name === 'QuotaExceededError') {
                alert("Error saving game: Local storage is full. Please clear some space or try a different browser.");
            }
        }
    }

    function loadGame() {
        const savedDataString = localStorage.getItem(SAVE_KEY);
        if (savedDataString) {
            try {
                const savedData = JSON.parse(savedDataString);

                // Restore game state
                playerMoney = savedData.playerMoney || 0;
                currentlyWorkingBuildingId = savedData.currentlyWorkingBuildingId || null;
                buildings = savedData.buildings || []; // Load saved buildings

                if (buildings.length === 0) {
                    console.warn("Loaded save data but buildings array was empty. Starting fresh.");
                    return false; // Treat as no save found if buildings are missing
                }

                // --- CRITICAL: Rebuild DOM from loaded data ---
                gameArea.innerHTML = ''; // Clear existing generated elements
                buildings.forEach(building => {
                    const buildingEl = createBuildingElement(building); // Create elements based on LOADED data
                    gameArea.appendChild(buildingEl);
                });
                // --- End DOM Rebuild ---

                calculateTotalIncomeRate(); // Recalculate based on loaded state
                updateUI(true); // Update display with loaded state

                //console.log("Game loaded successfully from save data.");
                showSaveStatus("Game loaded.");
                return true; // Indicate successful load

            } catch (error) {
                console.error("Error parsing saved game data:", error);
                localStorage.removeItem(SAVE_KEY); // Clear corrupted data
                showSaveStatus("Error loading save. Starting new game.");
                return false; // Indicate load failure
            }
        }
        return false; // No save data found
    }

    // --- Restart Game (Modified) ---
    function restartGame() {
        if (!confirm("Are you sure you want to restart? All progress will be lost (including saved data).")) {
            //console.log("Restart cancelled by user.");
            return;
        }

        //console.log("Restarting game...");
        // Stop loops
        if (gameLoopIntervalId) clearInterval(gameLoopIntervalId);
        if (autoSaveIntervalId) clearInterval(autoSaveIntervalId); // Stop auto-save too
        gameLoopIntervalId = null;
        autoSaveIntervalId = null;

        closeModal();

        // Reset player state
        playerMoney = 0;
        totalIncomeRate = 0;
        currentlyWorkingBuildingId = null;

        // --- Clear Save Data ---
        localStorage.removeItem(SAVE_KEY);
        //console.log("Cleared saved game data.");
        showSaveStatus("Game Reset. Save cleared.");
        // --- End Clear Save ---

        // Regenerate buildings
        //console.log("Generating new buildings...");
        buildings = generateBuildings();
        gameArea.innerHTML = '';
        buildings.forEach(building => {
            const buildingEl = createBuildingElement(building);
            gameArea.appendChild(buildingEl);
        });
        //console.log(`Generated and displayed ${buildings.length} new buildings.`);

        calculateTotalIncomeRate();
        updateUI(true);

        // Restart loops
        gameLoopIntervalId = setInterval(gameTick, gameTickInterval);
        autoSaveIntervalId = setInterval(() => saveGame(true), AUTO_SAVE_INTERVAL); // Restart auto-save
        //console.log("Game restarted successfully with new buildings.");
    }

    // --- Initialization (Modified) ---
    function createBuildingElement(building) {
        // ... (keep existing element creation logic) ...
        const div = document.createElement('div');
        div.id = building.id;
        div.classList.add('building', building.color);

        const levelSpan = document.createElement('span');
        levelSpan.classList.add('building-level');
        levelSpan.textContent = `Lvl ${building.level}`;
        div.appendChild(levelSpan);

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('building-name');
        nameSpan.textContent = building.name;
        div.appendChild(nameSpan);

        // Make sure clicks still work after loading
        div.addEventListener('click', () => openBuildingMenu(building.id));
        return div;
    }

    function initGame() {
        //console.log("Initializing Grind Mindset game...");

        // Check dark mode preference (already handled)
        if (localStorage.getItem('darkMode') === 'enabled') {
            bodyEl.classList.add('dark-mode');
        }

        // --- Try Loading Game First ---
        let loaded = false;
        try {
            loaded = loadGame();
        } catch (error) {
            console.error("Critical error during game load:", error);
            // Attempt to clear potentially bad save data and start fresh
            localStorage.removeItem(SAVE_KEY);
            showSaveStatus("Load error. Starting fresh.");
            loaded = false;
        }
        // --- End Load Attempt ---


        if (!loaded) {
            // If load failed or no save exists, generate fresh game
            //console.log("No valid save found or load failed. Starting a new game.");
            playerMoney = 0; // Ensure reset if load failed partially
            currentlyWorkingBuildingId = null;
            buildings = generateBuildings();
            //console.log(`Generated ${buildings.length} new buildings.`);

            // Create building elements for the *new* game
            gameArea.innerHTML = ''; // Clear just in case
            buildings.forEach(building => {
                const buildingEl = createBuildingElement(building);
                gameArea.appendChild(buildingEl);
            });

            calculateTotalIncomeRate(); // Calculate for the new game
            updateUI(true); // Display the new game state
        }
        // If loaded successfully, loadGame() already rebuilt the DOM and updated UI

        // Setup Event Listeners (always needed)
        closeModalButton.addEventListener('click', closeModal);
        modalBuyButton.addEventListener('click', buyBuilding);
        modalWorkButton.addEventListener('click', workAtBuilding);
        modalUpgradeButton.addEventListener('click', upgradeBuilding);
        restartButton.addEventListener('click', restartGame);
        darkModeButton.addEventListener('click', toggleDarkMode);
        saveButton.addEventListener('click', () => saveGame(false)); // Manual save

        window.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });

        // Start/Restart Game Loops
        if (gameLoopIntervalId) clearInterval(gameLoopIntervalId);
        if (autoSaveIntervalId) clearInterval(autoSaveIntervalId);

        gameLoopIntervalId = setInterval(gameTick, gameTickInterval);
        autoSaveIntervalId = setInterval(() => saveGame(true), AUTO_SAVE_INTERVAL); // Start auto-save

        //console.log("Grind Mindset game initialized and running!");
        if (loaded) {
            //console.log(`Resumed game from save dated: ${new Date(JSON.parse(localStorage.getItem(SAVE_KEY) || '{}').saveTimestamp || Date.now()).toLocaleString()}`);
        }
    }

    // Start the game
    initGame();
});