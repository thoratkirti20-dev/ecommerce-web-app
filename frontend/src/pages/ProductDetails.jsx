import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = "http://localhost:5000";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/products/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Product not found");
        return;
      }

      setProduct(data.product);
    } catch (error) {
      console.error("Product details error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to add to cart");
        return;
      }

      setMessage("Product added to cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      setMessage("Unable to connect to server");
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-center">
        <h2>Product not found</h2>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <header className="shop-header">
        <div>
          <h1>E-Commerce Store</h1>
          <p>Product Details</p>
        </div>

        <nav>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main className="details-container">
        <Link
          to="/products"
          className="back-link"
        >
          ← Back to Products
        </Link>

        <section className="product-details-card">
          <div className="details-image-container">
            <img
              src={product.image}
              alt={product.name}
              className="details-image"
            />
          </div>

          <div className="details-content">
            <span className="product-category">
              {product.category}
            </span>

            <h2>{product.name}</h2>

            <div className="details-rating">
              ⭐ {Number(product.rating).toFixed(1)}
            </div>

            <p className="details-description">
              {product.description}
            </p>

            <h3 className="details-price">
              ₹{Number(product.price).toFixed(2)}
            </h3>

            <p className="details-stock">
              {product.stock > 0
                ? `${product.stock} items available`
                : "Out of stock"}
            </p>

            <button
              className="add-cart-button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </button>

            {message && (
              <p className="dashboard-message">
                {message}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductDetails;