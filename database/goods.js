const Database = require('./newclient');

function getGoodBySlug(slug) {
  return Database.collection('goods').findOne(
    {
      'slug': slug
    },
  );
}


module.exports = {
  getGoodBySlug
}
