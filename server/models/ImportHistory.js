const mongoose = require('mongoose');

const importHistorySchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    successfulRecords: {
      type: Number,
      default: 0,
    },
    failedRecords: {
      type: Number,
      default: 0,
    },
    duplicateRecords: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // createdAt = import date
);

module.exports = mongoose.model('ImportHistory', importHistorySchema);
