import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load products");
        return;
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <header className="shop-header">
        <div>
          <h1>E-Commerce Store</h1>
          <p>Find products you'll love</p>
        </div>

        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/cart">Cart</Link>
        </nav>
      </header>

      <main className="products-container">
        <div className="products-heading">
          <h2>Products</h2>
          <span>{products.length} products</span>
        </div>

        {message && (
          <p className="error-message">{message}</p>
        )}

        {products.length === 0 ? (
          <div className="empty-state">
            <h3>No products available</h3>
            <p>Please check back later.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <article className="product-card" key={product._id}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <p className="product-description">
                    {product.description}
                  </p>

                  <div className="product-price-row">
                    <strong>
                      ₹{Number(product.price).toFixed(2)}
                    </strong>

                    <span>
                      ⭐ {Number(product.rating).toFixed(1)}
                    </span>
                  </div>

                  <p className="product-stock">
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "Out of stock"}
                  </p>

                  <Link
                    to={`/products/${product._id}`}
                    className="view-product-button"
                  >
                    View Product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;