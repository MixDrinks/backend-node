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

async function getAlcohole() {
  const alcohol = await Database
    .collection('alcohol')
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

  return alcohol;
}

async function getFiltersData() {
  return [
    {
      id: 4,
      queryName: 'alcohol-volume',
      name: 'Міцність',
      items: await getAlcoholoVolume(),
      selectionType: 'SINGLE',
      isOpen: true,
    },
    {
      id: 3,
      queryName: 'taste',
      name: 'Смак',
      items: await getTastes(),
      selectionType: 'MULTIPLE',
      isOpen: false,
    },
    {
      id: 1,
      queryName: 'goods',
      name: 'Інгрідієнти',
      items: await getGoods(),
      selectionType: 'MULTIPLE',
      isOpen: false,
    },
    {
      id: 6,
      queryName: 'alcohol',
      name: 'Категорія алкоголю',
      items: await getAlcohole(),
      selectionType: 'MULTIPLE',
      isOpen: false,
    },
    {
      id: 5,
      queryName: 'glassware',
      name: 'Стакан',
      items: await getGlasswares(),
      selectionType: 'SINGLE',
      isOpen: false,
    },
    {
      id: 2,
      queryName: 'tools',
      name: 'Приладдя',
      items: await getToolsData(),
      selectionType: 'MULTIPLE',
      isOpen: false,
    },
    {
      id: 0,
      queryName: 'tags',
      name: 'Інше',
      items: await getTagsData(),
      selectionType: 'MULTIPLE',
      isOpen: false,
    },
  ]
}

module.exports = {
  getFiltersData
}
