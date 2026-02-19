const mongoose = require("mongoose");

const idCounterSchema = new mongoose.Schema(
  {
    prefix: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

idCounterSchema.index({ prefix: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("IdCounter", idCounterSchema);
