const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Attendance date is required"],
      index: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return value <= today;
        },
        message: "Attendance date cannot be in the future",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["Present", "Absent"],
        message: "Status must be Present or Absent",
      },
      required: [true, "Attendance status is required"],
      default: "Absent",
    },
    markTime: {
      type: Date,
      required: [true, "Mark time is required"],
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { employeeId: 1, date: 1 },
  { unique: true, sparse: true, name: "unique_employee_date" }
);

// Static method to check if attendance already marked for today
attendanceSchema.statics.isAlreadyMarked = async function (employeeId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const attendance = await this.findOne({
    employeeId: employeeId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  return attendance !== null;
};

// Static method to get attendance by employee and date
attendanceSchema.statics.getByEmployeeAndDate = function (employeeId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.findOne({
    employeeId: employeeId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });
};

// Static method to get attendance records for employee within date range
attendanceSchema.statics.getByEmployeeAndDateRange = function (
  employeeId,
  startDate,
  endDate
) {
  return this.find({
    employeeId: employeeId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).sort({ date: -1 });
};

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = { Attendance };
