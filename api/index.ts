// Full file: api/index.ts
import app from './email.js';

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Email API server running on port ${port}`);
});