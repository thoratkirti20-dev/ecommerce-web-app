import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = "http://localhost:5000";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrder();
  }, [id, token, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Order not found");
        return;
      }

      setOrder(data.order);
    } catch (error) {
      console.error("Fetch order error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-center">
        <div className="empty-state">
          <h3>{message || "Order not found"}</h3>
          <Link to="/orders">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="shop-header">
        <div>
          <h1>E-Commerce Store</h1>
          <p>Order Details</p>
        </div>

        <nav>
          <Link to="/products">Products</Link>
          <Link to="/orders">My Orders</Link>
        </nav>
      </header>

      <main className="order-details-container">
        <Link
          to="/orders"
          className="back-link"
        >
          ← Back to Orders
        </Link>

        <section className="order-details-card">
          <div className="order-details-top">
            <div>
              <h2>
                Order #
                {order._id.slice(-8).toUpperCase()}
              </h2>

              <p>
                Placed on{" "}
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

          <div className="order-section">
            <h3>Items</h3>

            {order.items.map((item, index) => (
              <div
                className="order-detail-item"
                key={`${order._id}-${index}`}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="order-detail-image"
                  />
                )}

                <div className="order-detail-info">
                  <h4>{item.name}</h4>
                  <p>
                    Quantity: {item.quantity}
                  </p>
                  <p>
                    Price: ₹
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

          <div className="order-section">
            <h3>Shipping Address</h3>

            <div className="shipping-info">
              <p>
                <strong>
                  {order.shippingAddress.fullName}
                </strong>
              </p>

              <p>
                {order.shippingAddress.address}
              </p>

              <p>
                {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} -{" "}
                {order.shippingAddress.pincode}
              </p>

              <p>
                Phone:{" "}
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          <div className="order-summary-details">
            <div>
              <span>Payment Method</span>
              <strong>
                {order.paymentMethod}
              </strong>
            </div>

            <div>
              <span>Payment Status</span>
              <strong>
                {order.paymentStatus}
              </strong>
            </div>

            <div className="order-total-details">
              <span>Total</span>
              <strong>
                ₹
                {Number(
                  order.totalAmount
                ).toFixed(2)}
              </strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OrderDetails;