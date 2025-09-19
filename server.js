import express from 'express';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import cookieParser from 'cookie-parser';
import router from './src/routes/index.js';
import cors from 'cors';
// import verifyToken from '.src/middleware/verifyToken.js'

const app = express();
const PORT = process.env.PORT;

app.use(morgan('combined'));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
   origin: ["*"],       
  methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true          
}));

// Connect to MongoDB
connectDB();

// Setup routes
router(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});