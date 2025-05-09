//#region finding HTML document element
const userInputField = document.getElementById('userInputField');
const runButton = document.getElementById('runButton');
const themeToggleButton = document.getElementById('themeToggleButton');
const containerForWallet = document.getElementById('containerForWallet');
const containerForOutput = document.getElementById("containerForOutput");
const themeToggleImg = document.getElementById("themeToggleImg");
const createWindowButtonTest = document.getElementById('create-window');
//#endregion
//=
//==
//===
//==
//=
//#region classes and enums
class server {
    constructor(name, power, SecurityLevel, HackedLevel) {
        this.name = name;
        this.power = power;

        this.SecurityLevel = SecurityLevel;
        this.SecurityName = "";
        this.HackedLevel = HackedLevel;
        this.HackedName = "";

        this.updateSecurityName();
        this.updateHackedName();

        this.working = false;
    }

    updateSecurityName() {
        this.SecurityName = securityLevelToName(this.SecurityLevel);
    }
    
    updateHackedName() {
        if (this.HackedLevel >= this.SecurityLevel) {
            this.HackedName = "Overrun"
        }
        else {
            this.HackedName = levelToCoolNumber(this.HackedLevel);
        }
    }
}

// Enum-like object for component types
const ComponentType = {
    CPU: "CPU",
    RAM: "RAM",
    PSU: "PSU",
    GPU: "GPU",
};

// Enum-like object for units
const UnitType = {
    WATT: "Watt",
    GB: "GB",
    CinebenchR20: "Cinebench R20",
    TimeSpy3dMark: "3DMark Time Spy"
};

// Unified class for all components
class Component {
    constructor(type, name, specs = {}) {
        if (!Object.values(ComponentType).includes(type)) {
            throw new Error(`Invalid component type: ${type}`);
        }
        this.type = type;
        this.name = name;
        this.specs = specs;
    }

    getDescription() {
        const statDetails = this.specs.stat ? `${this.specs.stat.value} ${this.specs.stat.unit}` : "N/A";
        const powerDetails = this.specs.power ? `${this.specs.power.value} ${this.specs.power.unit}` : "N/A";
        return `Component: ${this.name} (${this.type})<br>Stat: ${statDetails}<br>Power: ${powerDetails}<br>Price: ${this.specs.price}`;
    }
}

const ColorMode =
{
    DARK: 0,
    LIGHT: 1
};

const Products =
{
    rx470: (new Component(ComponentType.GPU, "RX-470", {
        stat: { value: 450, unit: UnitType.TimeSpy3dMark },
        power: { value: 120, unit: UnitType.WATT },
        price: 60
    })),
    fx6300: (new Component(ComponentType.CPU, "FX-6300", {
        stat: { value: 850, unit: UnitType.CinebenchR20 },
        power: { value: 95, unit: UnitType.WATT },
        price: 40
    })),
    ram8gb: (new Component(ComponentType.RAM, "8GB", {
        stat: { value: 8, unit: UnitType.GB },
        power: { value: 3, unit: UnitType.WATT },
        price: 20
    })),
    psu500Watt80G: (new Component(ComponentType.PSU, "500-Watt-80+Gold", {
        stat: { value: 500, unit: UnitType.WATT },
        power: { value: 590, unit: UnitType.WATT },
        price: 40
    })),
    rtx4090: (new Component(ComponentType.GPU, "RTX-4090", {
        stat: { value: 33400, unit: UnitType.TimeSpy3dMark },
        power: { value: 450, unit: UnitType.WATT },
        price: 1400
    })),
    i9_14900k: (new Component(ComponentType.CPU, "i9-14900k", {
        stat: { value: 15600, unit: UnitType.CinebenchR20 },
        power: { value: 250, unit: UnitType.WATT },
        price: 460
    })),
    ram16gb: (new Component(ComponentType.RAM, "16GB", {
        stat: { value: 16, unit: UnitType.GB },
        power: { value: 3, unit: UnitType.WATT },
        price: 30
    })),
    psu1600Watt85P: (new Component(ComponentType.PSU, "1600-Watt-85+Platinum", {
        stat: { value: 1600, unit: UnitType.WATT },
        power: { value: 1650, unit: UnitType.WATT },
        price: 300
    })),
};
//#endregion
//=
//==
//===
//==
//=
//#region market
let market = []

market.push(Products.rx470);
market.push(Products.fx6300);
market.push(Products.ram8gb);
market.push(Products.psu500Watt80G);
market.push(Products.rtx4090);
market.push(Products.i9_14900k);
market.push(Products.ram16gb);
market.push(Products.psu1600Watt85P);

console.log(getMarketDetails(market));
//#endregion
//=
//==
//===
//==
//=
//#region servers
let servers = [
    new server("localServer", 10, 0, 0)
]

