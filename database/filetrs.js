const Database = require('./newclient');
const { buildImages } = require("../utils/image");

function buildFilterQuery(filters) {
  const filterQuery = {};

  if (filters['alcohol-volume']) {
    filterQuery['alcoholVolumes.slug'] = { $all: filters['alcohol-volume'] };
  }
  if (filters['taste']) {
    filterQuery['tastes.slug'] = { $all: filters['taste'] };
  }
  if (filters['glassware']) {
    filterQuery['glassware.slug'] = { $all: filters['glassware'] };
  }
  if (filters['goods']) {
    filterQuery['goods.slug'] = { $all: filters['goods'] };
  }
  if (filters['tools']) {
    filterQuery['tools.slug'] = { $all: filters['tools'] };
  }
  if (filters['tags']) {
    filterQuery['tags.slug'] = { $all: filters['tags'] };
  }

  return filterQuery;
}

async function getCocktailCountByFilter(filters) {
  const filterQuery = buildFilterQuery(filters);

  const totalCount = await Database.collection('cocktails').countDocuments(filterQuery);
  return totalCount;
}

async function getCocktailSubsetByFilter(filters, skip, limit, sortType = 'most-popular') {
  const filterQuery = buildFilterQuery(filters);

  const sortField = sortType === 'most-popular' ? { visitCount: -1 } : { ratingValue: -1 };

  const cocktails = await Database.collection('cocktails')
    .find(filterQuery)
    .sort(sortField)
    .skip(skip)
    .limit(limit)
    .project({ _id: 0, id: 1, slug: 1, name: 1, ratingCount: 1, ratingValue: 1, visitCount: 1 })
    .toArray();

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
  //alcohol-volume=slaboalkoholni/taste=yahidni,solodki/glassware=kelykh-dlia-irlandskoi-kavy/goods=med,tsukrovyi-pisok/tools=dzhyher
  let path = '';
  Object.keys(filters).sort().forEach((filterKey) => {
    filterValue = filters[filterKey].sort();
    if (filterValue.length != 0) {
      path += filterKey + '=' + filterValue.join(',') + '/';
    }
  });

  //remove last /
  path = path.slice(0, -1);

  return path;
}


const cacheCollectionName = 'filterCache';

async function generateCacheKey(inputFilters, filterKey) {
  return `${filterKey}-${JSON.stringify(inputFilters)}`;
}

async function getCacheFromDb(cacheKey) {
  const cachedResult = await Database.collection(cacheCollectionName).findOne({ key: cacheKey });
  return cachedResult ? cachedResult.value : null;
}

async function saveCacheToDb(cacheKey, value) {
  await Database.collection(cacheCollectionName).updateOne(
    { key: cacheKey },
    { $set: { key: cacheKey, value: value, timestamp: new Date() } },
    { upsert: true }
  );
}

async function buildFutureCounter(inputFilters, filterKey, collectionName) {
  const cacheKey = await generateCacheKey(inputFilters, filterKey);

  // Check if the result is already in the cache collection
  const cachedResult = await getCacheFromDb(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const allFilterValues = await Database.collection(collectionName).find().toArray();

  const future = await Promise.all(allFilterValues.map(async (filterValue) => {
    const filters = structuredClone(inputFilters);
    const theFilterValue = filters[filterKey] || [];

    const isInclude = theFilterValue.includes(filterValue.slug)

    if (filterKey === 'alcohol-volume' || filterKey === 'glassware') {
      theFilterValue.splice(theFilterValue.indexOf(filterValue.slug), 1);
    }

    if (isInclude) {
      theFilterValue.splice(theFilterValue.indexOf(filterValue.slug), 1);
    } else {
      theFilterValue.push(filterValue.slug);
    }

    const futureFilter = { ...filters, [filterKey]: theFilterValue };

    const futureSelectedFilterCount = Object.keys(futureFilter).reduce((acc, key) => acc + futureFilter[key].length, 0);
    const isAddToIndex = futureSelectedFilterCount < 3;

    const count = await getCocktailCountByFilter(futureFilter);

    return {
      id: filterValue.id,
      query: filterToPath(futureFilter),
      count: count,
      isActive: isInclude,
      isAddToIndex: isAddToIndex,
    };
  }));

  const sortedFutures = future.sort((a, b) => b.count - a.count);

  await saveCacheToDb(cacheKey, sortedFutures);

  return sortedFutures;
}

async function getCocktailFilterState(filters, skip, limit, sortType) {
  const [totalCount, cocktails, alcoholVolumeFuture, tasteFuture, glasswareFuture, toolsFuture, goodsFuture, tagsFuture] = await Promise.all([
    getCocktailCountByFilter(filters),
    getCocktailSubsetByFilter(filters, skip, limit, sortType),
    buildFutureCounter(filters, 'alcohol-volume', 'alcoholVolumes'),
    buildFutureCounter(filters, 'taste', 'tastes'),
    buildFutureCounter(filters, 'glassware', 'glassware'),
    buildFutureCounter(filters, 'tools', 'tools'),
    buildFutureCounter(filters, 'goods', 'goods'),
    buildFutureCounter(filters, 'tags', 'tags')
  ]);

  const selectedFilterCount = Object.keys(filters).reduce((acc, key) => acc + filters[key].length, 0);
  const isAddToIndex = selectedFilterCount < 3;

  return {
    totalCount,
    cocktails,
    futureCounts: {
      0: alcoholVolumeFuture,
      1: tasteFuture,
      2: glasswareFuture,
      3: toolsFuture,
      4: goodsFuture,
      5: tagsFuture,
    },
    isAddToIndex: isAddToIndex,
  }
}

module.exports = {
  getFullCocktailByFilter: getCocktailFilterState
}
