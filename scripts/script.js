// Constants

const COLOR_NAMES = {
    itemBgGray: 'itemBg-gray',
    itemBgBlue: 'itemBg-blue',
    itemBgOrange: 'itemBg-orange',
    itemBgGreen: 'itemBg-green',
    itemBgRed: 'itemBg-red'
};

const RANDOM_COLORS = [
    COLOR_NAMES.itemBgBlue,
    COLOR_NAMES.itemBgOrange,
    COLOR_NAMES.itemBgGreen,
    COLOR_NAMES.itemBgRed
];

// DOM Elements
const resetButtonEl = document.querySelector('#resetButton');
const singleButtonEl = document.querySelector('#singleButton');
const rawDataButtonEl = document.querySelector('#rawDataButton');
const diceButtonEl = document.querySelector('#diceButton');
const groupAreaEl = document.querySelector('#groupArea');
const mainAreaEl = document.querySelector('#mainArea');
const rawDataAreaEl = document.querySelector('#rawDataArea');
const singleAreaEl = document.querySelector('#singleArea');

const state = {
    clusters: [],
    groups: [],
    hiddenGroups: [],
    results: {},
    lastBoxColor: null
};

// Check if source data is available
if (typeof clusters === 'undefined') {
    alert(
        "It seems like you haven't renamed data.example.js into data.js. If you have, there's something wrong with your data."
    );
} else {
    state.clusters = clusters;
}

// Utility functions

function selectRandomFromArray(sourceArray) {
    return sourceArray[Math.floor(Math.random() * sourceArray.length)];
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
    const dataRaw = localStorage.getItem(key);

    if (!dataRaw) {
        return;
    }

    let dataParsed;

    try {
        dataParsed = JSON.parse(dataRaw);

        return dataParsed;
    } catch (e) {
        console.error(e);
        alert('Error parsing local storage data.');

        return;
    }
}

function saveResults() {
    saveToLocalStorage('results', state.results);
}

function loadResults() {
    const results = loadFromLocalStorage('results');

    if (results) {
        state.results = results;
    }
}

function saveHiddenGroups() {
    saveToLocalStorage('hiddenGroups', state.hiddenGroups);
}

function loadHiddenGroups() {
    const hiddenGroups = loadFromLocalStorage('hiddenGroups');

    if (hiddenGroups) {
        state.hiddenGroups = hiddenGroups;
    }
}

function findColorClass(classList) {
    for (let i = 0; i < RANDOM_COLORS.length; i++) {
        if (classList.contains(RANDOM_COLORS[i])) {
            return RANDOM_COLORS[i];
        }
    }

    // If nothing is found, return default color
    return COLOR_NAMES.itemBgGray;
}

function getNewRandomColor(oldColor) {
    let newColor = '';

    while (newColor === '' || newColor === oldColor) {
        newColor = selectRandomFromArray(RANDOM_COLORS);
    }

    return newColor;
}

function setRandomBoxColor(htmlElement, clear = false, previousColor = null) {
    const oldColor = findColorClass(htmlElement.classList);
    let newColor;

    if (!previousColor) {
        newColor = getNewRandomColor(oldColor);
    } else {
        while (!newColor || newColor === previousColor) {
            newColor = getNewRandomColor(oldColor);
        }
    }

    htmlElement.classList.remove(oldColor);

    if (!clear) {
        htmlElement.classList.add(newColor);
    }

    state.lastBoxColor = newColor;

    return newColor;
}

// Initialize groups based on data

state.clusters.forEach((cluster) => {
    if (cluster.group && !state.groups.includes(cluster.group)) {
        state.groups.push(cluster.group);
    }
});

// Main Area (Cluster & Item Rendering)

function newClusterBoxValue(cluster, clusterEl, resultEl) {
    const value = selectRandomFromArray(cluster.items);
    resultEl.textContent = value;
    const color = setRandomBoxColor(clusterEl, false, state.lastBoxColor);

    state.results[cluster.title] = { value, color };
    saveResults();
}

function resetClusterBox(cluster, clusterEl, resultEl) {
    const colorClass = findColorClass(clusterEl.classList);
    clusterEl.classList.remove(colorClass);
    clusterEl.classList.add(COLOR_NAMES.itemBgGray);
    resultEl.textContent = '';
    delete state.results[cluster.title];
    saveResults();
}

function createClusterBox(cluster) {
    const clusterEl = document.createElement('div');
    clusterEl.classList.add('clusterBox', COLOR_NAMES.itemBgGray);

    const title = clusterEl.appendChild(document.createElement('h2'));
    title.textContent = cluster.title;
    title.classList.add('itemTitle');

    const resultEl = clusterEl.appendChild(document.createElement('span'));
    resultEl.classList.add('result', 'item');
    resultEl.setAttribute('name', cluster.title);

    if (state.results[cluster.title]) {
        resultEl.textContent = state.results[cluster.title].value;
        clusterEl.classList.add(state.results[cluster.title].color);
    }

    clusterEl.addEventListener('click', () => {
        newClusterBoxValue(cluster, clusterEl, resultEl);
    });

    clusterEl.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        resetClusterBox(cluster, clusterEl, resultEl);
    });

    return clusterEl;
}

