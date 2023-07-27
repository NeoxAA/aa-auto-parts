const asyncHandler = require("express-async-handler");
const Part = require("../models/part");
const Category = require("../models/category");

exports.index = asyncHandler(async (req, res, next) => {
  const [
      allParts,
      allCategories
  ] = await Promise.all([
      Part.find({}).sort({title:1}).populate("category").exec(),
      Category.find().sort({name: 1}).populate("parts").exec(),
  ]);

  res.render("index", {
      title: "Your Parts Super Store",
      all_parts: allParts,
      all_categories: allCategories,
  });
});
