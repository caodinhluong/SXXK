# Hướng dẫn chạy toàn bộ hệ thống SXXK

## Tổng quan các service

| Service | Công nghệ | Port | Thư mục |
|---|---|---|---|
| Database | MySQL 8 (Docker) | 3306 | — |
| Backend API | Node.js / Express | 3000 | `Backend/` |
| AI Chatbot | Python / FastAPI | 8000 | `ai/chatbot/` |
| Frontend User | React / Vite | 5173 | `Frontend-User/` |
| Frontend Admin | React / Vite | 5174 | `Frontend-Admin/` |

> Khởi động theo đúng thứ tự: **Database → Backend → Chatbot → Frontend**

---

## Yêu cầu cài đặt

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (cho MySQL)
- [Node.js >= 18](https://nodejs.org/)
- [Python >= 3.11](https://www.python.org/)
- npm (đi kèm Node.js)

---

## Bước 1 — Khởi động MySQL (Docker)

```bash
cd SXXK
docker-compose up mysql -d
```

Chờ khoảng 15–20 giây để MySQL khởi động xong. Kiểm tra:

```bash
docker-compose logs mysql --tail 10
# Thấy "ready for connections" là OK
```

> **Thông tin kết nối:**
> - Host: `127.0.0.1:3306`
> - Database: `xuatnhapkhau`
> - User: `root` / Password: `root123`

---

## Bước 2 — Chạy Backend (Node.js)

### 2.1 Cấu hình môi trường

File `Backend/.env` đã có sẵn. Kiểm tra các giá trị phù hợp với MySQL ở bước 1:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=xuatnhapkhau
DB_USER=root
DB_PASS=root123
DB_DIALECT=mysql
JWT_SECRET=replace_with_a_real_secret
JWT_SECRET_REFRESH_TOKEN=replace_with_a_real_refresh_secret
```

### 2.2 Cài dependencies và chạy

```bash
cd Backend
npm install
npm run dev
```

Backend chạy tại: **http://localhost:3000**

Sequelize sẽ tự tạo/đồng bộ bảng khi khởi động lần đầu.

---

## Bước 3 — Chạy AI Chatbot (Python/FastAPI)

### 3.1 Cấu hình môi trường

```bash
cd ai/chatbot
cp .env.example .env
```

Mở `.env` và điền:

```env
OPENAI_API_KEY=sk-...          # Bắt buộc - OpenAI API key thật
CHATBOT_API_KEY=sxxk-chatbot-secret-key   # Giữ nguyên hoặc đổi tùy ý
GENERATE_MODEL=gpt-4o-mini
ROUTER_TYPE=keyword
USE_RERANKER=False
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

### 3.2 Tạo môi trường ảo Python và cài thư viện

```bash
# Tạo venv (chạy 1 lần)
python -m venv .venv

# Kích hoạt venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Cài thư viện
pip install -r requirements.txt
```

### 3.3 Khởi động

> Phải đứng đúng trong thư mục `ai/chatbot/` — uvicorn cần tìm thấy `src/` ở thư mục hiện tại.

```bash
cd ai/chatbot          # quan trọng: không chạy từ thư mục ai/
uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
```

Chatbot chạy tại: **http://localhost:8000**

Kiểm tra: mở http://localhost:8000/api/v1/health/live → trả về `{"status":"ok"}`

### 3.4 Upload tài liệu hướng dẫn (quan trọng)

Chatbot cần có dữ liệu mới trả lời được. Upload file PDF/DOCX hướng dẫn sử dụng SXXK qua trang Admin (Bước 5) hoặc qua curl:

```bash
curl -X POST http://localhost:8000/api/v1/files/upload \
  -H "X-Chatbot-Key: sxxk-chatbot-secret-key" \
  -F "file=@duong_dan_den_file.pdf"
```

---

## Bước 4 — Chạy Frontend User (React)

```bash
cd Frontend-User
npm install        # lần đầu
npm run dev
```

Ứng dụng người dùng: **http://localhost:5173**

> File `.env` đã có: `VITE_API_BASE_URL=http://localhost:3000/api`
> Chatbot URL mặc định là `http://localhost:8000` (không cần cấu hình thêm).

---

## Bước 5 — Chạy Frontend Admin (React)

### 5.1 Cấu hình `.env` cho Admin

Mở `Frontend-Admin/.env`, thêm dòng sau (nếu chưa có):

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_CHATBOT_API_KEY=sxxk-chatbot-secret-key
```

> Giá trị `VITE_CHATBOT_API_KEY` phải khớp với `CHATBOT_API_KEY` trong `ai/chatbot/.env`

### 5.2 Chạy

```bash
cd Frontend-Admin
npm install        # lần đầu
npm run dev -- --port 5174
```

Trang quản trị: **http://localhost:5174**

---

## Tóm tắt — Mở 5 terminal song song

```
Terminal 1 (MySQL):      cd SXXK && docker-compose up mysql -d
Terminal 2 (Backend):    cd SXXK/Backend && npm run dev
Terminal 3 (Chatbot):    cd SXXK/ai/chatbot && .venv\Scripts\activate && uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
Terminal 4 (User FE):    cd SXXK/Frontend-User && npm run dev
Terminal 5 (Admin FE):   cd SXXK/Frontend-Admin && npm run dev -- --port 5174
```

---

## Lần đầu sử dụng Chatbot

1. Mở trang Admin: http://localhost:5174
2. Đăng nhập → vào **Quản lý Chatbot**
3. Upload file PDF/DOCX hướng dẫn sử dụng hệ thống SXXK
4. Đợi index xong (cột trạng thái hiển thị **Đã index**)
5. Dùng panel chat bên phải để thử nghiệm
6. Chatbot trên trang User (http://localhost:5173) đã sẵn sàng trả lời

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| Backend không kết nối DB | MySQL chưa sẵn sàng | Chờ thêm 20s, kiểm tra `docker-compose logs mysql` |
| Chatbot trả lời "OPENAI_API_KEY chưa được cấu hình" | Thiếu API key | Điền `OPENAI_API_KEY` vào `ai/chatbot/.env` |
| Chatbot "Offline" trên Admin | Service chưa chạy hoặc port 8000 bị chặn | Chạy lại bước 3, kiểm tra firewall |
| CORS error trên trình duyệt | Origin không được phép | Thêm URL frontend vào `CORS_ORIGINS` trong `ai/chatbot/.env` |
| `ModuleNotFoundError` khi chạy Python | Chưa kích hoạt venv | Chạy `.venv\Scripts\activate` trước |