servers = servers.concat(generateServers(19));

var CurrentServer = servers[0];
let localServerHardware = {
    cpuList: [Products.fx6300/*, Products.fx6300*/
    ],
    gpuList: [Products.rx470/*, Products.rx470, Products.rx470,
        Products.rx470, Products.rx470, Products.rx470*/
    ],
    ramList: [Products.ram8gb/*, Products.ram8gb*/
    ],
    psuList: [Products.psu500Watt80G/*, Products.psu500Watt80G*/
    ]
}

let maxLocalServerLevel = 2500;
setLocalServerPower();
//#endregion
//=
//==
//===
//==
//=
//#region commands
const validCommands = [
    "pass", "clear", "clean", "cls", "hack", "mine",
    "list", "help", "connect", "scan", "pwd", "market",
    "buy"
];
const validCommandsWithMessages = [
    "connect", "scan", "market", "buy"
];
//#endregion
//=
//==
//===
//==
//=
//#region event listeners
//Event listeners for buttons
themeToggleButton.addEventListener('click', toggleTheme);
runButton.addEventListener('click', runUserCode);
createWindowButtonTest.addEventListener('click', () => createWindow("Example Window", "This is a draggable and resizable window."));

//Event listeners for key presses
userInputField.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        runUserCode();
    }
});
//#endregion
//=
//==
//===
//==
//=
//#region tracker variables for creating windows
let windowCount = 0; // Track the number of created windows
let zIndexCounter = 1; // Initialize z-index counter
//#endregion
//=
//==
//===
//==
//=
//#region light/dark theme
const themeAdjustDark = "themeAdjustDark.png";
const themeAdjustLight = "themeAdjustLight.png";

var CurrentTheme = ColorMode.LIGHT;

themeToggleImg.src = themeAdjustDark;
//#endregion
//=
//==
//===
//==
//=
//#region variables about hacking
let CurrentlyHacking = false;
let HackingMode = 0;

var exclusivePart = "";
var exclusiveID = "";
var allIDs = "";
//#endregion
//=
//==
//===
//==
//=
//#region UPDATE
var profitPerSecond = 0;
var totalMoney = 0;

window.onload = update();
function update() {
    delay = 16;
    multiplier = 16 / 1000;

    function fnc() {
        totalMoney = totalMoney + (profitPerSecond * multiplier);

        stringMoney = formatNumber(totalMoney, 2);

        containerForWallet.innerHTML = stringMoney + "$";
    }
    setInterval(fnc, delay);
}
//#endregion
//=
//==
//===
//==
//=

