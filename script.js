// Editor textarea
const editor = document.getElementById("editor");

// Line number container
const lineNumbers = document.getElementById("lineNumbers");

// All tabs
const tabs = document.querySelectorAll(".tab");


// Fake file contents
const files = {

    js: `console.log("Hello World");

function test() {

    return "JavaScript File";
}`,

    css: `body {

    background-color: black;

    color: white;
}`
};


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


// Detect typing inside editor
editor.addEventListener("input", updateLineNumbers);


// Tab switching
tabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        // Ignore + tab
        if (tab.classList.contains("add-tab")) {
            return;
        }

        // Remove active class from all tabs
        tabs.forEach((t) => {
            t.classList.remove("active-tab");
        });

        // Add active class to clicked tab
        tab.classList.add("active-tab");

        // Get selected file
        const fileType = tab.dataset.file;

        // Change editor content
        editor.value = files[fileType];

        // Refresh line numbers
        updateLineNumbers();
    });

});


// Initial line numbers
updateLineNumbers();