import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    paymentMethod: "COD",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load cart");
        return;
      }

      setCart(data.cart);
    } catch (error) {
      console.error("Checkout cart error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) {
      return 0;
    }

    return cart.items.reduce((total, item) => {
      if (!item.product) {
        return total;
      }

      return (
        total +
        item.product.price * item.quantity
      );
    }, 0);
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!cart || cart.items.length === 0) {
      setMessage("Your cart is empty");
      return;
    }

    setPlacingOrder(true);

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            phone: formData.phone,
          },
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to place order");
        return;
      }

      navigate(`/orders/${data.order._id}`);
    } catch (error) {
      console.error("Place order error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-center">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add products before checkout.</p>

          <Link
            to="/products"
            className="view-product-button"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="shop-header">
        <div>
          <h1>E-Commerce Store</h1>
          <p>Checkout</p>
        </div>

        <nav>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">My Orders</Link>
        </nav>
      </header>

      <main className="checkout-container">
        <div className="checkout-heading">
          <h2>Checkout</h2>

          <Link to="/cart">
            ← Back to Cart
          </Link>
        </div>

        <div className="checkout-layout">
          <section className="checkout-form-card">
            <h3>Shipping Information</h3>

            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State</label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pincode">
                    Pincode
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">
                  Payment Method
                </label>

                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="COD">
                    Cash on Delivery
                  </option>

                  <option value="ONLINE">
                    Online Payment
                  </option>
                </select>
              </div>

              {message && (
                <p className="error-message">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="checkout-place-button"
                disabled={placingOrder}
              >
                {placingOrder
                  ? "Placing Order..."
                  : "Place Order"}
              </button>
            </form>
          </section>

          <aside className="checkout-summary">
            <h3>Order Summary</h3>

            {cart.items.map((item) => {
              if (!item.product) {
                return null;
              }

              return (
                <div
                  className="checkout-item"
                  key={item.product._id}
                >
                  <div>
                    <strong>{item.product.name}</strong>
                    <span>
                      {item.quantity} × ₹
                      {Number(
                        item.product.price
                      ).toFixed(2)}
                    </span>
                  </div>

                  <strong>
                    ₹
                    {(
                      item.product.price *
                      item.quantity
                    ).toFixed(2)}
                  </strong>
                </div>
              );
            })}

            <div className="checkout-total">
              <span>Total</span>
              <strong>
                ₹{calculateTotal().toFixed(2)}
              </strong>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Checkout;