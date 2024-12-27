class server
{
    constructor(name, power, SecurityLevel, HackedLevel)
    {
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
    "list"
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
function runUserCode()
{
    const inputValue = userInputField.value.trim();
    if (inputValue)
    {
        addUserInputToOutput(inputValue); // Print the input
        userInputField.value = ''; // Clear the input field

        EditedInput = inputValue.toLowerCase();
        EditedInput = EditedInput.replaceAll("();", "");
        commands = EditedInput.split(' ');
        console.log("detected commands are, ");
        console.log(commands);

        // Find strings in commands that are not in validCommands
        const faultyCommands = commands.filter(command_ => !validCommands.includes(command_));

        //more than one commands are valid
        if (faultyCommands.length > 1)
        {
            addErrorToOutput("Some commands were not recognized as a valid internal or external command: \"" +
                (faultyCommands.join("\", \"")) + "\"");
        }
        //a command is not valid
        else if (faultyCommands.length == 1)
        {
            addErrorToOutput("A command was not recognized as a valid internal or external command: " + faultyCommands[0]);
        }
        //all commands are valid
        else
        {
            processCommands(commands);
        }
    }
}


function processCommands(commands)
{
    //ignore the pass command
    if(commands.includes("pass"))
    {
        index = commands.indexOf("pass");
        commands.splice(index, 1);//remove 1 element at index
        processCommands(commands);//rerun without the pass command
    }
    //clean or clear command
    else if(commands.includes("clear") || commands.includes("clean") || commands.includes("cls"))
    {
        if(commands.length > 1)
        {
            if(commands.includes("clean"))
                addErrorToOutput("The command clean cannot be combined with other commands or values.");
            if(commands.includes("clear"))
                addErrorToOutput("The command clear cannot be combined with other commands or values.");
            if(commands.includes("cls"))
                addErrorToOutput("The command cls cannot be combined with other commands or values.");
        }
        else
        {
            setOutput("");
        }
    }
    //start mining on the current computer
    else if(commands.includes("mine"))
    {
        if(commands.length > 1)
        {
            addErrorToOutput("The command mine cannot be combined with other commands or values.");
        }
        else
        {
            if(CurrentServer.working == false)
            {
                if(CurrentServer.HackedLevel >= CurrentServer.SecurityLevel)
                {
                    startMining();
                }
                else
                {
                    addErrorToOutput("Access denied.");
                }
            }
            else
            {
                addErrorToOutput("The server was assign a task.");
            }
        }
    }
    //increase hack level
    else if(commands.includes("hack"))
    {
        if(commands.length > 1)
        {
            addErrorToOutput("The command hack cannot be combined with other commands or values.");
        }
        else
        {
            if(CurrentServer.HackedLevel >= CurrentServer.SecurityLevel)
            {
                addErrorToOutput("You already have full access to this servers kernel");
            }
            else
            {
                hackServer();
            }
        }
    }
    //list servers
    else if(commands.includes("list"))
    {
        if(commands.length > 1)
        {
            addErrorToOutput("The command list cannot be combined with other commands or values.");
        }
        else
        {
            listServers();
        }
    }
}

function listServers() 
{
    const serverList = servers.map((server, index) => `${index + 1}. ${server.name} (Security Level: ${server.SecurityLevel}, Power: ${server.power})`).join("<br>");
    addSysMessageToOutput("Available Servers:<br>" + serverList);
}

function hackServer()
{
    CurrentServer.HackedLevel = CurrentServer.HackedLevel + 1;
    addSysMessageToOutput("Succesfully hacked the {" + CurrentServer.name + "} server.");
}

function startMining()
{
    CurrentServer.working = true;
    profitPerSecond = profitPerSecond + CurrentServer.power;
    addSysMessageToOutput("Mining started on the {" + CurrentServer.name + "} server.");
}

function getTextBetween(text, startMarker, endMarker)
{
    const regex = new RegExp(`${startMarker}(.*?)${endMarker}`, 'g');
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        matches.push(`${startMarker}${match[1]}${endMarker}`);
    }

    if(matches != [])
    {
        let concatenatedWithMarkers = matches.join(' ');
        let concatenatedWithoutMarkers  = concatenatedWithMarkers.slice(1, -2);
    
        return [concatenatedWithMarkers, concatenatedWithoutMarkers];
    }
    else
    {
        return -1;
    }
}

function addSysMessageToOutput(text)
{
    if(CurrentTheme == ColorMode.DARK)
    {
        addToOutput("<span class=\"sysmsg dark-theme\">SYSTEM: " + text + "</span>");
    }
    else
    {
        addToOutput("<span class=\"sysmsg\">SYSTEM: " + text + "</span>");
    }
}
function addWarningToOutput(text)
{
    if(CurrentTheme == ColorMode.DARK)
    {
        addToOutput("<span class=\"warning\">WARNING: " + text + "</span>");
    }
    else
    {
        addToOutput("<span class=\"warning\">WARNING: " + text + "</span>");
    }
}
function addErrorToOutput(text)
{
    if(CurrentTheme == ColorMode.DARK)
    {
        addToOutput("<span class=\"error\">ERROR: " + text + "</span>");
    }
    else
    {
        addToOutput("<span class=\"error\">ERROR: " + text + "</span>");
    }
}
function addUserInputToOutput(text)
{
    if(CurrentTheme == ColorMode.DARK)
    {
        addToOutput("<span class=\"sysmsg\">></span>" + text);
    }
    else
    {
        addToOutput("<span class=\"sysmsg\">></span>" + text);
    }
}
function addToOutput(text)
{
    setOutput(containerForOutput.innerHTML + text + "<br>");
}
function setOutput(text)
{
    containerForOutput.innerHTML = text;
}

// Function to toggle dark theme
function toggleTheme()
{
    document.body.classList.toggle('dark-theme');
    if(CurrentTheme == ColorMode.DARK)
    {
        CurrentTheme = ColorMode.LIGHT;
        themeToggleImg.src = themeAdjustDark;
    }
    else
    {
        CurrentTheme = ColorMode.DARK;
        themeToggleImg.src = themeAdjustLight;
    }
}

//Event listeners for buttons
themeToggleButton.addEventListener('click', toggleTheme);
runButton.addEventListener('click', runUserCode);

//Event listeners for key presses
userInputField.addEventListener('keydown', function(event)
{
    if (event.key === 'Enter')
    {
        runUserCode();
    }
});

window.onload = update();
function update()
{    
    delay = 16;
    multiplier = 16 / 1000;

    function fnc()
    {
        totalMoney = totalMoney + (profitPerSecond * multiplier);

        stringMoney = (totalMoney + "");
        indexOfDot = stringMoney.indexOf(".");

        if(indexOfDot != -1)
        {
            stringMoney = stringMoney.substring(0, stringMoney.indexOf(".") + 3);
        }

        containerForWallet.innerHTML = stringMoney + "$";
    }
    setInterval(fnc, delay);
}

toggleTheme(); //makes the default theme dark.