const express = require('express')
const { getGlasswareBySlug } = require('../../database/glassware');
const { buildImages, buildOgImage, buildGlasswareDetailsImage } = require('../../utils/image');
const router = express.Router();

router.get('/api/glassware/:slug', async (req, res) => {
  const slug = req.params.slug;

  const glasswares = await getGlasswareBySlug(slug);
  const glassware = glasswares[0];

  if (!glassware) {
    return res.status(404).send('Glassware not found');
  } else {
    return res.status(200).send({
      id: glassware.id,
      slug: glassware.slug,
      name: glassware.name,
      about: glassware.about,
      images: buildGlasswareDetailsImage(glassware.slug),
      meta: {
        ogImage: buildOgImage(glassware.id, 'ITEM'),
      },
    });
  }
});

module.exports = router;

