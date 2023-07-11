const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    tile: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
    },
    description: {
        type: String,
        required: true,
        minLength: 100,
        maxLength: 200,
    }
});

CategorySchema.virtual('url').get(function(){
    return `/category/${this.id}`;
})

module.exports = mongoose.model("Category", CategorySchema);