// Initialize global variables
let grid;
let simulationTime = 0; // Track time
let fpsSum = 0; // Sum of FPS values for averaging
let frameCount = 0; // Count of frames to calculate average FPS
let startTime; // Time when the simulation starts
let isSimulationRunning = false; // To track simulation state
let params; // Parameters for Hamsters.js

// Weather condition mapping
const weatherConditions = {
  'sunny': 0,
  'cloudy': 1,
  'rainy': 2,
  'stormy': 3,
  'foggy': 4,
  'snowy': 5
};

//Settings
const cols = 128;
const rows = 72;
const cellSize = 10;
const maxTime = 1000; // Run the simulation for 1000 frames
const dampingFactor = 0.90; // Adjusted to control transition rates

// Define transition probabilities
const transitionProbs = {
  'sunny': { cloudy: 0.10, rainy: 0.08, stormy: 0.05, foggy: 0.03, snowy: 0.02 },
  'cloudy': { sunny: 0.07, rainy: 0.12, stormy: 0.07, foggy: 0.03, snowy: 0.02 },
  'rainy': { sunny: 0.05, cloudy: 0.07, stormy: 0.15, foggy: 0.05, snowy: 0.03 },
  'stormy': { sunny: 0.04, cloudy: 0.08, rainy: 0.08, foggy: 0.20, snowy: 0.04 },
  'foggy': { sunny: 0.04, cloudy: 0.07, rainy: 0.04, stormy: 0.15, snowy: 0.12 },
  'snowy': { sunny: 0.06, cloudy: 0.06, rainy: 0.05, stormy: 0.04, foggy: 0.12 }
};


