
const express = require('express');
const { getGoodBySlug } = require('../../database/goods');
const { buildOgImage, buildGoodDetailsImage } = require('../../utils/image');
const router = express.Router();

router.get('/api/goods/:slug', async (req, res) => {
  const slug = req.params.slug;
  const good = await getGoodBySlug(slug);

  if (!good) {
    return res.status(404).send('Good not found');
  } else {
    return res.status(200).send({
      id: good.id,
      slug: good.slug,
      name: good.name,
      about: good.about,
      images: buildGoodDetailsImage(good.slug),
      meta: {
        ogImage: buildOgImage(good.id, 'ITEM'),
      },
    });
  }
});

module.exports = router;
