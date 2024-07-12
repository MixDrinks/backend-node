require('dotenv').config();
const {buildImages} = require("../../utils/image");
const Cocktail = require("../../database/cocktail");
const express = require('express')
const router = express.Router();

router.get('/api/cocktail/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const cocktail = await Cocktail.getCocktailBySlug(slug);

    if (!cocktail) {
      return res.status(404).json({message: "Cocktail not found"});
    }

    // Add images to the cocktail and goods
    const cocktailImages = buildImages(cocktail.id, 'COCKTAIL');
    const goods = cocktail.goods.map(good => ({
      id: good.id,
      slug: good.slug,
      url: `goods/${good.slug}`,
      name: good.name,
      amount: good.amount,
      unit: good.unit,
      images: buildImages(good.id, 'ITEM')
    }));

    const glassware = cocktail.glassware.map(glass => ({
      id: glass.id,
      slug: glass.slug,
      url: `glassware/${glass.slug}`,
      name: glass.name,
      images: buildImages(glass.id, 'ITEM')
    }));

    const tools = cocktail.tools.map(tool => ({
      id: tool.id,
      slug: tool.slug,
      url: `tools/${tool.slug}`,
      name: tool.name,
      images: buildImages(tool.id, 'ITEM')
    }));

    const taste = cocktail.tastes.map(taste => ({
      id: taste.id,
      name: taste.name,
      url: `taste=${taste.slug}`,
      slug: taste.slug
    }))

    const tags = cocktail.tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      url: `tags=${tag.slug}`,
      slug: tag.slug
    }))

    let ratting = cocktail.ratingCount ? cocktail.ratingValue / cocktail.ratingCount : 0;
    if (ratting === 0) {
      ratting = null;
    }

    // Transform the data to match the existing response structure
    const response = {
      id: cocktail.id,
      slug: cocktail.slug,
      name: cocktail.name,
      visitCount: cocktail.visitCount,
      rating: ratting,
      ratingCount: cocktail.ratingCount,
      receipt: cocktail.recipe,
      images: cocktailImages,
      goods: goods,
      tools: glassware.concat(tools),
      tags: taste.concat(tags),
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching cocktail:", error);
    res.status(500).json({message: "Internal server error"});
  }
});

module.exports = router;