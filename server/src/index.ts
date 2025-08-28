import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import storesRouter from './routes/stores';
import ratingsRouter from './routes/ratings';
import adminRouter from './routes/admin';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/stores', storesRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/admin', adminRouter);

async function bootstrap() {
	const count = await prisma.user.count();
	if (count === 0) {
		const name = process.env.BOOTSTRAP_ADMIN_NAME;
		const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
		const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
		const address = process.env.BOOTSTRAP_ADMIN_ADDRESS || 'N/A';
		if (name && email && password) {
			const hash = await bcrypt.hash(password, 10);
			await prisma.user.create({ data: { name, email, address, password: hash, role: 'ADMIN' } });
			console.log('Created bootstrap admin:', email);
		} else {
			console.warn('No users found. Set BOOTSTRAP_ADMIN_* env vars to create an initial admin.');
		}
	}
}

const port = Number(process.env.PORT || 4000);
bootstrap().finally(() => {
	app.listen(port, () => console.log(`server listening on http://localhost:${port}`));
});

export { prisma };
