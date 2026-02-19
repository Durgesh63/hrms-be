const { Attendance } = require("../models/Attendance.models");
const { Employes } = require("../models/employees.models");
const ApiError = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc Mark Attendance for Employee
// @access Private
const markAttendance = asyncHandler(async (req, res) => {
  const { employeeId, status, date } = req.body;

  if (!employeeId || !status || !date) {
    throw new ApiError(400, "Employee ID, status and date are required");
  }

  const validStatuses = ["Present", "Absent"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  // Verify employee exists
  const employee = await Employes.findOne({ userId: employeeId });
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  // Parse and validate the provided date
  const providedDate = new Date(date);
  providedDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if provided date is in the future
  if (providedDate > today) {
    throw new ApiError(
      400,
      "Cannot mark attendance for future dates. Only current and past dates are allowed."
    );
  }

  // Check if attendance already marked for the provided date
  const isAlreadyMarked = await Attendance.isAlreadyMarked(employeeId, providedDate);
  if (isAlreadyMarked) {
    throw new ApiError(
      409,
      "Attendance already marked for this date. Only one attendance per day is allowed."
    );
  }

  // Create attendance record
  const attendance = new Attendance({
    employeeId: employeeId,
    date: providedDate,
    status: status,
    markTime: new Date(),
  });

  const savedAttendance = await attendance.save();

  res.status(201).json(
    new ApiResponse(
      201,
      savedAttendance,
      "Attendance marked successfully"
    )
  );
});

// @desc Get All Attendance Records
// @access Private
const getAllAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, date, startDate, endDate } = req.query;

  // Build query filters
  const query = {};
  
  if (status) {
    query.status = status;
  }
  
  // Filter by exact date if provided
  if (date) {
    const filterDate = new Date(date);
    if (isNaN(filterDate.getTime())) {
      throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
    }
    filterDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.date = { $gte: filterDate, $lt: nextDay };
  } 
  // Filter by date range if provided
  else if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const attendanceRecords = await Attendance.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalRecords = await Attendance.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRecords,
        page: parseInt(page),
        totalPages: Math.ceil(totalRecords / parseInt(limit)),
        records: attendanceRecords,
      },
      "All attendance records retrieved successfully"
    )
  );
});

// @desc Get Attendance by Employee ID
// @access Private
const getAttendanceByEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { startDate, endDate, page = 1, limit = 10 } = req.query;

  if (!employeeId) {
    throw new ApiError(400, "Employee ID is required");
  }

  // Verify employee exists
  const employee = await Employes.findOne({ userId: employeeId });
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  // Build query
  const query = { employeeId: employeeId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const attendanceRecords = await Attendance.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalRecords = await Attendance.countDocuments(query);

  // Calculate statistics
  const stats = await Attendance.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        employee: employee,
        totalRecords,
        page: parseInt(page),
        totalPages: Math.ceil(totalRecords / parseInt(limit)),
        statistics: stats,
        records: attendanceRecords,
      },
      "Employee attendance records retrieved successfully"
    )
  );
});

// @desc Get Attendance for Today by Employee
// @access Private
const getTodayAttendance = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  if (!employeeId) {
    throw new ApiError(400, "Employee ID is required");
  }

  // Verify employee exists
  const employee = await Employes.findOne({ userId: employeeId });
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.getByEmployeeAndDate(employeeId, today);

  if (!attendance) {
    return res.status(404).json(
      new ApiResponse(404, null, "No attendance record found for today")
    );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      attendance,
      "Today's attendance record retrieved successfully"
    )
  );
});

// @desc Get Attendance Records by Specific Date
// @access Private
const getAttendanceByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const { page = 1, limit = 10, status } = req.query;

  if (!date) {
    throw new ApiError(400, "Date parameter is required");
  }

  // Validate and parse date
  const filterDate = new Date(date);
  if (isNaN(filterDate.getTime())) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
  }
  filterDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(filterDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Build query
  const query = {
    date: { $gte: filterDate, $lt: nextDay },
  };

  if (status) {
    const validStatuses = ["Present", "Absent"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const attendanceRecords = await Attendance.find(query)
    .sort({ employeeId: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalRecords = await Attendance.countDocuments(query);

  // Calculate statistics
  const stats = await Attendance.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        date: filterDate.toISOString().split("T")[0],
        totalRecords,
        page: parseInt(page),
        totalPages: Math.ceil(totalRecords / parseInt(limit)),
        statistics: stats,
        records: attendanceRecords,
      },
      "Attendance records for the specified date retrieved successfully"
    )
  );
});

module.exports = {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  getTodayAttendance,
  getAttendanceByDate,
};
