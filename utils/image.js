require('dotenv').config();

const imageUrlStart = process.env.IMAGE_URL_START;

const buildImages = (id, type) => {
  const types = {
    COCKTAIL: "cocktails",
    ITEM: "goods"
  };
  const formats = ["webp", "jpg"];
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

module.exports = {
  buildImages,
  buildOgImage,
}
