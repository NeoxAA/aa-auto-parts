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


exports.part_detail = asyncHandler(async (req, res, next) => {

    const part = await Part.findOne({slug: req.params.slug}).populate("category").exec();

    if (part === null) {
        const err = new Error("Part not found");
        err.status = 404;
        return next(err);
    }

    res.render("part_detail", {
        name: part.name,
        image: part.image,
        category: part.category,
        company: part.company,
        price: part.price,
        sku: part.sku
    });
})


exports.part_create_get = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().exec();
    
    res.render("part_form", {
        title: "Add Part",
        categories: allCategories,
        errors: [],
    })
});

exports.part_create_post = [
    (req, res, next) => {
        if (!(req.body.category instanceof Array)) {
            if (typeof req.body.category === "undefined") req.body.category = [];
            else req.body.category = new Array(req.body.category)
        }
        next();
    },

    body("name", "Name must not be empty.")
        .trim()
        .isLength({min:1})
        .escape(),
    body("image", "Image must not be empty.")
        .trim()
        .isLength({min:3})
        .escape(),
    body("category", "Category must not be empty.")
        .trim()
        .isLength({min:3})
        .escape(),
    body("company", "Company needs to be specified.")
        .trim()
        .isLength({min:3})
        .escape(),
    body("price", "Price needs to be added.")
        .trim()
        .isLength({min:1})
        .escape(),
    body("sku", "SKU needs to be added.")
        .trim()
        .isLength({min:1})
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const part = new Part({
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            company: req.body.company,
            price: req.body.price,
            sku: req.body.sku,
        });

        if(!errors.isEmpty()) {
            const allCategories = await Category.find().exec()
        

            for (const category of allCategories) {
                if (Array.isArray(part.category) && part.category.indexOf(category._id) > -1){
                    category.checked = "true";
                }
            }

            res.render("part_form", {
                title: "Add Part",
                categories: allCategories,
                part: part,
                errors: errors.array(),
            });
        } else {
            const partExists = await Part.findOne({name: req.body.name}).collation({ locale: 'en', strength: 2}).exec();

            if(partExists) {
                res.redirect(partExists.url);
            }
            await part.save();
            res.redirect(part.url);
        }
    }),
];