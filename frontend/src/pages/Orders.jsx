import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setMessage(data.message || "Failed to load orders");
        return;
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="shop-header">
        <div>
          <h1>E-Commerce Store</h1>
          <p>My Orders</p>
        </div>

        <nav>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
        </nav>
      </header>

      <main className="orders-container">
        <div className="orders-heading">
          <h2>My Orders</h2>

          <Link to="/products">
            Continue Shopping
          </Link>
        </div>

        {message && (
          <p className="error-message">{message}</p>
        )}

        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>
              Your placed orders will appear here.
            </p>

            <Link
              to="/products"
              className="view-product-button"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article
                className="order-card"
                key={order._id}
              >
                <div className="order-header">
                  <div>
                    <h3>
                      Order #
                      {order._id.slice(-8).toUpperCase()}
                    </h3>

                    <p>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`order-status ${order.orderStatus}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div
                      className="order-item"
                      key={`${order._id}-${index}`}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="order-item-image"
                        />
                      )}

                      <div className="order-item-info">
                        <h4>{item.name}</h4>
                        <p>
                          {item.quantity} × ₹
                          {Number(
                            item.price
                          ).toFixed(2)}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div>
                    <span>Payment:</span>
                    <strong>
                      {order.paymentMethod}
                    </strong>
                  </div>

                  <div>
                    <span>Total:</span>
                    <strong>
                      ₹
                      {Number(
                        order.totalAmount
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="order-details-link"
                >
                  View Order Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;