let gridSpace = 70;
let numOfLines = 10; 

//points and counters
let score = 0;
let lives = 3;

//no need to touch this...
let gridSize  = gridSpace * (numOfLines-1);
let marginX = 0;
let marginY = 0;

//target stuff (all get assigned later in newTarget())
let targetSize = 0;
let targetX = 0;
let targetY = 0;

//for user input (dictionary to lookup what y values are assigned to each letter)
let coords = [];
let yValues = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8,
    i: 9,
    j: 10,
}

//for webcam tracking
let video;
let poseNet;
let poses = [];

let xPos;
let yPos;

function webcamTrackSetup(){
    video = createCapture(VIDEO);
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
    select('#status').html('Model Loaded');
  }

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
      // For each pose detected, loop through all the keypoints
      let pose = poses[i].pose;
      for (let j = 0; j < pose.keypoints.length; j++) {
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        let keypoint = pose.keypoints[j];
        // Only draw an ellipse is the pose probability is bigger than 0.2
        if (keypoint.score > 0.99) {
          fill(255, 0, 0);


          //map the values to put the dot in the middle of the screen.
          xPos = map(keypoint.position.x,0,640,1700,-200);
          yPos = map(keypoint.position.y,0,480,-500,1300)

          noFill();
          strokeWeight(1.5);
          ellipse(xPos,yPos,40,40); //circle
          //draw both the vertical lines of the sniper scope.
          line(xPos,yPos+20,xPos,yPos+7);
          line(xPos,yPos-20,xPos,yPos-7);
          //draw both the horizontal lines of the sniper scope.
          line(xPos+20,yPos,xPos+7,yPos);
          line(xPos-20,yPos,xPos-7,yPos);
          //ellipse(xPos,yPos, 10, 10);
          strokeWeight(1);
          return;
        }
      }
    }
  }

function drawGrid() {
    fill(59,187,250);
    strokeWeight(.5);
    rect(marginX-50,marginY-50,gridSize+(marginX/4.5),marginY+(gridSize)*1.025);

    let yMarkers = ["","a","b","c","d","e","f","g","h","i",];
    for(let i=0; i<numOfLines; i++) {
        line(marginX,marginY+(i*gridSpace),gridSize+marginX,marginY+(i*gridSpace)); //horizontal grid lines
        line(marginX+(i*gridSpace),marginY,marginX+(i*gridSpace),marginY+(gridSize)); //vertical grid lines 
        //where 500 is the size of the cavas and 100 are the incriments...

        //grid markers
        if(i>0) {
            fill(0);   
            text(yMarkers[i],marginX-12,marginY+(i*gridSpace)+5); //y-axis markers
            text(i,marginX+(i*gridSpace)-3,marginY-5); // x-axis markers 
        }

    }

}

function newTarget() {
    targetSize = 80;
    //give the new target a random position on the grid...
    targetX = int(random(1,numOfLines));
    targetY = int(random(1,numOfLines));

    //draw the target at the position (accounting for the margin and grid spacing)
    fill(255);
    circle(marginX+(targetX*gridSpace),marginY+(targetY*gridSpace),targetSize);
    fill(255,0,0);
    circle(marginX+(targetX*gridSpace),marginY+(targetY*gridSpace),targetSize/1.2);
    fill(255);
    circle(marginX+(targetX*gridSpace),marginY+(targetY*gridSpace),targetSize/1.5);
    fill(255);
    circle(marginX+(targetX*gridSpace),marginY+(targetY*gridSpace),targetSize/1.8);
}


function drawTarget(){
    //reduce the target size by an ammount based on how high the players score is.
    //then redraw the target...
    targetSize = (targetSize - .1) -(.05*score);
    noStroke()
    fill(255);
    circle(marginX+(targetX*gridSpace),marginY+(targetY*gridSpace),targetSize); //outer white circle
    fill(255,0,0);
    circle(marginX+(targetX*gridSpace),marginY+(targetY*gridSpace),targetSize/1.3); //red outer band
    fill(255);
    circle(marginX+(targetX*gridSpace),marginY+(targetY*gridSpace),targetSize/1.8); //white inner band 
    fill(255,0,0);
    circle(marginX+(targetX*gridSpace),marginY+(targetY*gridSpace),targetSize/3.2); //red inner circle
    stroke(1);
}

function checkifTargetHit(){
  let distance = dist(xPos,yPos,(marginX+(targetX*gridSpace)),(marginY+(targetY*gridSpace)));
  //console.log(webcamPointX*(-1)); 
  if(distance < ((targetSize/2)+5)){
    console.log("hit!!");
    targetSize = 0;
    score++;
  }
  //console.log(marginX+(targetX*gridSpace));

  //keypoint.position.x-(windowHeight/2), keypoint.position.y*1.5
  //^ this is the position that the cursor is drawn
  //10 is the diameter.

  //marginX+(targetX*gridSpace),marginY+(targetY*gridSpace
  //^ this is the position that the target is drawn
  //targetSize is the diameter.

  //check if the distance between them is less than the sum of the two circles radius...
  //if it is then set the target size to 0 and add 1 to score! 
}








function setup(){
    createCanvas(windowWidth-20, windowHeight-20);

    //fixes the margins to be exactly in the middle of the page.
    marginX = (windowWidth/2) - (gridSize/2)
    marginY = (windowHeight/2) - (gridSize/2);

    //make a new target to show on startup
    newTarget();


    //this is the setup function for the webcam tracking
    //might need to put this in setup if it doesn't work...
    webcamTrackSetup();
}


function draw() {
    background(255);
    drawGrid();

    
    if(targetSize <= 0) {
        newTarget();
    }
    drawTarget();

    fill(0);
    text(score,100,100)


    //this is all cam tracking stuff.
    //translates the webcam so its not mirrored and then draws a circle on the first strongest marker it finds in the webcam.
    //translate(video.width, 0);
    //scale(-1, 1);
    
  drawKeypoints();

  checkifTargetHit();
    

}

function keyPressed() {
    //if a key is pressed add it to a list
    append(coords,key);

    //if two keys have been pressed then check if they are the coordinates of the current target.
    if(coords.length > 1) {

        //this checks if the inputs are the same as the target position.
        if(coords[0] == targetX && yValues[coords[1]] == targetY) {
            //setting the size to 0 will cause a new target to be drawn on the next frame.
            //add one to the players score.
            targetSize = 0;
            console.log("HIT!")
            score++;
        }
        //reset the score list so the program isnt testing previous user inputs after they have been tested once already.
        coords = [];     
    }
    
}

//maybe add a function for drawing the players score and number of lives etc...? 