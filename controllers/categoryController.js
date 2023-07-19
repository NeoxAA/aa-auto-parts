const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Category = require("../models/category");
const Part = require("../models/part");
const slugify = require('slugify');

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

exports.category_detail = asyncHandler(async (req, res, next) => {
    const category = await Category.findOne({ slug: req.params.slug }).exec();

    if (category === null) {
        const err = new Error("Category not found.");
        err.status = 404;
        return next(err);
    }

    const partsInCategory = await Part.find({ category: category._id}, "name image company price sku").exec();

    res.render('category_detail', {
        category: category,
        category_parts: partsInCategory,
    });
});


exports.category_delete_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findOne({slug: req.params.slug }).exec();
    const allParts = await Part.find({ category: category._id}, "name description slug").exec();

    if (category === null) {
        res.redirect("/category")
    }

    res.render("delete_category", {
        title: "Delete Category",
        category: category,
        parts: allParts
    })
});


exports.category_delete_post = asyncHandler(async (req, res, next) => {
    const category = await Category.findOne({slug: req.params.slug }).exec();
    const allParts = await Part.find({ category: category._id}, "name description slug").exec();

    if (allParts.length > 0){
        res.render("delete_category", {
            title: "Delete Category",
            category: category,
            parts: allParts
        });
        return;
    } else {
        await Category.findByIdAndDelete(req.body.categoryid);
        res.redirect("/");
    }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {

    const category = await Category.findOne({slug: req.params.slug}).exec();

    if (category === null) {
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: [],
    })
})

exports.category_update_post = [
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
            _id: req.body.categoryid,
            slug: slugify(req.body.name, {lower:true, strict: true})
        });

        if (!errors.isEmpty()){
            res.render("category_form", {
                title: "Update Category",
                category: category,
                errors: errors.array(),
            });
            return;
        } else{
            const theCategory = await Category.findOneAndUpdate({_id: req.body.categoryid}, category, {new: true});
            res.redirect(theCategory.url);
        }
    }),
];