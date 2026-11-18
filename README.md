# Restaurant Demo – Restaurant Management System

A backend and frontend application for managing restaurant operations, including master menu management, working menu overrides, offer management, and order processing.

Built using **Java 25, Spring Boot 4.1.2, Spring Data JPA, Hibernate, PostgreSQL 16, Flyway, React, TypeScript, and Vite**.

The project follows a layered architecture with a focus on maintainability, scalability, and RESTful API development.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Application Architecture](#application-architecture)
5. [Project Structure](#project-structure)
6. [Database Design](#database-design)
7. [API Documentation](#api-documentation)
8. [Getting Started](#getting-started)
9. [Database Migration](#database-migration)
10. [Frontend Overview](#frontend-overview)
11. [Development Roadmap](#development-roadmap)
12. [Development Guidelines](#development-guidelines)

---

## 1. Project Overview

The Restaurant Demo is designed to provide a complete backend and frontend system for managing restaurant menu and order operations.

The application demonstrates a **master/working menu pattern** where:
- Master menu represents the canonical menu items
- Working menu is a copy created on first modification for daily operations
- Offers can only be applied to working menu items
- Current menu returns working menu items when present, otherwise falls back to master
- Reset operations discard working menu changes and revert to master

The backend exposes REST APIs consumed by a React + TypeScript + Vite frontend application.

### Primary Objectives

- Build a modular and maintainable full-stack application
- Implement RESTful APIs using Spring Boot
- Manage relational data using PostgreSQL and Spring Data JPA
- Maintain database schema changes through Flyway
- Follow DTO-based request and response handling
- Demonstrate master/working menu pattern with overrides and offers
- Support order placement with working menu pricing and offers

---

## 2. Key Features

### Implemented

| Feature | Description |
|---|---|
| Master Menu Management | CRUD operations for master menu items (categories: VEG, NON_VEG) |
| Working Menu Overrides | Create working menu copies on first modification; supports custom items and overrides |
| Offer Management | Apply/remove offers on working menu items (full/half portion pricing) |
| Current Menu | Returns working menu items when present, otherwise master items with source indicator |
| Reset Operations | Reset offers only or full working menu reset to master |
| Order Processing | Place orders with working menu pricing; supports offer application |
| Order Status Management | Update order status (PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED) |
| Paginated APIs | All list endpoints support pagination |
| DTO Architecture | Separate API request/response objects from JPA entities |
| Database Migration | Flyway-managed database schema |
| Data Validation | Jakarta Bean Validation for request DTOs |
| CORS Configuration | Configured for frontend origin |
| Frontend UI | React + TypeScript + Vite with menu and orders views |

### Planned

- Restaurant registration and multi-restaurant support
- Table management and reservations
- Kitchen display system (KDS) integration
- Payment processing integration
- Inventory and stock management
- Reporting and analytics
- JWT-based authentication and role-based access
- Docker-based deployment
- Unit and integration testing

---

## 3. Technology Stack

### Backend

| Technology | Purpose |
|---|---|
| Java 25 | Primary programming language |
| Spring Boot 4.1.2 | Application framework |
| Spring Web | REST API development |
| Spring Data JPA | Database access and repository abstraction |
| Hibernate | ORM implementation |
| PostgreSQL 16 | Relational database |
| Flyway | Database version control and migrations |
| Jakarta Bean Validation | Request validation |
| Lombok | Reduces boilerplate code |
| Maven | Dependency management and build automation |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI library |
| TypeScript | Type-safe JavaScript |
| Vite | Build tool and dev server |
| React Router | Client-side routing |
| CSS Modules / Plain CSS | Styling |

---

## 4. Application Architecture

The application follows a layered architecture.

### Request Flow

```text
React Frontend (Vite)
          |
          v
    REST Controller
          |
          v
      DTO Layer
          |
          v
     Service Layer
          |
          v
  Repository Layer
          |
          v
   Hibernate / JPA
          |
          v
      PostgreSQL
```

### Layer Responsibilities

**1. Controller Layer**
- Exposes REST endpoints
- Receives HTTP requests
- Validates incoming request DTOs
- Delegates business operations to services
- Returns appropriate HTTP responses

**2. DTO Layer**
- Defines request and response structures
- Prevents direct exposure of database entities
- Controls which fields are accepted and returned by APIs

**3. Service Layer**
- Contains business logic
- Performs validations and business-rule checks
- Coordinates repository operations
- Manages transaction boundaries
- Converts entities into response DTOs through mappers

**4. Repository Layer**
- Handles database operations
- Uses Spring Data JPA repositories
- Provides CRUD operations and custom query methods

**5. Entity Layer**
- Represents database tables
- Defines entity relationships
- Maps Java objects to PostgreSQL records using JPA annotations

**6. Mapper Layer**
- Converts JPA entities into response DTOs
- Keeps entity-to-response conversion separate from business logic

**7. Config Layer**
- Contains application configuration and reusable Spring beans
- Includes CORS configuration and exception handling

---

## 5. Project Structure

The project uses feature-based packages with separate architectural layers.

```text
restaurant_demo/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── restaurant/
│   │   │           └── demo/
│   │   │
│   │   │                   ├── config/
│   │   │                   │   ├── SecurityConfig.java
│   │   │                   │   └── ApiExceptionHandler.java
│   │   │
│   │   │                   ├── menu/
│   │   │                   │   ├── controller/
│   │   │                   │   │   ├── MasterMenuController.java
│   │   │                   │   │   └── MenuController.java
│   │   │                   │   │
│   │   │                   │   ├── dto/
│   │   │                   │   │   ├── MenuItemRequest.java
│   │   │                   │   │   ├── MenuItemResponse.java
│   │   │                   │   │   ├── WorkingMenuItemRequest.java
│   │   │                   │   │   ├── WorkingMenuItemResponse.java
│   │   │                   │   │   ├── CurrentMenuItemResponse.java
│   │   │                   │   │   └── OfferRequest.java
│   │   │                   │   │
│   │   │                   │   ├── entity/
│   │   │                   │   │   ├── MenuItem.java
│   │   │                   │   │   └── WorkingMenuItem.java
│   │   │                   │   │
│   │   │                   │   ├── mapper/
│   │   │                   │   │   ├── MenuItemMapper.java
│   │   │                   │   │   ├── WorkingMenuItemMapper.java
│   │   │                   │   │   └── CurrentMenuItemMapper.java
│   │   │                   │   │
│   │   │                   │   ├── repository/
│   │   │                   │   │   ├── MenuItemRepository.java
│   │   │                   │   │   └── WorkingMenuItemRepository.java
│   │   │                   │   │
│   │   │                   │   └── service/
│   │   │                   │       ├── MasterMenuService.java
│   │   │                   │       └── WorkingMenuService.java
│   │   │                   │
│   │   │                   ├── order/
│   │   │                   │   ├── controller/
│   │   │                   │   │   └── OrderController.java
│   │   │                   │   │
│   │   │                   │   ├── dto/
│   │   │                   │   │   ├── OrderRequest.java
│   │   │                   │   │   ├── OrderResponse.java
│   │   │                   │   │   ├── OrderItemRequest.java
│   │   │                   │   │   └── OrderItemResponse.java
│   │   │                   │   │
│   │   │                   │   ├── entity/
│   │   │                   │   │   ├── Order.java
│   │   │                   │   │   └── OrderItem.java
│   │   │                   │   │
│   │   │                   │   ├── mapper/
│   │   │                   │   │   ├── OrderMapper.java
│   │   │                   │   │   └── OrderItemMapper.java
│   │   │                   │   │
│   │   │                   │   ├── repository/
│   │   │                   │   │   ├── OrderRepository.java
│   │   │                   │   │   └── OrderItemRepository.java
│   │   │                   │   │
│   │   │                   │   └── service/
│   │   │                   │       └── OrderService.java
│   │   │                   │
│   │   │                   └── DemoApplication.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/
│   │           └── migration/
│   │               ├── V1__create_restaurants_table.sql
│   │               ├── V2__create_menu_items_table.sql
│   │               ├── V3__create_working_menu_items_table.sql
│   │               └── V4__create_orders_tables.sql
│   │
│   └── test/
│
├── frontend/
│   ├── src/
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── style.css
│   │   └── views/
│   │       ├── MenuView.tsx
│   │       └── OrdersView.tsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── pom.xml
├── README.md
└── Deployment_details.md
```

---

## 6. Database Design

The application uses PostgreSQL as its relational database.

Flyway manages all database schema changes through versioned SQL migration scripts.

### Database Tables

| Table | Purpose |
|---|---|
| restaurants | Stores restaurant information (single-restaurant demo) |
| menu_items | Stores master menu items |
| working_menu_items | Stores working menu overrides and custom items |
| orders | Stores customer orders |
| order_items | Stores individual order line items |

### Entity Relationships

**Restaurant and Menu Items**
- One restaurant can have multiple menu items
- Each menu item belongs to one restaurant
- Relationship: `One-to-Many`

**Menu Items and Working Menu Items**
- Working menu items reference master menu items by ID (not FK for overrides)
- Working items can be overrides (copies) or custom additions
- Relationship: Logical reference by ID

**Orders and Order Items**
- One order can have multiple order items
- Each order item belongs to one order
- Order items reference menu item IDs (master or working)
- Relationship: `One-to-Many`

### Database Relationship Diagram

```text
           RESTAURANTS
                |
                | 1
                |
                | N
          MENU_ITEMS
                |
                | (logical reference by ID)
                |
       WORKING_MENU_ITEMS
                |
                |
                |
             ORDERS
                |
                | 1
                |
                | N
          ORDER_ITEMS
                |
                | (references menu item ID)
                |
        (MENU_ITEMS / WORKING_MENU_ITEMS)
```

### Flyway Migrations

| Version | Migration File | Description |
|---|---|---|
| V1 | V1__create_restaurants_table.sql | Creates restaurants table with sample data |
| V2 | V2__create_menu_items_table.sql | Creates menu_items table with sample master menu |
| V3 | V3__create_working_menu_items_table.sql | Creates working_menu_items table for overrides |
| V4 | V4__create_orders_tables.sql | Creates orders and order_items tables |

### Database Design Decisions

- Menu categories: `VEG` | `NON_VEG`
- Portions: `FULL` | `HALF`
- Order statuses: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`
- Working menu items track `is_override` flag to distinguish copies from custom items
- Offers stored on working menu items only (not master)
- Order items capture name, category, and price at time of order for audit trail
- `spring.jpa.hibernate.ddl-auto=none` - Flyway owns schema management

---

## 7. API Documentation

Base URL:
```text
http://localhost:8080
```

### Current Menu APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/menu/current` | Get current menu (working if present, else master) |
| POST | `/api/v1/menu/current/working` | Add item to working menu |
| DELETE | `/api/v1/menu/current/working/{id}` | Remove item from working menu |
| POST | `/api/v1/menu/current/offers` | Apply offer to working menu item |
| DELETE | `/api/v1/menu/current/offers` | Reset all offers on working menu |
| POST | `/api/v1/menu/current/reset` | Reset entire working menu to master |

#### Get Current Menu

```http
GET /api/v1/menu/current
```

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "category": "VEG",
    "subcategory": "Starters",
    "name": "Paneer Tikka",
    "priceFull": 250.00,
    "priceHalf": 150.00,
    "offerPriceFull": null,
    "offerPriceHalf": null,
    "offerLabel": null,
    "isOverride": false,
    "active": true,
    "source": "MASTER"
  },
  {
    "id": 2,
    "category": "VEG",
    "subcategory": "Main Course",
    "name": "Veg Biryani",
    "priceFull": 300.00,
    "priceHalf": 180.00,
    "offerPriceFull": 250.00,
    "offerPriceHalf": 150.00,
    "offerLabel": "Lunch Special",
    "isOverride": true,
    "active": true,
    "source": "WORKING"
  }
]
```

#### Add to Working Menu

```http
POST /api/v1/menu/current/working
Content-Type: application/json

{
  "category": "VEG",
  "subcategory": "Main Course",
  "name": "Veg Biryani",
  "priceFull": 300,
  "priceHalf": 180
}
```

**Response (201 Created)** - Returns created working menu item

#### Apply Offer

```http
POST /api/v1/menu/current/offers
Content-Type: application/json

{
  "itemId": 2,
  "offerPriceFull": 250,
  "offerPriceHalf": 150,
  "offerLabel": "Lunch Special"
}
```

**Response (200 OK)** - Returns updated working menu item with offer

---

### Master Menu APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/menu/master` | Get paginated master menu |
| POST | `/api/v1/menu/master` | Create master menu item |
| PUT | `/api/v1/menu/master/{id}` | Update master menu item |
| DELETE | `/api/v1/menu/master/{id}` | Delete master menu item |

#### Create Master Menu Item

```http
POST /api/v1/menu/master
Content-Type: application/json

{
  "category": "VEG",
  "subcategory": "Starters",
  "name": "Paneer Tikka",
  "priceFull": 250,
  "priceHalf": 150
}
```

---

### Order APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/orders` | Get paginated orders (optional status filter) |
| POST | `/api/v1/orders` | Place new order |
| GET | `/api/v1/orders/{id}` | Get order by ID |
| PATCH | `/api/v1/orders/{id}/status` | Update order status |

#### Place Order

```http
POST /api/v1/orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "1234567890",
  "items": [
    {
      "menuItemId": 2,
      "portion": "FULL",
      "quantity": 1,
      "useOffer": true
    }
  ]
}
```

**Response (201 Created)**
```json
{
  "id": 1,
  "customerName": "John Doe",
  "customerPhone": "1234567890",
  "status": "PENDING",
  "totalAmount": 250.00,
  "createdAt": "2026-11-18T10:30:00",
  "updatedAt": null,
  "items": [
    {
      "id": 1,
      "menuItemId": 2,
      "name": "Veg Biryani",
      "category": "VEG",
      "portion": "FULL",
      "quantity": 1,
      "unitPrice": 250.00,
      "totalPrice": 250.00,
      "offerApplied": true,
      "offerLabel": "Lunch Special"
    }
  ]
}
```

#### Update Order Status

```http
PATCH /api/v1/orders/1/status?status=CONFIRMED
```

---

## 8. Getting Started

### Prerequisites

- Java Development Kit (JDK) 25
- Maven
- PostgreSQL 16
- Node.js 20+ and npm
- IntelliJ IDEA / Eclipse / VS Code
- Postman (for API testing)

### Step 1: Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd restaurant_demo
```

### Step 2: Create PostgreSQL Database

```sql
CREATE DATABASE restaurant_demo;
```

### Step 3: Configure Database Connection

Update `src/main/resources/application.properties`:

```properties
spring.application.name=demo

spring.datasource.url=jdbc:postgresql://localhost:5432/restaurant_demo
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=0

app.cors.allowed-origins=http://localhost:5173

server.port=8080
```

### Step 4: Build and Run Backend

```bash
# Using Maven wrapper
./mvnw clean compile
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`. Flyway executes migrations automatically on startup.

### Step 5: Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

### Step 6: Verify

- Backend: `http://localhost:8080/api/v1/menu/current`
- Frontend: `http://localhost:5173`

---

## 9. Database Migration

Flyway manages database schema. Migration scripts are in:
```
src/main/resources/db/migration/
```

### Migration Naming Convention
```text
V1__create_restaurants_table.sql
V2__create_menu_items_table.sql
V3__create_working_menu_items_table.sql
V4__create_orders_tables.sql
```

### Important Rules

1. Never modify a migration already applied
2. Create new versioned migration for schema changes
3. Keep `spring.jpa.hibernate.ddl-auto=none` for Flyway ownership
4. Hibernate validates entity mappings against schema

---

## 10. Frontend Overview

The React frontend provides two main views:

### Menu View (`/menu`)
- Displays current menu in a table (master + working items)
- Shows source badge (MASTER/WORKING) and offer indicators
- Add items to working menu via modal form
- Apply/remove offers on working items
- Reset offers or full working menu
- Remove working menu items

### Orders View (`/orders`)
- Paginated order list with status filter
- Place new orders with item selection (from current menu)
- Quantity, portion (FULL/HALF), and offer toggle
- View order details and update status
- Real-time total calculation

### API Integration
- Centralized `api.ts` with typed requests/responses
- `PageResponse<T>` pattern for pagination
- `ApiError` class for consistent error handling
- Environment variable `VITE_API_BASE_URL` for backend URL

---

## 11. Development Roadmap

| Milestone | Module / Feature | Status |
|---|---|---|
| 1 | Spring Boot project setup, PostgreSQL, Flyway | Completed |
| 2 | Master menu CRUD APIs | Completed |
| 3 | Working menu overrides, offers, reset | Completed |
| 4 | Order placement with working menu pricing | Completed |
| 5 | Order status management | Completed |
| 6 | React frontend with menu and orders views | Completed |
| 7 | CORS configuration and integration testing | Completed |
| 8 | Restaurant registration & multi-restaurant | Planned |
| 9 | Table management & reservations | Planned |
| 10 | Kitchen display system (KDS) | Planned |
| 11 | Payment integration | Planned |
| 12 | Inventory management | Planned |
| 13 | JWT authentication & RBAC | Planned |
| 14 | Docker deployment | Planned |
| 15 | Unit & integration tests | Planned |

---

## 12. Development Guidelines

### Coding Standards

- Use meaningful class, method, and variable names
- Keep controllers focused on HTTP handling
- Place business logic in service classes
- Use repositories for database operations
- Use DTOs for API requests/responses
- Use mappers for entity-to-DTO conversion
- Apply `@Transactional` at service layer
- Keep database migrations version-controlled

### Database Standards

- Use PostgreSQL as primary database
- Use Flyway for schema management
- Define appropriate primary and foreign keys
- Add unique constraints for business-critical fields
- Add indexes for frequently queried columns
- Use enums for category, portion, status fields

### Security Standards

- Never commit credentials or secrets to source control
- Use environment variables for database configuration
- Configure CORS for specific frontend origins only
- Validate all incoming requests

---

## Project Status

**Current phase:** Full-stack foundation complete with backend APIs and React frontend.

Master menu, working menu overrides, offers, order placement, and order management are implemented and tested. The frontend provides menu management and order processing UIs.

---

## Author

**MASHCOD Technologies**

Restaurant Demo – Full-Stack Development

**Technology:** Java | Spring Boot | PostgreSQL | Spring Data JPA | Hibernate | Flyway | React | TypeScript | Vite