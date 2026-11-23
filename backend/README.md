# NCT Cinema Backend

Spring Boot 4.1.2 / JPA / MySQL (hoặc H2 local).

## Chạy nhanh

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

MySQL cần database `cinema_booking`:

```sql
CREATE DATABASE cinema_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Kiểm thử:

```powershell
.\mvnw.cmd test
```
