/* The number of rows and columns in the board. */
var ROWS = 4;
var COLS = 4;

/* global state. Note: these values are used to initialize the game. */
var STATE = {
  'numPredators': 5,
  'numPrey': 5,
  'predatorLocations': [],
  'preyLocations': []
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// User interface
///////////////////////////////////////////////////////////////////////////////////////////////////

/* Creates an empty ROWS * COLS board */
function initializeBoard() {
  //todo: figure out how to do this with nodes and append.
  var html = "<table border=1>";
  
  for(var row=0; row < ROWS; row++) {
    if(row == 0) 
      html += "<tr>";
    else 
      html += "</tr><tr>";

    for(var col=0; col < COLS; col++) {
      html += "<td><input type='checkbox' id='box" +row +col + "'></td>";
    }
  }

  html + "</table>";

  document.getElementById('board').innerHTML = html;
}

/** A helper function that unchecks all boxes and sets the onclick event for
 * each box to the `listener` function. */
function uncheckBoxesAndSetListener(listener) {
   for(var row=0; row < ROWS; row++) {
    for(var col=0; col < COLS; col++) {
      var box = document.getElementById('box'+row+col)
      if(box == null) alert("error in uncheckBoxesAndSetListener");
      box.checked = false;
      box.onclick = function(event) {
        listener();
      }
    }
   }
}

/** Prepares the page for predator's choice of locations. */
function predatorSetup() {
  document.getElementById('phase').innerHTML = "Place " + STATE['numPredators'] + " predators";
  uncheckBoxesAndSetListener(selectPredator);
}

/** Called whenever a predator checkbox is toggled. */
function selectPredator() {
  //Count all selected checkboxed.
  var selectedCount = 0;
  for(var row=0; row < ROWS; row++) {
    for(var col=0; col < COLS; col++) {
      var box = document.getElementById('box'+row+col);
      //Sanity check: box at (row,col) exists
      if(box == null) alert("Something went wrong.");
      if(box.checked) selectedCount++;
    }
  }

  var numUnplaced = STATE['numPredators'] - selectedCount;
  if(numUnplaced == 0) {
    savePredators();
    preySetup();
  }
  else
    document.getElementById('phase').innerHTML = "Place " + numUnplaced + " predators"; //todo if 1 remove "s"
}

/** Saves predator locations in global state. */
function savePredators() {
  STATE['predatorLocations'] = [];
  for(var row=0; row < ROWS; row++) {
    for(var col=0; col < COLS; col++) {
      var box = document.getElementById('box'+row+col);
      if(box.checked) STATE['predatorLocations'].push( [row, col] );
    }
  }
}

/** Prepares the board for prey's choice of locations. */
function preySetup() {
  debug("PLACE PREY");
  document.getElementById('phase').innerHTML = "Place " + STATE['numPrey'] + " prey";
  uncheckBoxesAndSetListener(selectPrey);
}

/** Called whenever a prey checkbox is selected. */
function selectPrey() {
  //Count all selected checkboxed.
  var selectedCount = 0;
  for(var row=0; row < ROWS; row++) {
    for(var col=0; col < COLS; col++) {
      var box = document.getElementById('box'+row+col);
      //Sanity check: box at (row,col) exists
      if(box == null) alert("Something went wrong.");
      if(box.checked) selectedCount++;
    }
  }

  var numUnplaced = STATE['numPrey'] - selectedCount;
  if(numUnplaced == 0) {
    savePrey();
    simulate();
  }
  else
    document.getElementById('phase').innerHTML = "Place " + numUnplaced + " prey"; 
}

/* Stores the prey selections in global state. */
function savePrey() {
  STATE['preyLocations'] = [];
  for(var row=0; row < ROWS; row++) {
    for(var col=0; col < COLS; col++) {
      var box = document.getElementById('box'+row+col);
      if(box.checked) STATE['preyLocations'].push( [row, col] );
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Simulation 
///////////////////////////////////////////////////////////////////////////////////////////////////

function simulate() { 
  document.getElementById('phase').innerHTML = "Simulation (C = predator, M = prey)";
  document.getElementById('stepper').hidden = false;
  document.getElementById('stepper').onclick = function(event) { step(); }
  printState();
}

function step() {
  var predatorLocations = STATE['predatorLocations'];
  var preyLocations     = STATE['preyLocations'];

  // Whenever there's an overlap, the predator reproduces and the prey dies.
  var overlaps = countOverlaps();
  STATE['numPredators'] = Math.min(STATE['numPredators'] + overlaps, ROWS*COLS);
  STATE['numPrey'] = Math.min(STATE['numPrey'] - overlaps, ROWS*COLS);
  // The surviving prey couple up and reproduce.
  debug("Reproduction created new prey: " + Math.floor(STATE['numPrey'] / 2));
  STATE['numPrey'] += Math.floor(STATE['numPrey'] / 2);

  document.getElementById('stepper').hidden = true; //hide the button.
  debug(overlaps + " overlaps");
  alert('There are now ' + STATE['numPredators'] + ' predators and ' + STATE['numPrey'] + ' prey');

  //And start a new round or exit if done.
  if(STATE['numPrey'] == 0) {
    alert('all prey are dead; game over');
  }
  else if(STATE['numPredators'] == 0) {
    alert('all preadators are dead: game over');
  }
  else {
    initializeBoard();
    predatorSetup(); 
  }
}

/* Overlap = predator and prey on same square. Returns the numer of overlapping squares. */
function countOverlaps() {
  var c=0;
  var predatorLocations = STATE['predatorLocations'];
  var preyLocations     = STATE['preyLocations'];
  for(var i=0;i<predatorLocations.length;i++) {
    for(var j=0; j<preyLocations.length; j++) {
      if(predatorLocations[i][0] == preyLocations[j][0] && predatorLocations[i][1] == preyLocations[j][1]) {
        c++;
        break;
      }
    }
  }
  return c;
}


function printState() {
  var predatorLocations = STATE['predatorLocations'];
  var preyLocations     = STATE['preyLocations'];

  //todo: figure out how to do this with nodes and append.
  var html = "<table border=1>";
  
  for(var row=0; row < ROWS; row++) {
    if(row == 0) 
      html += "<tr>";
    else 
      html += "</tr><tr>";

    for(var col=0; col < COLS; col++) {
      html += "<td>";
      var hasPredator = predatorAt([row,col]);
      var hasPrey = preyAt([row,col]);
      if(hasPredator) html += "C";
      if(hasPrey) html += "M";
      if(!hasPredator && !hasPrey) html += "-";
      
      html += "</td>";
    }
  }

  html + "</table>";

  document.getElementById('board').innerHTML = html;
}

function predatorAt(c) {
  for(var i=0;i<STATE['predatorLocations'].length;i++) {
    if(STATE['predatorLocations'][i][0] == c[0] && STATE['predatorLocations'][i][1] == c[1]) return true;
  }
  return false;
}

function preyAt(c) {
  for(var i=0;i<STATE['preyLocations'].length;i++) {
    if(STATE['preyLocations'][i][0] == c[0] && STATE['preyLocations'][i][1] == c[1]) return true;
  }
  return false;
}

function debug(msg) {
  console.log(msg);
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////////////////////////

initializeBoard();
predatorSetup();

