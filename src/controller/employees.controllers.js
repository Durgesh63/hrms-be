const { Attendance } = require("../models/Attendance.models");
const { Employes } = require("../models/employees.models");
const ApiError = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const generateId = require("../utils/genreateId");

// @desc Delete Employee by ID
// @access Private
const deleteEmployee = asyncHandler(async (req, res) => {
  const { ID } = req.params;

  if (!ID) {
    throw new ApiError(400, "Employee ID is required");
  }

  const employee = await Employes.findOneAndDelete({ userId: ID });
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  await Attendance.deleteMany({ employeeId: ID });

  res
    .status(200)
    .json(new ApiResponse(200, employee, "Employee deleted successfully"));
});

// @desc Add/Create New Employee
// @access Private
const addEmployee = asyncHandler(async (req, res) => {
  const { department, name, email } = req.body;

  if (!department || !name || !email) {
    throw new ApiError(400, "Employee data is required");
  }

  const existingEmployee = await Employes.findOne({ email });
  if (existingEmployee) {
    throw new ApiError(409, "An employee with this email already exists");
  }

  const empId = await generateId("EMP", 4);

  const employee = new Employes({
    userId: empId,
    department,
    name,
    email,
  });
  const createdEmployee = await employee.save();

  res
    .status(201)
    .json(new ApiResponse(201, createdEmployee, "Employee added successfully"));
});

// @desc Get All Employees
// @access Private
const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await Employes.find();

  res
    .status(200)
    .json(
      new ApiResponse(200, employees, "All employees retrieved successfully"),
    );
});

// @desc Get Dashboard Statistics
// @access Private
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total employees count
  const totalEmployees = await Employes.countDocuments();

  // Get total attendance records count
  const totalAttendance = await Attendance.countDocuments();

  // Get present count
  const presentCount = await Attendance.countDocuments({ status: "Present" });

  // Get absent count
  const absentCount = await Attendance.countDocuments({ status: "Absent" });

  // Get today's statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(today);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const todayStats = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: today, $lt: tomorrowStart },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const todayPresent = todayStats.find((stat) => stat._id === "Present")?.count || 0;
  const todayAbsent = todayStats.find((stat) => stat._id === "Absent")?.count || 0;
  const todayMarked = todayStats.reduce((sum, stat) => sum + stat.count, 0);

  const dashboardData = {
    totalEmployees,
    totalAttendance,
    presentCount,
    absentCount,
    today: {
      marked: todayMarked,
      present: todayPresent,
      absent: todayAbsent,
      pending: totalEmployees - todayMarked,
    },
  };

  res.status(200).json(
    new ApiResponse(200, dashboardData, "Dashboard statistics retrieved successfully")
  );
});

module.exports = {
  deleteEmployee,
  addEmployee,
  getAllEmployees,
  getDashboardStats,
};
