const express = require('express');
const router = express.Router();
const parts_controller = require("../controllers/partsController");
const category_controller = require("../controllers/categoryController");
const home_controller = require("../controllers/homeController");


router.get("/", parts_controller.index);

router.get("/part/create", parts_controller.part_create_get);
router.post("/part/create", parts_controller.part_create_post);
router.get("/part/:slug", parts_controller.part_detail);

router.get("/category/create", category_controller.category_create_get);
router.post("/category/create", category_controller.category_create_post);
router.get("/category/:slug", category_controller.category_detail);
router.get("/category/:slug/delete", category_controller.category_delete_get);
router.post("/category/:slug/delete", category_controller.category_delete_post);
router.get("/category/:slug/update", category_controller.category_update_get);
router.post("/category/:slug/update", category_controller.category_update_post);


module.exports = router;