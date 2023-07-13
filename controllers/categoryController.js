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
});

exports.category_detail = asyncHandler(async (req, res, next) => {
    const category = await Category.findOne({ slug: req.params.slug }).exec();

    if (category === null) {
        const err = new Error("Category not found.");
        err.status = 404;
        return next(err);
    }

    const partsInCategory = await Part.find({ category: category._id}, "name image company price sku").exec();

    res.render('category_detail', {
        title: category.name,
        description: category.description,
        category_parts: partsInCategory,
    });
});


exports.category_create_get = asyncHandler(async (req, res, next) => {
    res.render("category_form", {title: "Create Category", errors:[]})
});

exports.category_create_post = [
    body("name", "Category name is needed and must be a minimum of 3 characters.")
        .trim()
        .isLength({min:3})
        .escape(),
    body("description", "Category description is needed and must be a minimum of 100 characters and max 500 characters.")
        .trim()
        .isLength({min:100, max:500})
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
        })
        if (!errors.isEmpty()) {
            res.render('category_form', {
                title: "Create Category",
                category: category,
                errors: errors.array()
            });
            return;
        } else {
            const categoryExists = await Category.findOne({name: req.body.name}).collation({ locale: 'en', strength: 2}).exec();

            if(categoryExists) {
                res.redirect(categoryExists.url);
            } else {
                await category.save();
                res.redirect(category.url)
            }
        }
    }),
]