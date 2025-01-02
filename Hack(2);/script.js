class server {
    constructor(name, power, SecurityLevel, HackedLevel) {
        this.name = name;
        this.power = power;
        this.SecurityLevel = SecurityLevel;
        this.HackedLevel = HackedLevel;
        this.working = false;
    }
}

const ColorMode =
{
    DARK: 0,
    LIGHT: 1
};

const userInputField = document.getElementById('userInputField');
const runButton = document.getElementById('runButton');
const themeToggleButton = document.getElementById('themeToggleButton');
const containerForWallet = document.getElementById('containerForWallet');

const validCommands =
    [
        "pass", "clear", "clean", "cls", "hack", "mine",
        "list", "help", "connect", "scan", "pwd"
    ];
const validCommandsWithMessages =
    [
        "connect", "scan"
    ];

var containerForOutput = document.getElementById("containerForOutput");
var themeToggleImg = document.getElementById("themeToggleImg");

var themeAdjustDark = "themeAdjustDark.png";
var themeAdjustLight = "themeAdjustLight.png";

var CurrentTheme = ColorMode.LIGHT;

themeToggleImg.src = themeAdjustDark;

var profitPerSecond = 0;
var totalMoney = 0;

let servers =
    [
        new server("localServer", 10, 1, 1),
        new server("MinebuildGameServer", 15, 2, 0),
        new server("dataVault", 30, 5, 0),
        new server("cryptoFarm", 50, 8, 0),
        new server("mainframe", 100, 10, 0)
    ]
var CurrentServer = servers[0];

//Deal with the input.
function runUserCode() {
    const inputValue = userInputField.value.trim();
    if (inputValue) {
        addUserInputToOutput(inputValue); // Print the input
        userInputField.value = ''; // Clear the input field

        EditedInput = inputValue.toLowerCase();
        EditedInput = EditedInput.replaceAll("();", "");

        let messages = [];
        while(getTextBetween(EditedInput, "(", ");") != false)
        {
            messages.push(getTextBetween(EditedInput, "(", ");"));
            EditedInput = EditedInput.replace(");", "");
            EditedInput = EditedInput.replace("(", "");
        }
        
        let commands = EditedInput.split(' ');

        //we are handling messages like any other commands for now.
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
        }
    }
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

function getTextBetween(text, startMarker, endMarker) {
    const regex = new RegExp(`${startMarker}(.*?)${endMarker}`, 'g');
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        matches.push(`${startMarker}${match[1]}${endMarker}`);
    }

    if (matches != []) {
        let concatenatedWithMarkers = matches.join(' ');
        let concatenatedWithoutMarkers = concatenatedWithMarkers.slice(1, -2);

        return [concatenatedWithMarkers, concatenatedWithoutMarkers];
    }
    else {
        return false;
    }
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

//Event listeners for buttons
themeToggleButton.addEventListener('click', toggleTheme);
runButton.addEventListener('click', runUserCode);

//Event listeners for key presses
userInputField.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        runUserCode();
    }
});

window.onload = update();
function update() {
    delay = 16;
    multiplier = 16 / 1000;

    function fnc() {
        totalMoney = totalMoney + (profitPerSecond * multiplier);

        stringMoney = (totalMoney + "");
        indexOfDot = stringMoney.indexOf(".");

        if (indexOfDot != -1) {
            stringMoney = stringMoney.substring(0, stringMoney.indexOf(".") + 3);
        }

        containerForWallet.innerHTML = stringMoney + "$";
    }
    setInterval(fnc, delay);
}

toggleTheme(); //makes the default theme dark.

//---------resizable window---------

let windowCount = 0; // Track the number of created windows
let zIndexCounter = 1; // Initialize z-index counter

// Event listener for creating a new window
document.getElementById('create-window').addEventListener('click', createWindow);

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