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
    document.querySelectorAll(".tab").forEach((tab) => {

    tab.classList.remove("active-tab");
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
// Tab interactions
tabsContainer.addEventListener("click", (event) => {

    // Check if close button clicked
    if (event.target.classList.contains("close-tab")) {

        // Stop bubbling
        event.stopPropagation();

        // Get tab element
        const tab = event.target.closest(".tab");

        // Get all tabs except +
        const allTabs = document.querySelectorAll(
            ".tab:not(.add-tab)"
        );

        // Prevent deleting last tab
        if (allTabs.length === 1) {
            return;
        }

        // Check if active
        const wasActive = tab.classList.contains("active-tab");
        // Get previous tab
        let previousTab = tab.previousElementSibling;

        // Get filename
        const fileName = tab.dataset.file;

        // Delete file data
        delete files[fileName];

        // Remove tab
        tab.remove();

        // If active tab deleted
        if (wasActive) {

           // If no previous tab exists
            // OR previous tab is +
            // then select first remaining tab
            if (
                !previousTab ||
                previousTab.classList.contains("add-tab")
            ) {

                previousTab = document.querySelector(
                    ".tab:not(.add-tab)"
                );
            }

            // Remove old active states
            document.querySelectorAll(".tab").forEach((tab) => {

                tab.classList.remove("active-tab");
            });

            // Activate tab
            previousTab.classList.add("active-tab");

            // Get new filename
            const newFile = previousTab.dataset.file;

            // Update state
            activeFile = newFile;

            // Load editor content
            editor.value = files[newFile];
            editor.focus();

            // Update heading
            fileNameDisplay.textContent =
                `Editing: ${newFile}`;

            // Update line numbers
            updateLineNumbers();
        }

        return;
    }

    // Find clicked tab
    const clickedTab = event.target.closest(".tab");

    // Ignore invalid clicks
    if (!clickedTab) {
        return;
    }

    // Ignore + button
    if (clickedTab.classList.contains("add-tab")) {
        return;
    }

    // Remove old active tabs
    document.querySelectorAll(".tab").forEach((tab) => {

        tab.classList.remove("active-tab");
    });

    // Activate clicked tab
    clickedTab.classList.add("active-tab");

    // Get filename
    const fileName = clickedTab.dataset.file;

    // Update state
    activeFile = fileName;

    // Update heading
    fileNameDisplay.textContent =
        `Editing: ${fileName}`;

    // Load content
    editor.value = files[fileName] || "";
    // Focus editor
    editor.focus();

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