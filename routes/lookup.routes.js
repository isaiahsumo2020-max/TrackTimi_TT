const router = require('express').Router();
const Lookup = require('../models/Lookup');

router.get('/', (req, res) => {
  Lookup.getAll((err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
});

router.get('/org-types', (req, res) => {
  Lookup.getOrgTypes((err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
});

router.get('/regions', (req, res) => {
  Lookup.getRegions((err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
});

router.get('/user-types', (req, res) => {
  Lookup.getUserTypes((err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
});

module.exports = router;
