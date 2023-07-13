const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require('slugify');

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
    },
    description: {
        type: String,
        required: true,
        minLength: 100,
        maxLength: 500,
    },
    parts: [{ type: Schema.Types.ObjectId, ref: 'Part' }],
    slug: {
        type: String,
        unique: true,
        lower: true
    },
});

CategorySchema.pre('save', function(next) {
    if(!this.isModified('name')){
        next();
        return;
    }
    this.slug = slugify(this.name, {lower:true, strict: true});
    next();
})

CategorySchema.virtual('url').get(function(){
    return `/category/${this.slug}`;
})

module.exports = mongoose.model("Category", CategorySchema);