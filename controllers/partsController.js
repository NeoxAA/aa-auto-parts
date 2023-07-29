const Part = require("../models/part");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

exports.part_detail = asyncHandler(async (req, res, next) => {

    const part = await Part.findOne({slug: req.params.slug}).populate("category").exec();

    if (part === null) {
        const err = new Error("Part not found");
        err.status = 404;
        return next(err);
    }

    res.render("part_detail", {
        title: part.name,
        name: part.name,
        image: part.image,
        category: part.category,
        company: part.company,
        price: part.price,
        sku: part.sku,
        slug: part.slug,
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
            image: req.file.filename,
            category: req.body.category,
            company: req.body.company,
            price: req.body.price,
            sku: req.body.sku,
        });

        if(!errors.isEmpty()) {
            const allCategories = await Category.find().exec();
        

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

            const categories = await Category.find({
                _id: { $in: part.category }
            });

            for (let category of categories) {
                category.parts.push(part._id);
                await category.save();
            }

            res.redirect(part.url);
        }
    }),
];

exports.part_delete_get = asyncHandler(async (req, res, next) => {

    const part = await Part.findOne({slug: req.params.slug}).populate("category").exec();

    if (part === null) {
        const err = new Error("Part not found");
        err.status = 404;
        return next(err);
    }

    res.render("delete_part", {
        title: "Delete Part",
        part: part,
        errors: [],
    })
})

exports.part_delete_post = asyncHandler(async (req, res, next) => {

    const part = await Part.findOne({slug: req.params.slug}).populate("category").exec();

    if (part === null) {
        const err = new Error("Part not found");
        err.status = 404;
        return next(err);
    } else{
        for (const category of part.category) {
            await Category.findByIdAndUpdate(category._id, { $pull: { parts: part._id}});
        }

        if (part.image) {
            const partImagePath = path.join("public/images/uploads/", part.image);
            fs.unlink(partImagePath, (err) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                })
        }

        await Part.findByIdAndDelete(req.body.partid);
        res.redirect("/");
    }
})

exports.part_update_get = asyncHandler(async (req, res, next) => {

    const part = await Part.findOne({slug: req.params.slug}).exec();
    const allCategories = await Category.find().exec();
    
    if (part === null) {
        const err = new Error("Part not found");
        err.status = 404;
        return next(err);
    }

    for (const category of allCategories) {
        for (const partCategories of part.category){
            if (partCategories._id.equals(category._id)) {
                category.checked = "true";
            }
        }
    }

    res.render("part_form", {
        title: "Update Part",
        part: part,
        categories: allCategories,
        errors: [],
    })
})


exports.part_update_post = [
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
    body("category")
        .exists()
        .withMessage("Category is required.")
        .escape(),
    body("company", "Company needs to be specified and longer than one letter.")
        .trim()
        .isLength({min:2})
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

        const partUpdate = {
            name: req.body.name,
            image: req.file.filename,
            category:  typeof req.body.category === "undefined" ? [] : req.body.category,
            company: req.body.company,
            price: req.body.price,
            sku: req.body.sku,
            slug: slugify(req.body.company + '-' + req.body.name, {lower:true, strict:true}),
            _id: req.params.partid,
        };
        
        const allCategories = await Category.find().exec();

        if(!errors.isEmpty()) {

            for (const category of allCategories) {
                if (Array.isArray(partUpdate.category) && partUpdate.category.indexOf(category._id) > -1){
                    category.checked = "true";
                }
            }

            res.render("part_form", {
                title: "Update Part",
                categories: allCategories,
                part: partUpdate,
                errors: errors.array(),
            });

        } else {
            const existingPart = await Part.findOne({_id: req.body.partid});
            const existingPartImage = existingPart.image;

            if (existingPartImage) {
                const existingPartImagePath = path.join("public/images/uploads/", existingPartImage);
                fs.unlink(existingPartImagePath, (err) => {
                        if(err){
                            console.error(err);
                            return;
                        }
                    })
            }

            const existingCategories = new Set(existingPart.category.map(category => category._id.toString()));
            const newCategories = new Set(partUpdate.category);

            const addToCategories = [...newCategories].filter(id => !existingCategories.has(id));
            const removeFromCategories = [...existingCategories].filter(id => !newCategories.has(id));

            for (const categoryId of addToCategories) {
                await Category.findByIdAndUpdate(categoryId, { $addToSet: { parts: req.body.partid}}, { new: true });
            }
            for (const categoryId of removeFromCategories) {
                await Category.findByIdAndUpdate(categoryId, { $pull: { parts: req.body.partid}}, { new: true });
            }

            const thePart = await Part.findOneAndUpdate({_id: req.body.partid}, partUpdate, {new: true});

            res.redirect(thePart.url);
        }
    }),
];