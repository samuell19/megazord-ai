import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { initUserModel } from './models/User';
import ApiKey from './models/ApiKey';
import Agent from './models/Agent';
import authRoutes from './routes/authRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';
import agentRoutes from './routes/agentRoutes';
import errorHandler from './middleware/errorHandler';

dotenv.config();

// Initialize models
const User = initUserModel(sequelize);
ApiKey.initialize(sequelize);
Agent.initialize(sequelize);

// Setup associations with cascade delete
User.hasMany(Agent, {
  foreignKey: 'userId',
  as: 'agents',
  onDelete: 'CASCADE'
});

Agent.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasOne(ApiKey, {
  foreignKey: 'userId',
  as: 'apiKey',
  onDelete: 'CASCADE'
});

ApiKey.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Megazord AI Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/agents', agentRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

startServer();

export default app;
