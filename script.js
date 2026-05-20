const datePicker = document.getElementById('datePicker');
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const maxDate = tomorrow.toISOString().split('T')[0];
datePicker.setAttribute('max', maxDate);
datePicker.value = today.toISOString().split('T')[0];

const TRACKER_TARIFFS = [
    { code: 'SILVER-24-04-03', label: 'April 2024 v1', formulaEffectiveFrom: '3 April 2024', sourceBasis: 'Octopus Tracker API product code' },
    { code: 'SILVER-24-07-01', label: 'July 2024 v1', formulaEffectiveFrom: '1 July 2024', sourceBasis: 'Octopus Tracker API product code' },
    { code: 'SILVER-24-10-01', label: 'October 2024 v1', formulaEffectiveFrom: '1 October 2024', sourceBasis: 'Octopus Tracker API product code' },
    { code: 'SILVER-24-12-31', label: 'December 2024 v1', formulaEffectiveFrom: '31 December 2024', sourceBasis: 'Octopus Tracker API product code' },
    { code: 'SILVER-25-04-11', label: 'April 2025 v1', formulaEffectiveFrom: '11 April 2025', sourceBasis: 'Octopus Tracker API product code' },
    { code: 'SILVER-25-04-15', label: 'April 2025 v2', formulaEffectiveFrom: '15 April 2025', sourceBasis: 'Octopus Tracker API product code' },
    { code: 'SILVER-25-09-02', label: 'September 2025 v1', formulaEffectiveFrom: '2 September 2025', sourceBasis: 'Octopus Tracker API product code' },
    { code: 'SILVER-26-04-01', label: 'April 2026 formula era', formulaEffectiveFrom: '1 April 2026', sourceBasis: 'Tracker FAQ formula era; API product availability may vary' }
];

const PRE_2026_ADJUSTMENTS = {
    electricity: 3.5,
    gas: 0.33
};


let autoCloseTimeout = null;
let priceTrendChart = null;

function closeReferralBar() {
    const referralLinkBar = document.querySelector('.referral-link');
    referralLinkBar.style.display = 'none';
}

document.getElementById('datePicker').addEventListener('change', function() {
    updateData(this.value);
    updateTitleDate(this.value);
});

document.getElementById('regionPicker').addEventListener('change', function() {
    updateCurrentRegion();

    const selectedRegion = this.value;
    const selectedTariff = document.getElementById('tariffPicker').value;
    const newUrl = `${window.location.pathname}?region=${selectedRegion}&tariff=${selectedTariff}`;

    history.pushState({ path: newUrl }, '', newUrl);
    updateData(datePicker.value);
});

document.getElementById('tariffPicker').addEventListener('change', function() {
    const selectedTariff = this.value;
    const currentRegion = document.getElementById('regionPicker').value;
    const newUrl = `${window.location.pathname}?region=${currentRegion}&tariff=${selectedTariff}`;

    history.pushState({ path: newUrl }, '', newUrl);
    updateData(datePicker.value);
    updateCurrentTariff();
});

document.getElementById('datePicker').addEventListener('change', resetAutoCloseTimer);
document.getElementById('regionPicker').addEventListener('change', resetAutoCloseTimer);
document.getElementById('tariffPicker').addEventListener('change', resetAutoCloseTimer);

document.querySelector('.settings-panel').addEventListener('mousemove', resetAutoCloseTimer);
document.querySelector('.settings-panel').addEventListener('keypress', resetAutoCloseTimer);

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const regionFromURL = params.get('region');
    const tariffFromURL = params.get('tariff');

    const regionPicker = document.getElementById('regionPicker');
    if (regionFromURL) {
        const normalizedRegionFromURL = regionFromURL.toUpperCase();
        for (const option of regionPicker.options) {
            if (option.value === normalizedRegionFromURL) {
                option.selected = true;
                break;
            }
        }
    }

    const tariffPicker = document.getElementById('tariffPicker');
    populateTariffPicker();
    if (tariffFromURL) {
        const normalizedTariffFromURL = tariffFromURL.toUpperCase();
        for (const option of tariffPicker.options) {
            if (option.value === normalizedTariffFromURL) {
                option.selected = true;
                break;
            }
        }
    }

    updateData(datePicker.value);
    updateCurrentRegion();
    updateCurrentTariff();
});

document.addEventListener('DOMContentLoaded', function() {
    const prevDayButton = document.getElementById('prevDay');
    const nextDayButton = document.getElementById('nextDay');

    const adjustDate = (days) => {
        const currentDate = new Date(datePicker.value);
        currentDate.setDate(currentDate.getDate() + days);

        const maxSelectableDate = new Date();
        maxSelectableDate.setDate(maxSelectableDate.getDate() + 1);

        if (currentDate <= maxSelectableDate) {
            datePicker.value = currentDate.toISOString().split('T')[0];
            updateData(datePicker.value);
            updateTitleDate(datePicker.value);
        }
    };

    prevDayButton.addEventListener('click', () => adjustDate(-1));
    nextDayButton.addEventListener('click', () => adjustDate(1));
});

