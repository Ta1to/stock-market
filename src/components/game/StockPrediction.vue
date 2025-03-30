<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal">
        <h2>Stock Price Prediction</h2>
        <input
          type="number"
          v-model="prediction"
          placeholder="Enter predicted price"
        />
        <div class="modal-actions">
          <button @click="submitPrediction">Submit</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "StockPrediction",
    props: {
      // Control visibility of the popup from the parent component
      visible: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        prediction: "",
      };
    },
    methods: {
      submitPrediction() {
        // Emit an event with the prediction value, converting it to a number if needed
        const predictionValue = parseFloat(this.prediction);
        if (!isNaN(predictionValue)) {
          this.$emit("submit", predictionValue);
          this.reset();
        } else {
          console.error("Invalid prediction value");
        }
      },
      reset() {
        this.prediction = "";
      },
    },
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal {
    background: #000;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    max-width: 90%;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .modal input {
    width: 100%;
    padding: 8px;
    margin-top: 12px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .modal-actions {
    display: flex;
    justify-content: space-evenly;
  }
  
  .modal-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .modal-actions button:first-of-type {
    background-color: #056947;
    color: #fff;
  }
  
  .modal-actions button:last-of-type {
    background-color: #ccc;
  }
  </style>
  