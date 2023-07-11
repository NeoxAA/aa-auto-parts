const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartsSchema = new Schema({
    name: {type: String, required: true},
    image: {type: String, required: true},
    category: {type: Schema.Types.ObjectId, ref: "Catalog", required: true},
    company: {type: String, required: true},
    price: {type: Number, required: true},
    sku: {type: String, required: true}
});

PartsSchema.virtual("url").get(function () {
    return `/part/${this._id}`;
  });

module.exports = mongoose.model("Part", PartsSchema)