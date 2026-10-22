
const support = document.querySelector('.support .cha2')
const supportX = document.querySelectorAll('.close-support')
const supportOpen = document.querySelectorAll('.open-support')

function closeSupport() {
    support.classList.add('haha')
}

for (const supportOf of supportX) {
    supportOf.addEventListener('click', closeSupport)
}

function openSupport() {
    support.classList.remove('haha')
}

for (const supportOp of supportOpen) {
    supportOp.addEventListener('click', openSupport)
}





function updateFlashSaleCountdown() {
    const now = new Date();

    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const remaining = Math.max(0, midnight.getTime() - now.getTime());

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining / (1000 * 60)) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);

    document.getElementById("flash-hours").textContent =
        String(hours).padStart(2, "0");

    document.getElementById("flash-minutes").textContent =
        String(minutes).padStart(2, "0");

    document.getElementById("flash-seconds").textContent =
        String(seconds).padStart(2, "0");
}

updateFlashSaleCountdown();
setInterval(updateFlashSaleCountdown, 1000);




const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

function goToSearchPage() {
    const keyword = searchInput.value.trim();

    if (keyword === "") {
        searchInput.focus();
        return;
    }

    window.location.href =
        "search.html?q=" + encodeURIComponent(keyword);
}

searchButton.addEventListener("click", goToSearchPage);

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        goToSearchPage();
    }
});