async function updateData(selectedDate) {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    const tomorrowDateObject = new Date(date);
    tomorrowDateObject.setDate(date.getDate() + 1);

    const todayDate = date.toISOString().split('T')[0];
    const tomorrowDate = tomorrowDateObject.toISOString().split('T')[0];

    await fetchTariffData('gas', todayDate, 'Today');
    await fetchTariffData('electricity', todayDate, 'Today');
    await fetchTariffData('gas', tomorrowDate, 'Tomorrow');
    await fetchTariffData('electricity', tomorrowDate, 'Tomorrow');
    await updateTrendChart(todayDate);
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


function populateTariffPicker(defaultTariffCode = 'SILVER-25-04-15') {
    const tariffPicker = document.getElementById('tariffPicker');
    tariffPicker.innerHTML = '';

    TRACKER_TARIFFS.forEach((tariff) => {
        const option = document.createElement('option');
        option.value = tariff.code;
        option.textContent = tariff.label;
        if (tariff.code === defaultTariffCode) {
            option.selected = true;
        }
        tariffPicker.appendChild(option);
    });
}

function getSelectedTariffConfig() {
    const selectedTariff = document.getElementById('tariffPicker').value;
    return TRACKER_TARIFFS.find((tariff) => tariff.code === selectedTariff);
}

function applyBudgetAdjustmentIfEnabled(value, tariffType) {
    const toggle = document.getElementById('budgetAdjustmentToggle');
    const selectedTariff = getSelectedTariffConfig();
    const shouldAdjust = toggle && toggle.checked && selectedTariff && selectedTariff.code !== 'SILVER-26-04-01';

    if (!shouldAdjust) {
        return value;
    }

    const adjusted = value - PRE_2026_ADJUSTMENTS[tariffType];
    return Math.max(adjusted, 0);
}

function updateCurrentTariff() {
    const tariffPicker = document.getElementById('tariffPicker');
    const selectedTariff = tariffPicker.value;

    const selectedTariffConfig = TRACKER_TARIFFS.find((tariff) => tariff.code === selectedTariff);
    const tariffDisplayText = selectedTariffConfig ? selectedTariffConfig.label : '';
    document.getElementById('currentTariff').textContent = `Tariff: ${tariffDisplayText}`;

    const metaElement = document.getElementById('tariffMeta');
    if (metaElement && selectedTariffConfig) {
        metaElement.textContent = `Formula effective from ${selectedTariffConfig.formulaEffectiveFrom} · ${selectedTariffConfig.sourceBasis}`;
    }
}

async function fetchTariffData(tariffType, date, period) {
    const selectedRegion = document.getElementById('regionPicker').value;
    const selectedTariff = document.getElementById('tariffPicker').value;

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
        const adjustedTodayPrice = applyBudgetAdjustmentIfEnabled(result.value_inc_vat, tariffType);
        const priceHTML = `<div class='price'>${adjustedTodayPrice.toFixed(2)}p</div>`;
        const iconColor = tariffType === 'gas' ? 'style="color:orange;"' : 'style="color:YELLOW;"';
        const iconClass = tariffType === 'gas' ? 'fa-burn' : 'fa-bolt';
        container.innerHTML = `<i class="fas ${iconClass} icon" ${iconColor}></i>
                            <div class='title h5'>${tariffType.toUpperCase()} Tariff</div>
                            ${priceHTML}
                            <div class='tomorrow-price' id='tomorrow-${tariffType}'>Loading...</div>`;
    } else if (period === 'Tomorrow') {
        if (!result || result.value_inc_vat === undefined) {
            document.getElementById(`tomorrow-${tariffType}`).innerHTML = 'Tomorrow: Available Soon';
            return;
        }

        const tomorrowPrice = parseFloat(applyBudgetAdjustmentIfEnabled(result.value_inc_vat, tariffType).toFixed(2));
        const todayElement = document.getElementById(`${tariffType}TariffData`);
        const todayPriceElement = todayElement.querySelector('.price');
        const todayPrice = todayPriceElement ? parseFloat(todayPriceElement.textContent.replace('p', '')) : 0;

        let priceClass = '';
        let iconHtml = 'Tomorrow:&nbsp;';
        let percentageChange = 0;
        if (tomorrowPrice > todayPrice) {
            priceClass = 'highlight-red';
            percentageChange = ((tomorrowPrice - todayPrice) / todayPrice) * 100;
            iconHtml += '<i class="fas fa-arrow-up" style="color:red;"></i>&nbsp;';
        } else if (tomorrowPrice < todayPrice) {
            priceClass = 'highlight-green';
            percentageChange = ((todayPrice - tomorrowPrice) / todayPrice) * 100;
            iconHtml += '<i class="fas fa-arrow-down" style="color:green;"></i>&nbsp;';
        }

        const percentageChangeHtml = percentageChange > 0 ? ` <span class="${priceClass}" style="font-size:0.8rem;">(${percentageChange.toFixed(2)}%)</span>` : '';

        const tomorrowElement = document.getElementById(`tomorrow-${tariffType}`);
        tomorrowElement.innerHTML = `${iconHtml}<span class="${priceClass}">${tomorrowPrice}p</span>&nbsp;${percentageChangeHtml}`;
    }
}

