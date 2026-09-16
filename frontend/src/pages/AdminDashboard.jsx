import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: "",
  stock: "",
  rating: "0",
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [message, setMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchProducts();
    fetchOrders();
  }, [token, navigate, user?.role]);

  // ==================== PRODUCTS ====================

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/products`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to load products"
        );
        return;
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct._id}`
        : `${API_URL}/api/products`;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          image: formData.image,
          category: formData.category,
          stock: Number(formData.stock),
          rating: Number(formData.rating),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Operation failed");
        return;
      }

      if (editingProduct) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product._id === editingProduct._id
              ? data.product
              : product
          )
        );

        setMessage("Product updated successfully");
      } else {
        setProducts((currentProducts) => [
          data.product,
          ...currentProducts,
        ]);

        setMessage("Product created successfully");
      }

      setFormData(emptyForm);
      setEditingProduct(null);
    } catch (error) {
      console.error("Product operation error:", error);
      setMessage("Unable to connect to server");
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      image: product.image || "",
      category: product.category || "",
      stock: product.stock ?? "",
      rating: product.rating ?? "0",
    });

    setMessage("");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setMessage("");
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to delete product"
        );
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product._id !== productId
        )
      );

      setMessage("Product deleted successfully");
    } catch (error) {
      console.error("Delete product error:", error);
      setMessage("Unable to connect to server");
    }
  };

  // ==================== ORDERS ====================

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/orders/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to load orders"
        );
        return;
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (
    orderId,
    orderStatus
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/orders/admin/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to update order"
        );
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? data.order
            : order
        )
      );

      setMessage("Order status updated successfully");
    } catch (error) {
      console.error("Update order error:", error);
      setMessage("Unable to connect to server");
    }
  };

  // ==================== LOGOUT ====================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="admin-page">
      <header className="shop-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage products and orders</p>
        </div>

        <nav>
          <Link to="/products">
            Store
          </Link>

          <Link to="/orders">
            Customer Orders
          </Link>

          <button
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="admin-container">
        {/* ==================== PRODUCT FORM ==================== */}

        <section className="admin-form-card">
          <h2>
            {editingProduct
              ? "Edit Product"
              : "Add Product"}
          </h2>

          <form onSubmit={handleProductSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Product Name
                </label>

                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Product name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Category
                </label>

                <input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Category"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">
                Image URL
              </label>

              <input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">
                  Price
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">
                  Stock
                </label>

                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rating">
                Rating
              </label>

              <input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="create-button"
              >
                {editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && (
            <p className="dashboard-message">
              {message}
            </p>
          )}
        </section>

        {/* ==================== PRODUCTS ==================== */}

        <section className="admin-products-section">
          <div className="section-heading">
            <h2>Products</h2>
            <span>
              {products.length} product(s)
            </span>
          </div>

          {loadingProducts ? (
            <div className="empty-state">
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products yet</h3>
              <p>Add your first product above.</p>
            </div>
          ) : (
            <div className="admin-products-list">
              {products.map((product) => (
                <article
                  className="admin-product-row"
                  key={product._id}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="admin-product-image"
                  />

                  <div className="admin-product-info">
                    <h3>{product.name}</h3>

                    <p>{product.category}</p>

                    <strong>
                      ₹
                      {Number(
                        product.price
                      ).toFixed(2)}
                    </strong>

                    <span>
                      Stock: {product.stock}
                    </span>
                  </div>

                  <div className="admin-product-actions">
                    <button
                      className="edit-button"
                      onClick={() =>
                        startEditing(product)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteProduct(
                          product._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ==================== ORDERS ==================== */}

        <section className="admin-orders-section">
          <div className="section-heading">
            <h2>Customer Orders</h2>
            <span>{orders.length} order(s)</span>
          </div>

          {loadingOrders ? (
            <div className="empty-state">
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <h3>No orders yet</h3>
              <p>Customer orders will appear here.</p>
            </div>
          ) : (
            <div className="admin-orders-list">
              {orders.map((order) => (
                <article
                  className="admin-order-card"
                  key={order._id}
                >
                  <div className="admin-order-top">
                    <div>
                      <h3>
                        Order #
                        {order._id
                          .slice(-8)
                          .toUpperCase()}
                      </h3>

                      <p>
                        Customer:{" "}
                        {order.user?.name ||
                          "Unknown"}
                      </p>

                      <p>
                        Email:{" "}
                        {order.user?.email ||
                          "Unknown"}
                      </p>

                      <p>
                        Date:{" "}
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <strong>
                        ₹
                        {Number(
                          order.totalAmount
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-order-items">
                    {order.items.map(
                      (item, index) => (
                        <div
                          className="admin-order-item"
                          key={`${order._id}-${index}`}
                        >
                          <span>
                            {item.name}
                          </span>

                          <span>
                            {item.quantity} × ₹
                            {Number(
                              item.price
                            ).toFixed(2)}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="admin-order-bottom">
                    <div>
                      <span>
                        Payment:{" "}
                      </span>

                      <strong>
                        {order.paymentMethod}
                      </strong>
                    </div>

                    <div className="admin-status-control">
                      <label
                        htmlFor={`status-${order._id}`}
                      >
                        Status:
                      </label>

                      <select
                        id={`status-${order._id}`}
                        value={order.orderStatus}
                        onChange={(event) =>
                          updateOrderStatus(
                            order._id,
                            event.target.value
                          )
                        }
                      >
                        <option value="placed">
                          Placed
                        </option>

                        <option value="processing">
                          Processing
                        </option>

                        <option value="shipped">
                          Shipped
                        </option>

                        <option value="delivered">
                          Delivered
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;