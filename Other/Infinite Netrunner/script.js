document.addEventListener('DOMContentLoaded', () => {

    const ICE_PENALTY_PERCENTAGE = 25;
    const MAX_CHALLENGE_USES = 3;
    const NODE_BASE_INCOME_VALUE = 5;

    const challenges = [
        // Layer 0
        {
            id: "sum_two_numbers_l0", layer: 0, description: "Print the sum of the two numbers.",
            starterFunction: function () { this.challengeInput = [Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 20) + 1]; this.expectedPrint = this.challengeInput[0] + this.challengeInput[1]; }
        },
        {
            id: "reverse_string_l0", layer: 0, description: "Print the reverse of the given string.",
            starterFunction: function () { const g = (l, c = "abcdefghij") => [...Array(l)].map(_ => c[Math.random() * c.length | 0]).join(''); this.challengeInput = g(Math.floor(Math.random() * 5) + 5); this.expectedPrint = this.challengeInput.split('').reverse().join(''); }
        },
        {
            id: "sum_string_numbers_l0", layer: 0, description: "Two strings representing numbers are provided. Print their sum as a number.",
            starterFunction: function () { const n1 = Math.floor(Math.random() * 50) + 1; const n2 = Math.floor(Math.random() * 50) + 1; this.challengeInput = [String(n1), String(n2)]; this.expectedPrint = n1 + n2; }
        },
        {
            id: "string_length_l0", layer: 0, description: "Print the length of the given string.",
            starterFunction: function () { const g = (l, c = "KlMnOpQrStU") => [...Array(l)].map(_ => c[Math.random() * c.length | 0]).join(''); this.challengeInput = g(Math.floor(Math.random() * 10) + 3); this.expectedPrint = this.challengeInput.length; }
        },
        // Layer 1
        {
            id: "array_sum_l1", layer: 1, description: "An array of numbers is provided. Print the sum of all elements.",
            starterFunction: function () { const len = Math.floor(Math.random() * 4) + 3; this.challengeInput = Array.from({ length: len }, () => Math.floor(Math.random() * 10) + 1); this.expectedPrint = this.challengeInput.reduce((s, n) => s + n, 0); }
        },
        {
            id: "array_max_l1", layer: 1, description: "An array of numbers is provided. Print the largest number in the array.",
            starterFunction: function () { const len = Math.floor(Math.random() * 4) + 3; this.challengeInput = Array.from({ length: len }, () => Math.floor(Math.random() * 100) + 1); this.expectedPrint = Math.max(...this.challengeInput); }
        },
        {
            id: "string_uppercase_l1", layer: 1, description: "A string is provided. Print it in uppercase.",
            starterFunction: function () { const g = (l, c = "testcase") => [...Array(l)].map(_ => c[Math.random() * c.length | 0]).join(''); this.challengeInput = g(Math.floor(Math.random() * 6) + 4); this.expectedPrint = this.challengeInput.toUpperCase(); }
        },
        // Layer 2
        {
            id: "array_concat_strings_l2", layer: 2, description: "An array of strings is provided. Print a single string that is the concatenation of all elements.",
            starterFunction: function () { const g = (l, c = "xyz123") => [...Array(l)].map(_ => c[Math.random() * c.length | 0]).join(''); const len = Math.floor(Math.random() * 3) + 2; this.challengeInput = Array.from({ length: len }, () => g(Math.floor(Math.random() * 3) + 2)); this.expectedPrint = this.challengeInput.join(''); }
        },
        {
            id: "object_product_l2", layer: 2, description: "An object with 'x' and 'y' properties (numbers) is provided. Print the product of x and y.",
            starterFunction: function () { const x = Math.floor(Math.random() * 10) + 1; const y = Math.floor(Math.random() * 10) + 1; this.challengeInput = { x: x, y: y, z: Math.random() }; this.expectedPrint = x * y; }
        },
        {
            id: "sentence_word_count_l2", layer: 2, description: "A sentence (string) is provided. Count how many words it contains (words are separated by single spaces). Print the count.",
            starterFunction: function () { const w = ["net", "run", "hack", "node", "ice"]; let s = ""; const nw = Math.floor(Math.random() * 3) + 2; for (let i = 0; i < nw; i++) { s += w[Math.floor(Math.random() * w.length)] + (i < nw - 1 ? " " : ""); } this.challengeInput = s; this.expectedPrint = nw; }
        },
        // Layer 3
        {
            id: "object_get_target_l3", layer: 3, description: "An object `v` has a property `targetValue`. Print its value.",
            starterFunction: function () {
                const p = ["alpha", "beta", "gamma"]; const v = [101, "critical", true, null]; this.challengeInput = {};
                this.challengeInput.targetValue = v[Math.floor(Math.random() * v.length)];
                this.challengeInput[p[Math.floor(Math.random() * p.length)]] = v[Math.floor(Math.random() * v.length)]; // Decoy
                this.expectedPrint = this.challengeInput.targetValue;
            }
        },
        {
            id: "array_filter_even_l3", layer: 3, description: "An array of numbers `v` is provided. Print a new array (as a string) containing only the even numbers from `v`.",
            starterFunction: function () {
                const len = Math.floor(Math.random() * 5) + 5; this.challengeInput = Array.from({ length: len }, () => Math.floor(Math.random() * 20));
                this.expectedPrint = JSON.stringify(this.challengeInput.filter(n => n % 2 === 0));
            }
        },
        {
            id: "number_sign_l3", layer: 3, description: "A number `v` is provided. Print 'positive', 'negative', or 'zero'.",
            starterFunction: function () {
                const r = Math.random();
                if (r < 0.45) this.challengeInput = Math.floor(Math.random() * 20) + 1; else if (r < 0.9) this.challengeInput = Math.floor(Math.random() * -20) - 1; else this.challengeInput = 0;
                if (this.challengeInput > 0) this.expectedPrint = "positive"; else if (this.challengeInput < 0) this.expectedPrint = "negative"; else this.expectedPrint = "zero";
            }
        },
        // Layer 4
        {
            id: "string_pad_start_l4", layer: 4, description: "Given string `v`, print it padded with '*' at the start to length 10. If 10+ chars, print original.",
            starterFunction: function () {
                const g = (l, c = "data") => [...Array(l)].map(_ => c[Math.random() * c.length | 0]).join(''); const len = Math.floor(Math.random() * 12) + 3; this.challengeInput = g(len);
                this.expectedPrint = this.challengeInput.length < 10 ? this.challengeInput.padStart(10, '*') : this.challengeInput;
            }
        },
        {
            id: "array_sum_first_three_l4", layer: 4, description: "Array `v` has numbers. Print sum of first 3 elements (or all if <3 elements).",
            starterFunction: function () {
                const len = Math.floor(Math.random() * 5) + 1; this.challengeInput = Array.from({ length: len }, () => Math.floor(Math.random() * 10));
                this.expectedPrint = this.challengeInput.slice(0, 3).reduce((s, n) => s + n, 0);
            }
        },
        {
            id: "object_key_exists_l4", layer: 4, description: "Object `v` is given. Print `true` if it has a key named 'secret', else `false`.",
            starterFunction: function () {
                this.challengeInput = { data: 1, info: "test" };
                const hasSecret = Math.random() > 0.5;
                if (hasSecret) this.challengeInput.secret = "found";
                this.expectedPrint = hasSecret;
            }
        },
    ];

    const UPGRADE_DEFINITIONS = [
        {
            id: 'income_boost_1', name: 'ICE Flow Optimizer v1', description: 'Increases all ICE income by 10%.',
            cost: 100, maxPurchases: 1, effect: (gs) => { gs.incomeMultiplier = (gs.incomeMultiplier || 1) * 1.10; },
            isAvailable: (gs) => true,
        },
        {
            id: 'income_boost_2', name: 'ICE Flow Optimizer v2', description: 'Increases all ICE income by an additional 15%.',
            cost: 500, maxPurchases: 1, effect: (gs) => { gs.incomeMultiplier = (gs.incomeMultiplier || 1) * 1.15; },
            isAvailable: (gs) => gs.upgradesPurchased && gs.upgradesPurchased['income_boost_1'],
        },
        {
            id: 'sonar_capacity_1', name: 'Wide-Band Sonar Emitter', description: 'Increases max scannable nodes on sonar by 1.',
            cost: 150, maxPurchases: 3, effect: (gs) => { gs.maxNodesOnSonar = (gs.maxNodesOnSonar || 5) + 1; },
            isAvailable: (gs) => true,
        },
        {
            id: 'layer_insight_1', name: 'Pattern Recognition Subroutines', description: 'Reduces hacks needed for next layer by 1 (min 1).',
            cost: 300, maxPurchases: 2, effect: (gs) => { gs.hacksToAdvanceLayer = Math.max(1, (gs.hacksToAdvanceLayer || 3) - 1); },
            isAvailable: (gs) => gs.currentLayer >= 1,
        }
    ];

    const gameState = {
        currentLayer: 0,
        ownedNodes: 0,
        incomeRate: 0,
        currentICE: 50,
        activeHack: null,
        maxNodesOnSonar: 5,
        nodesOnSonar: [],
        nodeCounter: 0,
        hacksThisLayer: 0,
        hacksToAdvanceLayer: 2,
        challengeUsageCount: {},
        upgradesPurchased: {},
        incomeMultiplier: 1
    };

    const SH = (id) => document.getElementById(id);
    const currentLayerEl = SH('currentLayer'), ownedNodesEl = SH('ownedNodes'), incomeRateEl = SH('incomeRate'),
        currentICEEl = SH('currentICE'), sonarDisplay = SH('sonarDisplay'), scanButton = SH('scanButton'),
        challengeArea = SH('challengeArea'), nodeIdDisplayEl = SH('nodeIdDisplay'),
        challengeDescriptionEl = SH('challengeDescription'), challengeVariablesEl = SH('challengeVariables'),
        userCodeEl = SH('userCode'), runHackButton = SH('runHackButton'), abortHackButton = SH('abortHackButton'),
        toggleUpgradesButton = SH('toggleUpgradesButton'), iceForUpgradesDisplayEl = SH('iceForUpgradesDisplay'),
        upgradesPanel = SH('upgradesPanel'), upgradesListEl = SH('upgradesList'),
        closeUpgradesButton = SH('closeUpgradesButton'),
        hackResultAreaEl = SH('hackResultArea'), hackResultTitleEl = SH('hackResultTitle'),
        hackResultMessageEl = SH('hackResultMessage'), closeHackResultButtonEl = SH('closeHackResultButton'),
        hackResultContentEl = hackResultAreaEl.querySelector('.hack-result-content');


    function initSonarAnimation() {
        if (!sonarDisplay) return;
        for (let i = 0; i < 3; i++) {
            const ring = document.createElement('div');
            ring.classList.add('sonar-ring');
            ring.style.width = sonarDisplay.offsetWidth + 'px';
            ring.style.height = sonarDisplay.offsetHeight + 'px';
            ring.style.left = '0px'; ring.style.top = '0px';
            ring.style.animationDelay = `${i * 1}s`; // Stagger ring animations
            sonarDisplay.appendChild(ring);
        }
    }

    function updateStatsDisplay() {
        if (currentLayerEl) currentLayerEl.textContent = gameState.currentLayer;
        if (ownedNodesEl) ownedNodesEl.textContent = gameState.ownedNodes;
        if (incomeRateEl) incomeRateEl.textContent = (gameState.incomeRate * gameState.incomeMultiplier).toFixed(1);
        if (currentICEEl) currentICEEl.textContent = Math.floor(gameState.currentICE);
        if (iceForUpgradesDisplayEl) iceForUpgradesDisplayEl.textContent = Math.floor(gameState.currentICE);
    }

    function generateNodeBlip() {
        if (!sonarDisplay || gameState.nodesOnSonar.length >= gameState.maxNodesOnSonar || gameState.activeHack) return;

        const blip = document.createElement('div');
        blip.classList.add('node-blip');
        blip.style.animationDelay = `-${(Math.random() * 2.5).toFixed(1)}s`;

        const sonarRadius = sonarDisplay.offsetWidth / 2;
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * (sonarRadius * 0.85) + (sonarRadius * 0.1);
        const x = sonarRadius + distance * Math.cos(angle) - 5; // Approx blip radius
        const y = sonarRadius + distance * Math.sin(angle) - 5; // Approx blip radius
        blip.style.left = `${x}px`; blip.style.top = `${y}px`;

        gameState.nodeCounter++;
        const nodeId = `N7R-${gameState.nodeCounter.toString().padStart(4, '0')}`;
        blip.dataset.nodeId = nodeId;
        blip.addEventListener('click', () => startHack(nodeId, blip));

        sonarDisplay.appendChild(blip);
        gameState.nodesOnSonar.push(blip);
    }

    function getChallengeForCurrentLayer() {
        let pool = challenges.filter(c => c.layer === gameState.currentLayer && !gameState.challengeUsageCount[c.id]);
        if (pool.length === 0) {
            pool = challenges.filter(c => c.layer < gameState.currentLayer && !gameState.challengeUsageCount[c.id]);
        }
        if (pool.length === 0) {
            pool = challenges.filter(c => !gameState.challengeUsageCount[c.id]);
        }
        if (pool.length === 0) {
            return {
                id: "fallback_exhausted", layer: gameState.currentLayer,
                description: "NET TRAVERSED: All known unique ICE patterns encountered. System is repeating known sequences or awaiting deeper net protocols. Print 'acknowledge'.",
                starterFunction: function () { this.challengeInput = "none"; this.expectedPrint = "acknowledge"; }
            };
        }
        const chosenTemplate = pool[Math.floor(Math.random() * pool.length)];
        return { ...chosenTemplate };
    }

    function startHack(nodeId, nodeElement) {
        if (gameState.activeHack || nodeElement.classList.contains('owned')) return;

        const currentChallengeInstance = getChallengeForCurrentLayer();
        if (currentChallengeInstance.id !== "fallback_exhausted") {
            gameState.challengeUsageCount[currentChallengeInstance.id] = true;
        }
        currentChallengeInstance.starterFunction();

        gameState.activeHack = {
            challenge: currentChallengeInstance,
            nodeElement: nodeElement,
            nodeId: nodeId
        };

        nodeIdDisplayEl.textContent = nodeId;
        challengeDescriptionEl.textContent = currentChallengeInstance.description;
        let varsDisplay = "N/A";
        if (currentChallengeInstance.challengeInput !== undefined && currentChallengeInstance.challengeInput !== null) {
            varsDisplay = typeof currentChallengeInstance.challengeInput === 'object' ?
                JSON.stringify(currentChallengeInstance.challengeInput, null, 2) :
                JSON.stringify(currentChallengeInstance.challengeInput);
        }
        challengeVariablesEl.innerHTML = `<code>${varsDisplay}</code>`;
        userCodeEl.value = "";
        challengeArea.style.display = 'block';
        runHackButton.disabled = false; abortHackButton.disabled = false; scanButton.disabled = true;
        nodeElement.classList.add('active-hack');
        gameState.nodesOnSonar.forEach(n => { if (n !== nodeElement) n.style.pointerEvents = 'none'; });
    }

    function displayHackOutcome(title, message, type = 'info') {
        hackResultTitleEl.textContent = title;
        hackResultMessageEl.textContent = message;
        hackResultContentEl.className = `hack-result-content ${type}`;
        hackResultAreaEl.style.display = 'flex';

        if (challengeArea.style.display !== 'none') {
            challengeArea.style.display = 'none';
        }
        runHackButton.disabled = true;
        abortHackButton.disabled = true;
    }

    closeHackResultButtonEl.addEventListener('click', () => {
        hackResultAreaEl.style.display = 'none';
        // The calling functions are responsible for game state and button states.
        // This button just closes the modal.
    });

    function abortHack() {
        if (!gameState.activeHack) return;
        const { nodeElement, nodeId } = gameState.activeHack;

        if (nodeElement) nodeElement.classList.remove('active-hack');
        gameState.activeHack = null;
        if (challengeArea.style.display !== 'none') {
            challengeArea.style.display = 'none';
        }

        scanButton.disabled = false;
        gameState.nodesOnSonar.forEach(n => { if (n && !n.classList.contains('owned')) n.style.pointerEvents = 'auto'; });
        updateStatsDisplay();

        displayHackOutcome("Hack Aborted", `Hack on node ${nodeId} aborted by user. Access codes reset.`, "info");
    }

    function isAttemptCheating(userCodeStr, expectedPrint) {
        const normalizedCode = userCodeStr.trim().replace(/\s+/g, ' ');
        const expectedStr = String(expectedPrint).trim();

        const directStringPrintPattern1 = `print('${expectedStr}')`;
        const directStringPrintPattern2 = `print("${expectedStr}")`;
        const directValuePrintPattern = `print(${JSON.stringify(expectedPrint)})`; // Handles numbers, booleans, and strings correctly

        return normalizedCode === directStringPrintPattern1 ||
            normalizedCode === directStringPrintPattern2 ||
            (typeof expectedPrint !== 'string' && normalizedCode === `print(${expectedStr})`) || // For numbers/booleans not as strings
            normalizedCode === directValuePrintPattern;
    }

    function runHack() {
        if (!gameState.activeHack) return;
        const userCode = userCodeEl.value;
        const { challenge, nodeElement, nodeId } = gameState.activeHack;
        let capturedOutput = [];
        const customPrint = (...args) => { capturedOutput.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')); };

        if (challengeArea.style.display !== 'none') {
            challengeArea.style.display = 'none'; // Hide challenge area as outcome will be in modal
        }

        if (isAttemptCheating(userCode, challenge.expectedPrint, challenge.challengeInput)) {
            gameState.currentICE = Math.max(0, gameState.currentICE * (1 - ICE_PENALTY_PERCENTAGE / 100));
            updateStatsDisplay();

            if (nodeElement) {
                nodeElement.remove();
                gameState.nodesOnSonar = gameState.nodesOnSonar.filter(n => n !== nodeElement);
            }
            gameState.activeHack = null;
            scanButton.disabled = false;
            gameState.nodesOnSonar.forEach(n => { if (n && !n.classList.contains('owned')) n.style.pointerEvents = 'auto'; });

            displayHackOutcome(
                "PENALTY INCURRED!",
                `Anti-cheat subroutines triggered on node ${nodeId}.\nDirect answer submission detected.\n-${ICE_PENALTY_PERCENTAGE}% ICE fine levied.\nNode connection forcibly severed.`,
                "error"
            );
            return;
        }

        try {
            const func = new Function('v', 'print', 'challengeInput', userCode);
            func(challenge.challengeInput, customPrint, challenge.challengeInput);
            const finalOutput = capturedOutput.join('\n').trim();

            if (finalOutput === String(challenge.expectedPrint).trim()) {
                completeHack(); // This will handle game state and then call displayHackOutcome for success
            } else {
                if (nodeElement) nodeElement.classList.remove('active-hack');
                gameState.activeHack = null;
                scanButton.disabled = false;
                gameState.nodesOnSonar.forEach(n => { if (n && !n.classList.contains('owned')) n.style.pointerEvents = 'auto'; });
                updateStatsDisplay();

                displayHackOutcome(
                    "Hack Failed!",
                    `Output mismatch for node ${nodeId}.\n\nYour Output:\n${finalOutput}\n\nExpected Output:\n"${challenge.expectedPrint}"\n\nICE countermeasures activated. Connection terminated.`,
                    "error"
                );
            }
        } catch (error) {
            if (nodeElement) nodeElement.classList.remove('active-hack');
            gameState.activeHack = null;
            scanButton.disabled = false;
            gameState.nodesOnSonar.forEach(n => { if (n && !n.classList.contains('owned')) n.style.pointerEvents = 'auto'; });
            updateStatsDisplay();

            displayHackOutcome(
                "Runtime Error!",
                `Critical error during hack execution on node ${nodeId}:\n${error.message}\n${error.stack ? error.stack.split('\n')[1].trim() : ''}\n\nSystem integrity compromised. Disconnecting.`,
                "error"
            );
        }
    }

    function completeHack() {
        const { nodeId, nodeElement } = gameState.activeHack;

        gameState.ownedNodes++;
        gameState.incomeRate += (gameState.currentLayer + 1) * NODE_BASE_INCOME_VALUE;

        nodeElement.classList.remove('active-hack');
        nodeElement.classList.add('owned');
        nodeElement.style.pointerEvents = 'none';

        gameState.nodesOnSonar = gameState.nodesOnSonar.filter(n => n !== nodeElement);
        gameState.hacksThisLayer++;

        let layerAdvanced = false;
        if (gameState.hacksThisLayer >= gameState.hacksToAdvanceLayer) {
            advanceLayer(); // This will show its own "Layer Advanced" message
            layerAdvanced = true;
        }

        gameState.activeHack = null;
        scanButton.disabled = false; // Enable scan after successful hack
        gameState.nodesOnSonar.forEach(n => { if (n && !n.classList.contains('owned')) n.style.pointerEvents = 'auto'; });
        updateStatsDisplay();

        if (!layerAdvanced) { // Only show hack success if layer didn't advance (advanceLayer shows its own)
            displayHackOutcome("Hack Successful!", `Node ${nodeId} compromised! \nICE protocols breached. Data stream secured.`, "success");
        }
    }

    function advanceLayer() {
        gameState.currentLayer++;
        gameState.hacksThisLayer = 0;
        gameState.hacksToAdvanceLayer = Math.floor(gameState.hacksToAdvanceLayer * 1.25) + 1;

        gameState.nodesOnSonar.forEach(node => node.remove());
        gameState.nodesOnSonar = [];
        updateStatsDisplay(); // Update stats before showing message

        displayHackOutcome(
            "Layer Advanced!",
            `Accessing deeper net segments. Reached Layer ${gameState.currentLayer}.\nSecurity protocols intensify. New node patterns expected.`,
            "success" // Using 'success' as it's a positive progression
        );
    }

    function initializeUpgradableGameState() {
        UPGRADE_DEFINITIONS.forEach(upgDef => {
            upgDef.purchasedCount = gameState.upgradesPurchased[upgDef.id] || 0;
        });
    }

    function renderUpgradesPanel() {
        if (!upgradesListEl) return;
        upgradesListEl.innerHTML = '';
        initializeUpgradableGameState();

        UPGRADE_DEFINITIONS.forEach(upgrade => {
            const item = document.createElement('div');
            item.classList.add('upgrade-item');
            const available = upgrade.isAvailable(gameState);
            if (!available) item.classList.add('unavailable');
            if (upgrade.purchasedCount >= upgrade.maxPurchases) item.classList.add('purchased');

            let currentCost = upgrade.cost;
            if (upgrade.maxPurchases > 1 && upgrade.purchasedCount > 0) {
                currentCost = Math.floor(upgrade.cost * Math.pow(1.7, upgrade.purchasedCount));
            }

            let purchaseButtonHTML = '';
            if (upgrade.purchasedCount < upgrade.maxPurchases && available) {
                purchaseButtonHTML = `<button data-upgrade-id="${upgrade.id}" ${gameState.currentICE < currentCost ? 'disabled' : ''}>Purchase</button>`;
            } else if (!available) {
                purchaseButtonHTML = '<p><em>Requirements not met.</em></p>';
            } else {
                purchaseButtonHTML = '<p><strong>Maxed Out</strong></p>';
            }
            const levelDisplay = upgrade.maxPurchases > 1 && upgrade.purchasedCount > 0 ? ` (Lvl ${upgrade.purchasedCount + 1})` : (upgrade.maxPurchases > 1 ? ' (Lvl 1)' : '');

            item.innerHTML = `
                <h3>${upgrade.name}${levelDisplay}</h3>
                <p>${upgrade.description}</p>
                ${upgrade.purchasedCount < upgrade.maxPurchases ? `<p class="cost">Cost: ${currentCost} ICE</p>` : ''}
                ${purchaseButtonHTML}
            `;
            upgradesListEl.appendChild(item);
        });

        upgradesListEl.querySelectorAll('button[data-upgrade-id]').forEach(button => {
            button.addEventListener('click', (e) => purchaseUpgrade(e.target.dataset.upgradeId));
        });
    }

    function purchaseUpgrade(upgradeId) {
        const upgrade = UPGRADE_DEFINITIONS.find(u => u.id === upgradeId);
        if (!upgrade || !upgrade.isAvailable(gameState) || upgrade.purchasedCount >= upgrade.maxPurchases) return;

        let currentCost = upgrade.cost;
        if (upgrade.maxPurchases > 1 && upgrade.purchasedCount > 0) {
            currentCost = Math.floor(upgrade.cost * Math.pow(1.7, upgrade.purchasedCount));
        }

        if (gameState.currentICE >= currentCost) {
            gameState.currentICE -= currentCost;
            upgrade.effect(gameState);
            upgrade.purchasedCount = (upgrade.purchasedCount || 0) + 1;
            gameState.upgradesPurchased[upgrade.id] = upgrade.purchasedCount;

            updateStatsDisplay();
            renderUpgradesPanel(); // Re-render to update states and costs
            displayHackOutcome("Upgrade Acquired!", `Successfully purchased: ${upgrade.name}! System enhancements active.`, "success");
        } else {
            displayHackOutcome("Purchase Failed", `Insufficient ICE for ${upgrade.name}. Required: ${currentCost} ICE. Available: ${Math.floor(gameState.currentICE)} ICE.`, "error");
        }
    }

    if (toggleUpgradesButton) {
        toggleUpgradesButton.addEventListener('click', () => {
            const panelVisible = upgradesPanel.style.display === 'flex';
            if (panelVisible) {
                upgradesPanel.style.display = 'none';
            } else {
                renderUpgradesPanel();
                upgradesPanel.style.display = 'flex';
            }
        });
    }
    if (closeUpgradesButton) {
        closeUpgradesButton.addEventListener('click', () => { upgradesPanel.style.display = 'none'; });
    }
    if (upgradesPanel) {
        upgradesPanel.addEventListener('click', (event) => {
            if (event.target === upgradesPanel) {
                upgradesPanel.style.display = 'none';
            }
        });
    }

    setInterval(() => {
        gameState.currentICE += (gameState.incomeRate * gameState.incomeMultiplier) / 20; // ICE gain per 50ms
        updateStatsDisplay();
    }, 50);

    if (scanButton) scanButton.addEventListener('click', () => {
        if (gameState.nodesOnSonar.length < gameState.maxNodesOnSonar && !gameState.activeHack) {
            generateNodeBlip();
            // No message for successful scan, blip appearing is feedback
        } else if (gameState.activeHack) {
            displayHackOutcome("Scan Blocked", "Cannot initiate new scan sequences while a hack is in progress.", "error");
        } else {
            displayHackOutcome("Sonar Saturated", "Maximum number of unsecured node signatures already detected on sonar. Clear existing nodes or upgrade sonar capacity.", "error");
        }
    });

    if (runHackButton) runHackButton.addEventListener('click', runHack);
    if (abortHackButton) abortHackButton.addEventListener('click', abortHack);

    initializeUpgradableGameState();
    updateStatsDisplay();
    initSonarAnimation();
    for (let i = 0; i < 2; i++) generateNodeBlip(); // Start with a couple of nodes
    console.log("NetrunnerOS v2.1 initialized. System online. Anti-tamper subroutines active. Awaiting user input.");
});