async function fetchDailyRate(productCode, tariffType, regionCode, date) {
    const tariffCode = `${tariffType[0].toUpperCase()}-1R-${productCode}-${regionCode}`;
    const endpoint = `https://api.octopus.energy/v1/products/${productCode}/${tariffType}-tariffs/${tariffCode}/standard-unit-rates/`;
    const url = `${endpoint}?period_from=${date}T00:00:00Z&period_to=${date}T23:59:59Z`;

    const response = await fetch(url);
    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    if (!data.results || !data.results.length) {
        return null;
    }

    return parseFloat(data.results[0].value_inc_vat.toFixed(2));
}

async function updateTrendChart(selectedDate) {
    const statusEl = document.getElementById('chartStatus');
    const regionCode = document.getElementById('regionPicker').value;
    const trackerProduct = document.getElementById('tariffPicker').value;
    const baselineProduct = 'VAR-22-11-01';

    const endDate = new Date(selectedDate);
    const labels = [];
    const trackerSeries = [];
    const baselineSeries = [];

    for (let index = 6; index >= 0; index -= 1) {
        const pointDate = new Date(endDate);
        pointDate.setDate(endDate.getDate() - index);
        const dateString = pointDate.toISOString().split('T')[0];

        labels.push(pointDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }));

        const [trackerRate, baselineRate] = await Promise.all([
            fetchDailyRate(trackerProduct, 'electricity', regionCode, dateString),
            fetchDailyRate(baselineProduct, 'electricity', regionCode, dateString)
        ]);

        trackerSeries.push(trackerRate);
        baselineSeries.push(baselineRate);
    }

    const hasAnyData = trackerSeries.some((value) => value !== null) || baselineSeries.some((value) => value !== null);
    if (!hasAnyData) {
        statusEl.textContent = 'Unable to load 7 day trend data for this region/tariff.';
        return;
    }

    statusEl.textContent = 'Tracker vs SVR baseline (p/kWh)';

    const ctx = document.getElementById('priceTrendChart').getContext('2d');
    if (priceTrendChart) {
        priceTrendChart.destroy();
    }

    priceTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Tracker',
                    data: trackerSeries,
                    borderColor: '#4dd0e1',
                    backgroundColor: 'rgba(77, 208, 225, 0.25)',
                    tension: 0.3,
                    spanGaps: true
                },
                {
                    label: 'SVR baseline',
                    data: baselineSeries,
                    borderColor: '#ffb74d',
                    backgroundColor: 'rgba(255, 183, 77, 0.2)',
                    borderDash: [6, 6],
                    tension: 0.2,
                    spanGaps: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#F8F8FF' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#F8F8FF' },
                    grid: { color: 'rgba(248,248,255,0.15)' }
                },
                y: {
                    ticks: {
                        color: '#F8F8FF',
                        callback: (value) => `${value}p`
                    },
                    grid: { color: 'rgba(248,248,255,0.15)' }
                }
            }
        }
    });
}

function resetAutoCloseTimer() {
    clearTimeout(autoCloseTimeout);

    autoCloseTimeout = setTimeout(() => {
        document.querySelector('.settings-panel').style.display = 'none';
    }, 5000);
}

function toggleSettingsPanel() {
    const panel = document.querySelector('.settings-panel');
    const isPanelOpen = panel.style.display === 'block';

    if (isPanelOpen) {
        panel.style.display = 'none';
        clearTimeout(autoCloseTimeout);
    } else {
        panel.style.display = 'block';
        resetAutoCloseTimer();
    }
}

window.onload = function() {
    updateData(datePicker.value);
    updateTitleDate(datePicker.value);
    updateCurrentRegion();
    updateCurrentTariff();

    setInterval(function() {
        updateData(datePicker.value);
        updateTitleDate(datePicker.value);
        updateCurrentRegion();
        updateCurrentTariff();
    }, 3600000);
};

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('colorSchemeToggle');

    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('colorblind');

        const isColorblindMode = document.body.classList.contains('colorblind');
        localStorage.setItem('colorScheme', isColorblindMode ? 'colorblind' : 'default');
        toggleButton.textContent = isColorblindMode ? 'Switch to Default Mode' : 'Switch to Colorblind Mode';
    });

    if (localStorage.getItem('colorScheme') === 'colorblind') {
        document.body.classList.add('colorblind');
        toggleButton.textContent = 'Switch to Default Mode';
    }

    const budgetAdjustmentToggle = document.getElementById('budgetAdjustmentToggle');
    budgetAdjustmentToggle.addEventListener('change', function() {
        updateData(datePicker.value);
        updateCurrentTariff();
    });

    document.querySelector('.close-btn').addEventListener('click', closeReferralBar);
});
