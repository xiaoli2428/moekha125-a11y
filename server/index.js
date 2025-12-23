// Express server setup
const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const app = express();
app.use(express.json());

// Express-Rate-Limit middleware setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
});
app.use(limiter);

// Zod validation example for a POST endpoint
const schema = z.object({
  username: z.string().min(3),
  age: z.number().int().min(1)
});

app.post('/api/data', (req, res) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }
  res.status(200).json({ message: 'Data is valid!', data: result.data });
});

// Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
