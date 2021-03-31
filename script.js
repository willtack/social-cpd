
//assign states
var PREDICT_STATE = 0;
var WAIT_STATE = 1;
var RANGE_STATE = 2;
var OUTCOME_STATE = 3;
var BLANK_STATE = 4;


//distribution parameters
var target = 0;
var m1 = 23; var m2 = 28; var sd = 3;

//trials and phases
var totaln = 4; //number of trials per phase (two phases)
var trial_number = 1;


//initialize
var state = PREDICT_STATE;
var middlenum = 0;
var num = 0;
var diameter = 0;
var points = 0;
var gameover = false;
var predictclick = false;
var rangeclick = false;
function init(){ //use for re-initializing
  state = PREDICT_STATE;
  middlenum = 0;
  num = 0;
  diameter = 0;
  predictclick = false;
  rangeclick = false;
}

//generate number from distribution 
var standard1 = gaussian(m1, sd);
target = Math.round(standard1());


var feed = document.getElementsByClassName("Feedback"); //Hide the feedback elements at start
$(feed).addClass("Hidden");

var instruct = document.getElementById('instruct1');

document.getElementById("trial").innerHTML = "Trial Number: " + trial_number ; //trial number readout

//returns a random number from a normal distribution with given mean and stdev
function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;               
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       var retval = mean + stdev * y1;
       if(retval > 0) 
           return retval;
       return -retval;
   }
}

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
      
  
 async function blank(){
    //hide instruct, feedback, squares; unhide after 0.5s
      var elements = document.getElementsByClassName("Square");
      var elements2 = document.getElementsByClassName("Instruction");

      $(elements).addClass("Hidden");
      $(elements2).addClass("Hidden");

      await sleep(500);
      
      $(elements).removeClass("Hidden");    
      $(elements2).removeClass("Hidden");

  }
  
   function outputData(){
      var radius = +diameter/2;
      console.log("-------------")
      console.log("Range: +/- " + radius)
      console.log("Points: " + points)
      console.log("Human chose: " + middlenum)
      console.log("Computer chose: " + target)
  }
  
    function resetSquares(){
        var squares = document.getElementsByClassName("Square"); //reset the squares
        $(squares).removeClass("ChosenSquare");
        $(squares).removeClass("TargetSquare");
        $(squares).removeClass("ChosenRangeLeft");
        $(squares).removeClass("ChosenRangeRight");
  }
  
  async function reset(mean) {
      
      outputData(); //prints stats to the console

      await sleep(2000);  //how long to show outcome for 
      document.getElementById("instruct1").innerHTML = "Predict"; //reset the text
      $(feed).addClass("Hidden");
          
      blank();  //show a blanks screen for one second (ITI)
      resetSquares();
      init(); //reinitialize all variables
      
      var standard1 = gaussian(mean, sd); //pick a new number
      target = Math.round(standard1());
      document.getElementById("meandisplay").innerHTML = "Mean: " + mean; //DELETE THIS !!!!!
  }


 async function endGame() {
    gameover = true;
    await sleep(1000);

    document.getElementById("instruct1").innerHTML = "End of Game"; //reset the text
    $(feed).addClass("Hidden");
    
    resetSquares();
    
    document.getElementById("trial").innerHTML = "Points: " + points ;
}

 function checkOutcome(){
      state = OUTCOME_STATE;
      document.getElementById("instruct1").innerHTML = "Outcome"
      $(instruct).removeClass('Hidden')
      
      var pointsgiven = 0;
      difference=Math.abs(+middlenum - target);
      closeness="";
      if (difference === 0){
        closeness="perfect!";
        pointsgiven = 2;}
      else if (difference <= 5){
        closeness="very close!";
        pointsgiven = 2; }
      else if (difference >= 6 && difference <= 10){
        closeness="close";
        pointsgiven = 1;}
      else if (difference >= 11 && difference <= 15){
        closeness="far";
        pointsgiven = 0;}
      else if (difference > 15){
        pointsgiven = 0;
        closeness="very far";
      }
      points += pointsgiven;
      
      //give feedback
      document.getElementById("feedback1").innerHTML = closeness;
      document.getElementById("feedback2").innerHTML = "+" + pointsgiven;
      if (pointsgiven === 0){
         $(feed).addClass("FeedbackBad");
      }
      $(feed).removeClass("Hidden");
      
      
      //reveal target square
      targetsquare = "#you-square-" + target;
      $(targetsquare).addClass('TargetSquare');
      
      //next trial
      trial_number++; 
      document.getElementById("trial").innerHTML = "Trial Number: " + trial_number ; //update trial number readout
      if (+trial_number >= +totaln*2){ //if above max trials, end game
        endGame();
      } else if (+trial_number > +totaln){ //if more than halfway through, reset with mean = 28
        reset(m2);
      } else { //if less than halfway through, reset with mean = 23
        reset(m1);
      }
    }
    
    
//What to do whenever the mouse is clicked:

 $(".Square").click(async function() {
    if (gameover == true){ //do nothing if the game is over
      return;
    }
    num=$(this).attr('num'); //get the number from the square that was clicked
    if (state == PREDICT_STATE && +num != 50 && +num != 1 && predictclick == false){ //if we're in the predict stage,  
          $(this).addClass('ChosenSquare'); //denote the chosen square
          middlenum=num;
          $(instruct).addClass('Hidden') //hide PREDICT for .3s before it becomes RANGE
          await sleep(300);
          document.getElementById("instruct1").innerHTML = "Range"; 
          $(instruct).removeClass('Hidden');
          
          state = RANGE_STATE; //and move to Range stage
    }
    else if (state == RANGE_STATE && rangeclick == false){
          if (+num < +middlenum){
            //figure out the id of the upper-limit square given lower-limit
             diameter = (middlenum - num)*2;
             high = +num + diameter;
            if (high <= 50){
              rangeclick = true;
              var highsquare = "#you-square-" + high ;
              var lowsquare = "#you-square-" + num;
              $(lowsquare).addClass('ChosenRangeLeft'); //show range graphic
              $(highsquare).addClass('ChosenRangeRight')
              $(instruct).addClass('Hidden');
              await sleep(800); //how long to show range graphic
              $(lowsquare).removeClass('ChosenRangeLeft'); //hide range
              $(highsquare).removeClass('ChosenRangeRight'); 
              await sleep(500); //between range graphic disappearing and outcome displaying
              checkOutcome();
            }

          }
       }
    });
    
    
    
    
    

    
    
    
   
  
 
