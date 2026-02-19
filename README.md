# HRMS Backend

Human Resource Management System (HRMS) - A comprehensive backend API for managing employees and their attendance records.

## Project Overview

HRMS Backend is a robust Node.js/Express application designed to manage:
- **Employee Management** - Create, retrieve, update, and delete employee records
- **Attendance Tracking** - Mark and monitor employee attendance with date-based filtering
- **Dashboard Statistics** - Real-time statistics on employee count, attendance rates, and daily metrics
- **User Authentication** - Secure authentication and authorization using JWT tokens
- **Date-based Filtering** - Query attendance records by specific dates, date ranges, and employee IDs

The system provides a complete REST API with proper error handling, validation, and pagination support.

## Tech Stack

### Backend Framework & Runtime
- **Node.js** (v20.19.2) - JavaScript runtime environment
- **Express.js** - Web application framework
- **JavaScript (ES6+)** - Programming language

### Database
- **MongoDB** - NoSQL document database
- **Mongoose** - MongoDB object modeling library

### Authentication & Security
- **JWT (JSON Web Tokens)** - Token-based authentication
- **bcrypt** - Password hashing library
- **cookie-parser** - HTTP cookie parsing middleware

### Utilities & Middleware
- **CORS** - Cross-Origin Resource Sharing support
- **dotenv** - Environment variable management
- **Custom Error Handling** - ApiError and ApiResponse classes

### Development Tools
- **Git** - Version control system

## Project Structure

```
hrms-be/
├── src/
│   ├── controller/
│   │   ├── auth.controllers.js           # Authentication logic
│   │   ├── employees.controllers.js      # Employee management & dashboard
│   │   └── attendance.controllers.js     # Attendance management
│   ├── models/
│   │   ├── user.models.js                # User schema
│   │   ├── employees.models.js           # Employee schema
│   │   ├── refreshToken.models.js        # Refresh token schema
│   │   ├── Attendance.models.js          # Attendance schema
│   │   └── IdCounter.js                  # Counter model for ID generation
│   ├── Routes/
│   │   ├── auth.routes.js                # Auth endpoints
│   │   ├── employes.routes.js            # Employee endpoints
│   │   └── attendance.routes.js          # Attendance endpoints
│   ├── middleware/
│   │   ├── auth.middleware.js            # JWT verification
│   │   └── errorHandler.middleware.js    # Global error handler
│   ├── utils/
│   │   ├── ApiError.js                   # Custom error class
│   │   ├── ApiResponse.js                # Response wrapper class
│   │   ├── asyncHandler.js               # Async error wrapper
│   │   ├── utils.js                      # Utility functions
│   │   └── genreateId.js                 # ID generation utility
│   ├── db/
│   │   └── db.connection.js              # MongoDB connection
│   ├── app.js                            # Express app configuration
│   └── constant.js                       # Environment constants
├── public/
│   ├── logs.txt                          # Application logs
│   └── temp/                             # Temporary files
├── index.js                              # Entry point
├── package.json                          # Project dependencies
├── .env                                  # Environment variables
└── README.md                             # This file
```

## Installation & Setup

### Prerequisites
- **Node.js** (v20+)
- **MongoDB** (local or cloud - MongoDB Atlas)
- **npm** (comes with Node.js)
- **Git**

### Steps to Run Locally

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd hrms-be
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/hrms

# Server
PORT=8080
CORS_ORIGINE=*

# Authentication Tokens
ACCESS_TOKEN_SECRET=your_secret_key_here
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_secret_key_here
REFRESH_TOKEN_EXPIRY=7d
```

**Note:** Replace the values with your actual MongoDB connection string and secure secret keys.

#### 4. Start the Server
```bash
# Development mode (if nodemon is installed)
npm run dev

# Production mode
npm start

# Or directly with node
node index.js
```

The server will start at `http://localhost:8080`

#### 5. Testing the API
Use Postman, Insomnia, or curl to test the endpoints:

