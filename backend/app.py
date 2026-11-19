from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_db_connection
from mysql.connector import Error

app = Flask(__name__)
CORS(app)


# -------------------------
# DASHBOARD API
# -------------------------
@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) AS total_products FROM products")
    products = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) AS total_orders FROM orders")
    orders = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) AS total_customers FROM customers")
    customers = cursor.fetchone()

    cursor.execute("""
        SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
        FROM orders
        WHERE status != 'CANCELLED'
    """)
    revenue = cursor.fetchone()

    cursor.execute("""
        SELECT
            COUNT(*) AS total_products,
            SUM(CASE WHEN stock_quantity > 10 THEN 1 ELSE 0 END) AS in_stock,
            SUM(CASE WHEN stock_quantity BETWEEN 1 AND 10 THEN 1 ELSE 0 END) AS low_stock,
            SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) AS out_of_stock
        FROM products
    """)
    inventory = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({
        "products": products,
        "orders": orders,
        "customers": customers,
        "revenue": revenue,
        "inventory": inventory
    })


# -------------------------
# RECENT ORDERS API
# -------------------------
@app.route("/api/orders", methods=["GET"])
def get_orders():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            o.order_id,
            c.customer_name,
            o.order_date,
            o.status,
            o.total_amount,
            GROUP_CONCAT(p.product_name SEPARATOR ', ') AS products
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        GROUP BY
            o.order_id,
            c.customer_name,
            o.order_date,
            o.status,
            o.total_amount
        ORDER BY o.order_date DESC
    """)

    orders = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(orders)


# -------------------------
# PRODUCTS API
# -------------------------
@app.route("/api/products", methods=["GET"])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
       SELECT
    p.product_id,
    p.product_name,
    p.category_id,
    p.supplier_id,
    p.price,
    p.stock_quantity,
    p.description,
    c.category_name,
    s.supplier_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN suppliers s ON p.supplier_id = s.supplier_id
ORDER BY p.product_id
    """)

    products = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(products)

# ADD PRODUCT API
@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        INSERT INTO products
        (product_name, category_id, supplier_id, price,
         stock_quantity, description)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    values = (
        data["product_name"],
        data["category_id"],
        data["supplier_id"],
        data["price"],
        data["stock_quantity"],
        data.get("description", "")
    )

    cursor.execute(sql, values)
    conn.commit()

    product_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Product added successfully",
        "product_id": product_id
    }), 201


# UPDATE PRODUCT API
@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        UPDATE products
        SET product_name = %s,
            category_id = %s,
            supplier_id = %s,
            price = %s,
            stock_quantity = %s,
            description = %s
        WHERE product_id = %s
    """

    values = (
        data["product_name"],
        data["category_id"],
        data["supplier_id"],
        data["price"],
        data["stock_quantity"],
        data.get("description", ""),
        product_id
    )

    cursor.execute(sql, values)
    conn.commit()

    updated = cursor.rowcount

    cursor.close()
    conn.close()

    if updated == 0:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product updated successfully"})


# DELETE PRODUCT API
@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM products WHERE product_id = %s",
        (product_id,)
    )

    deleted = cursor.rowcount
    conn.commit()

    cursor.close()
    conn.close()

    if deleted == 0:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product deleted successfully"})
# -------------------------
# CATEGORIES API
# -------------------------
@app.route("/api/categories", methods=["GET"])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM categories")
    categories = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(categories)


# -------------------------
# SUPPLIERS API
# -------------------------
@app.route("/api/suppliers", methods=["GET"])
def get_suppliers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM suppliers")
    suppliers = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(suppliers)

# ADD CATEGORY
@app.route("/api/categories", methods=["POST"])
def add_category():
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO categories (category_name, description) VALUES (%s, %s)",
        (data["category_name"], data.get("description", ""))
    )

    conn.commit()
    category_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Category added successfully",
        "category_id": category_id
    }), 201


# UPDATE CATEGORY
@app.route("/api/categories/<int:category_id>", methods=["PUT"])
def update_category(category_id):
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """UPDATE categories
           SET category_name = %s, description = %s
           WHERE category_id = %s""",
        (data["category_name"], data.get("description", ""), category_id)
    )

    conn.commit()
    updated = cursor.rowcount

    cursor.close()
    conn.close()

    if updated == 0:
        return jsonify({"message": "Category not found"}), 404

    return jsonify({"message": "Category updated successfully"})


# DELETE CATEGORY
@app.route("/api/categories/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM categories WHERE category_id = %s",
        (category_id,)
    )

    deleted = cursor.rowcount
    conn.commit()

    cursor.close()
    conn.close()

    if deleted == 0:
        return jsonify({"message": "Category not found"}), 404

    return jsonify({"message": "Category deleted successfully"})

# ADD SUPPLIER
@app.route("/api/suppliers", methods=["POST"])
def add_supplier():
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO suppliers
        (supplier_name, phone, email, address)
        VALUES (%s, %s, %s, %s)
    """, (
        data["supplier_name"],
        data.get("phone", ""),
        data.get("email", ""),
        data.get("address", "")
    ))

    conn.commit()
    supplier_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Supplier added successfully",
        "supplier_id": supplier_id
    }), 201


