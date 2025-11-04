# 🤖 AI Chatbot Service

Django microservice for text translation and summarization.

## 📁 Structure

```
ai-service/              # Django PROJECT
├── ai_service/         # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── ai_tools/           # Django APP (contains the AI functionality)
│   ├── services.py     # Translation and summarization functions
│   ├── views.py        # API endpoints
│   └── urls.py         # URL routing
├── manage.py
└── requirements.txt
```

**Note:** `ai-service/` is the Django **project**, and `ai_tools/` is a Django **app** inside it. This follows Django's standard structure (similar to how `course-service/` contains the `courses/` app).

## 🚀 Features

- **Translation API:** Translate text to different languages
- **Summarization API:** Generate summaries of text
- **REST API:** Django REST Framework endpoints

## 📡 API Endpoints

### Translate
```
POST /api/translate/
Body: {
    "text": "Hello world",
    "target_language": "fr"
}
```

### Summarize
```
POST /api/summarize/
Body: {
    "text": "Long text here...",
    "max_length": 150
}
```

### Supported Languages
```
GET /api/languages/
```

## 🔧 Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

3. **Start server:**
   ```bash
   python manage.py runserver 8083
   ```

## ☁️ Production Deployment

For production, integrate with cloud services:

- **Azure Translator API** (recommended by teacher)
- **Google Cloud Translation API**
- **AWS Translate**

See `DEPLOYMENT.md` for detailed deployment instructions.

## 📝 Current Implementation

The current implementation uses **placeholder functions** to demonstrate the API structure. To enable real translation and summarization:

1. Add cloud translation API credentials
2. Update `ai_tools/services.py` to call the actual APIs
3. See `DEPLOYMENT.md` for integration examples

## 🔗 Related Services

- **Student Service:** Port 8081
- **Course Service:** Port 8082
- **AI Service:** Port 8083
- **Frontend:** Port 5173

