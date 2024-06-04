class Genetic {
  constructor(max_unit, top_unit, input_nodes=4, hidden_nodes=6, output_nodes=1) {
    this.max_unit = max_unit;
    this.top_unit = top_unit;
    if (top_unit > max_unit) {
      this.top_unit = max_unit;
    }
    this.populations = [];
    this.dead_bird = [];
    this.mutationRate = 1;
    this.iteration = 0;
    this.best_score = 0;
    this.best_fitness = 0;
    this.best_population = 0;
    
    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;
  }

  createPopulation() {
    this.iteration++;
    this.populations = [];
    this.dead_bird = [];
    this.mutationRate = 1;
    for (let i = 0; i < this.max_unit; i++) {
      this.populations.push(
        new Bird(
          new NeuralNetwork(
            this.input_nodes,
            this.hidden_nodes,
            this.output_nodes)));
    }
  }

  evolvePopulation() {
    console.clear();
    let [winners, losers] = this.selection();
    // save 
    if (winners.length == 0 ||
       (winners[0].score < 1 && this.mutationRate == 1)) {
      this.pupulations = this.createPopulation();
    } else {
      this.iteration++;
      this.populations = [];
      this.dead_bird = [];
      if (winners[0].fitness > this.best_fitness) {
        this.best_population = this.iteration;
        this.best_score = winners[0].score;
        this.best_fitness = winners[0].fitness;
      }
      
      for (let i = 0; i < this.max_unit; i++) {
        let a, b, offspring;
        if (i == 0 && winners.length > 1) {
          a = winners[0];
          b = winners[1];
          this.mutationRate = 0.1;
        } else if (i % 2 == 0 && winners.length > 2) {
          a = random(winners);
          b = random(winners);
          this.mutationRate = 0.15;
        } else {
          a = random(winners);
          b = random(winners);
          this.mutationRate = 0.2;
        }
        let aCopy = a.brain.copy();
        let bCopy = b.brain.copy();
        offspring = new Bird(this.crossOver(aCopy, bCopy).mutate(this.mutationRate));
        this.populations.push(offspring);
        aCopy.model.dispose();
        bCopy.model.dispose();
      }
      for(let bird of winners) {
        bird.clearMind()
      }
    }
  }

  crossOver(a, b) {
    let cutPoint = random(0, 1) > 0.5 ? 1 : 0;
    try {
      for (let i = cutPoint; i < cutPoint + 1; i++) {
        let aWeights = a.model.layers[i].getWeights()[0];
        let aBias = a.model.layers[i].getWeights()[1];
        let bWeights = b.model.layers[i].getWeights()[0];
        let bBias = b.model.layers[i].getWeights()[1];
        b.model.layers[i].setWeights([aWeights, aBias]);
        a.model.layers[i].setWeights([bWeights, bBias]);
      }
    } catch(err) {
      console.error(err);
      noLoop();
    }
    return random(0, 1) > 0.5 ? a : b;
  }


  selection() {
    // top 1 to top_unit
    let totalPopulations = [...this.dead_bird||[], ...this.pupulations||[]];
    let topWinner = totalPopulations.sort(function (a, b) {
      return b.fitness - a.fitness;
    });
    let winners = topWinner.slice(0, this.top_unit);
    let losers = topWinner.slice(this.top_unit, this.max_unit);
    for(let bird of losers) {
      bird.clearMind()
    }
    return [winners, losers];
  }
}
