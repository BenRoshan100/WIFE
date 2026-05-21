# Project Structure

```
project/
├── CLAUDE.md                    ← Claude Code routing file (read every session)
├── README.md                    ← Public-facing project readme
├── requirements.txt             ← Python dependencies
├── .env.example                 ← Environment variable template
├── .gitignore
│
├── .claude/
│   ├── settings.json            ← Hook configuration
│   ├── hooks/
│   │   └── session-reflect.sh  ← Stop hook for memory updates
│   └── rules/
│       ├── memory-profile.md    ← Facts about Ben (auto-updated)
│       ├── memory-preferences.md← How Ben likes things done (auto-updated)
│       ├── memory-decisions.md  ← Technical decisions with dates (auto-updated)
│       ├── memory-sessions.md   ← Session log (auto-updated)
│       └── coding-standards.md ← Code style rules
│
├── docs/
│   ├── architecture.md          ← System design
│   ├── decisions.md             ← Project-level decisions
│   ├── api-spec.md              ← API documentation
│   └── structure.md             ← This file
│
├── src/                         ← Production code
│   ├── __init__.py
│   ├── main.py                  ← FastAPI app entry point
│   ├── models/                  ← ML model code
│   ├── api/                     ← API routes
│   ├── utils/                   ← Shared utilities
│   └── prompts/                 ← LLM prompt templates
│
├── notebooks/
│   └── EDA/                     ← Exploratory notebooks (not production)
│
├── data/
│   ├── raw/                     ← Source data (gitignored if large)
│   └── processed/               ← Cleaned, feature-engineered data
│
├── tests/
│   └── test_api.py
│
└── models/                      ← Saved model artifacts (gitignored)
```
