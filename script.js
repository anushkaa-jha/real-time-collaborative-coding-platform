// File name display
const fileNameDisplay = document.getElementById("fileNameDisplay");
// Current active file
let activeFile = "main.js";

// Tabs container
const tabsContainer = document.getElementById("tabsContainer");

// Add tab button
const addTab = document.getElementById("addTab");

// Counter for untitled files
let tabCount = 1;

// Editor textarea
const editor = document.getElementById("editor");

// Line number container
const lineNumbers = document.getElementById("lineNumbers");

// All tabs
const tabs = document.querySelectorAll(".tab");


// File data
const files = {

    "main.js": `console.log("Hello World");

function test() {

    return "JavaScript File";
}`,

    "style.css": `body {

    background-color: black;

    color: white;
}`
};// Get icon based on file type
function getFileIcon(fileName) {

    // JavaScript file
    if (fileName.endsWith(".js")) {

        return "🟨";
    }

    // CSS file
    if (fileName.endsWith(".css")) {

        return "🎨";
    }

    // Default icon
    return "📄";
}
// Create new tab
function createNewTab() {

    tabCount++;

    // Create tab element
    const newTab = document.createElement("div");

    // Add classes
    newTab.classList.add("tab");

    // File name
    const fileName = `untitled${tabCount}.js`;
     
    const icon = getFileIcon(fileName);

    newTab.innerHTML = `

    <span>${icon} ${fileName}</span>

    <button class="close-tab">
        ×
    </button>
`;
    // Add file identifier
    newTab.dataset.file = fileName;
    // Empty file content
    files[fileName] = "";

    // Insert before + tab
    tabsContainer.insertBefore(newTab, addTab);

    // Remove active state from old tabs
    tabs.forEach((t) => {
        t.classList.remove("active-tab");
    });

    // Activate new tab
    newTab.classList.add("active-tab");

    // Set active file
    activeFile = fileName;
    fileNameDisplay.textContent = `Editing: ${fileName}`;

   // Empty editor
    editor.value = files[fileName];
    // Put cursor inside editor
     editor.focus();

    // Update line numbers
    updateLineNumbers();
}

// FUNCTION → Update line numbers
function updateLineNumbers() {

    // Count total lines
    const lines = editor.value.split("\n").length;

    let numbers = "";

    // Generate line numbers
    for (let i = 1; i <= lines; i++) {

        numbers += i + "<br>";
    }

    // Put numbers in sidebar
    lineNumbers.innerHTML = numbers;
}

// Detect typing
editor.addEventListener("input", () => {

    // Save current editor content
    files[activeFile] = editor.value;

    // Update line numbers
    updateLineNumbers();
});

// Event delegation for tabs

// Close tab functionality
tabsContainer.addEventListener("click", (event) => {

    // Check if close button clicked
    if (!event.target.classList.contains("close-tab")) {
        return;
    }

    // Get parent tab
    const tab = event.target.parentElement;

    // Prevent deleting last file
    const allTabs = document.querySelectorAll(".tab:not(.add-tab)");

    if (allTabs.length === 1) {
        return;
    }

    // Check if tab is active
     const wasActive = tab.classList.contains("active-tab");
    // Get previous tab
     const previousTab = tab.previousElementSibling;

    // Remove file from object
    const fileName = tab.dataset.file;

    delete files[fileName];

    // Remove tab from page
    tab.remove();

    // If deleted tab was active
if (wasActive) {

    // Ignore + tab
    if (
        previousTab &&
        !previousTab.classList.contains("add-tab")
    ) {

        // Make previous tab active
        previousTab.classList.add("active-tab");

        // Get file name
        const newFile = previousTab.dataset.file;

        // Update active file state
        activeFile = newFile;

        // Load editor content
        editor.value = files[newFile];

        // Update heading
        fileNameDisplay.textContent = `Editing: ${newFile}`;

        // Refresh line numbers
        updateLineNumbers();
    }
}

});
tabsContainer.addEventListener("click", (event) => {

    // Get clicked element
    const clickedTab = event.target;

    // Check if clicked element has class "tab"
    if (!clickedTab.classList.contains("tab")) {
        return;
    }

    // Ignore + tab
    if (clickedTab.classList.contains("add-tab")) {
        return;
    }

    // Remove active class from all tabs
    document.querySelectorAll(".tab").forEach((tab) => {
        tab.classList.remove("active-tab");
    });

    // Add active class to clicked tab
    clickedTab.classList.add("active-tab");

    // Get file type
    const fileName = clickedTab.dataset.file;

    // Update active file
    activeFile = fileName;
    // Update heading
    fileNameDisplay.textContent = `Editing: ${fileName}`;

    // Load file content into editor
    editor.value = files[fileName] || "";

    // Update line numbers
    updateLineNumbers();
});

// Initial line numbers
updateLineNumbers();

// Add new tab when + clicked
addTab.addEventListener("click", createNewTab);
// Sync line number scrolling
editor.addEventListener("scroll", () => {

    lineNumbers.scrollTop = editor.scrollTop;
});