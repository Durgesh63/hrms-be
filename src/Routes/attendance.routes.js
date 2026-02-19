const { Router } = require("express");
const {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  getTodayAttendance,
  getAttendanceByDate,
} = require("../controller/attendance.controllers");
const checkAuthUser = require("../middleware/auth.middleware");

const attendanceRouter = Router();

// Private routes - all attendance routes require authentication
// Mark attendance
attendanceRouter.route("/mark").post(checkAuthUser, markAttendance);

// Get all attendance records with filters
attendanceRouter.route("/").get(checkAuthUser, getAllAttendance);

// Get attendance by specific date
attendanceRouter.route("/filter/by-date").get(checkAuthUser, getAttendanceByDate);

// Get today's attendance for specific employee
attendanceRouter.route("/:employeeId/today").get(checkAuthUser, getTodayAttendance);

// Get attendance records for specific employee
attendanceRouter.route("/:employeeId").get(checkAuthUser, getAttendanceByEmployee);

module.exports = attendanceRouter;
