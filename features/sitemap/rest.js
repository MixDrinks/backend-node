const express = require('express')

const Database = require('../../database/newclient');
const router = express.Router();

async function getAllCocktailsSlug() {
  return Database.collection('cocktails')
    .find({}, { slug: 1 })
    .toArray();
}

async function getAllToolsSlug() {
  return Database.collection('tools')
    .find({}, { slug: 1 })
    .toArray();
}

async function getAllGoodsSlug() {
  return Database.collection('goods')
    .find({}, { slug: 1 })
    .toArray();
}

async function getAllGlasswareSlug() {
  return Database.collection('glassware')
    .find({}, { slug: 1 })
    .toArray();
}

async function getAllTagsSlug() {
  return Database.collection('tags')
    .find({}, { slug: 1 })
    .toArray();
}

async function getAllTastesSlug() {
  return Database.collection('tastes')
    .find({}, { slug: 1 })
    .toArray();
}

async function getAllAlcoholVolumeSlug() {
  return Database.collection('alcoholVolumes')
    .find({}, { slug: 1 })
    .toArray();
}

async function getAllAlcoholSlugs() {
  return Database.collection('alcohol')
    .find({}, { slug: 1 })
    .toArray();
}


router.get('/api/sitemap', async (req, res) => {
  const cocktails = (await getAllCocktailsSlug()).map((cocktail) => `cocktails/${cocktail.slug}`);
  const goods = (await getAllGoodsSlug()).map((good) => `goods/${good.slug}`);
  const tools = (await getAllToolsSlug()).map((tool) => `tools/${tool.slug}`);
  const glassware = (await getAllGlasswareSlug()).map((glass) => `glassware/${glass.slug}`);
  const tagsFilter = (await getAllTagsSlug()).map((tag) => `tags=${tag.slug}`);
  const goodsFilter = (await getAllGoodsSlug()).map((good) => `goods=${good.slug}`);
  const toolsFilter = (await getAllToolsSlug()).map((tool) => `tools=${tool.slug}`);
  const tastsFilter = (await getAllTastesSlug()).map((tag) => `taste=${tag.slug}`);
  const alcoholVolumeFilter = (await getAllAlcoholVolumeSlug()).map((tag) => `alcohol-volume=${tag.slug}`);
  const glasswareFilter = (await getAllGlasswareSlug()).map((glass) => `glassware=${glass.slug}`);
  const alcoholFilter = (await getAllAlcoholSlugs()).map((alcohol) => `alcohol=${alcohol.slug}`);


  const urls = cocktails
    .concat(goods)
    .concat(tools)
    .concat(glassware)
    .concat(tagsFilter)
    .concat(goodsFilter)
    .concat(toolsFilter)
    .concat(tastsFilter)
    .concat(alcoholVolumeFilter)
    .concat(glasswareFilter)
    .concat(alcoholFilter);

  return res.status(200).send(urls);
});

module.exports = router;
