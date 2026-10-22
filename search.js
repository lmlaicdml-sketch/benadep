(() => {
    const input = document.getElementById("header-search-input");
    const searchButton = document.getElementById("header-search-button");
    const suggestionsBox = document.getElementById("search-suggestions");
    const resultsBox = document.getElementById("search-results");
    const keywordLabel = document.getElementById("search-keyword");
    const resultCount = document.getElementById("result-count");
    const sortSelect = document.getElementById("sort-products");

    if (!input || !searchButton || !suggestionsBox) return;

    const homeUrl = "/benadep/index.html";
    const currentParams = new URLSearchParams(window.location.search);
    input.value = currentParams.get("q") || "";
    let products = [];

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function readText(element, selector) {
        const found = element.querySelector(selector);
        return found ? found.textContent.replace(/\s+/g, " ").trim() : "";
    }

    function readPrice(value) {
        const match = String(value || "").replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/);
        return match ? Number(match[0]) : 0;
    }

    function extractProducts(doc) {
        const collected = [];
        const seen = new Set();

        function addProduct(card, type) {
            const image = card.querySelector(":scope > .cha1 img, .cha1 img, img");
            if (!image) return;

            const imageSrc = image.getAttribute("src");
            if (!imageSrc) return;

            let name = "";
            let brand = "";
            let priceText = "";

            if (type === "content1") {
                const title = Array.from(card.children).find(child => child.tagName === "P");
                name = title ? title.textContent.replace(/\s+/g, " ").trim() : "";
                brand = readText(card, ".cha2 .con1");
                priceText = readText(card, ".cha3 .con1");
            } else {
                name = readText(card, ":scope > .cha2") || readText(card, ".cha2");
                brand = readText(card, ".cha3 .con1");
                priceText = readText(card, ".cha4 .con1");
            }

            if (!name) return;
            const key = normalize(name) + "|" + imageSrc;
            if (seen.has(key)) return;
            seen.add(key);

            collected.push({
                name,
                brand,
                price: readPrice(priceText),
                image: imageSrc
            });
        }

        doc.querySelectorAll("#content1 .left1, #content1 .left2, #content1 .left3").forEach(card => {
            if (card.querySelector(".cha1 img")) addProduct(card, "content1");
        });

        doc.querySelectorAll("#content3 .ong1, #content6 .ong1").forEach(card => {
            if (card.querySelector(".cha1 img") && card.querySelector(".cha2")) addProduct(card, "product");
        });

        return collected;
    }

    function matches(product, query) {
        const searchText = normalize([product.name, product.brand].join(" "));
        return searchText.includes(normalize(query));
    }

    function hideSuggestions() {
        suggestionsBox.hidden = true;
    }

    function goToSearch(value) {
        const query = String(value || "").trim();
        if (!query) {
            input.focus();
            return;
        }
        window.location.href = "/benadep/search.html?q=" + encodeURIComponent(query);
    }

    function drawSuggestions() {
        const query = input.value.trim();
        suggestionsBox.replaceChildren();

        if (!query) {
            hideSuggestions();
            return;
        }

        const found = products.filter(product => matches(product, query)).slice(0, 8);

        if (found.length === 0) {
            const message = document.createElement("div");
            message.className = "search-suggestion search-suggestion-empty";
            message.textContent = "No matching product. Press Search to try this keyword.";
            suggestionsBox.appendChild(message);
            suggestionsBox.hidden = false;
            return;
        }

        found.forEach(product => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "search-suggestion";

            const icon = document.createElement("span");
            icon.className = "search-suggestion-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = "⌕";

            const name = document.createElement("span");
            name.className = "search-suggestion-name";
            name.textContent = product.name;

            item.append(icon, name);
            item.addEventListener("click", () => goToSearch(product.name));
            suggestionsBox.appendChild(item);
        });

        suggestionsBox.hidden = false;
    }

    function drawResults() {
        if (!resultsBox) return;

        const query = currentParams.get("q") || "";
        if (keywordLabel) keywordLabel.textContent = query ? `“${query}”` : "All products";

        let found = query ? products.filter(product => matches(product, query)) : [...products];
        const sort = sortSelect ? sortSelect.value : "match";

        if (sort === "price-low") found.sort((a, b) => a.price - b.price);
        if (sort === "price-high") found.sort((a, b) => b.price - a.price);
        if (sort === "name") found.sort((a, b) => a.name.localeCompare(b.name));

        if (resultCount) resultCount.textContent = `${found.length} products found`;
        resultsBox.replaceChildren();

        if (found.length === 0) {
            const empty = document.createElement("div");
            empty.className = "search-empty";
            empty.textContent = query
                ? `No products found for “${query}”. Try another keyword in the search bar above.`
                : "No products are available yet.";
            resultsBox.appendChild(empty);
            return;
        }

        found.forEach(product => {
            const card = document.createElement("article");
            card.className = "search-product";

            const imageWrap = document.createElement("div");
            imageWrap.className = "search-product-image-wrap";
            const image = document.createElement("img");
            image.className = "search-product-image";
            image.src = product.image;
            image.alt = product.name;
            image.loading = "lazy";
            image.onerror = () => { imageWrap.hidden = true; };
            imageWrap.appendChild(image);

            const name = document.createElement("h3");
            name.className = "search-product-name";
            name.textContent = product.name;

            const brand = document.createElement("p");
            brand.className = "search-product-brand";
            brand.textContent = product.brand || "Bena";

            const price = document.createElement("p");
            price.className = "search-product-price";
            price.textContent = product.price > 0 ? `$${product.price.toFixed(2)}` : "See details";

            card.append(imageWrap, name, brand, price);
            resultsBox.appendChild(card);
        });
    }

    input.addEventListener("input", drawSuggestions);
    input.addEventListener("focus", () => {
        if (input.value.trim()) drawSuggestions();
    });
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            goToSearch(input.value);
        }
        if (event.key === "Escape") hideSuggestions();
    });

    searchButton.addEventListener("click", () => goToSearch(input.value));
    searchButton.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            goToSearch(input.value);
        }
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".search-autocomplete")) hideSuggestions();
    });

    if (sortSelect) sortSelect.addEventListener("change", drawResults);

    fetch(homeUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Request failed: ${response.status}`);
            return response.text();
        })
        .then(html => {
            const doc = new DOMParser().parseFromString(html, "text/html");
            products = extractProducts(doc);
            drawResults();
            if (input.value.trim()) drawSuggestions();
            if (products.length === 0 && resultCount) {
                resultCount.textContent = "No product cards were found. Check the selectors in index.html.";
            }
        })
        .catch(error => {
            console.error("Bena search catalog error:", error);
            if (resultCount) {
                resultCount.textContent = "Could not load products. Check that the homepage is available at /benadep/index.html.";
            }
            if (input.value.trim()) {
                suggestionsBox.replaceChildren();
                const message = document.createElement("div");
                message.className = "search-suggestion";
                message.textContent = "Product suggestions could not load. Please check the homepage path.";
                suggestionsBox.appendChild(message);
                suggestionsBox.hidden = false;
            }
        });
})();


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