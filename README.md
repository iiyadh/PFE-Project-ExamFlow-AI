# ExamFlow-AI

An intelligent exam management system powered by AI, featuring automated exam generation, student management, and AI-powered content processing.

## 🏗️ Architecture

This project follows a **microservices architecture** with three independent services:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │─────▶│   Server    │─────▶│ AI Service  │
│  (React)    │      │  (Express)  │      │  (FastAPI)  │
│  Port 5173  │      │  Port 5000  │      │  Port 8000  │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   MongoDB   │
                     │  Port 27017 │
                     └─────────────┘
```

### Service Communication
- **Client → Server**: REST API calls (axios)
- **Server → AI Service**: HTTP requests for AI processing
- **Server → MongoDB**: Mongoose ODM
- **AI Service**: Uses ChromaDB for vector storage (RAG system)

---

## 📁 Project Structure

```
PFE-Project-ExamFlow-AI/
├── client/                    # React frontend
│   ├── src/
│   │   ├── Components/        # Reusable UI components
│   │   ├── Pages/            # Page components (Login, Register, etc.)
│   │   ├── Protection/       # Route protection/guards
│   │   ├── store/            # Zustand state management
│   │   ├── Wrapper/          # Layout wrappers
│   │   └── lib/              # Utility functions
│   ├── public/               # Static assets
│   └── package.json
│
├── server/                    # Express.js backend
│   ├── controllers/          # Request handlers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   ├── middlewares/          # Custom middleware
│   ├── libs/                 # Helper functions
│   ├── uploads/              # File upload storage
│   └── index.js              # Entry point
│
├── ai-service/               # FastAPI AI service
│   ├── app/
│   │   ├── services/         # AI processing logic
│   │   │   ├── file_service.py
│   │   │   ├── vector_service.py
│   │   │   └── convert_ai_service.py
│   │   ├── main.py          # FastAPI app
│   │   └── chroma_db/       # Vector database storage
│   └── requirements.txt
│
└── docker-compose.yml        # Container orchestration
```

---

## 🛠️ Tech Stack

### **Frontend (Client)**
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router DOM** | Client-side routing |
| **Zustand** | State management |
| **Ant Design** | UI component library |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | HTTP client |
| **Lucide React** | Icons |
| **React Markdown** | Markdown rendering |
| **@react-oauth/google** | Google OAuth integration |

### **Backend (Server)**
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express 5** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling |
| **Nodemailer** | Email sending |
| **CORS** | Cross-origin requests |
| **Cookie Parser** | Cookie handling |

### **AI Service**
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | Python web framework |
| **LangChain** | LLM orchestration framework |
| **ChromaDB** | Vector database for RAG |
| **Groq** | LLM provider integration |
| **OpenAI** | AI models integration |
| **PyPDF** | PDF processing |
| **docx2txt** | Word document processing |
| **Cloudinary** | Cloud storage for files |

### **Infrastructure**
- **Docker & Docker Compose**: Containerization
- **MongoDB 7**: Database
- **Nodemon**: Auto-reload for development

---

## 🎨 Code Style & Standards

### **Frontend (JavaScript/JSX)**
- **ES6+ syntax** with modules (`import/export`)
- **ESLint** configuration with React Hooks and React Refresh plugins
- **Functional components** with React Hooks
- **JSX** for component templates
- **Naming conventions**:
  - Components: PascalCase (e.g., `UserPage.jsx`)
  - Files: camelCase or PascalCase
  - Variables: camelCase
  - Constants: UPPER_SNAKE_CASE for global constants

**ESLint Rules**:
```javascript
{
  extends: ['@eslint/js', 'react-hooks', 'react-refresh'],
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]
  }
}
```

### **Backend (Node.js)**
- **CommonJS** module system (`require/module.exports`)
- **RESTful API** design patterns
- **MVC architecture**: Models, Controllers, Routes
- **Middleware-based** request processing
- **Environment variables** for configuration (`.env`)
- **Naming conventions**:
  - Routes: kebab-case in URLs
  - Models: PascalCase (e.g., `User.js`)
  - Controllers: camelCase functions

### **AI Service (Python)**
- **PEP 8** style guide
- **snake_case** for functions and variables
- **Type hints** recommended
- **Async/await** for async operations
- **Service-oriented** architecture

---

## 📦 Key Dependencies

### Client (`package.json`)
```json
{
  "react": "^19.2.0",
  "vite": "^7.3.1",
  "antd": "^6.3.0",
  "tailwindcss": "^4.2.0",
  "zustand": "^5.0.11",
  "react-router-dom": "^7.13.0",
  "axios": "^1.13.5"
}
```

### Server (`package.json`)
```json
{
  "express": "^5.2.1",
  "mongoose": "^9.2.2",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "multer": "^1.4.5-lts.1",
  "nodemailer": "^8.0.1"
}
```

### AI Service (`requirements.txt`)
```
fastapi
uvicorn[standard]
chromadb>=0.5.0
langchain>=0.3.0
langchain-groq>=0.2.0
openai>=1.0.0
pypdf>=4.0.0
cloudinary
```

---

## 🗄️ Data Models

### **User** (`server/models/User.js`)
- User authentication and profile management
- Roles: Student, Teacher, Admin

### **Student** (`server/models/Student.js`)
- Student-specific information
- Links to User model

### **Teacher** (`server/models/Teacher.js`)
- Teacher-specific information
- Links to User model

### **Course** (`server/models/Course.js`)
- Course information and management

### **Class** (`server/models/Class.js`)
- Class/group management
- Student-teacher-course relationships

### **File** (`server/models/File.js`)
- Uploaded file metadata
- Links to courses/classes

### **MarkdownContent** (`server/models/MarkdownContent.js`)
- AI-generated or stored markdown content

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Docker & Docker Compose
- MongoDB (or use Docker)

### Installation & Running

**Option 1: Docker (Recommended)**
```bash
# Start all services
docker-compose up