//Deal and execute the commands.
function processCommands(commands, isThereMessage) {
    //ignore the pass command
    if (commands.includes("pass")) {
        index = commands.indexOf("pass");
        commands.splice(index, 1);//remove 1 element at index
        processCommands(commands, isThereMessage);//rerun without the pass command
    }
    else {
        if (isThereMessage) {
            //connect to server
            if (commands.includes("connect")) {
                if (commands.length === 1) {
                    addErrorToOutput("Server name was not provided.");
                }
                else if (commands.length === 2) {
                    if (commands[0] === "connect") {
                        connectToServer(commands[1]);
                    }
                    else {
                        connectToServer(commands[0]);
                    }
                }
                else if (commands.length > 2) {
                    addErrorToOutput("The command connect cannot be combined with more than one command or value.");
                }
            }
            //list given server defaul is current
            else if (commands.includes("scan")) {
                if (commands.length === 1) {
                    showTheServerInfo(CurrentServer.name);
                }
                else if (commands.length === 2) {
                    if (commands[0] === "scan") {
                        showTheServerInfo(commands[1]);
                    }
                    else {
                        showTheServerInfo(commands[0]);
                    }
                }
                else if (commands.length > 2) {
                    addErrorToOutput("The command scan cannot be combined with more than one command or value.");
                }
            }
            //list market content or buy
            else if (commands.includes("buy")) {
                if (commands.length === 1) {
                    addErrorToOutput("No product was given.");
                }
                else if (commands.length === 2) {
                    let productToBuy;
                    if (commands[0] == "buy") {
                        productToBuy = getProduct(commands[1]);
                    }
                    else {
                        productToBuy = getProduct(commands[0]);
                    }

                    buy(productToBuy);
                }
                else if (commands.length > 2) {
                    addErrorToOutput("Multiple item buys are not ready yet!");
                }
            }
            //list market content or buy
            else if (commands.includes("market")) {
                if (commands.length === 1) {
                    showMarket();
                }
                else if (commands.length > 1) {
                    //change the market command with the buy command.
                    //'[market] [other]' means '[buy] [other]'
                    commands = updateElement(commands, "market", "buy");
                    processCommands(commands, true);
                }
            }
        }
        else {
            //clean or clear command
            if (commands.includes("clear") ||
                commands.includes("clean") ||
                commands.includes("cls")) {
                if (commands.length > 1) {
                    if (commands.includes("clean"))
                        addErrorToOutput("The command clean cannot be combined with other commands or values.");
                    if (commands.includes("clear"))
                        addErrorToOutput("The command clear cannot be combined with other commands or values.");
                    if (commands.includes("cls"))
                        addErrorToOutput("The command cls cannot be combined with other commands or values.");
                }
                else {
                    setOutput("");
                }
            }
            //start mining on the current computer
            else if (commands.includes("mine")) {
                if (commands.length > 1) {
                    addErrorToOutput("The command mine cannot be combined with other commands or values.");
                }
                else {
                    if (CurrentServer.working === false) {
                        if (CurrentServer.HackedLevel >= CurrentServer.SecurityLevel) {
                            startMining();
                        }
                        else {
                            addErrorToOutput("Access denied.");
                        }
                    }
                    else {
                        addErrorToOutput("The server was assign a task.");
                    }
                }
            }
            //increase hack level
            else if (commands.includes("hack")) {
                if (commands.length > 1) {
                    addErrorToOutput("The command hack cannot be combined with other commands or values.");
                }
                else {
                    if (CurrentServer.HackedLevel >= CurrentServer.SecurityLevel) {
                        addWarningToOutput("You already have full access to this servers kernel");
                    }
                    else {
                        hackServer();
                    }
                }
            }
            //list servers
            else if (commands.includes("list")) {
                if (commands.length > 1) {
                    addErrorToOutput("The command list cannot be combined with other commands or values.");
                }
                else {
                    listServers();
                }
            }
            //show avaliable commands
            else if (commands.includes("help")) {
                if (commands.length > 1) {
                    addErrorToOutput("The command help cannot be combined with other commands or values.");
                }
                else {
                    help();
                }
            }
            //list given server defaul is current
            else if (commands.includes("pwd")) {
                if (commands.length === 1) {
                    showTheServerInfo(CurrentServer.name);
                }
                else if (commands.length > 1) {
                    addErrorToOutput("The command pwd cannot be combined with other commands or values.");
                }
            }
        }
    }
}

// Deal with the input.
function runUserCode() {
    const inputValue = userInputField.value.trim();
    if (inputValue) {

        addUserInputToOutput(inputValue); // Print the input
        userInputField.value = ''; // Clear the input field

        EditedInput = inputValue.toLowerCase();
        EditedInput = EditedInput.replaceAll("();", "");

        let messages = [];

        let __TempEditedInput = EditedInput;
        while (getTextBetween(__TempEditedInput, "(", ");") !== false) {
            messages.push(getTextBetween(__TempEditedInput, "(", ");").withoutStrings);
            //remove "(" and ");"
            __TempEditedInput = (__TempEditedInput.replace("(", "")).replace(");", "");
        }

        let commands = EditedInput.split(' ');
        commands = removeMessageFromCommands(commands);
        //we are handling messages like any other command. They are being detected as messages later down the line.
        commands = commands.concat(messages);

        console.log("detected commands are, ");
        console.log(commands);

        if (CurrentlyHacking === false) {    
            // Find strings in commands that are not in validCommands
            const faultyCommands = commands.filter(command_ => !validCommands.includes(command_));
    
            // If true than a command with variable was inputed
            const commandShouldContainAMessage = anyElementInArray(commands, validCommandsWithMessages)
            if (faultyCommands.length > 0 && commandShouldContainAMessage) {
                processCommands(commands, true);
            }
            else {
                //more than one commands are valid
                if (faultyCommands.length > 1) {
                    addErrorToOutput("Some commands were not recognized as a valid internal or external command: \"" +
                        (faultyCommands.join("\", \"")) + "\"");
                }
                //a command is not valid
                else if (faultyCommands.length === 1) {
                    addErrorToOutput("A command was not recognized as a valid internal or external command: " +
                        faultyCommands[0]);
                }
                //all commands are valid
                else {
                    if (commandShouldContainAMessage) {
                        processCommands(commands, true);
                    }
                    else {
                        processCommands(commands, false);
                    }
                }
            }
        }
        else if (CurrentlyHacking === true) {
            // Player wanted to hack a server but the statemant below returned true
            // CurrentConnectedServerHackedLevel >= 2 && currentConnectedServerHackedLevel <= 10
            // Manage inputs differently now!

            const exitWords = ["cancel", "abort", "close", "stop",
                "end", "terminate", "break", "back", "halt",
                "return","q", "esc", "quit", "exit"];
            const currentConnectedServerHackedLevel = CurrentServer.HackedLevel;
            if(currentConnectedServerHackedLevel === 2) {
                if(commands.length !== 1) {
                    addErrorToOutput("You need to provide only the code that ends with \'" + exclusivePart + "\'");
                    addWarningToOutput("You can quit the current hacking process by entering " +
                        exitWords.map(word => `[${word}]`).join(", ") + " without the brackets");
                }
                else {
                    if(commands[0].toLowerCase() == exclusiveID.toLowerCase()) {
                        SuccesfullyHackedServer();
                    }
                    else if(exitWords.includes(commands[0])) {
                        CurrentlyHacking = false;
                    }
                    else {
                        addErrorToOutput("You need to provide only the code that ends with \'" + exclusivePart + "\'");
                        addWarningToOutput("You can quit the current hacking process by entering " +
                            exitWords.map(word => `[${word}]`).join(", ") + " without the brackets");
                    }
                }
            }
            //TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
            /*else if(currentConnectedServerHackedLevel === 3) {
            }
            else if(currentConnectedServerHackedLevel === 4) {
            }
            else if(currentConnectedServerHackedLevel === 5) {
            }
            else if(currentConnectedServerHackedLevel === 6) {
            }
            else if(currentConnectedServerHackedLevel === 7) {
            }
            else if(currentConnectedServerHackedLevel === 8) {
            }
            else if(currentConnectedServerHackedLevel === 9) {
            }
            else if(currentConnectedServerHackedLevel === 10) {
            }*/
            //TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
            else {
                addErrorToOutput("This section of the game is not ready yet");
                addWarningToOutput("You can quit the current hacking process by entering " +
                    exitWords.map(word => `[${word}]`).join(", ") + " without the brackets");
            }
        }
    }
}

