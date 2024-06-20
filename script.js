document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    initializeSettingsPanel();
    initializeRegionAndTariffSelectors();
    initializeArrows();
    initializeColorSchemeToggle();
    initializeReferralPanelClose();

    updateInitialData();
    setAutoRefresh();
});

// Initialize Date Picker
function initializeDatePicker() {
    const datePicker = document.getElementById('datePicker');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    datePicker.setAttribute('max', tomorrow.toISOString().split('T')[0]);
    datePicker.value = today.toISOString().split('T')[0];

    datePicker.addEventListener('change', () => {
        updateData(datePicker.value);
        updateTitleDate(datePicker.value);
        resetAutoCloseTimer();
    });
}

// Initialize Settings Panel
function initializeSettingsPanel() {
    let autoCloseTimeout = null;

    function toggleSettingsPanel() {
        const panel = document.querySelector('.settings-panel');
        const isPanelOpen = panel.style.display === 'block';
        panel.style.display = isPanelOpen ? 'none' : 'block';

        if (!isPanelOpen) {
            resetAutoCloseTimer();
        }
    }

    function resetAutoCloseTimer() {
        clearTimeout(autoCloseTimeout);
        autoCloseTimeout = setTimeout(() => {
            document.querySelector('.settings-panel').style.display = 'none';
        }, 5000);
    }

    document.querySelector('.settings-icon').addEventListener('click', toggleSettingsPanel);
    document.querySelector('.btn-close').addEventListener('click', toggleSettingsPanel); // Updated to call toggleSettingsPanel
    document.querySelector('.settings-panel').addEventListener('mousemove', resetAutoCloseTimer);
    document.querySelector('.settings-panel').addEventListener('keypress', resetAutoCloseTimer);
}

// Initialize Region and Tariff Selectors
function initializeRegionAndTariffSelectors() {
    const regionPicker = document.getElementById('regionPicker');
    const tariffPicker = document.getElementById('tariffPicker');

    regionPicker.addEventListener('change', () => {
        updateCurrentRegion();
        updateURL('region', regionPicker.value);
        updateData();
        resetAutoCloseTimer();
    });

    tariffPicker.addEventListener('change', () => {
        updateCurrentTariff();
        updateURL('tariff', tariffPicker.value);
        updateData();
        resetAutoCloseTimer();
    });

    const params = new URLSearchParams(window.location.search);
    setPickerValue(regionPicker, params.get('region'));
    setPickerValue(tariffPicker, params.get('tariff'));
}

function setPickerValue(picker, value) {
    if (value) {
        picker.value = value.toUpperCase();
    }
}

// Initialize Arrows for Date Navigation
function initializeArrows() {
    const prevDayButton = document.getElementById('prevDay');
    const nextDayButton = document.getElementById('nextDay');
    const datePicker = document.getElementById('datePicker');

    const adjustDate = (days) => {
        let currentDate = new Date(datePicker.value);
        currentDate.setDate(currentDate.getDate() + days);

        const tomorrow = new Date();
        tomorrow.setDate(new Date().getDate() + 1);

        if (currentDate <= tomorrow) {
            datePicker.value = currentDate.toISOString().split('T')[0];
            updateData(datePicker.value);
            updateTitleDate(datePicker.value);
        } else {
            console.log("Cannot select a date beyond tomorrow.");
        }
    };

    prevDayButton.addEventListener('click', () => adjustDate(-1));
    nextDayButton.addEventListener('click', () => adjustDate(1));
}

// Initialize Color Scheme Toggle
function initializeColorSchemeToggle() {
    const toggleButton = document.getElementById('colorSchemeToggle');
    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('colorblind');
        const isColorblindMode = document.body.classList.contains('colorblind');
        localStorage.setItem('colorScheme', isColorblindMode ? 'colorblind' : 'default');
        toggleButton.textContent = isColorblindMode ? "Switch to Default Mode" : "Switch to Colorblind Mode";
    });

    if (localStorage.getItem('colorScheme') === 'colorblind') {
        document.body.classList.add('colorblind');
        toggleButton.textContent = "Switch to Default Mode";
    }
}

// Initialize Referral Panel Close Button
function initializeReferralPanelClose() {
    document.querySelector('.referral-link .close-btn').addEventListener('click', function() {
        document.querySelector('.referral-link').style.display = 'none';
    });
}

