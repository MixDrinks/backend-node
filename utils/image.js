const { format } = require('express/lib/response');

require('dotenv').config();

const imageUrlStart = process.env.IMAGE_URL_START;

const formats = ["webp", "jpg"];

const buildImages = (id, type) => {
  const types = {
    COCKTAIL: "cocktails",
    ITEM: "goods"
  };
  const sizes = [
    { responseSize: "570", imageSize: "origin" },
    { responseSize: "410", imageSize: "560" },
    { responseSize: "330", imageSize: "400" },
    { responseSize: "0", imageSize: "320" }
  ];

  return formats.flatMap(format =>
    sizes.map(size => ({
      srcset: `${imageUrlStart}/${types[type]}/${id}/${size.imageSize}/${id}.${format}`,
      media: `screen and (min-width: ${size.responseSize}px)`,
      type: `image/${format}`
    }))
  );
};

const buildOgImage = (id, type) => {
  const types = {
    COCKTAIL: "cocktails",
    ITEM: "goods"
  };

  return `${imageUrlStart}/${types[type]}/${id}/256/${id}.jpg`;
};

const buildCocktailInListImage = (slug) => {
  const sizes = [
    { responseSize: "414px", imageSize: "300" },
    { responseSize: "0", imageSize: "100" }
  ];

  return formats.flatMap(format =>
    sizes.map(size => ({
      srcset: `${imageUrlStart}/v2/cocktails/${slug}/${size.imageSize}.${format}`,
      media: `screen and (min-width: ${size.responseSize})`,
      type: `image/${format}`
    }))
  );
}

const buildCocktailDetailsImage = (slug) => {
  const sizes = [
    { responseSize: "414px", imageSize: "500" },
    { responseSize: "0", imageSize: "334" }
  ];

  return formats.flatMap(format =>
    sizes.map(size => ({
      srcset: `${imageUrlStart}/v2/cocktails/${slug}/${size.imageSize}.${format}`,
      media: `screen and (min-width: ${size.responseSize})`,
      type: `image/${format}`
    }))
  );
}

const buildGoodDetailsImage = (slug) => {
  const sizes = [
    { responseSize: "414px", imageSize: "500" },
    { responseSize: "0", imageSize: "334" }
  ];

  return formats.flatMap(format =>
    sizes.map(size => ({
      srcset: `${imageUrlStart}/v2/goods/${slug}/${size.imageSize}.${format}`,
      media: `screen and (min-width: ${size.responseSize})`,
      type: `image/${format}`
    }))
  );
}

const buildToolDetailsImage = (slug) => {
  const sizes = [
    { responseSize: "414px", imageSize: "500" },
    { responseSize: "0", imageSize: "334" }
  ];

  return formats.flatMap(format =>
    sizes.map(size => ({
      srcset: `${imageUrlStart}/v2/tools/${slug}/${size.imageSize}.${format}`,
      media: `screen and (min-width: ${size.responseSize})`,
      type: `image/${format}`
    }))
  );
}

const buildGlasswareDetailsImage = (slug) => {
  const sizes = [
    { responseSize: "414px", imageSize: "500" },
    { responseSize: "0", imageSize: "334" }
  ];

  return formats.flatMap(format =>
    sizes.map(size => ({
      srcset: `${imageUrlStart}/v2/glasswares/${slug}/${size.imageSize}.${format}`,
      media: `screen and (min-width: ${size.responseSize})`,
      type: `image/${format}`
    }))
  );
}

const buildGoodsImageInFeed = (slug) => {
  const sizes = [
    { responseSize: "414px", imageSize: "142" },
    { responseSize: "0", imageSize: "100" }
  ];

  return formats.flatMap(format =>
    sizes.map(size => ({
      srcset: `${imageUrlStart}/v2/goods/${slug}/${size.imageSize}.${format}`,
      media: `screen and (min-width: ${size.responseSize})`,
      type: `image/${format}`
    }))
  );
}

const buildToolsImageInFeed = (slug) => {
  const sizes = [
    { responseSize: "414px", imageSize: "142" },
    { responseSize: "0", imageSize: "100" }
  ];

  return formats.flatMap(format =>
    sizes.map(size => ({
      srcset: `${imageUrlStart}/v2/tools/${slug}/${size.imageSize}.${format}`,
      media: `screen and (min-width: ${size.responseSize})`,
      type: `image/${format}`
    }))
  );
}

const buildGlasswaresImageInFeed = (slug) => {
  const sizes = [
    { responseSize: "414px", imageSize: "142" },
    { responseSize: "0", imageSize: "100" }
  ];

  return formats.flatMap(format =>
    sizes.map(size => ({
      srcset: `${imageUrlStart}/v2/glasswares/${slug}/${size.imageSize}.${format}`,
      media: `screen and (min-width: ${size.responseSize})`,
      type: `image/${format}`
    }))
  );
}

module.exports = {
  buildImages,
  buildOgImage,
  buildCocktailInListImage,
  buildCocktailDetailsImage,
  buildGoodDetailsImage,
  buildToolDetailsImage,
  buildGlasswareDetailsImage,
  buildGoodsImageInFeed,
  buildToolsImageInFeed,
  buildGlasswaresImageInFeed,
}
