# 📦 Công cụ Puppeteer Export JSON

Công cụ này giúp tự động mở trang [https://sme.bkt.net.vn](https://sme.bkt.net.vn), xử lý nội dung JSON có chứa video/audio/image (blob) và xuất ra file `exported.json` để sử dụng cho HTML Viewer.

---

## ✅ Yêu cầu

- Node.js v18 trở lên: [Tải tại đây](https://nodejs.org/)
- Máy kết nối Internet

---

## 🚀 Cách sử dụng

### Bước 1: Mở Terminal và cài thư viện

Mở terminal tại thư mục sau khi giải nén file `.zip`, gõ lệnh sau:

```bash
npm install
```

### Bước 2: Chạy công cụ

Sau khi cài xong, chạy:

```bash
node script.js
```

### Bước 3: Tải file JSON

- Trình duyệt sẽ tự mở trang web.
- Khi popup "Xuất JSON" hiện ra, bạn chỉ cần bấm nút **"Xuất file JSON"**.
- File `exported.json` sẽ tự động được tải về.

---

## 📂 Cấu trúc thư mục

```

├──puppeteer-script/
├──index.html           # Trình xem HTML nếu có
├── script.js                # File chính Puppeteer
├── package.json             # Danh sách dependency
├── README.md                # Hướng dẫn sử dụng
```

---

## ℹ️ Ghi chú

- Script sẽ tự động chuyển video/audio/image từ blob sang base64.
- File xuất ra (`exported.json`) dùng để hiển thị slide với media.
