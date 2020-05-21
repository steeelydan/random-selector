/* global clusters:true */

const randomColors = ['bg-blue', 'bg-orange', 'bg-green', 'bg-red'];

// DOM Elements
const hideShowAllGroupsButton = document.querySelector('#hideShowAllGroups');
const clearButton = document.querySelector('#clearButton');
const diceButton = document.querySelector('#diceButton');
const hiddenCounterElement = document.querySelector('#hiddenCounter');
const groupArea = document.querySelector('#groupArea');
const mainArea = document.querySelector('#mainArea');

// Utility functions

function selectRandom(source) {
    return source[Math.floor(Math.random() * source.length)];
}

function findColorClass(classList) {
    for (let i = 0; i < randomColors.length; i++) {
        if (classList.contains(randomColors[i])) {
            return randomColors[i];
        }
    }

    return 'bg-gray';
}

function getNewColor(oldColor) {
    let newColor = '';

    while (newColor === '' || newColor === oldColor) {
        newColor = selectRandom(randomColors);
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
    mainArea.innerHTML = '';

    if (hiddenGroups.length === groups.length) {
        hideShowAllGroupsButton.textContent = 'Show all groups';
    } else {
        hideShowAllGroupsButton.textContent = 'Hide all groups';
    }

    let hiddenCounter = 0;

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
            result.textContent = selectRandom(cluster.items);
            const oldColor = findColorClass(clusterBox.classList);
            const newColor = getNewColor(oldColor);
            clusterBox.classList.remove(oldColor);
            clusterBox.classList.add('clusterBox', newColor);
        });

        mainArea.appendChild(clusterBox);
    }

    hiddenCounterElement.textContent = `(${hiddenCounter} hidden)`;
}

// UI Events

diceButton.addEventListener('click', () => {
    document.querySelectorAll('.result').forEach((resultElement) => {
        const resultElementName = resultElement.getAttribute('name');
        const clusterContainer = resultElement.parentElement;
        const oldColor = findColorClass(clusterContainer.classList);
        const newColor = getNewColor(oldColor);
        clusterContainer.classList.remove(oldColor);
        clusterContainer.classList.add(newColor);

        resultElement.textContent = selectRandom(
            clusters.find((cluster) => cluster.title === resultElementName)
                .items
        );
    });
});

clearButton.addEventListener('click', () => {
    document.querySelectorAll('.result').forEach((resultElement) => {
        const clusterContainer = resultElement.parentElement;
        clusterContainer.className = '';
        clusterContainer.classList.add('clusterBox', 'bg-gray');

        resultElement.innerHTML = '';
    });
});

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

// Group Rendering & Events

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
