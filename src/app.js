import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import { CLIENT_URL } from './configs/index.js';

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    req.csrfToken = () => "development-token";
    next();
  });
} else {
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      },
    })
  );
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Quá nhiều yêu cầu từ IP này, hãy thử lại sau 15 phút.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extends: true, limit: "50mb" }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());
app.use(limiter);
app.use(compression({ level: 6, threshold: 1024 }));
app.use(hpp());
app.use(morgan("dev"));
app.get("/api/v1/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});


app.use("/api/v1/auth", authRouter);
app.use('/api/v1/users', userRouter);



export default app;