const mongoose = require("mongoose");

const employesSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const Employes = mongoose.model("Employes", employesSchema);

module.exports = { Employes };
