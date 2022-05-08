// Check if source data is available
if (typeof clusters === 'undefined') {
    alert(
        "It seems like you haven't renamed data.example.js into data.js. If you have, there's something wrong with your data."
    );
}

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
const resetButton = document.querySelector('#resetButton');
const singleButton = document.querySelector('#singleButton');
const rawDataButton = document.querySelector('#rawDataButton');
const diceButton = document.querySelector('#diceButton');
const groupArea = document.querySelector('#groupArea');
const mainArea = document.querySelector('#mainArea');
const rawDataArea = document.querySelector('#rawDataArea');
const singleArea = document.querySelector('#singleArea');

const state = {
    lastBoxColor: null,
    groups: [],
    hiddenGroups: [],
    results: {}
};

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

clusters.forEach((cluster) => {
    if (cluster.group && !state.groups.includes(cluster.group)) {
        state.groups.push(cluster.group);
    }
});

// Main Area (Cluster & Item Rendering)

function createItemBox(cluster) {
    const itemBox = document.createElement('div');
    itemBox.classList.add('itemBox', COLOR_NAMES.itemBgGray);

    const title = itemBox.appendChild(document.createElement('h2'));
    title.textContent = cluster.title;
    title.classList.add('itemTitle');

    const result = itemBox.appendChild(document.createElement('span'));
    result.classList.add('result', 'item');
    result.setAttribute('name', cluster.title);

    if (state.results[cluster.title]) {
        result.textContent = state.results[cluster.title].value;
        itemBox.classList.add(state.results[cluster.title].color);
    }

    itemBox.addEventListener('click', () => {
        const value = selectRandomFromArray(cluster.items);
        result.textContent = value;
        const color = setRandomBoxColor(itemBox, false, state.lastBoxColor);

        state.results[cluster.title] = { value, color };
        saveResults();
    });

    return itemBox;
}

function clearMainArea() {
    // Reset the canvas, Pablo
    mainArea.innerHTML = '';
    singleArea.innerHTML = '';
    singleArea.classList.remove(findColorClass(singleArea.classList));
}

function renderAllClusters() {
    clearMainArea();

    // Iterate our data to create those fancy colored boxes
    for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];

        if (cluster.hidden || (cluster.group && state.hiddenGroups.includes(cluster.group))) {
            continue;
        }

        const itemBox = createItemBox(cluster);

        mainArea.appendChild(itemBox);
    }
}

function renderGroupButtons() {
    groupArea.innerHTML = '';

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

        groupToggle.addEventListener('click', () => {
            clusters = clusters.map((cluster) => {
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
        });

        groupArea.appendChild(groupToggle);
    });
}

function randomizeEveryItem() {
    document.querySelectorAll('.result').forEach((resultElement) => {
        const resultElementName = resultElement.getAttribute('name');
        const itemBox = resultElement.parentElement;
        const boxColor = setRandomBoxColor(itemBox, false, state.lastBoxColor);

        const value = selectRandomFromArray(
            clusters.find((cluster) => cluster.title === resultElementName).items
        );

        resultElement.textContent = value;

        state.results[resultElementName] = { value: value, color: boxColor };
    });

    saveResults();
}

// UI Events

// Randomize every cluster
diceButton.addEventListener('click', () => {
    clearMainArea();
    renderAllClusters();
    randomizeEveryItem();
});

// Reset Everything
resetButton.addEventListener('click', () => {
    state.hiddenGroups = [];
    state.results = {};
    saveHiddenGroups();
    saveResults();
    renderAllClusters();
    renderGroupButtons();
});

// Show single result
singleButton.addEventListener('click', () => {
    const items = [];
    clusters.forEach((cluster) => {
        if (!cluster.hidden) {
            cluster.items.forEach((item) => {
                items.push(`${cluster.title}: ${item}`);
            });
        }
    });

    mainArea.innerHTML = '';

    if (items.length) {
        const result = selectRandomFromArray(items);
        singleArea.textContent = result;
        setRandomBoxColor(singleArea, false, state.lastBoxColor);
    } else {
        setRandomBoxColor(singleArea, true, state.lastBoxColor);
        singleArea.textContent = 'All groups are currently hidden. Nothing to choose from...';
    }
});

// Toggle display of raw data in our UI
rawDataButton.addEventListener('click', () => {
    if (rawDataArea.innerHTML) {
        rawDataArea.innerHTML = '';
        rawDataButton.classList.add('inactiveButton');
    } else {
        const rawDataFormatted = JSON.stringify(clusters, null, 2);
        rawDataArea.innerHTML = `<pre>${rawDataFormatted}</pre>`;
        rawDataButton.classList.remove('inactiveButton');
    }
});

loadResults();
loadHiddenGroups();
renderGroupButtons();
renderAllClusters();
