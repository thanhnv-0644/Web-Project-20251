package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.service.interf.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<Response> getDashboard() {
        return ResponseEntity.ok(dashboardService.getFullDashboard());
    }
}
