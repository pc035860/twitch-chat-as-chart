const functions = require('firebase-functions');
const vodId = require('./utils/vodId');

module.exports = function analyze(admin) {
  return functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
      res.status(403).send('Forbidden!');
      return null;
    }

    const videoId = vodId.format(req.query.v);
    const db = admin.database();

    return db.ref(`results/${videoId}`).once('value')
    .then((snapshot) => {
      // already has results
      if (snapshot.exists()) {
        res.status(200).json(snapshot.val());
        return null;
      }

      // check running
      return db.ref(`running/${videoId}`).once('value');
    })
    .then((snapshot) => {
      if (!snapshot) {
        return null;
      }

      if (snapshot.exists()) {
        res.status(200).json({
          running: true
        });
        return null;
      }

      // trigger running
      return db.ref(`running/${videoId}`).set(true)
      .then(() => true);
    })
    .then((triggered) => {
      if (triggered) {
        res.status(200).json({
          trigger: true,
          running: true
        });
      }
    });
  });
};
