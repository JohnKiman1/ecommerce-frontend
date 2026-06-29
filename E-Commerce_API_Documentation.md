# E-Commerce API Documentation

## Overview

This API allows you to manage an e-commerce store, including products,
shopping cart, orders, and user management.

## Base URL

Production:

    https://your-render-app.onrender.com/api

Local:

    http://localhost:3000/api

## Authentication

Protected endpoints require authentication using the login endpoint.

Authentication type: - Session-based authentication - No tokens required
in this version

Protected areas: - Orders - Profile management - Cart operations -
Reviews - User management

------------------------------------------------------------------------

# Endpoints

## Health Check

### GET /status

Returns API status.

Example:

    GET /status

------------------------------------------------------------------------

# Products

## GET /products

Returns all products.

Query Parameters:

  Parameter   Description
  ----------- -----------------------------
  category    Filter by category
  minPrice    Minimum price
  maxPrice    Maximum price
  search      Search name and description
  sortBy      Field to sort
  sortOrder   asc or desc

Example:

    GET /products?category=clothing&minPrice=10&maxPrice=100&sortBy=price&sortOrder=asc

## GET /products/:id

Retrieve a specific product.

Example:

    GET /products/1

## POST /products

Create a product. Admin only.

Request body:

``` json
{
  "name": "Classic White T-Shirt",
  "price": 29.99,
  "description": "Premium cotton t-shirt",
  "category": "clothing",
  "in_stock": true,
  "sizes": ["S", "M", "L", "XL"]
}
```

Required: - name - price

Optional: - description - category - in_stock - sizes

## PUT /products/:id

Update product. Admin only.

Example:

``` json
{
  "name": "Updated T-Shirt Name",
  "price": 34.99
}
```

## DELETE /products/:id

Delete product. Admin only.

Example:

    DELETE /products/1

## GET /products/:id/reviews

Get product reviews.

## POST /products/:id/reviews

Submit review. Authentication required.

Body:

``` json
{
  "user_id": 1,
  "rating": 5,
  "comment": "Excellent product!"
}
```

------------------------------------------------------------------------

# Cart

## GET /cart/:userId

Retrieve user cart.

## POST /cart

Add item to cart.

Body:

``` json
{
  "user_id": 1,
  "product_id": 5,
  "quantity": 2,
  "size": "M"
}
```

## PUT /cart/:id

Update cart quantity.

``` json
{
  "quantity": 3
}
```

## DELETE /cart/:id

Remove cart item.

## DELETE /cart/user/:userId

Clear user cart.

------------------------------------------------------------------------

# Orders

## POST /orders

Create order.

Example:

``` json
{
  "user_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "total": 69.18,
  "payment_method": "credit_card"
}
```

## GET /orders/:userId

Get user orders.

## GET /orders/:userId/:orderId

Get specific order.

## PUT /orders/:id/status

Update order status.

Valid values:

-   pending
-   confirmed
-   processing
-   shipped
-   delivered
-   cancelled

Example:

``` json
{
  "status": "shipped"
}
```

------------------------------------------------------------------------

# Authentication

## POST /login

Login user.

Request:

``` json
{
  "username": "john_doe",
  "password": "secure_password"
}
```

Response:

``` json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "viewer"
  }
}
```

## POST /register

Create user account.

Example:

``` json
{
  "username": "jane_doe",
  "password": "secure_password",
  "email": "jane@example.com",
  "name": "Jane Doe"
}
```

------------------------------------------------------------------------

# Profile

## GET /profile/:userId

Retrieve profile.

## PUT /profile/:userId

Update profile.

Example:

``` json
{
  "email": "newemail@example.com",
  "phone": "555-123-4567"
}
```

------------------------------------------------------------------------

# Users (Admin)

## GET /users

Retrieve all users.

## PUT /users/:id/role

Update role.

Roles:

-   admin
-   viewer
-   locked

Example:

``` json
{
  "role": "admin"
}
```

## DELETE /users/:id

Delete user.

------------------------------------------------------------------------

# Database Reset

## POST /reset

Reset database to initial state.

------------------------------------------------------------------------

# Error Simulation

Add query parameters:

    ?simulate=500

Returns server error.

    ?simulate=slow

Adds 8 second delay.

Example:

    GET /products?simulate=500

------------------------------------------------------------------------

# Error Codes

  Code   Description
  ------ -----------------------
  200    Success
  201    Created
  400    Bad Request
  401    Unauthorized
  403    Forbidden
  404    Not Found
  409    Conflict
  500    Internal Server Error

------------------------------------------------------------------------

# Example Usage

## Login and Get Products

``` javascript
const loginResponse = await fetch('/api/login', {
 method:'POST',
 headers:{'Content-Type':'application/json'},
 body:JSON.stringify({
 username:'john_doe',
 password:'secure_password'
 })
});

const productsResponse = await fetch('/api/products');
```

## Add Cart Item and Create Order

``` javascript
await fetch('/api/cart',{
 method:'POST',
 headers:{'Content-Type':'application/json'},
 body:JSON.stringify({
 user_id:1,
 product_id:5,
 quantity:2
 })
});
```
