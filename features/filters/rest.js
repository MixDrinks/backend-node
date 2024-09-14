const express = require('express')
const { getFullCocktailByFilter } = require('../../database/filetrs');
const { getFiltersData } = require('../../database/filters');
const DescriptionBuilder = require('./description');
const router = express.Router();

//filter/alcohol-volume=bezalkoholni/taste=yahidni,solodki/glassware=kelykh-dlia-irlandskoi-kavy/goods=med,tsukrovyi-pisok/tools=madler,dzhyher,kokteilna-lozhka?page=0
router.get('/api/filter/*', async (req, res) => {
  //Getting query sort=most-popular&page=0
  const sortType = req.query.sort;
  const page = req.query.page || 0;

  const start = page * 24;
  const limit = 24;

  const filterString = req.params[0]; // get everything after /api/filter/
  const filterPairs = filterString.split('/');

  const filter = {};
  try {
    filterPairs.forEach(pair => {
      const [key, value] = pair.split('=');
      filter[key] = value.split(',');
    });
  } catch (e) {
  }

  const response = await getFullCocktailByFilter(filter, start, limit, sortType);

  const descriptionBuilder = new DescriptionBuilder();
  const description = await descriptionBuilder.buildDescription(filter);

  if (description) {
    response.description = description;
  }

  return res.status(200).send(response);
});

const filterDataCache = {};

router.get('/api/filters', async (req, res) => {
  if (filterDataCache.data) {
   // return res.status(200).send(filterDataCache.data);
  }
  const response = await getFiltersData();
  filterDataCache.data = response;

  return res.status(200).send(response);
});

module.exports = router;
