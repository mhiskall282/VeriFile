import express from 'express';

const router = express.Router();

// Health check route without MetaMask validation
router.get("/", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default router;