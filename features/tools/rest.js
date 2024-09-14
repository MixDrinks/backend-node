const express = require('express');
const { getToolBySlug } = require('../../database/tool');
const { buildImages, buildOgImage } = require('../../utils/image');
const router = express.Router();

router.get('/api/tools/:slug', async (req, res) => {
  const slug = req.params.slug;
  const tools = await getToolBySlug(slug);

  const tool = tools[0];

  if (!tool) {
    return res.status(404).send('Tool not found');
  } else {
    return res.status(200).send({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      about: tool.about,
      images: buildImages(tool.id, 'ITEM'),
      meta: {
        ogImage: buildOgImage(tool.id, 'ITEM'),
      },
    });
  }
});

module.exports = router;
