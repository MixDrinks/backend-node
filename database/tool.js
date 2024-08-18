
const Database = require('./newclient');

function getToolBySlug(slug) {
  return Database.collection('tools').find(
    {
      'slug': slug
    },
    {
    }
  ).toArray();
}


module.exports = {
  getToolBySlug
}

