const { Router } = require("express");

const checkAuthUser = require("../middleware/auth.middleware");
const { getAllEmployees, addEmployee, deleteEmployee, getDashboardStats } = require("../controller/employees.controllers");

const employesRouter   = Router();



employesRouter.route("/add").post(checkAuthUser, addEmployee);

employesRouter.route("/dashboard").get(checkAuthUser, getDashboardStats);

employesRouter.route("/all").get(checkAuthUser, getAllEmployees);


employesRouter.route("/delete/:ID").delete(checkAuthUser, deleteEmployee);

module.exports = employesRouter;


