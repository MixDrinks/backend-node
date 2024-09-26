const Database = require('./newclient');
const { buildImages, buildCocktailInListImage } = require("../utils/image");

const filterCache = {
  alcoholVolumes: {},
  tastes: {},
  glassware: {},
  goods: {},
  tools: {},
  tags: {},
  alcohol: {},
};

const filterSlugToIdMap = {}

const keyMapping = {
  'alcohol-volume': 'alcoholVolumes',
  taste: 'tastes',
  glassware: 'glassware',
  goods: 'goods',
  tools: 'tools',
  tags: 'tags',
  alcohol: 'alcohol',
};

async function initializeFilterCache() {
  const alcoholVolumes = await Database.collection('alcoholVolumes').find().toArray();
  const tastes = await Database.collection('tastes').find().toArray();
  const glassware = await Database.collection('glassware').find().toArray();
  const goods = await Database.collection('goods').find().toArray();
  const tools = await Database.collection('tools').find().toArray();
  const tags = await Database.collection('tags').find().toArray();
  const alcohol = await Database.collection('alcohol').find().toArray();

  alcoholVolumes.forEach(av => filterCache.alcoholVolumes[av.slug] = new Set(av.cocktailSlugs));
  tastes.forEach(taste => filterCache.tastes[taste.slug] = new Set(taste.cocktailSlugs));
  glassware.forEach(gw => filterCache.glassware[gw.slug] = new Set(gw.cocktailSlugs));
  goods.forEach(good => filterCache.goods[good.slug] = new Set(good.cocktailSlugs));
  tools.forEach(tool => filterCache.tools[tool.slug] = new Set(tool.cocktailSlugs));
  tags.forEach(tag => filterCache.tags[tag.slug] = new Set(tag.cocktailSlugs));
  alcohol.forEach(al => filterCache.alcohol[al.slug] = new Set(al.cocktailSlugs));

  alcoholVolumes.forEach(av => filterSlugToIdMap[av.slug] = av.id);
  tastes.forEach(taste => filterSlugToIdMap[taste.slug] = taste.id);
  glassware.forEach(gw => filterSlugToIdMap[gw.slug] = gw.id);
  goods.forEach(good => filterSlugToIdMap[good.slug] = good.id);
  tools.forEach(tool => filterSlugToIdMap[tool.slug] = tool.id);
  tags.forEach(tag => filterSlugToIdMap[tag.slug] = tag.id);
  alcohol.forEach(al => filterSlugToIdMap[al.slug] = al.id);

  console.log("Filter cache initialized");
}

function getCocktailIds(searchParams) {
  if (Object.keys(searchParams).length === 0) throw new Error("Filters must not be empty");

  return Object.entries(searchParams)
    .map(([filterGroup, filterIds]) => {
      if (filterIds.length === 0) throw new Error(`Filter group ${filterGroup} must not be empty`);

      const mappedKey = keyMapping[filterGroup];
      const selectedFilters = filterIds.map(id => filterCache[mappedKey][id] || new Set());

      if (selectedFilters.length === 0) {
        throw new Error(`Filter group ${mappedKey} is empty or does not contain filter ids ${filterIds}`);
      }

      return selectedFilters.reduce((acc, cocktailSlugs) => {
        return new Set([...acc].filter(slug => cocktailSlugs.has(slug)));
      });
    })
    .reduce((acc, cocktailSlugs) => {
      return new Set([...acc].filter(slug => cocktailSlugs.has(slug)));
    });
}

async function getCocktailCountByFilter(filters) {
  if (Object.keys(filters).every(key => filters[key].length === 0)) {
    return await Database.collection('cocktails').countDocuments();
  }

  const cocktailIds = getCocktailIds(filters);
  return cocktailIds.size;
}

