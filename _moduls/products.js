var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var Product = new Schema(
  {
    /* _id: String, */
      productName: String,
      preis: Number,
      kategorie: String,
      ursprungland: String,
      sorte: String,
      Image: String
  }
  ,
  { collection: "Products" }
);

const Products = mongoose.model("Products", Product);

module.exports = Products;
