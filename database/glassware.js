const Database = require('./newclient');

function getGlasswareBySlug(slug) {
  return Database.collection('glassware').find(
    {
      'slug': slug
    },
    {
    }
  ).toArray();
}


module.exports = {
  getGlasswareBySlug
}