async function getCocktailSubsetByFilter(filters, skip, limit, sortType = 'most-popular') {
  let cocktails;

  const matchStage = {
    $match: {
      ...(filters && Object.keys(filters).length > 0
        ? { slug: { $in: Array.from(getCocktailIds(filters)) } }
        : {}) // Add filter condition if filters are present
    }
  };

  const addFieldsStage = {
    $addFields: {
      ratingScore: {
        $cond: {
          if: { $gt: [{ $ifNull: ["$ratingCount", 0] }, 0] }, // Check if ratingCount > 0, else default to 0
          then: { $divide: [{ $ifNull: ["$ratingValue", 0] }, { $ifNull: ["$ratingCount", 1] }] }, // Safely divide ratingValue by ratingCount, default to 0/1
          else: 0 // If ratingCount is 0 or missing, set ratingScore to 0
        }
      }
    }
  };

  const sortStage = {
    $sort: sortType === 'most-popular'
      ? { visitCount: -1 }
      : { ratingScore: -1, ratingCount: -1, visitCount: -1 }
  };

  const projectStage = {
    $project: {
      _id: 0,
      id: 1,
      slug: 1,
      name: 1,
      visitCount: 1,
      ratingScore: 1,
      ratingCount: 1,
    }
  };

  cocktails = await Database.collection('cocktails').aggregate([
    matchStage,
    addFieldsStage,
    sortStage,
    { $skip: skip },
    { $limit: limit },
    projectStage
  ]).toArray();

  cocktails.forEach(cocktail => {
    cocktail.rating = cocktail.ratingScore;
    cocktail.images = buildImages(cocktail.id, 'COCKTAIL');
    cocktail.imagesV2 = buildCocktailInListImage(cocktail.slug);

    delete cocktail.ratingScore;
  });

  return cocktails;
}

function filterToPath(filters) {
  let path = '';
  Object.keys(filters).sort().forEach((filterKey) => {
    filterValue = filters[filterKey].sort();
    if (filterValue.length != 0) {
      path += filterKey + '=' + filterValue.join(',') + '/';
    }
  });

  path = path.slice(0, -1);
  return path;
}

async function buildFutureCounter(inputFilters, filterKey) {
  const mappedKey = keyMapping[filterKey];
  const allFilterValues = Object.keys(filterCache[mappedKey]);

  const future = await Promise.all(allFilterValues.map(async (filterValue) => {
    const filters = structuredClone(inputFilters);
    const theFilterValue = filters[filterKey] || [];

    const isInclude = theFilterValue.includes(filterValue);

    if (filterKey === 'alcohol-volume' || filterKey === 'glassware') {
      theFilterValue.splice(theFilterValue.indexOf(filterValue), 1);
    }

    if (isInclude) {
      theFilterValue.splice(theFilterValue.indexOf(filterValue), 1);
    } else {
      theFilterValue.push(filterValue);
    }

    const futureFilter = { ...filters, [filterKey]: theFilterValue };
    // Clean up empty filter groups
    Object.keys(futureFilter).forEach(key => {
      if (futureFilter[key].length === 0) {
        delete futureFilter[key];
      }
    });

    if (Object.keys(futureFilter).length === 0) {
      const totalCount = await Database.collection('cocktails').countDocuments();

      return {
        id: filterSlugToIdMap[filterValue],
        query: '',
        count: totalCount,
        isActive: true,
        isAddToIndex: false,
      };
    }

    const futureSelectedFilterCount = Object.keys(futureFilter).reduce((acc, key) => acc + futureFilter[key].length, 0);
    const isAddToIndex = futureSelectedFilterCount < 3;

    const count = getCocktailIds(futureFilter).size;

    return {
      id: filterSlugToIdMap[filterValue],
      query: filterToPath(futureFilter),
      count: count,
      isActive: isInclude,
      isAddToIndex: isAddToIndex,
    };
  }));

  return future.sort((a, b) => b.count - a.count);
}

async function getCocktailFilterState(filters, skip, limit, sortType) {
  const [totalCount, cocktails, alcoholVolumeFuture, tasteFuture, glasswareFuture, toolsFuture, goodsFuture, tagsFuture, alcoholFuture] = await Promise.all([
    getCocktailCountByFilter(filters),
    getCocktailSubsetByFilter(filters, skip, limit, sortType),
    buildFutureCounter(filters, 'alcohol-volume'),
    buildFutureCounter(filters, 'taste'),
    buildFutureCounter(filters, 'glassware'),
    buildFutureCounter(filters, 'tools'),
    buildFutureCounter(filters, 'goods'),
    buildFutureCounter(filters, 'tags'),
    buildFutureCounter(filters, 'alcohol'),
  ]);

  const selectedFilterCount = Object.keys(filters).reduce((acc, key) => acc + filters[key].length, 0);
  const isAddToIndex = selectedFilterCount < 3;

  return {
    totalCount,
    cocktails,
    futureCounts: {
      0: tagsFuture,
      1: goodsFuture,
      2: toolsFuture,
      3: tasteFuture,
      4: alcoholVolumeFuture,
      5: glasswareFuture,
      6: alcoholFuture,
    },
    isAddToIndex: isAddToIndex,
  }
}

// Initialize the filter cache when the application starts
initializeFilterCache();

module.exports = {
  getFullCocktailByFilter: getCocktailFilterState
}
