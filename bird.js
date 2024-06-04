class Bird {
  constructor(neuralnetwork) {
    this.x = 130;
    this.y = floor(random(height / 3, height / 2));
    this.r = 50;
    this.velocity = 0;
    this.lift = -30;
    this.up = false;
    this.state = true; // is bird still alive: true
    // this.name = makeid(5);
    // brain
    if (neuralnetwork) {
      this.brain = neuralnetwork;
    } else {
      this.brain = new NeuralNetwork(4, 6, 1);
    }
    this.score = 0;
    this.fitness = 0;
    this.total_distance = 0;
    // world effect
    this.gravity = 2;
    this.friction = 0.1;
  }

  actionAndUpdate(pipes) {
    if (pipes.length > 0 && this.state) {
      this.update();
      /*
      input include:
      1. width from bird to closest pipe
      2. height of top pip - bird
      3. height of bird - bottom pip
      4. current velocity of bird
      */
      // calc 1.
      let {
        pipe: closest_pipe,
        distance: distance_to_closest,
      } = this.findClosestPipe(pipes); // to bird

      let d_close = distance_to_closest / width;
      // calc 2. height_to_top_pipe
      let h_top = (this.y - closest_pipe.top) / height;
      // calc 3. height_to_bot_pipe
      let h_bot = (closest_pipe.y_bot - this.y) / height;
      // cal 4.
      let velocity_scale = this.velocity / 10;

      this.fitness = (this.total_distance - distance_to_closest) / width;
      // apply to predict
      let inputs = tf.tensor2d([[d_close, h_top, h_bot, velocity_scale]]);
      let output = this.brain.model.predict(inputs);
      let outputValue = output.dataSync();
      inputs.dispose();
      output.dispose();
      if (outputValue[0] > 0.5) {
        this.flap();
      }
      if (this.hit(closest_pipe)) {
        this.state = false; // die
      }
      if (distance_to_closest + closest_pipe.w == 0 && this.state) {
        this.score++;
      }
    }
  }

  clearMind() {
    this.brain.model.dispose();
    if(typeof this.brain.model.optimizer !== 'undefined') {
      this.brain.model.optimizer.dispose();
    }
  }

  show() {
    /* show bird's name
    fill(255);
    textSize(12);
    text(this.name, this.x, this.y - this.r/2 - 8);
    */
    fill(0, 0, 255, 100);

    push();
    imageMode(CENTER);
    translate(this.x, this.y);
    if (this.up || this.velocity < 0) {
      rotate(-35);
    } else {
      rotate(35);
    }
    image(birdImg, 0, 0, this.r, this.r);
    pop();
  }

  update() {
    this.total_distance++;
    this.velocity += this.gravity;
    this.velocity = constrain(this.velocity, -25, 25);
    this.y += this.velocity;
    if (this.y > height || this.y < 0) {
      this.velocity = 0;
      this.state = false;
    }
    this.up = false;
  }

  flap() {
    this.velocity += this.lift;
    this.velocity *= 1 - this.friction;
    this.up = true;
  }

  hit(pipe) {
    if (this.x > pipe.x && this.x < pipe.x + pipe.w) {
      if (this.y < pipe.top || this.y > pipe.top + pipe.gap) {
        return true;
      }
    }
    return false;
  }

  findClosestPipe(pipes) {
    let cp = pipes[0]; // closest pipe (to bird)
    // distance to closest (center of) pipe
    let dis = cp.x - this.x;
    for (let i = 0; i < pipes.length; i++) {
      let pipe = pipes[i];
      let cur_dis = pipe.x - this.x;
      if (cur_dis > 0 && cur_dis < dis) {
        cp = pipe;
        dis = cur_dis;
        break;
      }
    }
    return {
      pipe: cp,
      distance: dis,
    };
  }
}