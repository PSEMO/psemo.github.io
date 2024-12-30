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
    closeButton.textContent = '×';
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