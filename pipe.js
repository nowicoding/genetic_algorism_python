class Pipe {
  constructor() {
    this.x = width;
    this.w = 90;
    this.gap = 180; // 120
    this.min_height = 100;
    this.max_height = height - this.min_height - this.gap;
    this.top = floor(random(this.min_height, this.max_height));
    this.bot = height - this.gap - this.top;
    this.y_bot = height - this.bot;
    this.speed = 5;
  }

  show() {
    fill(0, 255, 0);

    /* top pipe */
    image(pipe2Img, this.x, 0, this.w, this.top);
    /* bottom pipe */
    image(pipeImg, this.x, this.y_bot, this.w, this.bot);
  }

  offScreen() {
    if (this.x + this.w < 0) {
      return true;
    }
    return false;
  }

  update() {
    this.x -= this.speed;
  }
}