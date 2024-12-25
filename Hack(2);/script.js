const ColorMode =
{
    DARK: 0,
    LIGHT: 1
};

const userInputField = document.getElementById('userInputField');
const runButton = document.getElementById('runButton');
const themeToggleButton = document.getElementById('themeToggleButton');

const validCommands = ["pass", "clear", "clean", "cls"];

var containerForOutput = document.getElementById("containerForOutput");
var themeToggleImg = document.getElementById("themeToggleImg");

var themeAdjustDark = "themeAdjustDark.png";
var themeAdjustLight = "themeAdjustLight.png";

var CurrentTheme = ColorMode.LIGHT;

themeToggleImg.src = themeAdjustDark;

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
        console.log("detected commands are, ")
        console.log(commands)

        // Find strings in commands that are not in validCommands
        const faultyCommands = commands.filter(command_ => !validCommands.includes(command_));

        if (faultyCommands.length > 1)
        {
            addErrorToOutput("Some commands were not recognized as a valid internal or external command: \"" + (faultyCommands.join("\", \"")) + "\"");
        }
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
        addToOutput("<span class=\"warning dark-theme\">WARNING: " + text + "</span>");
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
        addToOutput("<span class=\"error dark-theme\">ERROR: " + text + "</span>");
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
        addToOutput("<span class=\"sysmsg dark-theme\">></span>" + text);
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

toggleTheme(); //makes the default theme dark.