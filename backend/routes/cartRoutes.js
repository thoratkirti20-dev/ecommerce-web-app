import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================== GET CART ====================

router.get("/", authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.json({
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== ADD TO CART ====================

router.post(
  "/add",
  authMiddleware,
  async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({
          message: "Product ID is required",
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }

      let cart = await Cart.findOne({
        user: req.user._id,
      });

      if (!cart) {
        cart = await Cart.create({
          user: req.user._id,
          items: [],
        });
      }

      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        const newQuantity =
          existingItem.quantity + Number(quantity);

        if (newQuantity > product.stock) {
          return res.status(400).json({
            message: "Insufficient stock",
          });
        }

        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({
          product: productId,
          quantity: Number(quantity),
        });
      }

      await cart.save();

      const updatedCart = await Cart.findOne({
        user: req.user._id,
      }).populate("items.product");

      res.json({
        message: "Product added to cart",
        cart: updatedCart,
      });
    } catch (error) {
      console.error("Add to cart error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== UPDATE CART ITEM ====================

router.put(
  "/:productId",
  authMiddleware,
  async (req, res) => {
    try {
      const { quantity } = req.body;

      if (!quantity || Number(quantity) < 1) {
        return res.status(400).json({
          message: "Quantity must be at least 1",
        });
      }

      const product = await Product.findById(
        req.params.productId
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (Number(quantity) > product.stock) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }

      const cart = await Cart.findOne({
        user: req.user._id,
      });

      if (!cart) {
        return res.status(404).json({
          message: "Cart not found",
        });
      }

      const item = cart.items.find(
        (cartItem) =>
          cartItem.product.toString() === req.params.productId
      );

      if (!item) {
        return res.status(404).json({
          message: "Product is not in cart",
        });
      }

      item.quantity = Number(quantity);

      await cart.save();

      const updatedCart = await Cart.findOne({
        user: req.user._id,
      }).populate("items.product");

      res.json({
        message: "Cart updated successfully",
        cart: updatedCart,
      });
    } catch (error) {
      console.error("Update cart error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== REMOVE CART ITEM ====================

router.delete(
  "/:productId",
  authMiddleware,
  async (req, res) => {
    try {
      const cart = await Cart.findOne({
        user: req.user._id,
      });

      if (!cart) {
        return res.status(404).json({
          message: "Cart not found",
        });
      }

      const originalLength = cart.items.length;

      cart.items = cart.items.filter(
        (item) =>
          item.product.toString() !== req.params.productId
      );

      if (cart.items.length === originalLength) {
        return res.status(404).json({
          message: "Product is not in cart",
        });
      }

      await cart.save();

      const updatedCart = await Cart.findOne({
        user: req.user._id,
      }).populate("items.product");

      res.json({
        message: "Product removed from cart",
        cart: updatedCart,
      });
    } catch (error) {
      console.error("Remove cart item error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== CLEAR CART ====================

router.delete(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const cart = await Cart.findOne({
        user: req.user._id,
      });

      if (!cart) {
        return res.json({
          message: "Cart cleared",
        });
      }

      cart.items = [];

      await cart.save();

      res.json({
        message: "Cart cleared successfully",
        cart,
      });
    } catch (error) {
      console.error("Clear cart error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

export default router;