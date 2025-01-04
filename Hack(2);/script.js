class server {
    constructor(name, power, SecurityLevel, HackedLevel) {
        this.name = name;
        this.power = power;
        this.SecurityLevel = SecurityLevel;
        this.HackedLevel = HackedLevel;
        this.working = false;
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
        return `Component: ${this.name} (${this.type})\nStat: ${statDetails}\nPower: ${powerDetails}`;
    }
}

const ColorMode =
{
    DARK: 0,
    LIGHT: 1
};

//#region market
let market = []

market.push(new Component(ComponentType.GPU, "RX 470", {
    stat: { value: 450, unit: UnitType.TimeSpy3dMark },
    power: { value: 120, unit: UnitType.WATT }
}));
market.push(new Component(ComponentType.CPU, "FX-6300", {
    stat: { value: 850, unit: UnitType.CinebenchR20 },
    power: { value: 95, unit: UnitType.WATT }
}));
market.push(new Component(ComponentType.RAM, "8GB", {
    stat: { value: 8, unit: UnitType.GB },
    power: { value: 3, unit: UnitType.WATT }
}));
market.push(new Component(ComponentType.PSU, "400 Watt", {
    stat: { value: 400, unit: UnitType.WATT },
    power: { value: 550, unit: UnitType.WATT }
}));
market.push(new Component(ComponentType.GPU, "RTX 4090", {
    stat: { value: 33400, unit: UnitType.TimeSpy3dMark },
    power: { value: 450, unit: UnitType.WATT }
}));
market.push(new Component(ComponentType.CPU, "i9 14900k", {
    stat: { value: 15600, unit: UnitType.CinebenchR20 },
    power: { value: 250, unit: UnitType.WATT }
}));
market.push(new Component(ComponentType.RAM, "16GB", {
    stat: { value: 16, unit: UnitType.GB },
    power: { value: 3, unit: UnitType.WATT }
}));
market.push(new Component(ComponentType.PSU, "850 Watt 80+ White", {
    stat: { value: 850, unit: UnitType.WATT },
    power: { value: 1060, unit: UnitType.WATT }
}));

console.log(getMarketDetails(market));
//#endregion

//#region servers
let servers = [
    new server("localServer", 10, 1, 1)
]
    
servers = servers.concat(generateServers(19));

var CurrentServer = servers[0];
let localServerHardware = {
    cpuList: [market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1],
    market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1], market[1]],

    gpuList: [market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0],
    market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0], market[0]],

    ramList: [market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2],
    market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2], market[2]],

    psuList: [market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3],
    market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3], market[3]]
}

let maxLocalServerLevel = 2500;
//#endregion

//#region HTML document element
const userInputField = document.getElementById('userInputField');
const runButton = document.getElementById('runButton');
const themeToggleButton = document.getElementById('themeToggleButton');
const containerForWallet = document.getElementById('containerForWallet');
const containerForOutput = document.getElementById("containerForOutput");
const themeToggleImg = document.getElementById("themeToggleImg");
//#endregion

//#region commands
const validCommands = [
    "pass", "clear", "clean", "cls", "hack", "mine",
    "list", "help", "connect", "scan", "pwd"
];
const validCommandsWithMessages = [
    "connect", "scan"
];
//#endregion

//#region event listeners
//Event listeners for buttons
themeToggleButton.addEventListener('click', toggleTheme);
runButton.addEventListener('click', runUserCode);
document.getElementById('create-window').addEventListener('click', createWindow);

//Event listeners for key presses
userInputField.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        runUserCode();
    }
});
//#endregion

let windowCount = 0; // Track the number of created windows
let zIndexCounter = 1; // Initialize z-index counter

const themeAdjustDark = "themeAdjustDark.png";
const themeAdjustLight = "themeAdjustLight.png";

var CurrentTheme = ColorMode.LIGHT;

themeToggleImg.src = themeAdjustDark;

var profitPerSecond = 0;
var totalMoney = 0;

window.onload = update();
function update() {
    delay = 16;
    multiplier = 16 / 1000;

    function fnc() {
        totalMoney = totalMoney + (profitPerSecond * multiplier);

        stringMoney = formatNumber(totalMoney);

        containerForWallet.innerHTML = stringMoney + "$";
    }
    setInterval(fnc, delay);
}

