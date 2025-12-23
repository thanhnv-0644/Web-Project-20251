package com.phegondev.Phegon.Eccormerce.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;

@Service
public class VietQrService {

    @Value("${vietqr.bank-bin}")
    private String bankBin; // ví dụ: 970415 (VietinBank) / 970436 (Vietcombank)...

    @Value("${vietqr.account-no}")
    private String accountNo;

    @Value("${vietqr.account-name}")
    private String accountName;

    /**
     * Trả về URL ảnh QR VietQR (front chỉ cần <img src="...">)
     */
    public String buildQrImageUrl(BigDecimal amount, String transferContent) {
        // Một số hệ thống VietQR cho phép query param như dưới.
        // Bạn có thể đổi endpoint theo hệ thống VietQR bạn dùng.
        return UriComponentsBuilder
                .fromHttpUrl("https://img.vietqr.io/image/{bin}-{acc}-compact2.png")
                .buildAndExpand(bankBin, accountNo)
                .toUriString()
                + "?amount=" + amount.toPlainString()
                + "&addInfo=" + urlEncode(transferContent)
                + "&accountName=" + urlEncode(accountName);
    }

    private String urlEncode(String s) {
        return s == null ? "" : s.replace(" ", "%20");
    }
}

