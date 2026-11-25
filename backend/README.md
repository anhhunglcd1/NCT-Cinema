# NCT Cinema Backend

Spring Boot 4.1.2 / Spring Security / JPA / MySQL.

## Chạy trên máy

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

## Cấu hình (.env)

- `DB_URL`, `DB_USER`, `DB_PASSWORD`: kết nối MySQL (khi không dùng profile `local`).
- `NCT_ADMIN_EMAIL`, `NCT_ADMIN_PASSWORD`: bootstrap tài khoản quản trị lần đầu (mật khẩu tối thiểu 12 ký tự).

## API tài khoản

Tất cả request ghi dùng session cookie và CSRF (`GET /api/auth/csrf`):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
