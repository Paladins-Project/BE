# Database Configuration for EXE2

## Cấu hình kết nối MongoDB

Để đảm bảo ứng dụng kết nối đúng database `EXE2`, bạn cần tạo file `.env` trong thư mục root với nội dung sau:

```env
DBCONNECTIONSTRING=mongodb://localhost:27017/EXE2
SESSION_SECRET=your-session-secret-here
FE_PORT=3000
PORT=5000
COOKIE_SECRET=your-cookie-secret-here
```

## Các cách cấu hình Connection String

### 1. Local MongoDB
```
DBCONNECTIONSTRING=mongodb://localhost:27017/EXE2
```

### 2. MongoDB Atlas (Cloud)
```
DBCONNECTIONSTRING=mongodb+srv://username:password@cluster.mongodb.net/EXE2?retryWrites=true&w=majority
```

### 3. MongoDB với authentication
```
DBCONNECTIONSTRING=mongodb://username:password@localhost:27017/EXE2
```

## Kiểm tra kết nối

Sau khi cấu hình, chạy lệnh để kiểm tra:

```bash
# Chạy script kiểm tra database
node create-test-user.mjs

# Chạy server
npm run dev
```

Logs sẽ hiển thị:
```
✅ Connected to MongoDB successfully
📊 Database name: EXE2
```

## Lưu ý quan trọng

- **Database name phải là `EXE2`** - không phải `test`
- Nếu connection string không có database name, hệ thống sẽ tự động thêm `/EXE2`
- Nếu vẫn kết nối sai database, hệ thống sẽ tự động switch sang `EXE2`

## Troubleshooting

### Nếu vẫn hiển thị "Database name: test"
1. Kiểm tra connection string trong `.env`
2. Đảm bảo có `/EXE2` ở cuối connection string
3. Restart server sau khi thay đổi `.env`

### Tạo test user
```bash
node create-test-user.mjs
```

Test user được tạo:
- Email: `test@example.com`
- Password: `123456`
- Role: `parent` 