```bash
# Register a new user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## API Endpoints

### Authentication Routes (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user (requires auth)
- `POST /verify-token` - Verify and generate new access token
- `GET /user` - Get current user info (requires auth)

### Employee Routes (`/api/v1/employee`)
- `POST /add` - Add new employee (requires auth)
- `GET /all` - Get all employees (requires auth)
- `DELETE /delete/:ID` - Delete employee (requires auth)
- `GET /dashboard` - Get dashboard statistics (requires auth)

### Attendance Routes (`/api/v1/attendance`)
- `POST /mark` - Mark attendance (requires auth)
- `GET /` - Get all attendance records with filters (requires auth)
- `GET /filter/by-date` - Filter by date range and employee (requires auth)
- `GET /:employeeId` - Get employee attendance (requires auth)
- `GET /:employeeId/today` - Get today's attendance (requires auth)

## Assumptions & Limitations

### Assumptions
1. **MongoDB Setup** - Assumes MongoDB account and connection string are available
2. **Email Uniqueness** - Assumes each employee has a unique email address
3. **Date Format** - All dates are expected in `YYYY-MM-DD` format in query parameters
4. **Authentication Required** - All endpoints (except register/login) require valid JWT token
5. **Employee ID Generation** - Employee IDs are auto-generated in format `EMP-XXXXXXXX`
6. **Attendance Per Day** - Only one attendance record allowed per employee per day
7. **Past Dates Only** - Attendance can only be marked for current and past dates, not future dates

### Limitations
1. **No Role-Based Access Control** - All authenticated users have same permissions
2. **No Soft Delete** - Deleting an employee permanently removes all data
3. **No Bulk Operations** - Cannot mark attendance for multiple employees at once
4. **No File Upload** - Employee profile pictures/documents not supported
5. **No Email Notifications** - System doesn't send automated emails
6. **No Leave Management** - Only Present/Absent status, no leave types
7. **No Employee Export** - Cannot export attendance data to CSV/Excel
8. **Single Timezone** - System uses server's timezone, no timezone configuration
9. **No History Tracking** - Cannot view attendance edit history
10. **Limited Pagination** - Default limit is 10 records per page

### Database Constraints
- **Unique Constraints** - Email on User and Employee models, (employeeId, date) on Attendance
- **Validation** - Required fields and enum validations enforced at model level
- **Date Validation** - Attendance date cannot be in the future

### Performance Considerations
- Pagination recommended for large datasets (default: 10 records/page)
- Index on `employeeId` and `date` for faster attendance queries
- Aggregate queries used for statistics calculation

## Error Handling

All errors are returned in a consistent JSON format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": ["Detailed error information"]
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `404` - Not Found
- `409` - Conflict (e.g., duplicate entry)
- `500` - Internal Server Error

## Key Features

✅ **User Authentication** - Secure JWT-based authentication with refresh tokens
✅ **Employee Management** - Full CRUD operations for employees
✅ **Attendance Tracking** - Mark and query attendance with validation
✅ **Dashboard Stats** - Real-time statistics on attendance and employees
✅ **Date Filtering** - Advanced filtering by exact date or date range
✅ **Error Handling** - Comprehensive error handling with detailed messages
✅ **Pagination** - Support for paginated responses
✅ **Validation** - Input validation at controller and model levels
✅ **Security** - Password hashing, JWT tokens, middleware authentication

## Environment Configuration

Key environment variables:
- `DB_URI` - MongoDB connection string
- `PORT` - Server port (default: 8080)
- `CORS_ORIGINE` - Allowed CORS origins
- `ACCESS_TOKEN_SECRET` - Secret for access token signing
- `REFRESH_TOKEN_SECRET` - Secret for refresh token signing
- `ACCESS_TOKEN_EXPIRY` - Access token expiration time (e.g., "15m")
- `REFRESH_TOKEN_EXPIRY` - Refresh token expiration time (e.g., "7d")

## Future Enhancements

- Add role-based access control (RBAC)
- Implement leave management system
- Add employee export to CSV/Excel
- Implement email notifications
- Add file upload for employee documents
- Create admin dashboard with advanced analytics
- Add multi-timezone support
- Implement attendance history and audit logs
- Add bulk operations for attendance
- Create mobile app integration

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.

---

**Last Updated:** February 19, 2026
**Node.js Version:** v20.19.2
**MongoDB:** MongoDB Atlas / Local Instance
