const socket = io("https://collaborativeide-frontend-pjof.onrender.com");
socket.on("code-change", (data) => {
    files[data.file] = data.code;
    if(data.file === firstFile) {
        editor.value = data.code;
    updateLineNumbers();
}
});
socket.on("create-file",(data)=>{
    console.log("CREATE FILE EVENT:",data);
    if(files[data.file]){
       return;
    }
    files[data.file] = "";
    createTabUI(data.file);
});
socket.on("rename-file",(data)=>{
    files[data.newName]=files[data.oldName];
    delete files[data.oldName];
    const tab=document.querySelector(`.tab[data-file="${data.oldName}"]`);
    if(!tab){
        return;
    }
    tab.dataset.file=data.newName;
    const icon=getFileIcon(data.newName);
    const fileSpan=tab.querySelector("span");
    fileSpan.textContent=`${icon} ${data.newName}`;})
socket.on("delete-file",(data)=>{
    delete files[data.file];
    const tab = document.querySelector(`.tab[data-file="${data.file}"]`);
    if(tab){
        const wasActive = tab.classList.contains("active-tab");
        tab.remove();
        if(wasActive){
            const firstTab = document.querySelector(".tab:not(.add-tab)");
            if(firstTab){
                firstTab.classList.add("active-tab");
                firstFile = firstTab.dataset.file;
                editor.value = files[firstFile] || "";
            }}
        }
});
socket.on("user-list",(users)=>{
    renderUsers(users);
});
socket.on("room-state",(roomData)=>{
    loadRoomState(roomData);
});
function loadRoomState(roomData){
    tabsContainer.querySelectorAll(".tab:not(.add-tab)").forEach(tab=>tab.remove());
    for(let file in roomData){
        files[file]=roomData[file];
        createTabUI(file);
    }
    if(Object.keys(files).length > 0){
        firstFile=Object.keys(files)[0];
        editor.value=files[firstFile];
        fileNameDisplay.textContent=`Editing: ${firstFile}`;
        updateLineNumbers();
    }
}

// DOM elements (SELECTORS)
// User list
const userList = document.getElementById("userList");
//ROOM JOINING
const roomInput = document.getElementById("roomInput");
const joinRoomBtn=document.getElementById("joinRoomBtn");

// Run button
const runBtn = document.getElementById("runBtn");

// Output iframe
const outputFrame = document.getElementById("outputFrame");
// File name display
const fileNameDisplay = document.getElementById("fileNameDisplay");
// Current active file
let firstFile = "main.js";

// Tabs container
const tabsContainer = document.getElementById("tabsContainer");

// Add tab button
const addTab = document.getElementById("addTab");

// Editor textarea
const editor = document.getElementById("editor");

// Line number container
const lineNumbers = document.getElementById("lineNumbers");

//Current room
let currentRoom="";
joinRoomBtn.addEventListener("click", () => {
    const roomId = roomInput.value.trim();
    if(!roomId) {
        alert("Please enter a room ID");
        return;
    }
    socket.emit("join-room", roomId);
    currentRoom=roomId;
    alert(`Joined room ${roomId}`);
});


// File data
const files = {};
// Get icon based on file type
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
function createTabUI(fileName){
    const newTab = document.createElement("div");

    // Add classes
    newTab.classList.add("tab");
    const icon=getFileIcon(fileName);
    newTab.innerHTML = `<span>${icon} ${fileName}</span>
    <button class="close-tab">
        ×
    </button>`;
    newTab.dataset.file=fileName;
    tabsContainer.insertBefore(newTab, addTab);
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
    firstFile = fileName;
    fileNameDisplay.textContent = `Editing: ${fileName}`;

    socket.emit("create-file", {file: fileName, content: files[fileName]});

   // Empty editor
    editor.value = files[fileName];
    // Put cursor inside editor
     editor.focus();

    // Update line numbers
    updateLineNumbers();
}
// Render user list
function renderUsers(users) {
    userList.innerHTML = "";
    users.forEach((user,index)=>{
        const li=document.createElement("li");
        li.textContent=`🟢User ${index+1}`;
        userList.appendChild(li);   
    });
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
    files[firstFile] = editor.value;

    // Update line numbers
    updateLineNumbers();
    // Auto update preview
    runCode();
    //Send code through socket
    socket.emit("code-change", {file: firstFile, code: editor.value});
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
        socket.emit("delete-file", {file: tab.dataset.file});
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
            firstFile = newFile;

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
    firstFile = fileName;

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
    socket.emit("rename-file",{oldName: oldFileName, newName: newFileName});

    // Update active file if needed
    if (firstFile === oldFileName) {

        firstFile = newFileName;

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