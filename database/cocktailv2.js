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

async function addRatingToCocktail(slug, rating) {
  return Database.collection('cocktails').updateOne(
    {
      'slug': slug
    },
    {
      $inc: {
        'ratingCount': 1,
        'ratingValue': rating
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

async function getAllCocktails() {
  return Database.collection('cocktails').find(
    {},
  )
    .project({ name: 1, slug: 1, _id: 0 })
    .toArray();
}

module.exports = {
  addVisitToCocktail,
  addRatingToCocktail,
  getScoreInfo,
  getAllCocktails
};