// Hamsters.js operator function with randomization and debugging
const operator = function() {
  const sharedArray = params.sharedArray; // Use shared array directly
  const cols = params.cols;
  const rows = params.rows;
  const weatherConditions = params.weatherConditions;
  const dampingFactor = params.dampingFactor;
  const transitionProbs = params.transitionProbs;

  // Define a function to get neighbors
  function getNeighbors(x, y) {
    let neighbors = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i !== 0 || j !== 0) { // Skip the current cell
          let ni = (x + i + cols) % cols; // Wrap around edges horizontally
          let nj = (y + j + rows) % rows; // Wrap around edges vertically
          neighbors.push(Atomics.load(sharedArray, ni + nj * cols));
        }
      }
    }
    return neighbors;
  }

  // Determine the range of indices for this thread
  const start = params.index.start || 0;
  const end = params.index.end;

  for (let index = start; index <= end; index++) {
    const i = index % cols;
    const j = Math.floor(index / cols);
    const currentState = Atomics.load(sharedArray, index); // Load the value atomically

    // Get the states of neighboring cells
    const neighbors = getNeighbors(i, j);
    const neighborSum = neighbors.reduce((sum, n) => sum + n, 0);
    const neighborAverage = neighborSum / neighbors.length;

    // Apply transition logic with damping factor and randomization
    let newState = currentState; // Default to current state

    // Transition logic based on probabilities
    if (currentState === weatherConditions['sunny']) {
      if (Math.random() < (transitionProbs['sunny']['cloudy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['cloudy'];
      } else if (Math.random() < (transitionProbs['sunny']['rainy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['rainy'];
      } else if (Math.random() < (transitionProbs['sunny']['stormy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['stormy'];
      } else if (Math.random() < (transitionProbs['sunny']['foggy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['foggy'];
      } else if (Math.random() < (transitionProbs['sunny']['snowy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['snowy'];
      }
    } else if (currentState === weatherConditions['cloudy']) {
      if (Math.random() < (transitionProbs['cloudy']['sunny'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['sunny'];
      } else if (Math.random() < (transitionProbs['cloudy']['rainy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['rainy'];
      } else if (Math.random() < (transitionProbs['cloudy']['stormy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['stormy'];
      } else if (Math.random() < (transitionProbs['cloudy']['foggy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['foggy'];
      } else if (Math.random() < (transitionProbs['cloudy']['snowy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['snowy'];
      }
    } else if (currentState === weatherConditions['rainy']) {
      if (Math.random() < (transitionProbs['rainy']['sunny'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['sunny'];
      } else if (Math.random() < (transitionProbs['rainy']['cloudy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['cloudy'];
      } else if (Math.random() < (transitionProbs['rainy']['stormy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['stormy'];
      } else if (Math.random() < (transitionProbs['rainy']['foggy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['foggy'];
      } else if (Math.random() < (transitionProbs['rainy']['snowy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['snowy'];
      }
    } else if (currentState === weatherConditions['stormy']) {
      if (Math.random() < (transitionProbs['stormy']['sunny'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['sunny'];
      } else if (Math.random() < (transitionProbs['stormy']['cloudy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['cloudy'];
      } else if (Math.random() < (transitionProbs['stormy']['rainy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['rainy'];
      } else if (Math.random() < (transitionProbs['stormy']['foggy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['foggy'];
      } else if (Math.random() < (transitionProbs['stormy']['snowy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['snowy'];
      }
    } else if (currentState === weatherConditions['foggy']) {
      if (Math.random() < (transitionProbs['foggy']['sunny'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['sunny'];
      } else if (Math.random() < (transitionProbs['foggy']['cloudy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['cloudy'];
      } else if (Math.random() < (transitionProbs['foggy']['rainy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['rainy'];
      } else if (Math.random() < (transitionProbs['foggy']['stormy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['stormy'];
      } else if (Math.random() < (transitionProbs['foggy']['snowy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['snowy'];
      }
    } else if (currentState === weatherConditions['snowy']) {
      if (Math.random() < (transitionProbs['snowy']['sunny'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['sunny'];
      } else if (Math.random() < (transitionProbs['snowy']['cloudy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['cloudy'];
      } else if (Math.random() < (transitionProbs['snowy']['rainy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['rainy'];
      } else if (Math.random() < (transitionProbs['snowy']['stormy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['stormy'];
      } else if (Math.random() < (transitionProbs['snowy']['foggy'] + Math.random() * 0.05) * dampingFactor) {
        newState = weatherConditions['foggy'];
      }
    }

    Atomics.store(sharedArray, index, newState); // Store the result atomically
  }
};





// Initialize and start Hamsters.js
function initializeParams() {
  // Create the SharedArrayBuffer and initialize grid
  const buffer = new SharedArrayBuffer(cols * rows * Uint8Array.BYTES_PER_ELEMENT);
  grid = new Uint8Array(buffer);

  // Get the selected starting weather condition from dropdown
  const startingWeather = parseInt(document.getElementById('startingWeather').value, 10);

  // Initialize grid with the selected starting weather condition
  for (let i = 0; i < grid.length; i++) {
    grid[i] = startingWeather;
  }

  // Get the selected number of threads from dropdown
  const threadCount = parseInt(document.getElementById('threadCount').value, 10);

  // Initialize params with the grid and other settings
  params = {
    sharedArray: grid, // Pass the SharedArrayBuffer directly
    cols: cols,
    rows: rows,
    weatherConditions: weatherConditions,
    dampingFactor: dampingFactor,
    dataType: 'Uint8',
    threads: threadCount, // Use selected number of threads
    transitionProbs: transitionProbs 
  };
}

function startSimulation() {
  if (isSimulationRunning) return;

  // Reset simulation state
  resetSimulation();

  initializeParams();

  // Record the start time
  startTime = performance.now();
  isSimulationRunning = true;
  frameRate(60); // Set frame rate to control the speed of the simulation
  loop(); // Ensure draw loop is active
}

function stopSimulation() {
  if (!isSimulationRunning) return;

  // Logic to stop the simulation
  isSimulationRunning = false;
  noLoop(); // Stop the draw loop
  // Note: Hamsters.js handles stopping by managing the threads internally
}

function resetSimulation() {
  // Reset the global variables
  simulationTime = 0;
  fpsSum = 0;
  frameCount = 0;
  grid = new Uint8Array(cols * rows); // Reset the grid
  
  // Get the selected starting weather condition from dropdown
  const startingWeather = parseInt(document.getElementById('startingWeather').value, 10);

  // Initialize grid with the selected starting weather condition
  for (let i = 0; i < grid.length; i++) {
    grid[i] = startingWeather;
  }
}

function setup() {
  createCanvas(1280, 720); // Set canvas size to 400x400
  pixelDensity(1); // Ensure pixel density is 1 for consistency
}

async function draw() {
  if (!isSimulationRunning) return;

  // Read user input for dynamic parameters
  const weatherChangeRate = parseFloat(document.getElementById('weatherChange').value);

  // Refresh the params object with the latest grid values
  params.sharedArray = grid;
  // Run Hamsters.js to update the grid for this frame
  grid = await hamsters.promise(params, operator);

  background(220);
  displayGrid(grid);
  
  // Calculate and accumulate FPS
  const currentFPS = frameRate();
  fpsSum += currentFPS;
  frameCount++;

  // Display the FPS counter in white
  fill(255, 255, 255); // White color
  textSize(16);
  text(`FPS: ${Math.round(currentFPS)}`, 10, 20);

  // Update stats
  updateStats();

  // Stop the simulation after a certain time
  simulationTime++;
  if (simulationTime > maxTime) {
    stopSimulation(); // Stops the draw loop
    displayResults(grid);
  }
}

function updateStats() {
  const elapsedTime = performance.now() - startTime;
  const averageFPS = frameCount > 0 ? fpsSum / frameCount : 0;

  // Display stats
  document.getElementById('stats').innerHTML = `
    <p>Average FPS: ${Math.round(averageFPS)}</p>
    <p>Total Frames: ${simulationTime}</p>
    <p>Total Elapsed Time: ${elapsedTime.toFixed(2)} ms</p>
  `;
}

function displayGrid(resp) {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let index = i + j * cols;
      let state = Atomics.load(resp, index); // Use atomic load
      if (state === weatherConditions['sunny']) {
        fill(255, 255, 0); // Yellow for sunny
      } else if (state === weatherConditions['cloudy']) {
        fill(200, 200, 200); // Gray for cloudy
      } else if (state === weatherConditions['rainy']) {
        fill(0, 0, 255); // Blue for rainy
      } else if (state === weatherConditions['stormy']) {
        fill(100, 100, 100); // Dark gray for stormy
      } else if (state === weatherConditions['foggy']) {
        fill(200, 200, 255, 150); // Light blue for foggy
      } else if (state === weatherConditions['snowy']) {
        fill(255, 255, 255); // White for snowy
      }
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function displayResults(resp) {
  // Count the occurrences of each weather condition
  let counts = {
    'sunny': 0,
    'cloudy': 0,
    'rainy': 0,
    'stormy': 0,
    'foggy': 0,
    'snowy': 0
  };

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let index = i + j * cols;
      let state = Atomics.load(resp, index); // Use atomic load
      if (state === weatherConditions['sunny']) counts['sunny']++;
      else if (state === weatherConditions['cloudy']) counts['cloudy']++;
      else if (state === weatherConditions['rainy']) counts['rainy']++;
      else if (state === weatherConditions['stormy']) counts['stormy']++;
      else if (state === weatherConditions['foggy']) counts['foggy']++;
      else if (state === weatherConditions['snowy']) counts['snowy']++;
    }
  }

  // Determine the most common weather condition
  let mostCommon = '';
  let maxCount = 0;
  for (let condition in counts) {
    if (counts[condition] > maxCount) {
      mostCommon = condition;
      maxCount = counts[condition];
    }
  }

  // Display results including average FPS
  const averageFPS = frameCount > 0 ? fpsSum / frameCount : 0;
  document.getElementById('results').innerHTML = `
    <p>Simulation Results:</p>
    <p>Sunny: ${counts['sunny']}</p>
    <p>Cloudy: ${counts['cloudy']}</p>
    <p>Rainy: ${counts['rainy']}</p>
    <p>Stormy: ${counts['stormy']}</p>
    <p>Foggy: ${counts['foggy']}</p>
    <p>Snowy: ${counts['snowy']}</p>
    <p>Most Common Weather: ${mostCommon}</p>
    <p>Average FPS: ${Math.round(averageFPS)}</p>
  `;
}

// Populate the dropdown with thread options
function populateThreadDropdown() {
  const dropdown = document.getElementById('threadCount');
  const maxThreads = hamsters.maxThreads;
  for (let i = 1; i <= maxThreads; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.text = `Thread ${i}`;
    dropdown.add(option);
  }
}

// Initialize the thread dropdown
populateThreadDropdown();

// Example functions to control simulation
document.getElementById('startButton').addEventListener('click', function() {
  startSimulation();
});

document.getElementById('stopButton').addEventListener('click', function() {
  stopSimulation();
});