# Access:
# - Client: http://localhost:5173
# - Server: http://localhost:5000
# - AI Service: http://localhost:8000
# - MongoDB: localhost:27017
```

**Option 2: Manual Setup**

1. **MongoDB**
```bash
# Start MongoDB (or use cloud MongoDB)
mongod
```

2. **Server**
```bash
cd server
npm install
npm start
# Runs on http://localhost:5000
```

3. **AI Service**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

4. **Client**
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

### Environment Variables

Create `.env` files in each service directory:

**Server (`.env`)**
```env
MONGO_URI=mongodb://localhost:27017/appdb
AI_SERVICE_URL=http://localhost:8000
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

**AI Service (`.env`)**
```env
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_URL=your_cloudinary_url
```

**Client (`.env`)**
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## 🔌 API Structure

### **Server Routes** (`server/routes/`)
- `authRoutes.js` - Authentication (login, register, logout)
- `userRoutes.js` - User management
- `studentRoutes.js` - Student operations
- `classRoutes.js` - Class management
- `fileRoutes.js` - File upload/download
- `passwordRoutes.js` - Password reset

### **API Endpoints Pattern**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/:id
POST   /api/files/upload
GET    /api/classes
...
```

---

## 🤖 AI Features

The AI service provides:
- **Document Processing**: Extract text from PDFs and DOCX files
- **Vector Storage**: ChromaDB for semantic search (RAG)
- **LLM Integration**: Groq and OpenAI for text generation
- **Content Generation**: AI-powered exam/content creation
- **File Service**: Process and store educational materials

---

## 🎯 Features

- ✅ User authentication (JWT + Google OAuth)
- ✅ Role-based access (Student, Teacher, Admin)
- ✅ Course and class management
- ✅ File upload and management
- ✅ AI-powered content processing
- ✅ Password reset via email
- ✅ Responsive UI with Ant Design
- ✅ Markdown content rendering
- ✅ Vector database for semantic search

---

## 📝 Development Scripts

### Client
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Server
```bash
npm start        # Start with nodemon (auto-reload)
```

### AI Service
```bash
uvicorn app.main:app --reload    # Start with auto-reload
```

---

## 🐳 Docker Services

```yaml
services:
  - mongodb:      Port 27017
  - server:       Port 5000 (Express)
  - ai-service:   Port 8000 (FastAPI)
  - client:       Port 5173 (Vite)
```

All services have auto-reload enabled in development mode.

---

## 📚 Additional Notes

- **State Management**: Zustand is used for lightweight global state
- **Authentication**: JWT tokens stored in cookies
- **File Storage**: Local uploads folder + Cloudinary for AI service
- **Vector DB**: ChromaDB stores embeddings locally in `ai-service/app/chroma_db/`
- **API Communication**: Server acts as middleware between client and AI service

---

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Cookie-based session management
- CORS configuration
- Environment variable protection
- Input validation

---

## 🛡️ Best Practices Implemented

- ✅ Modular architecture (separation of concerns)
- ✅ Environment-based configuration
- ✅ Docker containerization
- ✅ Code linting (ESLint)
- ✅ RESTful API design
- ✅ MVC pattern in backend
- ✅ Component-based UI architecture
- ✅ Centralized state management
- ✅ Error handling middleware

---

## 📌 Project Type

**Educational Platform** - AI-powered exam and content management system for educational institutions.

---

*This README reflects the current state of the ExamFlow-AI project structure and dependencies.*
