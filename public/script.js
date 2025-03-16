let searchResultsEl = document.getElementById("searchResults");
let searchInputEl = document.getElementById("searchInput");
let spinnerEl = document.getElementById("spinner");
let messageEl = document.getElementById("message");


document.getElementById('home').addEventListener('click', function() {
    window.location.href = 'home.html';
});


function fetchData(searchQuery) {
    let url = `https://apis.ccbp.in/book-store?title=${searchQuery}`;
    let options = {
        method: "GET"
    };

    spinnerEl.classList.remove("d-none");

    fetch(url, options)
        .then(function(response) {
            return response.json();
        })
        .then(function(jsonData) {
            renderResults(jsonData.search_results);
        })
        .catch(function(error) {
            console.error('Error:', error);
        })
        .finally(function() {
            spinnerEl.classList.add("d-none");
        });
}

function renderResults(searchResults) {
    searchResultsEl.innerHTML = '';
    searchResults.forEach(function(result) {
        let imgElement = document.createElement('img');
        imgElement.src = result.imageLink;
        imgElement.className = 'img-fluid';

        let pElement = document.createElement('p');
        pElement.textContent = result.author;

        let titleElement = document.createElement('p');
        titleElement.textContent = result.title;

        let container = document.createElement('div');
        container.className = 'col-12 col-sm-6 col-md-4 col-lg-3 book-card';
        container.appendChild(imgElement);
        container.appendChild(titleElement);
        container.appendChild(pElement);

        searchResultsEl.appendChild(container);
    });
}

searchInputEl.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        let searchQuery = searchInputEl.value.trim();
        if (searchQuery) {
            fetchData(searchQuery);
        } else {
            console.log('Please enter a search query');
        }
    }
});
