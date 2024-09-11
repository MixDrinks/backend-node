const Database = require('./newclient');

async function getAlcoholoVolume() {
  const alcoholVolumes = await Database
    .collection('alcoholVolumes')
    .aggregate([
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          slug: 1,
          count: { $size: "$cocktailSlugs" }
        }
      },
      { $sort: { count: -1 } }
    ])
    .toArray();

  return alcoholVolumes
}

async function getTastes() {
  const tastes = await Database
    .collection('tastes')
    .aggregate([
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          slug: 1,
          count: { $size: "$cocktailSlugs" }
        }
      },
      { $sort: { count: -1 } }
    ])
    .toArray();

  return tastes
}

async function getGlasswares() {
  const glasswares = await Database
    .collection('glassware')
    .aggregate([
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          slug: 1,
          count: { $size: "$cocktailSlugs" }
        }
      },
      { $sort: { count: -1 } }
    ])
    .toArray();

  return glasswares
}

async function getGoods() {
  const goods = await Database
    .collection('goods')
    .aggregate([
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          slug: 1,
          count: { $size: "$cocktailSlugs" }
        }
      },
      { $sort: { count: -1 } }
    ])
    .toArray();

  return goods;
}

async function getTagsData() {
  const tags = await Database
    .collection('tags')
    .aggregate([
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          slug: 1,
          count: { $size: "$cocktailSlugs" }
        }
      },
      { $sort: { count: -1 } }
    ])
    .toArray();

  return tags;
}

async function getToolsData() {
  const tools = await Database
    .collection('tools')
    .aggregate([
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          slug: 1,
          count: { $size: "$cocktailSlugs" }
        }
      },
      { $sort: { count: -1 } }
    ])
    .toArray();

  return tools;
}

async function getFiltersData() {
  return [
    {
      id: 4,
      queryName: 'alcohol-volume',
      name: 'Алкоголь',
      items: await getAlcoholoVolume(),
      selectionType: 'SINGLE',
      sortOrder: 1,
    },
    {
      id: 3,
      queryName: 'taste',
      name: 'Смак',
      items: await getTastes(),
      selectionType: 'MULTIPLE',
      sortOrder: 2,
    },
    {
      id: 5,
      queryName: 'glassware',
      name: 'Стакан',
      items: await getGlasswares(),
      selectionType: 'SINGLE',
      sortOrder: 3,
    },
    {
      id: 1,
      queryName: 'goods',
      name: 'Інгрідієнти',
      items: await getGoods(),
      selectionType: 'MULTIPLE',
      sortOrder: 4,
    },
    {
      id: 0,
      queryName: 'tags',
      name: 'Інше',
      items: await getTagsData(),
      selectionType: 'MULTIPLE',
      sortOrder: 5,
    },
    {
      id: 2,
      queryName: 'tools',
      name: 'Приладдя',
      items: await getToolsData(),
      selectionType: 'MULTIPLE',
      sortOrder: 6,
    }
  ]
}

module.exports = {
  getFiltersData
}
