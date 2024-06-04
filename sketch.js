// YouTube 빵형의 개발도상국
// https://www.youtube.com/@bbanghyong
// Reference: https://editor.p5js.org/jounger/sketches/7uRyDWGvl
let pipes = [];

let genetic;
const maxPopulation = 20;
const topPopulation = 4;

let bestScore = 0;
let counter = 0;

function preload() {
  bgImg = loadImage("assets/background.png");
  birdImg = loadImage("assets/bird.png");
  pipeImg = loadImage("assets/pipe.png");
  pipe2Img = loadImage("assets/pipe2.png");
}

function setup() {
  createCanvas(400, 600);
  angleMode(DEGREES);
  slider = createSlider(1, 10, 1);

  // input, hidden, output nodes
  genetic = new Genetic(maxPopulation, topPopulation, 4, 6, 1);
  genetic.createPopulation();
}

function draw() {
  for (let s = 0; s < slider.value(); s++) {
    if (counter % 60 == 0) {
      pipes.push(new Pipe());

      counter = 0;
    }
    counter++;
    
    // pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].update();

      if (pipes[i].offScreen()) {
        pipes.splice(i, 1);
      }
    }
    
    // bird
    for (let i = genetic.populations.length - 1; i >= 0; i--) {
      let bird = genetic.populations[i];

      bird.actionAndUpdate(pipes);

      if (!bird.state) { // dead
        if (bird.score == 0) { // clear brain
          bird.clearMind();
        } else {
          genetic.dead_bird.push(bird);
        }

        genetic.populations.splice(i, 1);
      }

      // end of population
      if (genetic.populations.length == 0) {
        genetic.evolvePopulation();

        bestScore = 0;
        pipes = [];
      }
    }
  }
  
  // render
  background(bgImg);
  
  for (let pipe of pipes) {
    pipe.show();
  }
  
  for (let bird of genetic.populations) {
    bird.show();
  }
  
  // score
  for (let bird of genetic.populations) {
    if (bird.score > bestScore) {
      bestScore = bird.score;
    }
  }

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(50);

  text(bestScore, width / 2, height / 5);
  
  // etc
  fill(0);
  textAlign(LEFT);
  textStyle(NORMAL);
  textSize(12);

  text("Epochs: " + genetic.iteration, 300, 500);
  text("Alive: " + genetic.populations.length, 300, 520);
  text("Best Score: " + genetic.best_score, 300, 540);
  text("Best Epochs: " + genetic.best_population, 300, 560);
  text("Best Fitness: " + genetic.best_fitness, 300, 580);
}