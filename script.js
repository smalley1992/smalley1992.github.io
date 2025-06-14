const datePicker = document.getElementById('datePicker');
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1); // Add one day to get tomorrow

const maxDate = tomorrow.toISOString().split('T')[0];
datePicker.setAttribute('max', maxDate); // Set tomorrow as the max date

datePicker.value = today.toISOString().split('T')[0]; // Set today as the default selected date

function toggleSettingsPanel() {
    const panel = document.querySelector('.settings-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

let autoCloseTimeout = null; // Hold the timeout reference

function toggleSettingsPanel() {
    const panel = document.querySelector('.settings-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';

    // Clear existing timeout to prevent multiple instances
    clearTimeout(autoCloseTimeout);

    // Set the panel to automatically close after 5 seconds if it's opened
    if (panel.style.display === 'block') {
        autoCloseTimeout = setTimeout(() => {
            panel.style.display = 'none';
        }, 5000); // 5000 milliseconds = 5 seconds
    }
}

function closeReferralBar() {
    const referralLinkBar = document.querySelector('.referral-link');
    referralLinkBar.style.display = 'none';
}

document.getElementById('datePicker').addEventListener('change', function() {
    updateData(this.value); // Trigger data update when date changes
    updateTitleDate(this.value); // Also update the title date
});

document.getElementById('regionPicker').addEventListener('change', function() {
    updateCurrentRegion(); // Update displayed region information

    const selectedRegion = this.value;
    const selectedTariff = document.getElementById('tariffPicker').value;
    const newUrl = `${window.location.pathname}?region=${selectedRegion}&tariff=${selectedTariff}`;
    
    history.pushState({path:newUrl}, '', newUrl);
    updateData(); // Assuming this function fetches and updates data based on the selected region

});

document.getElementById('tariffPicker').addEventListener('change', function() {
    const selectedTariff = this.value;
    const currentRegion = document.getElementById('regionPicker').value;
    const newUrl = `${window.location.pathname}?region=${currentRegion}&tariff=${selectedTariff}`;
    
    history.pushState({path:newUrl}, '', newUrl);
    updateData(); // Fetch and update data based on the new tariff
    updateCurrentTariff(); // Update displayed tariff information
});
            
document.getElementById('datePicker').addEventListener('change', resetAutoCloseTimer);
document.getElementById('regionPicker').addEventListener('change', resetAutoCloseTimer);
document.getElementById('tariffPicker').addEventListener('change', resetAutoCloseTimer);
document.querySelector('.btn-close').addEventListener('click', resetAutoCloseTimer);

// Additionally, consider other interactions that should reset the timer
document.querySelector('.settings-panel').addEventListener('mousemove', resetAutoCloseTimer);
document.querySelector('.settings-panel').addEventListener('keypress', resetAutoCloseTimer);

document.addEventListener('DOMContentLoaded', function() {
const params = new URLSearchParams(window.location.search);
const regionFromURL = params.get('region'); // Get 'region' parameter from URL
const tariffFromURL = params.get('tariff'); // Get 'tariff' parameter from URL

const regionPicker = document.getElementById('regionPicker');
if (regionFromURL) {
    const normalizedRegionFromURL = regionFromURL.toUpperCase(); // Convert URL parameter to uppercase
    for (const option of regionPicker.options) {
        if (option.value === normalizedRegionFromURL) {
            option.selected = true;
            break;
        }
    }
}

const tariffPicker = document.getElementById('tariffPicker');
if (tariffFromURL) {
    const normalizedTariffFromURL = tariffFromURL.toUpperCase(); // Convert URL parameter to uppercase
    for (const option of tariffPicker.options) {
        if (option.value === normalizedTariffFromURL) {
            option.selected = true;
            break;
        }
    }
}

// Trigger data update with the current selection
updateData();
updateCurrentRegion();
updateCurrentTariff(); // Update displayed tariff information
});

document.addEventListener('DOMContentLoaded', function() {
    const prevDayButton = document.getElementById('prevDay');
    const nextDayButton = document.getElementById('nextDay');
    const datePicker = document.getElementById('datePicker');

    const adjustDate = (days) => {
        let currentDate = new Date(datePicker.value);
        currentDate.setDate(currentDate.getDate() + days);

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Set tomorrow's date

        // Ensure the new date is not beyond tomorrow
        if (currentDate <= tomorrow) {
            datePicker.value = currentDate.toISOString().split('T')[0];
            
            updateData(datePicker.value); // Update the dashboard with the new date
            updateTitleDate(datePicker.value); // Optionally, update the date in the title if you have this function
        } else {
            console.log("Cannot select a date beyond tomorrow."); // Optional: Handle attempts to exceed the date limit
        }
    };
    
    // Event listeners for the arrows
    prevDayButton.addEventListener('click', () => adjustDate(-1));
    nextDayButton.addEventListener('click', () => adjustDate(1));
});

async function updateData(selectedDate) {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);

    const todayDate = date.toISOString().split('T')[0];
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    await fetchTariffData('gas', todayDate, 'Today');
    await fetchTariffData('electricity', todayDate, 'Today');
    await fetchTariffData('gas', tomorrowDate, 'Tomorrow');
    await fetchTariffData('electricity', tomorrowDate, 'Tomorrow');
}

function updateTitleDate(selectedDate) {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    const dateString = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('currentDate').textContent = `Date: ${dateString}`;
}

function updateCurrentRegion() {
    const regionPicker = document.getElementById('regionPicker');
    const selectedRegion = regionPicker.options[regionPicker.selectedIndex].text;
    document.getElementById('currentRegion').textContent = `Region: ${selectedRegion}`;
}

function updateCurrentTariff() {
    const tariffPicker = document.getElementById('tariffPicker');
    const selectedTariff = tariffPicker.value;

    const tariffMap = {
        'SILVER-23-12-06': 'December 2023 v1',
        'SILVER-24-04-03': 'April 2024 v1',
        'SILVER-24-07-01': 'July 2024 v1',
        'SILVER-24-10-01': 'October 2024 v1',
        'SILVER-24-12-31': 'December 2024 v1',
        'SILVER-25-04-11': 'April 2025 v1',
        'SILVER-25-04-15': 'April 2025 v2'
    };

    const tariffDisplayText = tariffMap[selectedTariff] || '';
    document.getElementById('currentTariff').textContent = `Tariff: ${tariffDisplayText}`;
}


async function fetchTariffData(tariffType, date, period) {
    const regionPicker = document.getElementById('regionPicker');
    const tariffPicker = document.getElementById('tariffPicker');
    const selectedRegion = regionPicker.value; // Get the selected region value
    const selectedTariff = tariffPicker.value; // Get the selected tariff value

    // Adjust the URL to use the selected region and tariff
    const baseUrl = `https://api.octopus.energy/v1/products/${selectedTariff}/${tariffType}-tariffs/${tariffType[0].toUpperCase()}-1R-${selectedTariff}-${selectedRegion}/standard-unit-rates/`;
    const url = `${baseUrl}?period_from=${date}T00:00:00Z&period_to=${date}T22:59:59Z`;
    
    const response = await fetch(url);
    if (response.ok) {
        const data = await response.json();
        displayPriceAndDate(data.results[0], `${tariffType}TariffData`, tariffType, period);
    } else {
        document.getElementById(`${tariffType}TariffData`).innerHTML = 'Data loading error';
    }
}

function displayPriceAndDate(result, elementId, tariffType, period) {
    const container = document.getElementById(elementId);
    if (period === 'Today') {
        const priceHTML = `<div class='price'>${result.value_inc_vat.toFixed(2)}p</div>`;
        // Check the tariff type and apply appropriate color
        let iconColor = tariffType === 'gas' ? 'style="color:orange;"' : 'style="color:YELLOW;"';
        let iconClass = tariffType === 'gas' ? 'fa-burn' : 'fa-bolt';
        container.innerHTML = `<i class="fas ${iconClass} icon" ${iconColor}></i>
                            <div class='title h5'>${tariffType.toUpperCase()} Tariff</div>
                            ${priceHTML}
                            <div class='tomorrow-price' id='tomorrow-${tariffType}'>Loading...</div>`;
    } else if (period === 'Tomorrow') {
        if (!result || result.value_inc_vat === undefined) {
            document.getElementById(`tomorrow-${tariffType}`).innerHTML = "Tomorrow: Available Soon";
            return;
        }

        const tomorrowPrice = parseFloat(result.value_inc_vat.toFixed(2));
        const todayElement = document.getElementById(`${tariffType}TariffData`);
        const todayPriceElement = todayElement.querySelector('.price');
        const todayPrice = todayPriceElement ? parseFloat(todayPriceElement.textContent.replace('p', '')) : 0;

        let priceClass = '', iconHtml = 'Tomorrow:&nbsp;', percentageChange = 0;
        if (tomorrowPrice > todayPrice) {
            priceClass = 'highlight-red';
            percentageChange = ((tomorrowPrice - todayPrice) / todayPrice) * 100;
            iconHtml += `<i class="fas fa-arrow-up" style="color:red;"></i>&nbsp;`;
        } else if (tomorrowPrice < todayPrice) {
            priceClass = 'highlight-green';
            percentageChange = ((todayPrice - tomorrowPrice) / todayPrice) * 100;
            iconHtml += `<i class="fas fa-arrow-down" style="color:green;"></i>&nbsp;`;
        } else {
            // For equality, no change in price or percentage
        }

        // Removing explicit color style to use the class-based coloring
        let percentageChangeHtml = percentageChange > 0 ? ` <span class="${priceClass}" style="font-size:0.8rem;">(${percentageChange.toFixed(2)}%)</span>` : '';

        const tomorrowElement = document.getElementById(`tomorrow-${tariffType}`);
        tomorrowElement.innerHTML = `${iconHtml}<span class="${priceClass}">${tomorrowPrice}p</span>&nbsp;${percentageChangeHtml}`;
    }
}

function resetAutoCloseTimer() {
    clearTimeout(autoCloseTimeout); // Clear existing timer
    
    // Set a new timer
    autoCloseTimeout = setTimeout(() => {
        document.querySelector('.settings-panel').style.display = 'none';
    }, 5000); // Close after 5 seconds of inactivity
}

function toggleSettingsPanel() {
    const panel = document.querySelector('.settings-panel');
    const isPanelOpen = panel.style.display === 'block';

    panel.style.display = isPanelOpen ? 'none' : 'block';

    if (!isPanelOpen) { // If we're opening the panel, reset/start the auto-close timer
        resetAutoCloseTimer();
    }
}

window.onload = function() {
    updateData(); // Initial data load
    updateTitleDate(); // Set the current date at load
    updateCurrentRegion(); // Set the current region at load
    updateCurrentTariff(); // Set the current tariff at load

    // Set interval for auto-refresh every hour (3600000 milliseconds)
    setInterval(function() {
        updateData();
        updateTitleDate(); // Set the current date at load
        updateCurrentRegion(); // Set the current region at load
        updateCurrentTariff(); // Update the current tariff at interval
    }, 3600000); // 3600000 milliseconds = 1 hour
};

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('colorSchemeToggle');
    
    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('colorblind');
        
        const isColorblindMode = document.body.classList.contains('colorblind');
        localStorage.setItem('colorScheme', isColorblindMode ? 'colorblind' : 'default');
        toggleButton.textContent = isColorblindMode ? "Switch to Default Mode" : "Switch to Colorblind Mode";
    });

    // Apply saved theme
    if (localStorage.getItem('colorScheme') === 'colorblind') {
        document.body.classList.add('colorblind');
        toggleButton.textContent = "Switch to Default Mode";
    }

    // Add event listener to the close button for the referral link
    document.querySelector('.close-btn').addEventListener('click', closeReferralBar);
});