// Buy given product
function buy(product) {
    if (totalMoney > product.specs.price) {
        totalMoney -= product.specs.price;

        if (product.type == ComponentType.CPU) {
            localServerHardware.cpuList.push(product);
        }
        else if (product.type == ComponentType.GPU) {
            localServerHardware.gpuList.push(product);
        }
        else if (product.type == ComponentType.RAM) {
            localServerHardware.ramList.push(product);
        }
        else if (product.type == ComponentType.PSU) {
            localServerHardware.psuList.push(product);
        }
        setLocalServerPower();
    }
    else {
        addErrorToOutput("Insufficient funds.");
    }
}

// Find and return the given product according to its name if it exists on the market
function getProduct(name) {
    const product = market.find(component => component.name.toLowerCase() === name.toLowerCase());
    return product || null; // Return null if no matching product is found
}

// This function updates an element in an array by replacing a target value with a new value.
function updateElement(array, targetValue, newValue) {
    if (!Array.isArray(array)) {
        throw new Error("The first parameter must be an array.");
    }

    const index = array.indexOf(targetValue); // Find the index of the target value
    if (index !== -1) {
        array[index] = newValue; // Update the value at the found index
    }
    return array; // Return the updated array
}

// This function shows the market details
function showMarket() {
    // Slice removes the first <br>
    createWindow("Market", getMarketDetails().slice(4));
}

// Function to return a string with all market elements' details
function getMarketDetails() {
    if (market.length === 0) {
        return "The market is empty.";
    }
    return "<br>" + (market.map(component => component.getDescription()).join("<br>"));
}

// This function sets the local server's power based on hardware specifications.
function setLocalServerPower() {
    //remove the current mining power.
    profitPerSecond = profitPerSecond - servers[0].power;

    const _miningLevel = miningLevel(localServerHardware.cpuList, localServerHardware.gpuList, localServerHardware.ramList, localServerHardware.psuList);
    const _miningLevelIntoPower = (_miningLevel[0] / 10);
    const _miningExponential = (1.001 ** _miningLevel[0]);
    servers[0].power = _miningLevelIntoPower + _miningExponential;

    addSysMessageToOutput(_miningLevel[2]);

    //add the new mining power.
    profitPerSecond = profitPerSecond + servers[0].power;

    console.log("_miningLevel[0]: " + _miningLevel[0]);
    console.log("_miningLevelIntoPower: " + _miningLevelIntoPower);
    console.log("_miningExponential: " + _miningExponential);
    console.log("servers[0].power: " + servers[0].power);

    return servers[0].power;
}

