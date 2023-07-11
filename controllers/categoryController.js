const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Category = require("../models/category");
const Part = require("../models/part");

exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().sort({ name:1}).exec();
    res.render("category_list", {
        title: "Parts Categories",
        category_list: allCategories,
    })
})