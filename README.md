# NCN Evaluation Suite (Light Theme)
Updated: 2025-10-17T05:49:25

Pages:
- **login.html** — تسجيل الدخول (اختيار الاسم من قائمة + كلمة مرور).
- **applicants.html** — إدارة المتقدمين (لجنة/مدير).
- **index.html** — التقييم (للمقيمين).

Backend: **cloudflare/worker.js** (JWT مبسط، GitHub JSON storage).

Environment (Worker):
- GITHUB_TOKEN (secret RW), GH_OWNER, GH_REPO, GH_BRANCH
- GH_EVALUATORS_PATH, GH_APPLICANTS_PATH, GH_EVALUATIONS_PATH
- SECRET_KEY (secret random)

Create JSON files (empty arrays ok):
- evaluators.json, applicants.json, evaluations.json

Evaluator hashing: use `"passwordHash":"sha256:HEX"`. Plain `"password":"123"` also works (for setup only).

API base in pages is `"/api"`. If Worker is on another domain, change the constant accordingly.
