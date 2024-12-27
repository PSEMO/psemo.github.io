/*
class server {
    constructor(name, power, SecurityLevel, HackedLevel) {
        this.name = name;
        this.power = power;
        this.SecurityLevel = SecurityLevel;
        this.HackedLevel = HackedLevel;
        this.working = false;
    }
}

const ColorMode = {
    DARK: 0,
    LIGHT: 1
};

const userInputField = document.getElementById('userInputField');
const runButton = document.getElementById('runButton');
const themeToggleButton = document.getElementById('themeToggleButton');
const containerForWallet = document.getElementById('containerForWallet');

const validCommands = ["pass", "clear", "clean", "cls", "hack", "mine", "listServers", "phish", "bruteForce", "exploit"];

var containerForOutput = document.getElementById("containerForOutput");
var themeToggleImg = document.getElementById("themeToggleImg");

var themeAdjustDark = "themeAdjustDark.png";
var themeAdjustLight = "themeAdjustLight.png";

var CurrentTheme = ColorMode.LIGHT;

themeToggleImg.src = themeAdjustDark;

var profitPerSecond = 0;
var totalMoney = 0;

let servers = [
    new server("analServer", 10, 1, 0),
    new server("oralServer", 15, 2, 0),
    new server("dataVault", 30, 5, 0),
    new server("cryptoFarm", 50, 8, 0),
    new server("mainframe", 100, 10, 0)
];

var CurrentServer = servers[0];

// Deal with the input.
function runUserCode() {
    const inputValue = userInputField.value.trim();
    if (inputValue) {
        addUserInputToOutput(inputValue); // Print the input
        userInputField.value = ''; // Clear the input field

        EditedInput = inputValue.toLowerCase();
        EditedInput = EditedInput.replaceAll("();", "");
        commands = EditedInput.split(' ');

        // Find strings in commands that are not in validCommands
        const faultyCommands = commands.filter(command_ => !validCommands.includes(command_));

        if (faultyCommands.length > 1) {
            addErrorToOutput("Some commands were not recognized as a valid internal or external command: \"" +
                (faultyCommands.join("\", \"")) + "\"");
        } else if (faultyCommands.length == 1) {
            addErrorToOutput("A command was not recognized as a valid internal or external command: " + faultyCommands[0]);
        } else {
            processCommands(commands);
        }
    }
}

function processCommands(commands) {
    if (commands.includes("pass")) {
        commands.splice(commands.indexOf("pass"), 1);
        processCommands(commands);
    } else if (commands.includes("clear") || commands.includes("clean") || commands.includes("cls")) {
        if (commands.length > 1) {
            addErrorToOutput("The clear/clean/cls command cannot be combined with other commands or values.");
        } else {
            setOutput("");
        }
    } else if (commands.includes("mine")) {
        if (commands.length > 1) {
            addErrorToOutput("The command mine cannot be combined with other commands or values.");
        } else {
            startMining();
        }
    } else if (commands.includes("hack")) {
        if (commands.length > 1) {
            addErrorToOutput("The command hack cannot be combined with other commands or values.");
        } else {
            hackServer();
        }
    } else if (commands.includes("listServers")) {
        listServers();
    } else if (commands.includes("phish")) {
        phishingAttack();
    } else if (commands.includes("bruteForce")) {
        bruteForceAttack();
    } else if (commands.includes("exploit")) {
        exploitServer();
    }
}

function startMining() {
    if (!CurrentServer.working) {
        if (CurrentServer.HackedLevel >= CurrentServer.SecurityLevel) {
            CurrentServer.working = true;
            profitPerSecond += CurrentServer.power;
            addSysMessageToOutput(`Mining started on the {${CurrentServer.name}} server.`);
        } else {
            addErrorToOutput("Access denied.");
        }
    } else {
        addErrorToOutput("The server is already assigned a task.");
    }
}

function hackServer() {
    if (CurrentServer.HackedLevel >= CurrentServer.SecurityLevel) {
        addErrorToOutput("You already have full access to this server.");
    } else {
        CurrentServer.HackedLevel++;
        addSysMessageToOutput(`Successfully hacked the {${CurrentServer.name}} server.`);
    }
}

function listServers() {
    const serverList = servers.map((server, index) => `${index + 1}. ${server.name} (Security Level: ${server.SecurityLevel}, Power: ${server.power})`).join("<br>");
    addSysMessageToOutput("Available Servers:<br>" + serverList);
}

function phishingAttack() {
    if (Math.random() > 0.5) {
        CurrentServer.HackedLevel++;
        addSysMessageToOutput("Phishing attack successful! Security level breached.");
    } else {
        addErrorToOutput("Phishing attack failed.");
    }
}

function bruteForceAttack() {
    if (Math.random() > 0.7) {
        CurrentServer.HackedLevel++;
        addSysMessageToOutput("Brute force attack successful! Security level breached.");
    } else {
        addErrorToOutput("Brute force attack failed.");
    }
}

function exploitServer() {
    if (Math.random() > 0.3) {
        CurrentServer.HackedLevel += 2;
        addSysMessageToOutput("Exploit successful! Multiple security levels breached.");
    } else {
        addErrorToOutput("Exploit failed.");
    }
}

toggleTheme(); // Make the default theme dark.
*/