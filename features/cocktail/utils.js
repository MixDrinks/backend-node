const { buildImages, buildOgImage } = require("../../utils/image");
const { getCocktailBySlug } = require("../../database/cocktail");

async function getFullCocktailBySlug(slug) {
  try {
    const cocktail = await getCocktailBySlug(slug);

    if (!cocktail) {
      return null;
    }

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

    const meta = {
      ogImage: buildOgImage(cocktail.id, 'COCKTAIL'),
    }

    const rawText = cocktail.article?.chapters;

    let article = null;
    if (!rawText || rawText === '') {
      article = null;
    } else {
      article = {
        chapters: rawText
      }
    }

    return {
      id: cocktail.id,
      slug: cocktail.slug,
      name: cocktail.name,
      visitCount: cocktail.visitCount,
      rating: ratting,
      ratingCount: cocktail.ratingCount,
      receipt: cocktail.recipe,
      meta: meta,
      images: cocktailImages,
      goods: goods,
      tools: glassware.concat(tools),
      tags: taste.concat(tags),
      article: article,
    };
  } catch (error) {
    return null;
  }
}

module.exports = {
  getFullCocktailBySlug,
};
