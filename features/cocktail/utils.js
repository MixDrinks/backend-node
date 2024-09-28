const { buildImages, buildOgImage, buildGoodsImageInFeed, buildGlasswaresImageInFeed, buildToolsImageInFeed, buildCocktailDetailsImage, buildRecommendationCocktailImage } = require("../../utils/image");
const Database = require('../../database/newclient');
const { getCocktailBySlug } = require("../../database/cocktail");

async function getRecommendations(cocktail) {
  const maxRecommendations = 12;
  const classCocktailSlugs = [
    cocktail.matchesV2.class1 || [],
    cocktail.matchesV2.class2 || [],
    cocktail.matchesV2.class3 || [],
    cocktail.matchesV2.class4 || [],
    cocktail.matchesV2.class5 || [],
    cocktail.matchesV2.class6 || []
  ];

  const recommendationCocktails = [];

  for (const slugs of classCocktailSlugs) {
    if (recommendationCocktails.length >= maxRecommendations) break;
    const slugsWithoutExist = slugs.filter(slug => !recommendationCocktails.some(cocktail => cocktail.slug === slug));

    const countToFull = maxRecommendations - recommendationCocktails.length;

    const classCocktails = await Database.collection('cocktails')
      .find({ slug: { $in: slugsWithoutExist } })
      .sort({ visitCount: -1 })
      .limit(countToFull)
      .project({ _id: 0, id: 1, slug: 1, name: 1, ratingCount: 1, ratingValue: 1, visitCount: 1 })
      .toArray();

    recommendationCocktails.push(...classCocktails);
  }

  recommendationCocktails.forEach(cocktail => {
    cocktail.images = buildRecommendationCocktailImage(cocktail.slug);
    cocktail.rating = cocktail.ratingCount ? cocktail.ratingValue / cocktail.ratingCount : null;
    delete cocktail.ratingCount;
    delete cocktail.ratingValue;
  });

  return recommendationCocktails;
}

async function getFullCocktailBySlug(slug) {
  try {
    const cocktail = await getCocktailBySlug(slug);

    if (!cocktail) {
      return null;
    }

    const cocktailImages = buildCocktailDetailsImage(cocktail.slug);
    const goods = cocktail.goods.map(good => ({
      id: good.id,
      slug: good.slug,
      url: `goods/${good.slug}`,
      name: good.name,
      amount: good.amount,
      unit: good.unit,
      images: buildGoodsImageInFeed(good.slug)
    }));

    const glassware = cocktail.glassware.map(glass => ({
      id: glass.id,
      slug: glass.slug,
      url: `glassware/${glass.slug}`,
      name: glass.name,
      images: buildGlasswaresImageInFeed(glass.slug)
    }));

    const tools = cocktail.tools.map(tool => ({
      id: tool.id,
      slug: tool.slug,
      url: `tools/${tool.slug}`,
      name: tool.name,
      images: buildToolsImageInFeed(tool.slug)
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

    const alcoholVolume = cocktail.alcoholVolumes[0];
    const alcoholVolumeTag = {
      name: alcoholVolume.name,
      url: `alcohol-volume=${alcoholVolume.slug}`,
      slug: alcoholVolume.slug
    }

    const alcohols = cocktail.alcohols?.map(alcohol => ({
      name: alcohol.name,
      url: `alcohol=${alcohol.slug}`,
      slug: alcohol.slug
    })) || [];

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
      tags: taste.concat(tags).concat(alcohols).concat([alcoholVolumeTag]),
      article: article,
      recomendationCocktails: await getRecommendations(cocktail),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  getFullCocktailBySlug,
};