# UPDATE SUPPLIER
@app.route("/api/suppliers/<int:supplier_id>", methods=["PUT"])
def update_supplier(supplier_id):
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE suppliers
        SET supplier_name = %s,
            phone = %s,
            email = %s,
            address = %s
        WHERE supplier_id = %s
    """, (
        data["supplier_name"],
        data.get("phone", ""),
        data.get("email", ""),
        data.get("address", ""),
        supplier_id
    ))

    conn.commit()
    updated = cursor.rowcount

    cursor.close()
    conn.close()

    if updated == 0:
        return jsonify({"message": "Supplier not found"}), 404

    return jsonify({"message": "Supplier updated successfully"})


# DELETE SUPPLIER
@app.route("/api/suppliers/<int:supplier_id>", methods=["DELETE"])
def delete_supplier(supplier_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM suppliers WHERE supplier_id = %s",
        (supplier_id,)
    )

    deleted = cursor.rowcount
    conn.commit()

    cursor.close()
    conn.close()

    if deleted == 0:
        return jsonify({"message": "Supplier not found"}), 404

    return jsonify({"message": "Supplier deleted successfully"})
# GET ALL CUSTOMERS
@app.route("/api/customers", methods=["GET"])
def get_customers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM customers ORDER BY customer_id")
    customers = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(customers)

# ADD CUSTOMER
@app.route("/api/customers", methods=["POST"])
def add_customer():
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO customers
        (customer_name, email, phone, address)
        VALUES (%s, %s, %s, %s)
    """, (
        data["customer_name"],
        data.get("email", ""),
        data.get("phone", ""),
        data.get("address", "")
    ))

    conn.commit()
    customer_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Customer added successfully",
        "customer_id": customer_id
    }), 201


# UPDATE CUSTOMER
@app.route("/api/customers/<int:customer_id>", methods=["PUT"])
def update_customer(customer_id):
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE customers
        SET customer_name = %s,
            email = %s,
            phone = %s,
            address = %s
        WHERE customer_id = %s
    """, (
        data["customer_name"],
        data.get("email", ""),
        data.get("phone", ""),
        data.get("address", ""),
        customer_id
    ))

    conn.commit()
    updated = cursor.rowcount

    cursor.close()
    conn.close()

    if updated == 0:
        return jsonify({"message": "Customer not found"}), 404

    return jsonify({"message": "Customer updated successfully"})


# DELETE CUSTOMER
@app.route("/api/customers/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM customers WHERE customer_id = %s",
        (customer_id,)
    )

    deleted = cursor.rowcount
    conn.commit()

    cursor.close()
    conn.close()

    if deleted == 0:
        return jsonify({"message": "Customer not found"}), 404

    return jsonify({"message": "Customer deleted successfully"})


# CREATE ORDER
@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json()

    customer_id = data["customer_id"]
    items = data["items"]

    if not items:
        return jsonify({"message": "Order must contain at least one product"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        conn.start_transaction()

        # Verify customer exists
        cursor.execute(
            "SELECT customer_id FROM customers WHERE customer_id = %s",
            (customer_id,)
        )

        if not cursor.fetchone():
            raise ValueError("Customer not found")

        total_amount = 0
        order_items = []

        # Validate products and calculate total
        for item in items:
            product_id = item["product_id"]
            quantity = item["quantity"]

            if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity <= 0:
                raise ValueError("Quantity must be a positive integer")

            cursor.execute("""
                SELECT product_id, price, stock_quantity
                FROM products
                WHERE product_id = %s
                FOR UPDATE
            """, (product_id,))

            product = cursor.fetchone()

            if not product:
                raise ValueError(f"Product {product_id} not found")

            if product["stock_quantity"] < quantity:
                raise ValueError(
                    f"Insufficient stock for product ID {product_id}"
                )

            unit_price = product["price"]
            total_amount += unit_price * quantity

            order_items.append({
                "product_id": product_id,
                "quantity": quantity,
                "unit_price": unit_price
            })

        # Create order
        cursor.execute("""
            INSERT INTO orders (customer_id, status, total_amount)
            VALUES (%s, 'PLACED', %s)
        """, (customer_id, total_amount))

        order_id = cursor.lastrowid

        # Insert order items and reduce stock
        for item in order_items:
            cursor.execute("""
                INSERT INTO order_items
                (order_id, product_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
            """, (
                order_id,
                item["product_id"],
                item["quantity"],
                item["unit_price"]
            ))

            cursor.execute("""
                UPDATE products
                SET stock_quantity = stock_quantity - %s
                WHERE product_id = %s
            """, (item["quantity"], item["product_id"]))

        conn.commit()

        return jsonify({
            "message": "Order created successfully",
            "order_id": order_id,
            "total_amount": float(total_amount)
        }), 201

    except ValueError as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 400

    except Error as e:
        conn.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500

    except Exception as e:
        conn.rollback()
        return jsonify({"message": "Order creation failed", "error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# UPDATE ORDER STATUS
@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get("status", "").upper()

    allowed_statuses = [
        "PLACED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED"
        
    ]

    if new_status not in allowed_statuses:
        return jsonify({"message": "Invalid order status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE orders
        SET status = %s
        WHERE order_id = %s
    """, (new_status, order_id))

    updated = cursor.rowcount

    conn.commit()
    cursor.close()
    conn.close()

    if updated == 0:
        return jsonify({"message": "Order not found"}), 404

    return jsonify({"message": "Order status updated successfully"})


