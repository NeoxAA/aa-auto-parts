const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const PartsSchema = new Schema({
    name: {type: String, required: true},
    image: {type: String, required: true},
    category: [{type: Schema.Types.ObjectId, ref: "Category", required: true}],
    company: {type: String, required: true},
    price: {type: Number, required: true},
    sku: {type: String, required: true},
    slug: {type: String, unique: true, lower: true},
});

PartsSchema.pre('save', function(next) {
  if(!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slugify(this.company + '-' + this.name, {lower:true, strict:true});
  next();
});

PartsSchema.virtual("url").get(function () {
    return `/part/${this.slug}`;
  });

module.exports = mongoose.model("Part", PartsSchema)