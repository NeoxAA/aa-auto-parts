const express = require('express');
const router = express.Router();
const parts_controller = require("../controllers/partsController");
const category_controller = require("../controllers/categoryController");
const home_controller = require("../controllers/homeController");


router.get("/", parts_controller.index);

module.exports = router;