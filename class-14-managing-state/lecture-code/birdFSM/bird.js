// Logging utility functions so we can view big fonts on the screen
plog = document.getElementById("plog");
spEvent = document.getElementById("spEvent");
spState = document.getElementById("spState");

btnTime  = document.getElementById("btnTime");
btnCatch = document.getElementById("btnCatch");
btnShot  = document.getElementById("btnShot");
btnPhoenix = document.getElementById("btnPhoenix");

imgBird = document.getElementById("imgBird");

function clearLog()   { plog.innerHTML = ""; }
function mylog(s)     { plog.innerHTML += s + "<br>";  }
function mylogNoBR(s) { plog.innerHTML += s;           }

// Update event & state text
function evlogNoBR(s) { spEvent.innerHTML = s; }
function stlogNoBR(s) { spState.innerHTML = s; }

// These arrays & objects aren't used in this demo, but are here for reference
// as a way to organize data to get the "best of both worlds": a list of "enums"
// that is a numerical representation of states, and strings that map 1:1 to the
// enums that describe states in the UI and in debug logs (more human-readable
// than integers).
var StateString = [
  "Nest", // In the nest
  "Hunt", // Hunting for rabbit
  "Win",  // Flying home w/ freshly caught rabbit
  "Dead"  // Bird is dead
]                     
var State = {
   Nest : 0,
   Hunt : 1,
   Win  : 2,
   Dead : 3
};

var EventString = [
  "Time",  // Time has passed (makes bird hungry)
  "Catch", // Rabbit caught
  "Shot"   // Hunter shot the bird
]
var Event = {
   Time  : 0,
   Catch : 1,
   Shot  : 2
};

// Constructor for the FSM
// .processInput() is the FSM's "turn the crank" method (driven by
// inputs, which we call "events" in this code.
function birdFSM(st) {
  this.state = st; // Initial state
  stlogNoBR(this.state);
  mylog("birdFSM() constructor called with state = " + st);

  this.processInput = function(event) {
    evlogNoBR(event);

    switch (this.state) {
    case "Nest":
      if (event == "Time") { this.state = "Hunt"; }
      break;

    case "Hunt":
      switch (event) {
      case "Catch": this.state = "Win";  break;
      case "Shot":  this.state = "Dead"; break;
      default:  break;
      }
      break;

    case "Win":
      switch (event) {
      case "Shot": this.state = "Dead"; break;
      case "Time": this.state = "Nest"; break;
      default: break;
      }
      break;

    case "Dead":
      mylog("Eagle's (still) dead. Please show respect; stop clicking event buttons!");
      showPhoenixButton();
      break;

    default:
      break;
    }
    stlogNoBR(this.state);
    imgBird.src = "img/"+this.state.toLowerCase()+".jpg";
    if (this.state == "Dead") { showPhoenixButton(); }
  }
}

var eagleFSM = new birdFSM("Nest");

function showPhoenixButton() {
  btnPhoenix.style.display = "inline";
}
function hidePhoenixButton() {
  btnPhoenix.style.display = "none";
}

function resetFSM() {
  hidePhoenixButton();
  eagleFSM.state = "Nest";

  evlogNoBR("");
  stlogNoBR(eagleFSM.state);
  imgBird.src = "img/"+eagleFSM.state.toLowerCase()+".jpg";

  clearLog();
}

btnTime.addEventListener( "click", function() { eagleFSM.processInput("Time" ); }, false);
btnCatch.addEventListener("click", function() { eagleFSM.processInput("Catch"); }, false);
btnShot.addEventListener( "click", function() { eagleFSM.processInput("Shot" ); }, false);
btnPhoenix.addEventListener("click", resetFSM, false);

clearLog();

/* Automated test:
eagleFSM.processInput("Time");
eagleFSM.processInput("Miss");
eagleFSM.processInput("Win");

eagleFSM.processInput("Time");
eagleFSM.processInput("Time");
eagleFSM.processInput("Miss");

eagleFSM.processInput("Shot");
eagleFSM.processInput("Time");
eagleFSM.processInput("Time");
*/