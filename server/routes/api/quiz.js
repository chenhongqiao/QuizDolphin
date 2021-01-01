const express = require('express');

const router = express.Router();

router.get('/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    if (req.session.history === undefined) {
      res.send('No History!');
    } else {
      res.send(req.session.history);
    }
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

module.exports = router;
