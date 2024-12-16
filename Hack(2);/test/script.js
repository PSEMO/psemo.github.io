const ColorMode =
{
    DARK: 0,
    LIGHT: 1
};

const userInputField = document.getElementById('userInputField');
const runButton = document.getElementById('runButton');
const themeToggleButton = document.getElementById('themeToggleButton');

var themeToggleImg = document.getElementById("themeToggleImg");

var themeAdjustDark = "themeAdjustDark.png"
var themeAdjustLight = "themeAdjustLight.png"

var CurrentTheme = ColorMode.LIGHT;

themeToggleImg.src = themeAdjustDark

//Deal with the input.
function printToConsole()
{
    const inputValue = userInputField.value.trim();
    if (inputValue)
    {
        console.log(inputValue);
        userInputField.value = ''; // Clear the input field
    }
}

// Function to toggle dark theme
function toggleTheme()
{
    document.body.classList.toggle('dark-theme');
    if(CurrentTheme == ColorMode.DARK)
    {
        CurrentTheme = ColorMode.LIGHT;
        themeToggleImg.src = themeAdjustDark
    }
    else
    {
        CurrentTheme = ColorMode.DARK;
        themeToggleImg.src = themeAdjustLight
    }
}

//Event listeners for buttons
themeToggleButton.addEventListener('click', toggleTheme);
runButton.addEventListener('click', printToConsole);

//Event listeners for key presses
userInputField.addEventListener('keydown', function(event)
{
    if (event.key === 'Enter')
    {
        printToConsole();
    }
});

toggleTheme(); //makes the default theme dark.