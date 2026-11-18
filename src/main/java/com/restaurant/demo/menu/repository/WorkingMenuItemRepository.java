package com.restaurant.demo.menu.repository;

import com.restaurant.demo.menu.entity.MenuCategory;
import com.restaurant.demo.menu.entity.WorkingMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkingMenuItemRepository extends JpaRepository<WorkingMenuItem, Long> {

    List<WorkingMenuItem> findByActiveTrueOrderByCategoryAscNameAsc();

    List<WorkingMenuItem> findByCategoryAndActiveTrueOrderByNameAsc(MenuCategory category);

    boolean existsByActiveTrue();

    Optional<WorkingMenuItem> findByMasterItemId(Long masterItemId);
}