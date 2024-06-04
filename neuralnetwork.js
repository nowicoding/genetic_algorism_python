class NeuralNetwork {
  constructor(input_nodes, hidden_nodes, output_nodes, model) {
    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;
    if(model instanceof tf.Sequential) {
      this.model = model;
    } else {
      this.model = this.createModel();
    }
  }

  createModel() {
    const model = tf.sequential();

    let hiddenLayer = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.input_nodes],
      activation: "sigmoid",
      useBias: true,
      biasInitializer: tf.initializers.constant({
        value: Math.random(0, 1)
      })
    });

    let outputLayer = tf.layers.dense({
      units: this.output_nodes,
      activation: "sigmoid",
      useBias: true,
      biasInitializer: tf.initializers.constant({
        value: Math.random(0, 1)
      })
    });

    model.add(hiddenLayer);
    model.add(outputLayer);
    return model;
  }

  copy() {
    return tf.tidy(() => {
      const copyModel = this.createModel();
      const currentWeights = this.model.getWeights();
      let copyWeights = [];
      for(let i = 0; i < currentWeights.length; i++) {
        copyWeights.push(currentWeights[i].clone());
      }
      copyModel.setWeights(copyWeights);
      return new NeuralNetwork(this.input_nodes, this.hidden_nodes, 
        this.output_nodes, copyModel);
    })
  }

  mutate(rate) {
    return tf.tidy(() => {
      const copyModel = this.copy();
      const weights = copyModel.model.getWeights();
      let mutateWeights = [];
      for(let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = tensor.shape;
        let dtype = tensor.dtype;
        let values = tensor.dataSync().slice();
        for(let j = 0; j < values.length; j++) {
          if(random(0, 1) < rate) {
            values[j] += randomGaussian(0, 0.1);
          }
        }
        let newTensor = tf.tensor(values, shape, dtype);
        mutateWeights.push(newTensor);
      }
      copyModel.model.setWeights(mutateWeights);
      return copyModel;
    })
  }

  async loadModel() {
    console.log("Load model...");
    const layer = await tf.loadLayersModel('https://editor.p5js.org/jounger/sketches/7uRyDWGvl/model/mymodel.json');
    if(layer) {
      this.model = layer;
    }
    console.log("Load model complete");
  }

  async saveModel() {
    console.log("Save model...");
    const saveResult = await this.model.save("downloads://mymodel");
    // This will trigger downloading of two files:
    //   'mymodel.json' and 'mymodel.weights.bin'.
    console.log("Save model complete");
    console.log(saveResult);
  }

  logTensor() {
    console.log("numTensors (outside tidy): " + tf.memory().numTensors);
  }

  logWeights() {
    for (let i = 0; i < this.model.layers.length; i++) {
      print("weights: ");
      print(this.model.layers[i].getWeights());
      print(this.model.layers[i].getWeights()[0].dataSync());
      print("bias: ");
      print(this.model.layers[i].getWeights()[1].dataSync());
    }
  }
}
