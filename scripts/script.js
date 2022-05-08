// Check if source data is available
if (typeof clusters === 'undefined') {
    alert(
        "It seems like you haven't renamed data.example.js into data.js. If you have, there's something wrong with your data."
    );
}

// Color palette
const randomColors = ['itemBg-blue', 'itemBg-orange', 'itemBg-green', 'itemBg-red'];

// DOM Elements
const resetButton = document.querySelector('#resetButton');
const singleButton = document.querySelector('#singleButton');
const rawDataButton = document.querySelector('#rawDataButton');
const diceButton = document.querySelector('#diceButton');
const groupArea = document.querySelector('#groupArea');
const mainArea = document.querySelector('#mainArea');
const rawDataArea = document.querySelector('#rawDataArea');
const singleArea = document.querySelector('#singleArea');

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
    return 'itemBg-gray';
}

function getNewRandomColor(oldColor) {
    let newColor = '';

    while (newColor === '' || newColor === oldColor) {
        newColor = selectRandomFromArray(randomColors);
    }

    return newColor;
}

function changeColor(htmlElement, clear = false) {
    const oldColor = findColorClass(htmlElement.classList);
    const newColor = getNewRandomColor(oldColor);
    htmlElement.classList.remove(oldColor);
    if (!clear) {
        htmlElement.classList.add(newColor);
    }
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

function createItemBox(cluster) {
    const itemBox = document.createElement('div');
    itemBox.classList.add('itemBox', 'itemBg-gray');

    const title = itemBox.appendChild(document.createElement('h2'));
    title.textContent = cluster.title;
    title.classList.add('itemTitle');

    const result = itemBox.appendChild(document.createElement('span'));
    result.classList.add('result', 'item');
    result.setAttribute('name', cluster.title);

    itemBox.addEventListener('click', () => {
        result.textContent = selectRandomFromArray(cluster.items);
        changeColor(itemBox);
    });

    return itemBox;
}

function renderClusters() {
    // Reset the canvas, Pablo
    mainArea.innerHTML = '';
    singleArea.innerHTML = '';
    singleArea.classList.remove(findColorClass(singleArea.classList));

    // Iterate our data to create those fancy colored boxes
    for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];

        if (cluster.hidden) {
            continue;
        }

        const itemBox = createItemBox(cluster);

        mainArea.appendChild(itemBox);
    }
}

// UI Events

// Randomize every cluster
diceButton.addEventListener('click', () => {
    if (mainArea.innerHTML === '') {
        renderClusters();
    }

    document.querySelectorAll('.result').forEach((resultElement) => {
        const resultElementName = resultElement.getAttribute('name');
        const clusterContainer = resultElement.parentElement;
        const oldColor = findColorClass(clusterContainer.classList);
        const newColor = getNewRandomColor(oldColor);
        clusterContainer.classList.remove(oldColor);
        clusterContainer.classList.add(newColor);

        resultElement.textContent = selectRandomFromArray(
            clusters.find((cluster) => cluster.title === resultElementName).items
        );
    });
});

// Reset Everything
resetButton.addEventListener('click', () => {
    renderClusters();
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
        changeColor(singleArea);
    } else {
        changeColor(singleArea, true);
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

// Group button rendering & events
groups.forEach((group) => {
    const groupToggle = document.createElement('button');
    groupToggle.classList.add('linkButton', 'group');
    groupToggle.innerHTML = group + '&nbsp;';
    groupToggle.setAttribute('title', 'Click to hide group');
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
            const removeIndex = hiddenGroups.findIndex((element) => element === group);
            hiddenGroups.splice(removeIndex, 1);
            groupToggle.setAttribute('title', 'Click to hide group');
            groupToggle.classList.remove('inactiveButton');
        } else {
            hiddenGroups.push(group);
            groupToggle.setAttribute('title', 'Click to show group');
            groupToggle.classList.add('inactiveButton');
        }

        renderClusters();
    });

    groupArea.appendChild(groupToggle);
});

if (!groups.length) {
    document.querySelector('.groupContainer').remove();
}

renderClusters();
