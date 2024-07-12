const mongoose = require('./db');

const Schema = mongoose.Schema;

// Schema for nested documents
const AlcoholVolumeSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: Number,
  name: String,
  slug: String
});

const GlasswareSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: Number,
  name: String,
  slug: String
});

const ToolSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: Number,
  name: String,
  slug: String
});

const TasteSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: Number,
  name: String,
  slug: String
});

const GoodSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: Number,
  name: String,
  slug: String,
  amount: Number,
  unit: String
});

// Main schema
const CocktailSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id: Number,
  name: String,
  ratingCount: Number,
  ratingValue: Number,
  recipe: [String],
  slug: String,
  visitCount: Number,
  alcoholVolumes: [AlcoholVolumeSchema],
  glassware: [GlasswareSchema],
  tags: [String],
  tools: [ToolSchema],
  tastes: [TasteSchema],
  goods: [GoodSchema]
});

// Model
const Cocktail = mongoose.model('Cocktail', CocktailSchema);

async function getCocktailBySlug(slug) {
  return Cocktail.findOne({slug}).lean();
}

module.exports = {
  getCocktailBySlug,
  Cocktail,
  CocktailSchema,
  AlcoholVolumeSchema,
  GlasswareSchema,
  ToolSchema,
  TasteSchema,
  GoodSchema,
}
