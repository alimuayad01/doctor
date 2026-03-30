const express = require('express');
const router = express.Router();
const { MEDICAL_DEPARTMENTS, GOVERNORATES } = require('../config/constants');

// @route GET /api/departments  (Public)
router.get('/', (req, res) => {
  res.json({ success: true, departments: MEDICAL_DEPARTMENTS });
});

// @route GET /api/departments/governorates  (Public)
router.get('/governorates', (req, res) => {
  res.json({ success: true, governorates: GOVERNORATES });
});

module.exports = router;
