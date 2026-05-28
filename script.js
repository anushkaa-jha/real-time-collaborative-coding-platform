// Run button
const runBtn = document.getElementById("runBtn");

// Output iframe
const outputFrame = document.getElementById("outputFrame");
// File name display
const fileNameDisplay = document.getElementById("fileNameDisplay");
// Current active file
let activeFile = "main.js";

// Tabs container
const tabsContainer = document.getElementById("tabsContainer");

// Add tab button
const addTab = document.getElementById("addTab");

// Editor textarea
const editor = document.getElementById("editor");

// Line number container
const lineNumbers = document.getElementById("lineNumbers");


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

//Generate starter code
function getStarterTemplate(fileName) {
    //HTML file
    if (fileName.endsWith(".html")) {
        return `<!DOCTYPE html>
        <html>
        <head>
            <title>${fileName}</title>
        </head>
        <body>

        </body>
        </html>`;
    }

    //CSS file
    if (fileName.endsWith(".css")) {
        return `body{
        }`;
    }

    //JavaScript file
    if (fileName.endsWith(".js")) {
        return `console.log("Hello World");`;
    }
    // Default starter template
    return `// ${fileName}`;
}

// Create new tab
function createNewTab() {


    // Create tab element
    const newTab = document.createElement("div");

    // Add classes
    newTab.classList.add("tab");

    // Ask user for file name
        const fileName = prompt("Enter file name");
        // Stop if user cancels or leaves empty
        if (!fileName) {
            return;
        }
        //Prevent duplicate file names
        if (files[fileName]) {
            alert("File already exists");
            return;
        }
     
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
    files[fileName] = getStarterTemplate(fileName);

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
    // Auto update preview
    runCode();
});

// Event delegation for tabs
// Tab interactions
tabsContainer.addEventListener("click", (event) => {

    // CLOSE TAB
    if (event.target.classList.contains("close-tab")) {

        // Prevent other tab logic
        event.stopImmediatePropagation();

        // Get tab
        const tab = event.target.closest(".tab");

        // Get all real tabs
        const allTabs = document.querySelectorAll(
            ".tab:not(.add-tab)"
        );

        // Prevent deleting last tab
        if (allTabs.length === 1) {
            return;
        }

        // Check if deleting active tab
        const isActive =
            tab.classList.contains("active-tab");

        // Get next tab
        let nextTab = tab.nextElementSibling;

        // Get previous tab
        let previousTab = tab.previousElementSibling;

        // Remove file data
        delete files[tab.dataset.file];

        // Remove tab from DOM
        tab.remove();

        // If deleted tab was active
        if (isActive) {

            let newActiveTab;

            // Prefer next tab
            if (
                nextTab &&
                !nextTab.classList.contains("add-tab")
            ) {

                newActiveTab = nextTab;

            } else {

                // Otherwise use previous tab
                newActiveTab = previousTab;
            }

            // Remove all active states
            document.querySelectorAll(".tab")
                .forEach((tab) => {

                tab.classList.remove("active-tab");
            });

            // Activate chosen tab
            newActiveTab.classList.add("active-tab");

            // Get file name
            const newFile =
                newActiveTab.dataset.file;

            // Update state
            activeFile = newFile;

            // Update editor
            editor.value = files[newFile] || "";

            // Update heading
            fileNameDisplay.textContent =
                `Editing: ${newFile}`;

            // Focus editor
            editor.focus();

            // Refresh line numbers
            updateLineNumbers();
        }

        return;
    }

    // TAB SWITCHING
    const clickedTab =
        event.target.closest(".tab");

    // Invalid click
    if (!clickedTab) {
        return;
    }

    // Ignore +
    if (
        clickedTab.classList.contains("add-tab")
    ) {
        return;
    }

    // Remove active states
    document.querySelectorAll(".tab")
        .forEach((tab) => {

        tab.classList.remove("active-tab");
    });

    // Activate tab
    clickedTab.classList.add("active-tab");

    // Get filename
    const fileName =
        clickedTab.dataset.file;

    // Update state
    activeFile = fileName;

    // Update heading
    fileNameDisplay.textContent =
        `Editing: ${fileName}`;

    // Load editor content
    editor.value =
        files[fileName] || "";

    // Focus editor
    editor.focus();

    // Refresh line numbers
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
// Run code function
function runCode() {

    //Visual feedback for run button
    runBtn.classList.add("running");

    // Get iframe document
    const frameDocument =
        outputFrame.contentWindow.document;

    // Store different file contents
    let htmlCode = "";

    let cssCode = "";

    let jsCode = "";

    // Check every file
    for (let fileName in files) {

        // HTML file
        if (fileName.endsWith(".html")) {

            htmlCode = files[fileName];
        }

        // CSS file
        else if (fileName.endsWith(".css")) {

            cssCode = files[fileName];
        }

        // JavaScript file
        else if (fileName.endsWith(".js")) {

            jsCode = files[fileName];
        }
    }
    //No HTML found
    if(!htmlCode.trim()) {
        frameDocument.open();

        frameDocument.write(`

            <body
                style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                Create an HTML file to see the preview
            </body>

        `);
        frameDocument.close();

        return;
    }
    // Write editor code into iframe
    frameDocument.open();

    frameDocument.write(`

        <html>

            <style>
                ${cssCode}
            </style>

            <body>
                ${htmlCode}
            </body>

            <script>
                ${jsCode}
            </script>

        </html>

    `);

    frameDocument.close();
    setTimeout(() => {

        runBtn.classList.remove("running");
    }, 200);
}
    // Run button click
    runBtn.addEventListener("click", runCode);

// Rename file on double click
tabsContainer.addEventListener("dblclick", (event) => {

    // Get nearest tab
    const clickedTab =
        event.target.closest(".tab");

    // Ignore invalid clicks
    if (
        !clickedTab ||
        clickedTab.classList.contains("add-tab")
    ) {
        return;
    }

    // Get old file name
    const oldFileName =
        clickedTab.dataset.file;

    // Ask user for new file name
    const newFileName =
        prompt(
            "Enter new file name",
            oldFileName
        );

    // Stop if empty
    if (!newFileName) {
        return;
    }

    // Prevent duplicate names
    if (files[newFileName]) {

        alert("File already exists");

        return;
    }

    // Copy old content
    files[newFileName] =
        files[oldFileName];

    // Delete old content
    delete files[oldFileName];

    // Update dataset
    clickedTab.dataset.file =
        newFileName;

    // Update icon
    const icon =
        getFileIcon(newFileName);

    // Find filename span
    const fileSpan =
        clickedTab.querySelector("span");

    // Update visible filename
    fileSpan.textContent =
        `${icon} ${newFileName}`;

    // Update active file if needed
    if (activeFile === oldFileName) {

        activeFile = newFileName;

        fileNameDisplay.textContent =
            `Editing: ${newFileName}`;
    }
});

//Keyboard shortcut for running code (Ctrl + Enter)
document.addEventListener("keydown", (event) => {
    if(event.ctrlKey && event.key === "Enter") {
        runCode();
    }
});