function clearMainArea() {
    // Reset the canvas, Pablo
    mainAreaEl.innerHTML = '';
    singleAreaEl.innerHTML = '';
    singleAreaEl.classList.remove(findColorClass(singleAreaEl.classList));
}

function renderAllClusters() {
    clearMainArea();

    // Iterate our data to create those fancy colored boxes
    for (let i = 0; i < state.clusters.length; i++) {
        const cluster = state.clusters[i];

        if (cluster.hidden || (cluster.group && state.hiddenGroups.includes(cluster.group))) {
            continue;
        }

        const clusterBox = createClusterBox(cluster);

        mainAreaEl.appendChild(clusterBox);
    }
}

function toggleGroup(group, groupToggle) {
    state.clusters = state.clusters.map((cluster) => {
        if (cluster.group === group) {
            if (!state.hiddenGroups.includes(group)) {
                return { ...cluster, hidden: true };
            } else {
                return { ...cluster, hidden: false };
            }
        } else {
            return cluster;
        }
    });

    if (state.hiddenGroups.includes(group)) {
        const removeIndex = state.hiddenGroups.findIndex((element) => element === group);
        state.hiddenGroups.splice(removeIndex, 1);
        groupToggle.setAttribute('title', 'Click to hide group');
        groupToggle.classList.remove('inactiveButton');
    } else {
        state.hiddenGroups.push(group);
        groupToggle.setAttribute('title', 'Click to show group');
        groupToggle.classList.add('inactiveButton');
    }

    saveHiddenGroups();
    renderAllClusters();
}

function renderGroupButtons() {
    groupAreaEl.innerHTML = '';

    if (!state.groups.length) {
        document.querySelector('.groupContainer').remove();
        return;
    }

    state.groups.forEach((group) => {
        const groupToggle = document.createElement('button');
        groupToggle.classList.add('linkButton', 'group');
        groupToggle.innerHTML = group + '&nbsp;';

        if (state.hiddenGroups.includes(group)) {
            groupToggle.setAttribute('title', 'Click to show group');
            groupToggle.classList.add('inactiveButton');
        } else {
            groupToggle.setAttribute('title', 'Click to hide group');
        }

        groupToggle.addEventListener('click', () => toggleGroup(group, groupToggle));

        groupAreaEl.appendChild(groupToggle);
    });
}

function randomizeEveryItem() {
    document.querySelectorAll('.result').forEach((resultElement) => {
        const resultElementName = resultElement.getAttribute('name');
        const clusterBox = resultElement.parentElement;
        const boxColor = setRandomBoxColor(clusterBox, false, state.lastBoxColor);

        const value = selectRandomFromArray(
            state.clusters.find((cluster) => cluster.title === resultElementName).items
        );

        resultElement.textContent = value;

        state.results[resultElementName] = { value: value, color: boxColor };
    });

    saveResults();
}

function getAllItems() {
    const items = [];

    state.clusters.forEach((cluster) => {
        if (!cluster.hidden) {
            cluster.items.forEach((item) => {
                items.push(`${cluster.title}: ${item}`);
            });
        }
    });

    return items;
}

function reset() {
    state.results = {};
    saveResults();
    renderAllClusters();
}

function showSingleResult() {
    const allItems = getAllItems();

    mainAreaEl.innerHTML = '';

    if (allItems.length) {
        const result = selectRandomFromArray(allItems);
        singleAreaEl.textContent = result;
        setRandomBoxColor(singleAreaEl, false, state.lastBoxColor);
    } else {
        setRandomBoxColor(singleAreaEl, true, state.lastBoxColor);
        singleAreaEl.textContent = 'All groups are currently hidden. Nothing to choose from...';
    }
}

function toggleRawDataDisplay() {
    if (rawDataAreaEl.innerHTML) {
        rawDataAreaEl.innerHTML = '';
        rawDataButtonEl.classList.add('inactiveButton');
    } else {
        const rawDataFormatted = JSON.stringify(state.clusters, null, 2);
        rawDataAreaEl.innerHTML = `<pre>${rawDataFormatted}</pre>`;
        rawDataButtonEl.classList.remove('inactiveButton');
    }
}

// UI Actions

resetButtonEl.addEventListener('click', () => {
    reset();
});

diceButtonEl.addEventListener('click', () => {
    clearMainArea();
    renderAllClusters();
    randomizeEveryItem();
});

singleButtonEl.addEventListener('click', () => {
    showSingleResult();
});

// Toggle raw data display
rawDataButtonEl.addEventListener('click', () => {
    toggleRawDataDisplay();
});

loadResults();
loadHiddenGroups();
renderGroupButtons();
renderAllClusters();
