import express from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==================== CREATE ORDER / CHECKOUT ====================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        message: "Please provide complete shipping address",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          message: "One of the products is no longer available",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus:
        paymentMethod === "COD" ? "pending" : "pending",
      orderStatus: "placed",
    });

    // Reduce product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    // Empty cart
    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(
      order._id
    ).populate("items.product");

    res.status(201).json({
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== GET MY ORDERS ====================

router.get(
  "/my-orders",
  authMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find({
        user: req.user._id,
      })
        .populate("items.product")
        .sort({ createdAt: -1 });

      res.json({
        orders,
      });
    } catch (error) {
      console.error("Get my orders error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== GET SINGLE ORDER ====================

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== ADMIN: GET ALL ORDERS ====================

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email role")
        .populate("items.product")
        .sort({ createdAt: -1 });

      res.json({
        orders,
      });
    } catch (error) {
      console.error("Get all orders error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== ADMIN: UPDATE ORDER STATUS ====================

router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { orderStatus } = req.body;

      const allowedStatuses = [
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      order.orderStatus = orderStatus;

      await order.save();

      res.json({
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

export default router;