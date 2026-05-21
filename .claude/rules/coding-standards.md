# coding-standards.md
# Ben's coding standards for all portfolio projects

## Python
- Use Python 3.11+
- Format with black (line length 88)
- Type hints on all function signatures
- Docstrings on all public functions (one-line for simple, full for complex)
- requirements.txt for every project — pin major versions

## FastAPI
- Router-based structure (not monolithic main.py)
- Pydantic models for all request/response schemas
- /health endpoint on every API
- Log all requests with timing

## ML projects
- Separate notebooks/EDA/ from src/ — notebooks are exploration, src/ is production
- Always include a baseline model before the real model
- Evaluation: always show Precision@K, Recall@K, AUC alongside accuracy
- SHAP explanations mandatory for any production-bound classifier

## GenAI / LLM projects
- Separate prompt templates into prompts/ directory
- Log all LLM calls with input/output/latency/tokens
- Evaluation metrics defined before building (faithfulness, relevance, etc.)
- Never hardcode API keys — always use .env + python-dotenv

## Git
- Branch: feature/[short-name] or fix/[short-name]
- Commits: conventional commits style (feat:, fix:, docs:, refactor:)
- Every project has a .gitignore that excludes .env, __pycache__, *.pyc, .DS_Store

## README structure (mandatory for every project)
1. Problem statement (2-3 sentences)
2. Architecture diagram or description
3. Demo GIF or screenshot
4. Results table (metrics vs baseline)
5. How to run locally (copy-paste commands)
6. Tech stack badges
