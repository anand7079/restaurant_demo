package com.restaurant.demo.order.service;

import com.restaurant.demo.menu.entity.MenuItem;
import com.restaurant.demo.menu.entity.WorkingMenuItem;
import com.restaurant.demo.menu.repository.MenuItemRepository;
import com.restaurant.demo.menu.repository.WorkingMenuItemRepository;
import com.restaurant.demo.order.dto.OrderItemResponse;
import com.restaurant.demo.order.dto.OrderRequest;
import com.restaurant.demo.order.dto.OrderResponse;
import com.restaurant.demo.order.dto.StatusUpdateRequest;
import com.restaurant.demo.order.entity.Order;
import com.restaurant.demo.order.entity.OrderItem;
import com.restaurant.demo.order.entity.OrderStatus;
import com.restaurant.demo.order.entity.Portion;
import com.restaurant.demo.order.mapper.OrderMapper;
import com.restaurant.demo.order.repository.OrderItemRepository;
import com.restaurant.demo.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final WorkingMenuItemRepository workingMenuItemRepository;
    private final OrderMapper orderMapper;

    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            OrderItem orderItem = createOrderItem(itemRequest);
            orderItem.setOrder(order);
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getTotalPrice());
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order saved = orderRepository.save(order);
        return orderMapper.toResponse(saved);
    }

    private OrderItem createOrderItem(OrderRequest.OrderItemRequest itemRequest) {
        Long menuItemId = itemRequest.getMenuItemId();
        Portion portion = itemRequest.getPortion();
        Integer quantity = itemRequest.getQuantity();
        Boolean useOffer = itemRequest.getUseOffer() != null && itemRequest.getUseOffer();

        WorkingMenuItem workingItem = workingMenuItemRepository.findById(menuItemId).orElse(null);
        
        // If no working item, try to find master item
        MenuItem masterItem = null;
        if (workingItem == null) {
            masterItem = menuItemRepository.findById(menuItemId)
                    .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + menuItemId));
        } else if (!workingItem.getIsOverride()) {
            // Working item is a copy of master, try to find master for reference
            masterItem = menuItemRepository.findById(menuItemId).orElse(null);
        }

        OrderItem orderItem = new OrderItem();
        orderItem.setMenuItemId(menuItemId);
        
        // Use working menu item details if available, otherwise fall back to master
        if (workingItem != null) {
            orderItem.setName(workingItem.getName());
            orderItem.setCategory(workingItem.getCategory());
        } else if (masterItem != null) {
            orderItem.setName(masterItem.getName());
            orderItem.setCategory(masterItem.getCategory());
        } else {
            throw new IllegalArgumentException("Menu item not found: " + menuItemId);
        }
        
        orderItem.setPortion(portion);
        orderItem.setQuantity(quantity);

        BigDecimal unitPrice;
        Boolean offerApplied = false;
        String offerLabel = null;

        if (useOffer && workingItem != null && workingItem.getOfferPriceFull() != null) {
            if (portion == Portion.FULL && workingItem.getOfferPriceFull() != null) {
                unitPrice = workingItem.getOfferPriceFull();
                offerApplied = true;
                offerLabel = workingItem.getOfferLabel();
            } else if (portion == Portion.HALF && workingItem.getOfferPriceHalf() != null) {
                unitPrice = workingItem.getOfferPriceHalf();
                offerApplied = true;
                offerLabel = workingItem.getOfferLabel();
            } else {
                unitPrice = getRegularPrice(masterItem, workingItem, portion);
            }
        } else {
            unitPrice = getRegularPrice(masterItem, workingItem, portion);
        }

        orderItem.setUnitPrice(unitPrice);
        orderItem.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        orderItem.setOfferApplied(offerApplied);
        orderItem.setOfferLabel(offerLabel);

        return orderItem;
    }

    private BigDecimal getRegularPrice(MenuItem masterItem, WorkingMenuItem workingItem, Portion portion) {
        if (workingItem != null) {
            return portion == Portion.FULL ? workingItem.getPriceFull() : workingItem.getPriceHalf();
        }
        if (masterItem != null) {
            return portion == Portion.FULL ? masterItem.getPriceFull() : masterItem.getPriceHalf();
        }
        throw new IllegalArgumentException("No price available for menu item");
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> list(Pageable pageable) {
        return orderRepository.findAll(pageable).map(orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable).map(orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse get(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, StatusUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        order.setStatus(request.getStatus());
        Order saved = orderRepository.save(order);
        return orderMapper.toResponse(saved);
    }
}