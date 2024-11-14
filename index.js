const selectWrapper = document.querySelector(".select-wrapper");
const selectElement = selectWrapper.querySelector("#selected-algorithm");

// Function to toggle the arrow rotation
function toggleSelectOpen() {
    selectWrapper.classList.toggle("open");
}

// Function to close the select and reset the arrow rotation
function closeSelect() {
    selectWrapper.classList.remove("open");
}

// Event listener to toggle the rotation on click
selectElement.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevents triggering the document click event
    toggleSelectOpen();
});

// Event listener to close the select when an option is selected
selectElement.addEventListener("change", closeSelect);


