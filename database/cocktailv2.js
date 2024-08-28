const Database = require('./newclient');

async function addVisitToCocktail(slug) {
  return Database.collection('cocktails').updateOne(
    {
      'slug': slug
    },
    {
      $inc: {
        'visitCount': 1
      }
    }
  );
}

async function getScoreInfo(slug) {
  const rawScoreInfo = Database.collection('cocktails').findOne(
    {
      'slug': slug
    },
    {
      'ratingCount': 1,
      'ratingValue': 1,
      'visitCount': 1
    }
  );

  if (!rawScoreInfo) {
    return null;
  } else {
    return rawScoreInfo;
  }
}

module.exports = {
  addVisitToCocktail,
  getScoreInfo
};
