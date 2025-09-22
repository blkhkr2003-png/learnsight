# LearnSight Backend

Complete Firebase backend implementation for LearnSight adaptive learning platform.

## 🏗️ Architecture

- **Firebase Cloud Functions** - Express.js API with TypeScript
- **Firestore** - NoSQL database with security rules
- **Firebase Auth** - User authentication with role-based access
- **OpenAI Integration** - LLM-powered explanations (optional)
- **Adaptive Engine** - IRT-based question selection

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install Node.js 18+
node --version  # Should be 18+

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### 2. Project Setup

```bash
# Initialize Firebase project
firebase init

# Select:
# - Functions (TypeScript)
# - Firestore
# - Authentication

# Install dependencies
cd functions
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
FIREBASE_PROJECT_ID=your-project-id
OPENAI_API_KEY=your-openai-key  # Optional
OPENAI_ENABLED=true
```

### 4. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### 5. Build and Deploy Functions

```bash
# Build TypeScript
cd functions
npm run build

# Deploy functions
firebase deploy --only functions
```

### 6. Seed Demo Data

```bash
# Run seeding script
cd scripts
npm install
node seed-demo.js
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create user account
- `POST /api/auth/set-role` - Set user role (admin only)

### Questions
- `GET /api/questions` - Query questions with filters
- `GET /api/questions/:id` - Get specific question
- `POST /api/questions` - Create question (admin only)
- `PUT /api/questions/:id` - Update question (admin only)
- `DELETE /api/questions/:id` - Delete question (admin only)

### Practice
- `POST /api/practice/generate` - Generate adaptive practice queue
- `GET /api/practice/queue` - Get current practice queue
- `POST /api/practice/next` - Get next question in queue
- `DELETE /api/practice/queue` - Clear practice queue

### Responses
- `POST /api/responses` - Submit question response
- `GET /api/responses` - Get response history
- `GET /api/responses/analytics` - Get detailed analytics

### LLM (Optional)
- `POST /api/llm/explain` - Generate question explanation
- `POST /api/llm/hint` - Generate question hint
- `GET /api/llm/status` - Check LLM service status

## 🧠 Adaptive Engine

The adaptive engine uses a simplified IRT (Item Response Theory) model:

### Core Algorithm
1. **Skill Assessment**: Track student ability (θ) per skill
2. **Question Selection**: Choose questions near θ + 0.2 difficulty
3. **Ability Update**: Bayesian update based on response
4. **Queue Generation**: Mix adaptive + review questions

### Configuration
```typescript
const config = {
  targetDifficulty: 0.5,      // Base difficulty
  difficultyRange: 0.3,       // ±range for selection
  queueSize: 10,              // Questions per session
  includeRecentIncorrect: true // Review wrong answers
};
```

## 🔒 Security Rules

### User Access Patterns
- **Students**: Read/write own data only
- **Teachers**: Read student data in their classes
- **Parents**: Read their children's data
- **Admins**: Full access

### Server-Only Collections
- `studentSkills` - Only Cloud Functions can write
- `practiceQueues` - Only Cloud Functions can write
- `llm_cache` - Only Cloud Functions can access

## 🧪 Testing

### Unit Tests
```bash
cd functions
npm test
```

### Integration Tests with Emulator
```bash
# Start emulators
firebase emulators:start

# Run tests against emulator
npm run test:integration
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load tests
artillery run load-test.yml
```

## 📊 Monitoring

### Firebase Console
- Function logs and metrics
- Firestore usage and performance
- Authentication analytics

### Custom Metrics
```typescript
// Add to functions for monitoring
import { logger } from 'firebase-functions';

logger.info('Practice queue generated', {
  userId,
  queueSize: questions.length,
  difficulty: avgDifficulty
});
```

## 🔧 Development

### Local Development
```bash
# Start emulators
firebase emulators:start

# Functions will be available at:
# http://localhost:5001/your-project/us-central1/api
```

### Hot Reload
```bash
# Watch for changes
cd functions
npm run build:watch

# In another terminal
firebase emulators:start --only functions
```

### Debugging
```bash
# Enable debug logs
export DEBUG=*

# Or specific modules
export DEBUG=firebase:*
```

## 📈 Performance Optimization

### Firestore Best Practices
- Use composite indexes for complex queries
- Implement pagination for large result sets
- Cache frequently accessed data
- Use subcollections for hierarchical data

### Function Optimization
- Set appropriate memory allocation
- Use connection pooling for external APIs
- Implement request caching
- Monitor cold start times

### Adaptive Engine Tuning
- Adjust learning rate based on student performance
- Implement skill decay over time
- Use A/B testing for algorithm improvements

## 🚀 Production Deployment

### Environment Setup
```bash
# Set production environment variables
firebase functions:config:set \
  openai.api_key="your-key" \
  openai.enabled=true

# Deploy with production settings
firebase deploy --only functions --project production
```

### Monitoring Setup
- Enable Cloud Logging
- Set up alerting for errors
- Monitor function performance
- Track user engagement metrics

## 🤝 Integration with Frontend

### Authentication Flow
```typescript
// Frontend: Get ID token
const idToken = await user.getIdToken();

// Backend: Verify token
const decodedToken = await admin.auth().verifyIdToken(idToken);
```

### API Usage Example
```typescript
// Frontend API call
const response = await fetch('/api/practice/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ skills: ['math'], count: 10 })
});
```

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [IRT Theory Background](https://en.wikipedia.org/wiki/Item_response_theory)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```typescript
   // Ensure CORS is properly configured
   app.use(cors({ origin: true }));
   ```

2. **Authentication Failures**
   ```bash
   # Check service account permissions
   firebase projects:list
   ```

3. **Firestore Permission Denied**
   ```bash
   # Verify security rules
   firebase firestore:rules:get
   ```

4. **Function Timeout**
   ```typescript
   // Increase timeout in function config
   .runWith({ timeoutSeconds: 540 })
   ```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase console logs
3. Test with emulators first
4. Create detailed issue reports

---

Built with ❤️ for adaptive learning