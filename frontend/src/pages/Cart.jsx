import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setMessage(data.message || "Failed to load cart");
        return;
      }

      setCart(data.cart);
    } catch (error) {
      console.error("Fetch cart error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await fetch(
        `${API_URL}/api/cart/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update quantity");
        return;
      }

      setCart(data.cart);
      setMessage("");
    } catch (error) {
      console.error("Update quantity error:", error);
      setMessage("Unable to connect to server");
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/cart/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to remove product");
        return;
      }

      setCart(data.cart);
      setMessage("");
    } catch (error) {
      console.error("Remove cart item error:", error);
      setMessage("Unable to connect to server");
    }
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

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="shop-header">
        <div>
          <h1>E-Commerce Store</h1>
          <p>Shopping Cart</p>
        </div>

        <nav>
          <Link to="/products">Products</Link>
          <Link to="/dashboard">Account</Link>
        </nav>
      </header>

      <main className="cart-container">
        <div className="cart-heading">
          <h2>Your Cart</h2>
          <Link to="/products">
            Continue Shopping
          </Link>
        </div>

        {message && (
          <p className="error-message">{message}</p>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="empty-state">
            <h3>Your cart is empty</h3>
            <p>Add some products to get started.</p>

            <Link
              to="/products"
              className="view-product-button"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              {cart.items.map((item) => {
                if (!item.product) {
                  return null;
                }

                return (
                  <div
                    className="cart-item"
                    key={item.product._id}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="cart-item-image"
                    />

                    <div className="cart-item-info">
                      <h3>{item.product.name}</h3>

                      <p>
                        ₹
                        {Number(
                          item.product.price
                        ).toFixed(2)}
                      </p>

                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            item.quantity >=
                            item.product.stock
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <strong>
                        ₹
                        {(
                          item.product.price *
                          item.quantity
                        ).toFixed(2)}
                      </strong>

                      <button
                        className="delete-button"
                        onClick={() =>
                          removeItem(
                            item.product._id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>

            <aside className="cart-summary">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Items</span>
                <span>
                  {cart.items.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="summary-row total-row">
                <span>Total</span>
                <strong>
                  ₹{calculateTotal().toFixed(2)}
                </strong>
              </div>

              <button
                className="checkout-button"
                onClick={() =>
                  navigate("/checkout")
                }
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;