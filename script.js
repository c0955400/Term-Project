document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false';
    let coins = [];
    let filteredCoins = [];
    let comparisonList = [];
  
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('search');
  
    // Load saved comparison list from localStorage if available
    if (localStorage.getItem('comparisonList')) {
      comparisonList = JSON.parse(localStorage.getItem('comparisonList'));
      updateComparisonSection();
    }
  
    // Fetch data from CoinGecko API and populate the table
    function fetchData() {
      loader.style.display = 'block';
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          coins = data;
          const sortValue = document.getElementById('sort-options').value;
          coins = sortCoins(coins, sortValue);
          filteredCoins = coins; // Start with all coins displayed
          populateTable();
          loader.style.display = 'none';
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          loader.textContent = 'Error loading data.';
        });
    }
  
    // Sort coins based on selected option
    function sortCoins(coinsArray, sortOption) {
      let sortedCoins = [...coinsArray];
      switch (sortOption) {
        case 'market_cap_desc':
          sortedCoins.sort((a, b) => b.market_cap - a.market_cap);
          break;
        case 'market_cap_asc':
          sortedCoins.sort((a, b) => a.market_cap - b.market_cap);
          break;
        case 'price_desc':
          sortedCoins.sort((a, b) => b.current_price - a.current_price);
          break;
        case 'price_asc':
          sortedCoins.sort((a, b) => a.current_price - b.current_price);
          break;
        case 'change_desc':
          sortedCoins.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
          break;
        case 'change_asc':
          sortedCoins.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
          break;
        default:
          // No special sorting
          break;
      }
      return sortedCoins;
    }
  
    // Populate the cryptocurrency table
    function populateTable() {
      const tbody = document.querySelector('#crypto-table tbody');
      tbody.innerHTML = ''; // Clear previous data
  
      filteredCoins.forEach(coin => {
        const tr = document.createElement('tr');
  
        // Name
        const nameTd = document.createElement('td');
        nameTd.textContent = coin.name;
        tr.appendChild(nameTd);
  
        // Symbol
        const symbolTd = document.createElement('td');
        symbolTd.textContent = coin.symbol.toUpperCase();
        tr.appendChild(symbolTd);
  
        // Price
        const priceTd = document.createElement('td');
        priceTd.textContent = `$${coin.current_price.toLocaleString()}`;
        tr.appendChild(priceTd);
  
        // 24h Change
        const changeTd = document.createElement('td');
        const change = coin.price_change_percentage_24h;
        changeTd.textContent = change ? `${change.toFixed(2)}%` : 'N/A';
        changeTd.style.color = change >= 0 ? 'limegreen' : 'red';
        tr.appendChild(changeTd);
  
        // Market Cap
        const marketCapTd = document.createElement('td');
        marketCapTd.textContent = `$${coin.market_cap.toLocaleString()}`;
        tr.appendChild(marketCapTd);
  
        // Compare Button
        const compareTd = document.createElement('td');
        const compareButton = document.createElement('button');
        compareButton.textContent = 'Add';
        compareButton.addEventListener('click', () => addToComparison(coin));
        compareTd.appendChild(compareButton);
        tr.appendChild(compareTd);
  
        tbody.appendChild(tr);
      });
    }
  
    // Filter coins based on search input
    function filterCoins(query) {
      query = query.toLowerCase();
      filteredCoins = coins.filter(coin =>
        coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query)
      );
      populateTable();
    }
  
    // Add a coin to the comparison list
    function addToComparison(coin) {
      if (comparisonList.find(item => item.id === coin.id)) {
        alert(`${coin.name} is already in the comparison list.`);
        return;
      }
      if (comparisonList.length >= 5) {
        alert('You can only compare up to 5 cryptocurrencies.');
        return;
      }
      comparisonList.push(coin);
      localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
      updateComparisonSection();
    }
  
    // Update the comparison section with selected coins
    function updateComparisonSection() {
      const container = document.getElementById('comparison-container');
      container.innerHTML = ''; // Clear previous content
  
      comparisonList.forEach((coin, index) => {
        const div = document.createElement('div');
        div.classList.add('comparison-item');
        div.innerHTML = `
          <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
          <p>Price: $${coin.current_price.toLocaleString()}</p>
          <p>24h Change: ${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : 'N/A'}%</p>
          <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
          <button data-index="${index}" class="remove-btn">Remove</button>
        `;
        container.appendChild(div);
      });
    }
  
    // Remove a coin from the comparison list
    document.getElementById('comparison-container').addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('remove-btn')) {
        const index = e.target.getAttribute('data-index');
        comparisonList.splice(index, 1);
        localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
        updateComparisonSection();
      }
    });
  
    // Clear the entire comparison list
    document.getElementById('clear-comparison').addEventListener('click', () => {
      comparisonList = [];
      localStorage.removeItem('comparisonList');
      updateComparisonSection();
    });
  
    // Apply sorting preferences and update both the table and comparison section
    document.getElementById('apply-preferences').addEventListener('click', () => {
      const sortValue = document.getElementById('sort-options').value;
      // Sort all coins
      coins = sortCoins(coins, sortValue);
      filteredCoins = coins;
      populateTable();
  
      // Also sort the items in the comparison list
      comparisonList = sortCoins(comparisonList, sortValue);
      updateComparisonSection();
    });
  
    // Listen for search input changes
    searchInput.addEventListener('input', (e) => {
      filterCoins(e.target.value);
    });
  
    // Initial fetch and update data every minute
    fetchData();
    setInterval(fetchData, 60000);
  });
  