# CANCEL ORDER AND RESTORE STOCK
@app.route("/api/orders/<int:order_id>/cancel", methods=["PUT"])
def cancel_order(order_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        conn.start_transaction()

        cursor.execute("""
            SELECT status
            FROM orders
            WHERE order_id = %s
            FOR UPDATE
        """, (order_id,))

        order = cursor.fetchone()

        if not order:
            raise ValueError("Order not found")

        if order["status"] == "CANCELLED":
            raise ValueError("Order is already cancelled")

        if order["status"] == "DELIVERED":
            raise ValueError("Delivered orders cannot be cancelled")

        cursor.execute("""
            SELECT product_id, quantity
            FROM order_items
            WHERE order_id = %s
        """, (order_id,))

        items = cursor.fetchall()

        for item in items:
            cursor.execute("""
                UPDATE products
                SET stock_quantity = stock_quantity + %s
                WHERE product_id = %s
            """, (item["quantity"], item["product_id"]))

        cursor.execute("""
            UPDATE orders
            SET status = 'CANCELLED'
            WHERE order_id = %s
        """, (order_id,))

        conn.commit()

        return jsonify({
            "message": "Order cancelled and stock restored successfully"
        })

    except ValueError as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 400

    except Error as e:
        conn.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()



@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1. Overall sales summary
        cursor.execute("""
            SELECT
                COUNT(*) AS total_orders,
                COALESCE(SUM(
                    CASE WHEN status != 'CANCELLED' THEN total_amount ELSE 0 END
                ), 0) AS total_revenue,
                COALESCE(SUM(
                    CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END
                ), 0) AS cancelled_orders
            FROM orders
        """)
        summary = cursor.fetchone()

        # 2. Monthly top-selling products
        cursor.execute("""
            SELECT
                p.product_id,
                p.product_name,
                SUM(oi.quantity) AS units_sold,
                SUM(oi.quantity * oi.unit_price) AS total_revenue
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.status != 'CANCELLED'
              AND o.order_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
              AND o.order_date < DATE_ADD(
                  DATE_FORMAT(CURDATE(), '%Y-%m-01'),
                  INTERVAL 1 MONTH
              )
            GROUP BY p.product_id, p.product_name
            HAVING SUM(oi.quantity) > 0
            ORDER BY units_sold DESC
        """)
        top_products = cursor.fetchall()

        # 3. Monthly sales trend
        cursor.execute("""
            SELECT
                DATE_FORMAT(order_date, '%Y-%m') AS month,
                COUNT(*) AS total_orders,
                SUM(total_amount) AS revenue
            FROM orders
            WHERE status != 'CANCELLED'
            GROUP BY DATE_FORMAT(order_date, '%Y-%m')
            ORDER BY month
        """)
        monthly_sales = cursor.fetchall()

        # 4. Low-stock products
        cursor.execute("""
            SELECT
                product_id,
                product_name,
                stock_quantity
            FROM products
            WHERE stock_quantity BETWEEN 1 AND 10
            ORDER BY stock_quantity ASC
        """)
        low_stock = cursor.fetchall()

        return jsonify({
            "summary": summary,
            "top_products": top_products,
            "monthly_sales": monthly_sales,
            "low_stock": low_stock
        })

    except Error as e:
        return jsonify({
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# DELETE CANCELLED ORDER
@app.route("/api/orders/<int:order_id>", methods=["DELETE"])
def delete_cancelled_order(order_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT status FROM orders WHERE order_id = %s",
            (order_id,)
        )
        order = cursor.fetchone()

        if not order:
            return jsonify({"message": "Order not found"}), 404

        if order["status"] != "CANCELLED":
            return jsonify({
                "message": "Only cancelled orders can be deleted"
            }), 400

        cursor.execute(
            "DELETE FROM orders WHERE order_id = %s",
            (order_id,)
        )

        conn.commit()

        return jsonify({
            "message": "Cancelled order deleted successfully"
        })

    except Error as e:
        conn.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# -------------------------
# SERVER
# -------------------------
@app.route("/")
def home():
    return "E-Commerce Inventory API is running!"


if __name__ == "__main__":
    app.run(debug=True, port=5000)