toggleTheme(); //makes the default theme dark.

//Deal with the input.
function runUserCode() {
    const inputValue = userInputField.value.trim();
    if (inputValue) {
        addUserInputToOutput(inputValue); // Print the input
        userInputField.value = ''; // Clear the input field

        EditedInput = inputValue.toLowerCase();
        EditedInput = EditedInput.replaceAll("();", "");

        let messages = [];

        let __TempEditedInput = EditedInput;
        while(getTextBetween(__TempEditedInput, "(", ");") !== false)
        {
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
}

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
        }
        else {
            //clean or clear command
            if (commands.includes("clear") || commands.includes("clean") || commands.includes("cls")) {
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
                        addErrorToOutput("You already have full access to this servers kernel");
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
            //list market content
            else if (commands.includes("market")) {
                if (commands.length === 1) {
                    showMarket();
                }
                else if (commands.length > 1) {
                    addErrorToOutput("The command market cannot be combined with other commands or values.");
                }
            }
        }
    }
}

function showMarket()
{
    
}

console.log(setLocalServerPower());

function setLocalServerPower() {
    servers[0].power = (10 * (2 ** miningLevel(localServerHardware.cpuList,localServerHardware.gpuList,localServerHardware.ramList,localServerHardware.psuList)[0]));

    return servers[0].power;
}

function getLevelDetails(level) {
    if (level < 1) {
        level = 1;
    }
    else if (level > maxLocalServerLevel) {
        level = maxLocalServerLevel
    }

    let baseCpu = 1000;
    let baseGpu = 500;
    let baseRam = 4;

    // Calculate values dynamically based on level
    let cpu = baseCpu + Math.floor((level - 1) / 4) * 1000;
    let gpu = baseGpu + ((level - 1) % 4) * 500 + Math.floor((level - 1) / 4) * 2000;
    let ram = baseRam + Math.floor((level - 1) / 2) * 2;
    
    return { cpu: cpu, gpu: gpu, ram: ram, level: level };
}

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

    function affoardableLevel(levelCount) {
        let level = getLevelDetails(levelCount);
        return (
            totalCpuPower >= level.cpu &&
            totalGpuPower >= level.gpu &&
            totalRam >= level.ram &&
            totalPsuCapacity >= totalPowerConsumption
        );
    }

    // Determine the mining level
    for (let i = maxLocalServerLevel; i >= 0; i -= (maxLocalServerLevel / 10)) {
        if (affoardableLevel(i))
        {
            for (let j = i + (maxLocalServerLevel / 10); j >= 0; j -= (maxLocalServerLevel / 100)) {
                if (affoardableLevel(j))
                {
                    for (let z = j + (maxLocalServerLevel / 100); z >= 0; z--) {
                        if (affoardableLevel(z))
                        {
                            return [z, powerConsumptionFromWall];
                        }
                    }
                }
            }
        }
    }

    // If no level is met
    return [0, powerConsumptionFromWall];
}

// Function to return a string with all market elements' details
function getMarketDetails(market) {
    if (market.length === 0) {
        return "The market is empty.";
    }
    return market.map(component => component.getDescription()).join("\n--------------------\n");
}

//(inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueName(existingNames) {
    const adjectives = ["Quantum", "Alpha", "Mega", "Hyper", "Cyber", "Nano", "Shadow", "Giga"];
    const nouns = ["Server", "Node", "Vault", "Farm", "Core", "Hub", "Grid", "Cluster"];

    let name;
    do {
        const adjective = adjectives[getRandomInt(0, adjectives.length - 1)];
        const noun = nouns[getRandomInt(0, nouns.length - 1)];

        let number;
        if(randomOutcome = Math.random() < 0.5)
        {
            number = getRandomInt(1, 9999);
        }
        else
        {
            number = "";
        }

        name = `${adjective}${noun}${number}`;
    } while (existingNames.has(name));

    existingNames.add(name);
    return name;
}

function createRandomServer(existingNames) {
    const name = generateUniqueName(existingNames);
    const power = getRandomInt(10, 100); // Random power between 10 and 100
    const securityLevel = getRandomInt(1, 10); // Random security level between 1 and 10
    const hackedLevel = getRandomInt(0, securityLevel - 1); // Random hacked level less than security level
    return new server(name, power, securityLevel, hackedLevel);
}

