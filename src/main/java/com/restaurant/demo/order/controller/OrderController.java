package com.restaurant.demo.order.controller;

import com.restaurant.demo.order.dto.OrderRequest;
import com.restaurant.demo.order.dto.OrderResponse;
import com.restaurant.demo.order.dto.StatusUpdateRequest;
import com.restaurant.demo.order.entity.OrderStatus;
import com.restaurant.demo.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public Page<OrderResponse> list(
            Pageable pageable,
            @RequestParam(required = false) OrderStatus status) {
        if (status != null) {
            return orderService.listByStatus(status, pageable);
        }
        return orderService.list(pageable);
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) {
        return orderService.get(id);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return orderService.updateStatus(id, request);
    }
}