// Function to build image objects
const buildImages = (id, type) => {
  const domain = "https://newimages.mixdrinks.org/files";
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
      srcset: `${domain}/${types[type]}/${id}/${size.imageSize}/${id}.${format}`,
      media: `screen and (min-width: ${size.responseSize}px)`,
      type: `image/${format}`
    }))
  );
};

module.exports = {
  buildImages
}