function generateServers(count) {
    const servers = [];
    const existingNames = new Set(); // Keep track of unique names

    for (let i = 0; i < count; i++) {
        servers.push(createRandomServer(existingNames));
    }

    return servers;
}

function getServerNames(servers) {
    return servers.map(server => server.name);
}

function help() {
    let __helpMessage = validCommands.join(", ");
    let __helpMessageWMessages = validCommandsWithMessages.join(", ");
    addSysMessageToOutput("Avaliable commands are; " + __helpMessage + ". These ones can be combined with variables; " + __helpMessageWMessages + ".");
}

function showTheServerInfo(serverName) {
    for (let i = 0; i < servers.length; i++) {
        if (servers[i].name.toLowerCase() === serverName.toLowerCase()) {
            addSysMessageToOutput(`Server Name: ${servers[i].name}`);
            addSysMessageToOutput(`Server Power: ${servers[i].power}`);
            addSysMessageToOutput(`Security Level: ${servers[i].SecurityLevel}`);
            addSysMessageToOutput(`Hacked Level: ${servers[i].HackedLevel}`);
            return;
        }
    }

    addErrorToOutput("The server \"" + serverName + "\" was not found.");
}

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

function listServers() {
    const serverList = servers.map((server, index) => `${index + 1}. ${server.name}`).join("<br>");
    addSysMessageToOutput("Available Servers:<br>" + serverList);
}

function hackServer() {
    CurrentServer.HackedLevel = CurrentServer.HackedLevel + 1;
    addSysMessageToOutput("Succesfully hacked the {" + CurrentServer.name + "} server.");
}

function startMining() {
    CurrentServer.working = true;
    profitPerSecond = profitPerSecond + CurrentServer.power;
    addSysMessageToOutput("Mining started on the {" + CurrentServer.name + "} server.");
}

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

function removeMessageFromCommands(commands) {
    return commands.map(command => removeTextBetween(command, "(", ");"));
}

function addSysMessageToOutput(text) {
    if (CurrentTheme === ColorMode.DARK) {
        addToOutput("<span class=\"sysmsg dark-theme\">SYSTEM: " + text + "</span>");
    }
    else {
        addToOutput("<span class=\"sysmsg\">SYSTEM: " + text + "</span>");
    }
}
function addWarningToOutput(text) {
    if (CurrentTheme === ColorMode.DARK) {
        addToOutput("<span class=\"warning\">WARNING: " + text + "</span>");
    }
    else {
        addToOutput("<span class=\"warning\">WARNING: " + text + "</span>");
    }
}
function addErrorToOutput(text) {
    if (CurrentTheme === ColorMode.DARK) {
        addToOutput("<span class=\"error\">ERROR: " + text + "</span>");
    }
    else {
        addToOutput("<span class=\"error\">ERROR: " + text + "</span>");
    }
}
function addUserInputToOutput(text) {
    if (CurrentTheme === ColorMode.DARK) {
        addToOutput("<span class=\"sysmsg\">></span>" + text);
    }
    else {
        addToOutput("<span class=\"sysmsg\">></span>" + text);
    }
}
function addToOutput(text) {
    setOutput(containerForOutput.innerHTML + text + "<br>");
}
function setOutput(text) {
    containerForOutput.innerHTML = text;
}

// Function to toggle dark theme
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

// Check if any of the arrays includes an element that is in the other array.
function anyElementInArray(array1, array2) {
    for (let i = 0; i < array1.length; i++) {
        if (array2.includes(array1[i])) {
            return true; // Return true as soon as a match is found
        }
    }
    return false; // Return false if no matches are found
}

function createWindow() {
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
    title.textContent = `Window ${windowCount + 1}`;

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
    content.textContent = 'This is a draggable and resizable window.';

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

function formatNumber(number) {
    // Split the number into integer and decimal parts
    let [integerPart, decimalPart] = number.toFixed(2).split('.');

    // Add thousands separator to the integer part
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Format the number with a comma as the decimal separator
    return `${integerPart},${decimalPart}`;
}