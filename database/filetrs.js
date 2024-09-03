const Database = require('./newclient');
const { buildImages } = require("../utils/image");

const filterCache = {
  alcoholVolumes: {},
  tastes: {},
  glassware: {},
  goods: {},
  tools: {},
  tags: {},
};

const filterSlugToIdMap = {}

const keyMapping = {
  'alcohol-volume': 'alcoholVolumes',
  taste: 'tastes',
  glassware: 'glassware',
  goods: 'goods',
  tools: 'tools',
  tags: 'tags',
};

async function initializeFilterCache() {
  const alcoholVolumes = await Database.collection('alcoholVolumes').find().toArray();
  const tastes = await Database.collection('tastes').find().toArray();
  const glassware = await Database.collection('glassware').find().toArray();
  const goods = await Database.collection('goods').find().toArray();
  const tools = await Database.collection('tools').find().toArray();
  const tags = await Database.collection('tags').find().toArray();

  alcoholVolumes.forEach(av => filterCache.alcoholVolumes[av.slug] = new Set(av.cocktailSlugs));
  tastes.forEach(taste => filterCache.tastes[taste.slug] = new Set(taste.cocktailSlugs));
  glassware.forEach(gw => filterCache.glassware[gw.slug] = new Set(gw.cocktailSlugs));
  goods.forEach(good => filterCache.goods[good.slug] = new Set(good.cocktailSlugs));
  tools.forEach(tool => filterCache.tools[tool.slug] = new Set(tool.cocktailSlugs));
  tags.forEach(tag => filterCache.tags[tag.slug] = new Set(tag.cocktailSlugs));

  alcoholVolumes.forEach(av => filterSlugToIdMap[av.slug] = av.id);
  tastes.forEach(taste => filterSlugToIdMap[taste.slug] = taste.id);
  glassware.forEach(gw => filterSlugToIdMap[gw.slug] = gw.id);
  goods.forEach(good => filterSlugToIdMap[good.slug] = good.id);
  tools.forEach(tool => filterSlugToIdMap[tool.slug] = tool.id);
  tags.forEach(tag => filterSlugToIdMap[tag.slug] = tag.id);

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
  const sortField = sortType === 'most-popular' ? { visitCount: -1 } : { ratingValue: -1 };

  let cocktails;
  if (filters === undefined || Object.keys(filters).every(key => filters[key].length === 0)) {
    // return all cocktails with paggnation and sorting

    cocktails = await Database.collection('cocktails')
      .find()
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .project({ _id: 0, id: 1, slug: 1, name: 1, ratingCount: 1, ratingValue: 1, visitCount: 1 })
      .toArray();

  } else {
    const cocktailIds = getCocktailIds(filters);

    cocktails = await Database.collection('cocktails')
      .find({ slug: { $in: Array.from(cocktailIds) } })
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .project({ _id: 0, id: 1, slug: 1, name: 1, ratingCount: 1, ratingValue: 1, visitCount: 1 })
      .toArray();
  }

  cocktails.forEach(cocktail => {
    cocktail.images = buildImages(cocktail.id, 'COCKTAIL');

    cocktail.rating = cocktail.ratingCount ? cocktail.ratingValue / cocktail.ratingCount : 0;
    if (cocktail.rating === 0) {
      cocktail.rating = null;
    }
    delete cocktail.ratingCount;
    delete cocktail.ratingValue;
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
      // return empty query and total cocktail count
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
  const [totalCount, cocktails, alcoholVolumeFuture, tasteFuture, glasswareFuture, toolsFuture, goodsFuture, tagsFuture] = await Promise.all([
    getCocktailCountByFilter(filters),
    getCocktailSubsetByFilter(filters, skip, limit, sortType),
    buildFutureCounter(filters, 'alcohol-volume'),
    buildFutureCounter(filters, 'taste'),
    buildFutureCounter(filters, 'glassware'),
    buildFutureCounter(filters, 'tools'),
    buildFutureCounter(filters, 'goods'),
    buildFutureCounter(filters, 'tags')
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
    },
    isAddToIndex: isAddToIndex,
  }
}

// Initialize the filter cache when the application starts
initializeFilterCache();

module.exports = {
  getFullCocktailByFilter: getCocktailFilterState
}
