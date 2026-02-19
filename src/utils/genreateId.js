const IdCounter = require("../models/IdCounter");

/*
 * Generates a unique ID with format: PREFIX-YYYYNNN
 * @param {string} prefix - Static prefix like 'H', 'C', etc.
 * @param {number} [padLength=3] - Number of digits to pad the counter
 * @returns {Promise<string>} - Generated unique ID
 */
async function generateId(prefix, padLength = 3) {
  const year = new Date().getFullYear();

  const counter = await IdCounter.findOneAndUpdate(
    { prefix, year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(padLength, "0");
  return `${prefix}-${year}${paddedSeq}`;
}



module.exports =  generateId 
