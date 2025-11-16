// api/index.ts
import express from 'express';
import emailRouter from './email.js';
import cors from 'cors';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use('/api/email', emailRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Email API listening on ${PORT}`));