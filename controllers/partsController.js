const Part = require("../models/part");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    const [
        numParts,
        numCategories
    ] = await Promise.all([
        Part.countDocuments({}).exec(),
        Category.countDocuments({}).exec()
    ]);

    res.render("index", {
        title: "AA Auto Parts",
        parts_count: numParts,
        category_count: numCategories,
    });
});

