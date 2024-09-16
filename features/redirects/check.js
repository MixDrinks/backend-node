const Database = require('../../database/newclient');

async function checkIsUrlNeedRedirect(url) {
  url = url.replace(/^\/|\/$/g, '');

  const redirect = await Database.collection('redirects').findOne({ from: url });

  if (redirect) {
    return {
      isRedirect: true,
      to: redirect.to,
    };
  } else {
    return {
      isRedirect: false,
    };
  }
}

module.exports = {
  checkIsUrlNeedRedirect,
};
