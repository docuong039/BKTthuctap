const puppeteer = require("puppeteer");
// Khởi động Puppeteer và mở trang
(async () => {
  console.log("Đang khởi động trình duyệt...");
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log("Đang mở trang https://sme.bkt.net.vn/...");
  await page.goto("https://sme.bkt.net.vn/", { waitUntil: "networkidle2" });

  // Chờ nút "Xuất JSON" xuất hiện và xử lý tự động
  await page.evaluate(() => {
    // Hàm chờ một khoảng thời gian (ms)
    const waitForTimeout = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Hàm tải file JSON thủ công
    const downloadJsonFile = (jsonData, fileName) => {
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "exported.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Hàm chuyển đổi blob URL sang base64
    const convertBlobToBase64 = async (blobUrl) => {
      try {
        const response = await fetch(blobUrl);
        if (!response.ok) {
          throw new Error(`Không thể tải blob URL: ${response.statusText}`);
        }
        const blob = await response.blob();
        const base64String = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        return base64String;
      } catch (error) {
        console.error(`Lỗi khi chuyển blob sang base64 cho ${blobUrl}:`, error);
        return null;
      }
    };

    // Hàm kiểm tra và xử lý khi nút "Xuất JSON" xuất hiện
    const waitForExportJsonButton = async () => {
      // Selector chính xác của nút "Xuất JSON"
      const exportJsonSelector =
        "body > div:nth-child(11) > div.modal-content > div > div.tabs.card > div:nth-child(4)";
      const exportJsonTab = document.querySelector(exportJsonSelector);

      if (exportJsonTab) {
        console.log('Đã tìm thấy nút "Xuất JSON", đang kích hoạt tab...');

        // Tự động nhấp vào nút "Xuất JSON" để tải nội dung JSON
        exportJsonTab.click();
        console.log('Đã nhấp vào nút "Xuất JSON" để tải nội dung JSON!');

        // Chờ 1 giây để đảm bảo nội dung JSON được tải
        await waitForTimeout(1000);

        // Chờ nút "Xuất file JSON" và nội dung JSON xuất hiện
        const waitForExportFileAndJsonContent = async () => {
          // Selector chính xác của nút "Xuất file JSON"
          const exportFileSelector =
            "body > div:nth-child(11) > div.modal-content > div > div.content > div > div.btns > button.button.primary.btn.export";
          const exportFileBtn = document.querySelector(exportFileSelector);

          // Selector chính xác của phần tử <pre> chứa JSON
          const previewSelector =
            "body > div:nth-child(11) > div.modal-content > div > div.content > div > div.preview > pre";
          const previewElement = document.querySelector(previewSelector);

          if (exportFileBtn && previewElement) {
            console.log(
              'Đã tìm thấy nút "Xuất file JSON" và nội dung JSON, bắt đầu xử lý...'
            );

            // Đọc nội dung JSON
            const jsonText = previewElement.textContent;
            let jsonData;
            try {
              jsonData = JSON.parse(jsonText);
            } catch (error) {
              console.error("Lỗi khi parse JSON:", error);
              return;
            }

            let videoFound = false;
            let audioFound = false;
            let imageFound = false;

            // Duyệt qua các slide và phần tử để xử lý video, audio, image
            for (const slide of jsonData) {
              for (const element of slide.elements) {
                if (
                  element.type === "video" &&
                  element.src &&
                  element.src.startsWith("blob:")
                ) {
                  videoFound = true;
                  const blobUrl = element.src;
                  console.log("Video Blob URL:", blobUrl);
                  console.log("Đang chuyển video từ blob sang base64...");

                  const base64String = await convertBlobToBase64(blobUrl);
                  if (base64String) {
                    element.src = base64String;
                    console.log("Đã chuyển video sang base64 thành công!");
                  } else {
                    console.error(
                      "Không thể chuyển video blob URL sang base64!"
                    );
                  }
                } else if (
                  element.type === "audio" &&
                  element.src &&
                  element.src.startsWith("blob:")
                ) {
                  audioFound = true;
                  const blobUrl = element.src;
                  console.log("Audio Blob URL:", blobUrl);
                  console.log("Đang chuyển audio từ blob sang base64...");

                  const base64String = await convertBlobToBase64(blobUrl);
                  if (base64String) {
                    element.src = base64String;
                    console.log("Đã chuyển audio sang base64 thành công!");
                  } else {
                    console.error(
                      "Không thể chuyển audio blob URL sang base64!"
                    );
                  }
                } else if (
                  element.type === "image" &&
                  element.src &&
                  element.src.startsWith("blob:")
                ) {
                  imageFound = true;
                  const blobUrl = element.src;
                  console.log("Image Blob URL:", blobUrl);
                  console.log("Đang chuyển image từ blob sang base64...");

                  const base64String = await convertBlobToBase64(blobUrl);
                  if (base64String) {
                    element.src = base64String;
                    console.log("Đã chuyển image sang base64 thành công!");
                  } else {
                    console.error(
                      "Không thể chuyển image blob URL sang base64!"
                    );
                  }
                }
              }
            }

            // Thông báo nếu không tìm thấy loại phần tử nào
            if (!videoFound && !audioFound && !imageFound) {
              console.log("Không tìm thấy video, audio hoặc image trong JSON!");
            } else {
              if (videoFound) console.log("Đã xử lý tất cả video.");
              if (audioFound) console.log("Đã xử lý tất cả audio.");
              if (imageFound) console.log("Đã xử lý tất cả image.");
            }

            // Cập nhật nội dung JSON trong <pre>
            previewElement.textContent = JSON.stringify(jsonData, null, 2);
            console.log("Đã cập nhật JSON với base64!");

            // Chặn sự kiện nhấp chuột vào nút "Xuất file JSON" và thay thế bằng tải file exported.json
            exportFileBtn.addEventListener("click", (event) => {
              event.preventDefault(); // Chặn hành động mặc định của nút
              console.log(
                'Người dùng đã nhấp vào nút "Xuất file JSON", đang tải file exported.json...'
              );
              downloadJsonFile(jsonData, "exported.json");
              console.log("Đã tải file exported.json thay vì file gốc!");
            });

            console.log(
              'Đã thiết lập chặn sự kiện nhấp chuột cho nút "Xuất file JSON". Vui lòng nhấp thủ công để tải file exported.json.'
            );
          } else {
            // Nếu chưa tìm thấy nút "Xuất file JSON" hoặc nội dung JSON, thử lại sau 500ms
            setTimeout(waitForExportFileAndJsonContent, 500);
          }
        };

        // Bắt đầu kiểm tra nút "Xuất file JSON" và nội dung JSON
        waitForExportFileAndJsonContent();
      } else {
        // Nếu chưa tìm thấy nút "Xuất JSON", thử lại sau 500ms
        setTimeout(waitForExportJsonButton, 500);
      }
    };

    // Bắt đầu kiểm tra
    waitForExportJsonButton();
  });

  console.log('Đang chờ nút "Xuất JSON" xuất hiện để xử lý.');
})();
