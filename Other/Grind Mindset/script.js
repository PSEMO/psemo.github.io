document.addEventListener('DOMContentLoaded', () => {
    // --- Game State ---
    let playerMoney = 0; // starting money
    let totalIncomeRate = 0;
    let currentlyWorkingBuildingId = null;
    const gameTickInterval = 1000; // 1 second

    // --- Building Data ---
    // Will be generated dynamically now
    let buildings = []; // Initialize as empty array

    // --- Building Generation Parameters ---
    const gridWidth = 10;
    const gridHeight = 5; // Creates 500 building slots
    const buildingTypes = [
        { type: 'residential', color: 'green', basePrice: 300 * 500, priceRange: 500 * 500, baseRevenue: 5 * 500, revenueRange: 10 * 500, workBoost: 1.5, isWorkable: false, baseUpgradeCost: 150 * 500, upgradeCostMult: 1.15, upgradeRevInc: 2 * 500 },
        { type: 'commercial', color: 'blue', basePrice: 500 * 500, priceRange: 800 * 500, baseRevenue: 8 * 500, revenueRange: 15 * 500, workBoost: 1.6, isWorkable: true, baseUpgradeCost: 250 * 500, upgradeCostMult: 1.18, upgradeRevInc: 4 * 500 },
        { type: 'industrial', color: 'yellow', basePrice: 2000 * 500, priceRange: 3000 * 500, baseRevenue: 50 * 500, revenueRange: 70 * 500, workBoost: 1.8, isWorkable: false, baseUpgradeCost: 1000 * 500, upgradeCostMult: 1.20, upgradeRevInc: 15 * 500 },
        { type: 'logistics', color: 'purple', basePrice: 1500 * 500, priceRange: 2500 * 500, baseRevenue: 0.05, revenueRange: 0.05, workBoost: 0.03, isWorkable: false, baseUpgradeCost: 1200 * 500, upgradeCostMult: 1.22, upgradeRevInc: 0.01 }
    ];
    const workableChance = 0.3; // ~30% of commercial buildings might offer work initially

    // --- Function to Generate Buildings ---
    function generateBuildings() {
        const buildingData = [];
        let buildingIndex = 0;
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                buildingIndex++;
                const typeChoice = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
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
                    if (Math.random() < workableChance) {
                        isLooking = true;
                        workerPay = Math.floor(5 + Math.random() * 15 * 500); // Random pay between 5-20
                    } else {
                        workerPay = Math.floor(10 + Math.random() * 20 * 500); // Assign pay even if not looking now
                    }
                }


                buildingData.push({
                    id: uniqueId,
                    name: name,
                    type: typeChoice.type,
                    color: typeChoice.color,
                    price: price,
                    baseRevenue: baseRevenue, // This will be increased by upgrades
                    initialBaseRevenue: baseRevenue, // Store original for reference if needed
                    isOwned: false,
                    level: 1, // Start at level 1
                    upgradeBaseCost: Math.floor(typeChoice.baseUpgradeCost + Math.random() * typeChoice.baseUpgradeCost * 0.5), // Add variance
                    upgradeCostMultiplier: typeChoice.upgradeCostMult + (Math.random() - 0.5) * 0.04, // +/- 0.02 variance
                    upgradeRevenueIncrease: typeChoice.upgradeRevInc,
                    workBoostMultiplier: typeChoice.workBoost, // Boost multiplier when *you* work here (if owned)
                    isWorkable: typeChoice.isWorkable, // Can this type *ever* be worked at (for non-owners)?
                    isLookingForWorker: isLooking, // Is it currently offering work (for non-owners)?
                    workerPay: workerPay // Pay per click if working for non-owner
                });
            }
        }
        return buildingData;
    }


    // --- DOM References ---
    const gameArea = document.getElementById('game-area');
    const moneyEl = document.getElementById('money');
    const incomeRateEl = document.getElementById('income-rate');
    const currentWorkEl = document.getElementById('current-work');

    const modal = document.getElementById('building-modal');
    const modalBuildingName = document.getElementById('modal-building-name');
    const modalBuildingType = document.getElementById('modal-building-type');
    const modalBuildingLevel = document.getElementById('modal-building-level'); // New
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

    // Upgrade Modal Elements
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
        // Basic formatting, can be expanded (e.g., K, M, B for large numbers)
        return Math.floor(amount).toLocaleString();
    }
    function formatPercent(amount) {
        return (amount * 100).toFixed(1); // One decimal place for percentages
    }

    function updateBuildingVisuals() {
        buildings.forEach(building => {
            const buildingEl = document.getElementById(building.id);
            if (!buildingEl) return;

            // Clear previous indicators / Update Level
            buildingEl.classList.remove('working-indicator');
            const ownedIndicator = buildingEl.querySelector('.owned-indicator');
            if (ownedIndicator) ownedIndicator.remove();
            const levelIndicator = buildingEl.querySelector('.building-level');
            if (levelIndicator) levelIndicator.textContent = `Lvl ${building.level}`; // Update level display

            // Add 'Owned' indicator
            if (building.isOwned) {
                const indicator = document.createElement('span');
                indicator.classList.add('owned-indicator');
                indicator.textContent = 'Owned';
                buildingEl.appendChild(indicator);
                // Ensure level indicator is still visible if covered
                if (levelIndicator) levelIndicator.style.zIndex = '1';
            }

            // Add 'Working Here' indicator (border)
            if (building.id === currentlyWorkingBuildingId) {
                buildingEl.classList.add('working-indicator');
            }
        });
    }

    // Calculate the cost of the NEXT upgrade (from current level to level + 1)
    function calculateUpgradeCost(building) {
        if (!building) return Infinity;
        // Cost = Base * (Multiplier ^ (CurrentLevel - 1))
        return Math.floor(building.upgradeBaseCost * Math.pow(building.upgradeCostMultiplier, building.level - 1));
    }

    function calculateTotalIncomeRate() {
        let rate = 0;
        let totalPurpleBoost = 0;

        // Calculate boost from owned Purple buildings
        buildings.forEach(building => {
            if (building.isOwned && building.type === 'logistics') {
                let currentBoost = building.baseRevenue; // Base boost includes upgrades
                // Add extra boost if working at this purple building
                if (currentlyWorkingBuildingId === building.id) {
                    // Apply the work boost multiplier (which is an additive percentage for purple)
                    currentBoost += building.workBoostMultiplier * building.level; // Scale work boost slightly by level? Or keep static? Let's use static for now.
                    // currentBoost += building.workBoostMultiplier; // Simpler: Static work boost
                }
                totalPurpleBoost += currentBoost;
            }
        });

        // Calculate income from non-Purple buildings and apply boosts
        buildings.forEach(building => {
            if (building.isOwned && building.type !== 'logistics') {
                let buildingIncome = building.baseRevenue; // Base revenue already includes upgrades
                // Apply work boost if working at this specific building
                if (currentlyWorkingBuildingId === building.id) {
                    buildingIncome *= building.workBoostMultiplier;
                }
                // Apply total purple boost
                buildingIncome *= (1 + totalPurpleBoost);
                rate += buildingIncome;
            }
        });

        totalIncomeRate = rate;
        updateUI();
    }

    function updateUI() {
        moneyEl.textContent = formatMoney(playerMoney);
        incomeRateEl.textContent = formatMoney(totalIncomeRate);

        if (currentlyWorkingBuildingId) {
            const workingBuilding = findBuildingById(currentlyWorkingBuildingId);
            currentWorkEl.textContent = `Working: ${workingBuilding.name}`;
        } else {
            currentWorkEl.textContent = `Working: None`;
        }
        updateBuildingVisuals();
    }

    function openBuildingMenu(buildingId) {
        const building = findBuildingById(buildingId);
        if (!building) return;

        currentBuildingId = buildingId;

        modalBuildingName.textContent = building.name;
        modalBuildingType.textContent = building.type.charAt(0).toUpperCase() + building.type.slice(1);
        modalBuildingLevel.textContent = building.level; // Show current level
        modalBuildingPrice.textContent = formatMoney(building.price);

        // Display current revenue or boost (reflecting upgrades)
        let currentRevenue = building.baseRevenue;
        let benefitUnit = '/sec';
        let upgradeBenefitUnit = '/sec';
        if (building.type === 'logistics') {
            modalBuildingRevenue.textContent = `${formatPercent(currentRevenue)}%`;
            modalRevenueUnit.textContent = ' Boost';
            benefitUnit = '% Boost';
            upgradeBenefitUnit = '% Boost';
            modalUpgradeBenefit.textContent = formatPercent(building.upgradeRevenueIncrease);
        } else {
            modalBuildingRevenue.textContent = formatMoney(currentRevenue);
            modalRevenueUnit.textContent = '/sec';
            modalUpgradeBenefit.textContent = formatMoney(building.upgradeRevenueIncrease);
        }
        modalUpgradeBenefitUnit.textContent = upgradeBenefitUnit;


        // Worker Info Section
        if (!building.isOwned && building.isWorkable) {
            modalWorkerInfo.style.display = 'block';
            modalLookingWorker.textContent = building.isLookingForWorker ? 'Yes' : 'No';
            modalWorkerPay.textContent = formatMoney(building.workerPay);
        } else {
            modalWorkerInfo.style.display = 'none';
        }

        // Owned Message & Upgrade Section
        modalOwnedMessage.style.display = building.isOwned ? 'block' : 'none';
        modalUpgradeSection.style.display = building.isOwned ? 'block' : 'none';

        if (building.isOwned) {
            const nextUpgradeCost = calculateUpgradeCost(building);
            modalUpgradeCost.textContent = formatMoney(nextUpgradeCost);
            modalUpgradeButton.disabled = playerMoney < nextUpgradeCost;
        }


        // --- Configure Action Buttons ---
        modalBuyButton.disabled = building.isOwned || playerMoney < building.price;
        modalBuyButton.style.display = building.isOwned ? 'none' : 'inline-block';

        modalWorkButton.disabled = false;
        modalWorkButton.classList.remove('stop-working');
        modalWorkButton.textContent = "Work Here";

        if (building.isOwned) {
            modalWorkButton.style.display = 'inline-block';
            if (currentlyWorkingBuildingId === building.id) {
                modalWorkButton.textContent = "Stop Working";
                modalWorkButton.classList.add('stop-working');
            } else {
                let workText = "Work Here (Boost)";
                if (building.type === 'logistics') workText = `Work (Boost +${formatPercent(building.workBoostMultiplier)}%)`
                modalWorkButton.textContent = workText;
            }
        } else {
            if (building.isWorkable && building.isLookingForWorker) {
                modalWorkButton.style.display = 'inline-block';
                modalWorkButton.textContent = `Work (Earn $${formatMoney(building.workerPay)})`;
            } else {
                modalWorkButton.style.display = 'none';
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

        console.log(`Bought ${building.name} for $${formatMoney(building.price)}`);
        const buildingElement = document.getElementById(building.id);
        if (buildingElement) {
            const levelIndicator = buildingElement.querySelector('.building-level');
            if (levelIndicator) levelIndicator.textContent = `Lvl ${building.level}`; // Ensure level shows on buy
        }

        calculateTotalIncomeRate();
        updateUI(); // This now calls updateBuildingVisuals
        openBuildingMenu(currentBuildingId); // Refresh modal to show owned state & upgrade options
    }

    function workAtBuilding() {
        if (!currentBuildingId) return;
        const building = findBuildingById(currentBuildingId);
        if (!building) return;

        if (building.isOwned) {
            // Toggle working at OWNED building
            const previouslyWorkingId = currentlyWorkingBuildingId;
            if (currentlyWorkingBuildingId === building.id) {
                currentlyWorkingBuildingId = null;
                console.log(`Stopped working at ${building.name}`);
            } else {
                if (currentlyWorkingBuildingId) {
                    console.log(`Stopped working at ${findBuildingById(currentlyWorkingBuildingId).name} to start at ${building.name}`);
                }
                currentlyWorkingBuildingId = building.id;
                console.log(`Started working at owned ${building.name}`);
            }
            // Only recalculate if work status actually changed affecting rates
            if (previouslyWorkingId !== currentlyWorkingBuildingId) {
                calculateTotalIncomeRate(); // Recalculates income/boosts
                updateUI(); // Updates stats and visual indicators
            }
            openBuildingMenu(currentBuildingId); // Update modal buttons

        } else {
            // Working at NON-OWNED building (Click for pay)
            if (building.isWorkable && building.isLookingForWorker) {
                playerMoney += building.workerPay;
                console.log(`Worked at ${building.name} and earned $${formatMoney(building.workerPay)}`);
                updateUI(); // Update money display immediately
                // Optionally disable button for a short time to prevent spam clicking
                //modalWorkButton.disabled = true;
                //setTimeout(() => {
                //    // Re-enable if the modal is still open for the same building
                //    if (currentBuildingId === building.id) {
                //        const stillNeedsWorker = findBuildingById(building.id)?.isLookingForWorker; // Check again
                //        modalWorkButton.disabled = !stillNeedsWorker;
                //        if (!stillNeedsWorker) modalWorkButton.textContent = "Work (Not Hiring)";
                //    }
                //}, 250); // 500ms cooldown
            } else {
                console.log(`Cannot work at non-owned ${building.name} right now.`);
            }
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
            // Increase base revenue (or boost for logistics)
            building.baseRevenue += building.upgradeRevenueIncrease;

            console.log(`Upgraded ${building.name} to Level ${building.level} for $${formatMoney(cost)}`);

            calculateTotalIncomeRate(); // Recalculate income due to increased base revenue/boost
            updateUI(); // Updates money, rate, and building visuals (level)
            openBuildingMenu(currentBuildingId); // Refresh modal to show new level, cost, and button status
        } else {
            console.log(`Not enough money to upgrade ${building.name}. Need $${formatMoney(cost)}`);
        }
    }


    // --- Game Loop ---
    function gameTick() {
        playerMoney += totalIncomeRate;
        // No need to call updateUI() every single tick if income rate is stable
        // Only update money display directly for performance on potentially many buildings
        moneyEl.textContent = formatMoney(playerMoney);

        // Occasionally update button states in modal if open (e.g., can afford upgrade now)
        if (modal.style.display === 'block' && currentBuildingId) {
            const building = findBuildingById(currentBuildingId);
            if (building?.isOwned) {
                const nextUpgradeCost = calculateUpgradeCost(building);
                modalUpgradeButton.disabled = playerMoney < nextUpgradeCost;
                // Check buy button too? Not really necessary as it only enables/disables on open.
            }
        }

        // Maybe add random events here later (e.g., commercial building starts looking for worker)
    }

    // --- Initialization ---
    function createBuildingElement(building) {
        const div = document.createElement('div');
        div.id = building.id;
        div.classList.add('building', building.color);

        // Add Level Indicator Span
        const levelSpan = document.createElement('span');
        levelSpan.classList.add('building-level');
        levelSpan.textContent = `Lvl ${building.level}`; // Initial level
        div.appendChild(levelSpan);

        // Add Building Name Span
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('building-name');
        nameSpan.textContent = building.name;
        div.appendChild(nameSpan); // Append name at the bottom

        div.addEventListener('click', () => openBuildingMenu(building.id));
        return div;
    }

    function initGame() {
        // Generate the building data
        buildings = generateBuildings();
        console.log(`Generated ${buildings.length} buildings.`);

        // Create building elements
        gameArea.innerHTML = ''; // Clear any previous elements
        buildings.forEach(building => {
            const buildingEl = createBuildingElement(building);
            gameArea.appendChild(buildingEl);
        });

        // Initial UI setup
        calculateTotalIncomeRate(); // Calculate initial rate (should be 0)
        updateUI(); // Includes updateBuildingVisuals

        // Setup Modal Event Listeners
        closeModalButton.addEventListener('click', closeModal);
        modalBuyButton.addEventListener('click', buyBuilding);
        modalWorkButton.addEventListener('click', workAtBuilding);
        modalUpgradeButton.addEventListener('click', upgradeBuilding); // Add listener for upgrade

        window.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });

        // Start the game loop
        setInterval(gameTick, gameTickInterval);

        console.log("Grind Mindset game initialized!");
    }

    // Start the game
    initGame();
});