// api/index.ts
import app from './email';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;