// This function returns the details (CPU, GPU, RAM) for a given level of a server.
function getLevelDetails(level) {
    if (level < 1) {
        level = 1;
    }
    else if (level > maxLocalServerLevel) {
        level = maxLocalServerLevel
    }

    let baseCpu = 500;
    let baseGpu = 1000;
    let baseRam = 3;

    // Calculate values dynamically based on level
    let cpu = baseCpu + Math.ceil(Math.floor((level - 1) / 4) * 500);
    let gpu = baseGpu + Math.ceil(((level - 1) % 4) * 1000 + Math.floor((level - 1) / 4) * 4000);
    let ram = baseRam + Math.ceil(Math.floor((level - 1) / 2) * 0.6);

    return { cpu: cpu, gpu: gpu, ram: ram, level: level };
}

// This function calculates the mining level based on the components of the local server.
function miningLevel(cpuList, gpuList, ramList, psuList) {
    // Calculate total stats for the provided components
    let totalCpuPower = cpuList.reduce((sum, cpu) => sum + cpu.specs.stat.value, 0);
    let totalGpuPower = gpuList.reduce((sum, gpu) => sum + gpu.specs.stat.value, 0);
    let totalRam = ramList.reduce((sum, ram) => sum + ram.specs.stat.value, 0);
    let totalPsuCapacity = psuList.reduce((sum, psu) => sum + psu.specs.stat.value, 0);
    let powerConsumptionFromWall = psuList.reduce((sum, psu) => sum + psu.specs.power.value, 0);
    let totalPowerConsumption =
        cpuList.reduce((sum, cpu) => sum + cpu.specs.power.value, 0) +
        gpuList.reduce((sum, gpu) => sum + gpu.specs.power.value, 0) +
        ramList.reduce((sum, ram) => sum + ram.specs.power.value, 0);

    function affordableLevel(levelCount) {
        let level = getLevelDetails(levelCount);
        return (
            totalCpuPower >= level.cpu &&
            totalGpuPower >= level.gpu &&
            totalRam >= level.ram &&
            totalPsuCapacity >= totalPowerConsumption
        );
    }

    let currentLevel = 0;

    // Determine the mining level
    for (let i = maxLocalServerLevel; i >= 0; i -= (maxLocalServerLevel / 10)) {
        if (affordableLevel(i)) {
            for (let j = i + (maxLocalServerLevel / 10); j >= 0; j -= (maxLocalServerLevel / 100)) {
                if (affordableLevel(j)) {
                    for (let z = j + (maxLocalServerLevel / 100); z >= 0; z--) {
                        if (affordableLevel(z)) {
                            currentLevel = z;
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
    }

    // Calculate the needed stats for the next level
    let nextLevel = currentLevel + 1;
    let nextLevelDetails = getLevelDetails(nextLevel);

    // Compose the information string
    let information = `Current Level: ${currentLevel}<br>` +
        `Total CPU Power: ${totalCpuPower}<br>` +
        `Total GPU Power: ${totalGpuPower}<br>` +
        `Total RAM: ${totalRam}<br>` +
        `Total PSU Capacity: ${totalPsuCapacity}<br>` +
        `Total Power Consumption: ${totalPowerConsumption}<br>` +
        `Needed for Next Level - CPU: ${nextLevelDetails.cpu}, GPU: ${nextLevelDetails.gpu}, RAM: ${nextLevelDetails.ram}<br>` +
        `Total Power Draw From Wall: ${powerConsumptionFromWall}`;

    // Return results
    return [currentLevel, powerConsumptionFromWall, information];
}

// Random integer generator (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// This function generates a unique name using random adjectives and nouns, checking against existing names.
function generateUniqueName(existingNames) {
    const adjectives = ["Quantum", "Alpha", "Mega", "Hyper", "Cyber", "Nano", "Shadow", "Giga"];
    const nouns = ["Server", "Node", "Vault", "Farm", "Core", "Hub", "Grid", "Cluster"];

    let name;
    do {
        const adjective = adjectives[getRandomInt(0, adjectives.length - 1)];
        const noun = nouns[getRandomInt(0, nouns.length - 1)];

        let number;
        if (randomOutcome = Math.random() < 0.5) {
            number = getRandomInt(1, 9999);
        }
        else {
            number = "";
        }

        name = `${adjective}${noun}${number}`;
    } while (existingNames.has(name));

    existingNames.add(name);
    return name;
}

// This function creates a random server object with a unique name and random power and security level.
function createRandomServer(existingNames) {
    const name = generateUniqueName(existingNames);
    const power = getRandomInt(10, 100); // Random power between 10 and 100
    const securityLevel = getRandomInt(1, 10); // Random security level between 1 and 10
    const hackedLevel = getRandomInt(0, securityLevel - 1); // Random hacked level less than security level
    return new server(name, power, securityLevel, hackedLevel);
}

// This function generates a list of random servers.
function generateServers(count) {
    const servers = [];
    const existingNames = new Set(); // Keep track of unique names

    for (let i = 0; i < count; i++) {
        servers.push(createRandomServer(existingNames));
    }

    return servers;
}

// This function returns the names of all the servers in an array.
function getServerNames(servers) {
    return servers.map(server => server.name);
}

// This function displays the available commands and their valid combinations.
function help() {
    let __helpMessage = validCommands.join(", ");
    let __helpMessageWMessages = validCommandsWithMessages.join(", ");
    addSysMessageToOutput("Avaliable commands are; " + __helpMessage + ". These ones can be combined with variables; " + __helpMessageWMessages + ".");
}

// This function displays detailed information about a specific server.
function showTheServerInfo(serverName) {
    function getComponentDetailsWithCount(componentList) {
        const componentCounts = {};

        // Count occurrences of each component
        componentList.forEach(component => {
            const key = `${component.type}-${component.name}`;
            if (componentCounts[key]) {
                componentCounts[key].count++;
            } else {
                componentCounts[key] = { count: 1, component };
            }
        });

        // Print the components with their count
        output = "<br>";
        for (const key in componentCounts) {
            const { count, component } = componentCounts[key];
            output = output + `${count}x ${component.name}` + `<br>`;
        }
        return output;
    }

    if (serverName == "localServer") {
        let serverInfo = (`<br>` +
            `Server Name: ${servers[0].name}` + "<br>" +
            `Server Power: ${servers[0].power}` + "<br>" +
            `Server Hardware:` + "<br>" +
            "CPU List;" +
            getComponentDetailsWithCount(localServerHardware.cpuList) +
            "GPU List;" +
            getComponentDetailsWithCount(localServerHardware.gpuList) +
            "RAM List;" +
            getComponentDetailsWithCount(localServerHardware.ramList) +
            "PSU List;" +
            getComponentDetailsWithCount(localServerHardware.psuList)
        );
        //getComponentDetailsWithCount function adds a <br> at the end. this is to get rid of it
        addSysMessageToOutput(serverInfo.substring(0, serverInfo.length - 4));
    }
    else {
        for (let i = 0; i < servers.length; i++) {
            if (servers[i].name.toLowerCase() === serverName.toLowerCase()) {
                let serverInfo = (`<br>` +
                    `Server Name: ${servers[i].name}` + `<br>` +
                    `Server Power: ${servers[i].power}` + `<br>` +
                    `Security Level: ${servers[i].SecurityName}` + `<br>` +
                    `Hacked Level: ${servers[i].HackedName}`
                );
                addSysMessageToOutput(serverInfo);

                return;
            }
        }
        addErrorToOutput("The server \"" + serverName + "\" was not found.");
    }
}

// This function allows the user to connect to a specific server.
function connectToServer(serverName) {
    tempCurrentServer = CurrentServer;

    for (let i = 0; i < servers.length; i++) {
        if (servers[i].name.toLowerCase() === serverName.toLowerCase()) {
            CurrentServer = servers[i];
            return;
        }
    }

    addErrorToOutput("The server \"" + serverName + "\" was not found.");
}

// This function lists all the available servers.
function listServers() {
    const serverList = servers.map((server, index) => `${index + 1}. ${server.name}`).join("<br>");
    addSysMessageToOutput("Available Servers:<br>" + serverList);
}

// This function hacks the current connected server.
function hackServer() {
    const currentConnectedServerHackedLevel = CurrentServer.HackedLevel;
    console.log(CurrentServer.HackedLevel);

    if (currentConnectedServerHackedLevel >= 0 && currentConnectedServerHackedLevel < 2) {
        SuccesfullyHackedServer();
    }
    else if (currentConnectedServerHackedLevel >= 2 && currentConnectedServerHackedLevel <= 10) {
        CurrentlyHacking = true;
        HackingMode = currentConnectedServerHackedLevel;
        addWarningToOutput("Hacking session started, security level to breach is; \"" + CurrentServer.SecurityName + "\".");
        if(currentConnectedServerHackedLevel === 2) {
            exclusivePart = "X2";
            const _generatedUniqueCode = generateUniqueCodes(8, 20, exclusivePart);
            allIDs = _generatedUniqueCode.strings.join('<br>');
            exclusiveID = _generatedUniqueCode.exclusiveString;
            createWindow(CurrentServer.name + "\'s IDs", allIDs);

            addSysMessageToOutput("Enter the full key that ends with, \"" + exclusivePart + "\".");
        }
        //TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
        /*else if(currentConnectedServerHackedLevel === 3) {
        }
        else if(currentConnectedServerHackedLevel === 4) {
        }
        else if(currentConnectedServerHackedLevel === 5) {
        }
        else if(currentConnectedServerHackedLevel === 6) {
        }
        else if(currentConnectedServerHackedLevel === 7) {
        }
        else if(currentConnectedServerHackedLevel === 8) {
        }
        else if(currentConnectedServerHackedLevel === 9) {
        }
        else if(currentConnectedServerHackedLevel === 10) {
        }*/
        //TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
        else {
            addErrorToOutput("This section of the game is not ready yet");
            addWarningToOutput("You can quit the current hacking process by entering " +
                exitWords.map(word => `[${word}]`).join(", ") + " without the brackets");
        }
    }
    else {
        addErrorToOutput("Unexpected {CurrentServer.HackedLevel} value. (hx2-0)");
    }
}

// Succesfully hack the server
function SuccesfullyHackedServer() {
    CurrentServer.HackedLevel = CurrentServer.HackedLevel + 1;
    
    CurrentlyHacking = false;

    CurrentServer.updateHackedName();
    
    addSysMessageToOutput("Succesfully hacked the {" + CurrentServer.name + "} server." +
        " (" + CurrentServer.HackedName + "/" + CurrentServer.SecurityName + ")");
}

// Starts the mining process on the current server
function startMining() {
    CurrentServer.working = true;
    profitPerSecond = profitPerSecond + CurrentServer.power;
    addSysMessageToOutput("Mining started on the {" + CurrentServer.name + "} server.");
}

// Extracts text between specified start and end strings
function getTextBetween(text, startString, endString) {
    // Check if startString and endString exist in the text
    const startIndex = text.indexOf(startString);
    const endIndex = text.indexOf(endString, startIndex + startString.length);

    // If either string is not found or no text exists between them, return false
    if (startIndex === -1 || endIndex === -1 || startIndex + startString.length >= endIndex) {
        return false;
    }

    // Extract the text between startString and endString
    const textBetween = text.substring(startIndex + startString.length, endIndex);

    // Return the results
    return {
        withStrings: text.substring(startIndex, endIndex + endString.length),
        withoutStrings: textBetween
    };
}

// Removes text between specified start and end strings, including the strings themselves
function removeTextBetween(text, startString, endString) {
    // Check if startString and endString exist in the text
    const startIndex = text.indexOf(startString);
    const endIndex = text.indexOf(endString, startIndex + startString.length);

    // If either string is not found or no text exists between them, return the original text
    if (startIndex === -1 || endIndex === -1 || startIndex + startString.length >= endIndex) {
        return text;
    }

    // Remove the text between startString and endString, including the strings themselves
    return text.substring(0, startIndex) + text.substring(endIndex + endString.length);
}

// Removes messages enclosed in parentheses from a list of commands
function removeMessageFromCommands(commands) {
    return commands.map(command => removeTextBetween(command, "(", ");"));
}

// Adds a system message to the output with proper formatting based on the theme
function addSysMessageToOutput(text) {
    if (CurrentTheme === ColorMode.DARK) {
        addToOutput("<span class=\"sysmsg dark-theme\">SYSTEM: " + text + "</span>");
    }
    else {
        addToOutput("<span class=\"sysmsg\">SYSTEM: " + text + "</span>");
    }
}
// Adds a warning message to the output with proper formatting based on the theme
function addWarningToOutput(text) {
    if (CurrentTheme === ColorMode.DARK) {
        addToOutput("<span class=\"warning\">WARNING: " + text + "</span>");
    }
    else {
        addToOutput("<span class=\"warning\">WARNING: " + text + "</span>");
    }
}
// Adds an error message to the output with proper formatting based on the theme
function addErrorToOutput(text) {
    if (CurrentTheme === ColorMode.DARK) {
        addToOutput("<span class=\"error\">ERROR: " + text + "</span>");
    }
    else {
        addToOutput("<span class=\"error\">ERROR: " + text + "</span>");
    }
}
// Adds user input to the output with proper formatting based on the theme
function addUserInputToOutput(text) {
    if (CurrentTheme === ColorMode.DARK) {
        addToOutput("<span class=\"sysmsg\">></span>" + text);
    }
    else {
        addToOutput("<span class=\"sysmsg\">></span>" + text);
    }
}
// Appends text to the output container
function addToOutput(text) {
    setOutput(containerForOutput.innerHTML + text + "<br>");
}
// Sets the output container's content to the specified text
function setOutput(text) {
    containerForOutput.innerHTML = text;
}

// Toggles between light and dark themes for the application
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    if (CurrentTheme === ColorMode.DARK) {
        CurrentTheme = ColorMode.LIGHT;
        themeToggleImg.src = themeAdjustDark;
    }
    else {
        CurrentTheme = ColorMode.DARK;
        themeToggleImg.src = themeAdjustLight;
    }
}

// Checks if any element in one array exists in another array
function anyElementInArray(array1, array2) {
    for (let i = 0; i < array1.length; i++) {
        if (array2.includes(array1[i])) {
            return true; // Return true as soon as a match is found
        }
    }
    return false; // Return false if no matches are found
}

// Creates a draggable and resizable window with the specified title and content
function createWindow(HeadText, BodyText) {
    // Create the main window element
    const windowElement = document.createElement('div');
    windowElement.className = 'window';
    windowElement.style.left = `${100 + windowCount * 20}px`;
    windowElement.style.top = `${100 + windowCount * 20}px`;
    windowElement.style.zIndex = zIndexCounter++; // Set initial z-index and increment

    // Bring the window to the front on click
    windowElement.addEventListener('mousedown', () => {
        windowElement.style.zIndex = zIndexCounter++; // Set z-index to the highest value
    });

    // Create the header for dragging
    const header = document.createElement('div');
    header.className = 'window-header';

    // Add a title to the header
    const title = document.createElement('span');
    title.textContent = HeadText;

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-btn';
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', () => windowElement.remove());

    // Append title and close button to the header
    header.appendChild(title);
    header.appendChild(closeButton);

    // Create the content area
    const content = document.createElement('div');
    content.className = 'window-content';
    content.innerHTML = BodyText;

    // Create the resizable handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';

    // Append header, content, and resize handle to the window
    windowElement.appendChild(header);
    windowElement.appendChild(content);
    windowElement.appendChild(resizeHandle);

    // Add the window to the document
    document.body.appendChild(windowElement);

    // Make the window draggable
    makeDraggable(windowElement, header);

    // Make the window resizable
    makeResizable(windowElement, resizeHandle);

    // Increment the window count
    windowCount++;
}

// Makes a specified window element draggable using its header
function makeDraggable(windowElement, header) {
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - windowElement.offsetLeft;
        offsetY = e.clientY - windowElement.offsetTop;
        header.style.cursor = 'grabbing';

        // Bring the window to the front when dragging starts
        windowElement.style.zIndex = zIndexCounter++;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            windowElement.style.left = `${x}px`;
            windowElement.style.top = `${y}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        header.style.cursor = 'grab';
    });
}

// Makes a specified window element resizable using its resize handle
function makeResizable(windowElement, resizeHandle) {
    let isResizing = false;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        e.preventDefault(); // Prevent default drag behavior

        // Bring the window to the front when resizing starts
        windowElement.style.zIndex = zIndexCounter++;
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const width = e.clientX - windowElement.offsetLeft;
            const height = e.clientY - windowElement.offsetTop;

            if (width > 100) windowElement.style.width = `${width}px`; // Minimum width
            if (height > 100) windowElement.style.height = `${height}px`; // Minimum height
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });
}

// This function converts numbers from 1 to 10 into their corresponding English words.
function securityLevelToName(number) {
    const numberWords = [
        "Unrestricted",
        "Restricted",
        "Standard",
        "Intermediate",
        "Secure",
        "Encapsulated",
        "Hypersecure",
        "Quantum",
        "Adaptive",
        "Immune",
        "Secluded"
    ];

    const level = levelToCoolNumber(number);
    
    if (number >= 0 && number <= 10) {
        return numberWords[number] + " - " + level;
    }
    else {
        console.log("NUMBER OUT OF RANGE");
        return "NUMBER OUT OF RANGE";
    }
}

// This function converts numbers to cool big numbers.
function levelToCoolNumber(number) {
    return formatNumber((Math.random() * 999) + (1000 * number), 0);
}

// Formats a number with thousands separators and a dynamic number of decimal places
function formatNumber(number, numberAfterDecimal) {
    // Round the number to the specified decimal places
    let formattedNumber = number.toFixed(numberAfterDecimal);
    
    // Split the number into integer and decimal parts
    let [integerPart, decimalPart] = formattedNumber.split('.');

    // Add thousands separator to the integer part
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    if(numberAfterDecimal == 0) {
        return `${integerPart}`;
    }
    else {
        return `${integerPart},${decimalPart}`;
    }
}

//Generates an array of random strings with specified length and amount. 
//One of the strings will contain a set of exclusive letters.
function generateUniqueCodes(length, amount, exclusiveLetters) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const strings = [];
    
    for (let i = 0; i < amount; i++) {
      let randomString = "";
      
      for (let j = 0; j < length; j++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
      }
  
      strings.push(randomString);
    }
  
    // Ensure exclusive letters are in only one random string
    const exclusiveIndex = Math.floor(Math.random() * amount);
    strings[exclusiveIndex] = 
      strings[exclusiveIndex].slice(0, length - exclusiveLetters.length) + exclusiveLetters;
  
    return {strings: strings, exclusiveString: strings[exclusiveIndex]};
}


toggleTheme(); //changes the theme to dark, effectively making the default theme dark.