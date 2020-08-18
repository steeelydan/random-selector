/* global clusters:true */

// Check if source data is available
if (typeof clusters === 'undefined') {
    alert(
        "It seems like you haven't renamed data.example.js into data.js. If you have, there's something wrong with your data."
    );
}

// Color palette
const randomColors = ['bg-blue', 'bg-orange', 'bg-green', 'bg-red'];

// DOM Elements
const hideShowAllGroupsButton = document.querySelector('#hideShowAllGroups');
const clearButton = document.querySelector('#clearButton');
const rawDataButton = document.querySelector('#rawDataButton');
const diceButton = document.querySelector('#diceButton');
const hiddenCounterElement = document.querySelector('#hiddenCounter');
const groupArea = document.querySelector('#groupArea');
const mainArea = document.querySelector('#mainArea');
const rawDataArea = document.querySelector('#rawDataArea');

// Utility functions

function selectRandomFromArray(sourceArray) {
    return sourceArray[Math.floor(Math.random() * sourceArray.length)];
}

function findColorClass(classList) {
    for (let i = 0; i < randomColors.length; i++) {
        if (classList.contains(randomColors[i])) {
            return randomColors[i];
        }
    }

    // If nothing is found, return default color
    return 'bg-gray';
}

function getNewRandomColor(oldColor) {
    let newColor = '';

    while (newColor === '' || newColor === oldColor) {
        newColor = selectRandomFromArray(randomColors);
    }

    return newColor;
}

// Initialize groups based on data

let groups = [];
let hiddenGroups = [];

clusters.forEach((cluster) => {
    if (cluster.group && !groups.includes(cluster.group)) {
        groups.push(cluster.group);
    }
});

// Main Area (Cluster & Item Rendering)

function renderClusters() {
    // Clear the canvas, Pablo
    mainArea.innerHTML = '';

    if (hiddenGroups.length === groups.length) {
        hideShowAllGroupsButton.textContent = 'Show all groups';
    } else {
        hideShowAllGroupsButton.textContent = 'Hide all groups';
    }

    let hiddenCounter = 0;

    // Iterate our data to create those fancy colored boxes
    for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];

        if (cluster.hidden) {
            hiddenCounter++;
            continue;
        }

        const clusterBox = document.createElement('div');
        clusterBox.classList.add('clusterBox', 'bg-gray');

        const title = clusterBox.appendChild(document.createElement('h2'));
        title.textContent = cluster.title;
        title.classList.add('heading', 'mb-3');

        const result = clusterBox.appendChild(document.createElement('span'));
        result.classList.add('result', 'item');
        result.setAttribute('name', cluster.title);

        clusterBox.addEventListener('click', () => {
            result.textContent = selectRandomFromArray(cluster.items);
            const oldColor = findColorClass(clusterBox.classList);
            const newColor = getNewRandomColor(oldColor);
            clusterBox.classList.remove(oldColor);
            clusterBox.classList.add('clusterBox', newColor);
        });

        mainArea.appendChild(clusterBox);
    }

    hiddenCounterElement.textContent = `(${hiddenCounter} hidden)`;
}

// UI Events

// Randomize every cluster
diceButton.addEventListener('click', () => {
    document.querySelectorAll('.result').forEach((resultElement) => {
        const resultElementName = resultElement.getAttribute('name');
        const clusterContainer = resultElement.parentElement;
        const oldColor = findColorClass(clusterContainer.classList);
        const newColor = getNewRandomColor(oldColor);
        clusterContainer.classList.remove(oldColor);
        clusterContainer.classList.add(newColor);

        resultElement.textContent = selectRandomFromArray(
            clusters.find((cluster) => cluster.title === resultElementName)
                .items
        );
    });
});

// Clear all random results
clearButton.addEventListener('click', () => {
    document.querySelectorAll('.result').forEach((resultElement) => {
        const clusterContainer = resultElement.parentElement;
        clusterContainer.className = '';
        clusterContainer.classList.add('clusterBox', 'bg-gray');

        resultElement.innerHTML = '';
    });
});

// Toggle display of raw data in our UI
rawDataButton.addEventListener('click', () => {
    if (rawDataArea.innerHTML) {
        rawDataArea.innerHTML = '';
        rawDataButton.classList.add('inactiveToggle');
    } else {
        const rawDataFormatted = JSON.stringify(clusters, null, 2);
        rawDataArea.innerHTML = `<pre>${rawDataFormatted}</pre>`;
        rawDataButton.classList.remove('inactiveToggle');
    }
});

// Hide / show all groups, depending on if they are visible atm
hideShowAllGroupsButton.addEventListener('click', () => {
    if (hiddenGroups.length === groups.length) {
        // All groups are currently hidden. Clicking the button shows all groups.
        clusters = clusters.map((cluster) => {
            return { ...cluster, hidden: false };
        });

        hiddenGroups = [];

        document.querySelectorAll('.group').forEach((group) => {
            group.classList.remove('inactiveToggle');
        });
    } else {
        // Some groups are currently shown. Clicking the button hides all groups.
        clusters = clusters.map((cluster) => {
            if (cluster.group) {
                return { ...cluster, hidden: true };
            } else {
                return cluster;
            }
        });

        hiddenGroups = [...groups];

        document.querySelectorAll('.group').forEach((group) => {
            group.classList.add('inactiveToggle');
        });
    }

    renderClusters();
});

// Group button rendering & events
groups.forEach((group) => {
    const groupToggle = document.createElement('button');
    groupToggle.classList.add('linkButton', 'group');
    groupToggle.innerHTML = group + '&nbsp;';
    groupToggle.setAttribute('title', 'Click to hide/show group');
    groupToggle.addEventListener('click', () => {
        clusters = clusters.map((cluster) => {
            if (cluster.group === group) {
                if (!hiddenGroups.includes(group)) {
                    return { ...cluster, hidden: true };
                } else {
                    return { ...cluster, hidden: false };
                }
            } else {
                return cluster;
            }
        });

        if (hiddenGroups.includes(group)) {
            const removeIndex = hiddenGroups.findIndex(
                (element) => element === group
            );
            hiddenGroups.splice(removeIndex, 1);
            groupToggle.classList.remove('inactiveToggle');
        } else {
            hiddenGroups.push(group);
            groupToggle.classList.add('inactiveToggle');
        }

        renderClusters();
    });

    groupArea.appendChild(groupToggle);
});

if (!groups.length) {
    document.querySelector('.groupContainer').remove();
}

renderClusters();