// Update Initial Data
function updateInitialData() {
    const datePicker = document.getElementById('datePicker');
    const selectedDate = datePicker.value;
    updateData(selectedDate);
    updateTitleDate(selectedDate);
    updateCurrentRegion();
    updateCurrentTariff();
}

// Set Auto-Refresh Interval
function setAutoRefresh() {
    setInterval(() => {
        const datePicker = document.getElementById('datePicker');
        const selectedDate = datePicker.value;
        updateData(selectedDate);
        updateTitleDate(selectedDate);
        updateCurrentRegion();
        updateCurrentTariff();
    }, 3600000);
}

// Fetch and Update Data
async function updateData(selectedDate) {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);

    const todayDate = date.toISOString().split('T')[0];
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    await Promise.all([
        fetchTariffData('gas', todayDate, 'Today'),
        fetchTariffData('electricity', todayDate, 'Today'),
        fetchTariffData('gas', tomorrowDate, 'Tomorrow'),
        fetchTariffData('electricity', tomorrowDate, 'Tomorrow')
    ]);
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
    const tariffDisplayText = selectedTariff === 'SILVER-23-12-06' ? 'November 2023 v1' : 'April 2024 v1';
    document.getElementById('currentTariff').textContent = `Tariff: ${tariffDisplayText}`;
}

function updateURL(param, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(param, value);
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
}

// Fetch Tariff Data
async function fetchTariffData(tariffType, date, period) {
    const region = document.getElementById('regionPicker').value;
    const tariff = document.getElementById('tariffPicker').value;
    const baseUrl = `https://api.octopus.energy/v1/products/${tariff}/${tariffType}-tariffs/${tariffType[0].toUpperCase()}-1R-${tariff}-${region}/standard-unit-rates/`;
    const url = `${baseUrl}?period_from=${date}T00:00:00Z&period_to=${date}T22:59:59Z`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Data loading error: ${response.statusText}`);

        const data = await response.json();
        if (data.results.length === 0) throw new Error('No data available for the selected date and tariff.');

        displayPriceAndDate(data.results[0], `${tariffType}TariffData`, tariffType, period);
    } catch (error) {
        console.error(`Error fetching data for ${tariffType} on ${date} (${period}):`, error);
        document.getElementById(`${tariffType}TariffData`).textContent = 'Data loading error';
    }
}

function displayPriceAndDate(result, elementId, tariffType, period) {
    const container = document.getElementById(elementId);
    const priceHTML = `<div class='price'>${result.value_inc_vat.toFixed(2)}p</div>`;
    const iconClass = tariffType === 'gas' ? 'fa-burn' : 'fa-bolt';
    const iconColor = tariffType === 'gas' ? 'style="color:orange;"' : 'style="color:yellow;"';

    if (period === 'Today') {
        container.innerHTML = `
            <i class="fas ${iconClass} icon" ${iconColor}></i>
            <div class='title h5'>${tariffType.toUpperCase()} Tariff</div>
            ${priceHTML}
            <div class='tomorrow-price' id='tomorrow-${tariffType}'>Loading...</div>`;
    } else if (period === 'Tomorrow') {
        const tomorrowPrice = parseFloat(result.value_inc_vat.toFixed(2));
        const todayPriceElement = container.querySelector('.price');
        const todayPrice = todayPriceElement ? parseFloat(todayPriceElement.textContent.replace('p', '')) : 0;
        const priceClass = tomorrowPrice > todayPrice ? 'highlight-red' : 'highlight-green';
        const iconHtml = tomorrowPrice > todayPrice ? '<i class="fas fa-arrow-up" style="color:red;"></i>' : '<i class="fas fa-arrow-down" style="color:green;"></i>';
        const percentageChange = Math.abs(((tomorrowPrice - todayPrice) / todayPrice) * 100).toFixed(2);
        const percentageChangeHtml = percentageChange > 0 ? ` <span class="${priceClass}" style="font-size:0.8rem;">(${percentageChange}%)</span>` : '';

        document.getElementById(`tomorrow-${tariffType}`).innerHTML = `Tomorrow:&nbsp;${iconHtml}<span class="${priceClass}">${tomorrowPrice}p</span>&nbsp;${percentageChangeHtml}`;
    }
}
