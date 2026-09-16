import express from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==================== GET ALL PRODUCTS ====================

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.json({
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== GET SINGLE PRODUCT ====================

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== CREATE PRODUCT ====================

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        image,
        category,
        stock,
        rating,
      } = req.body;

      if (
        !name ||
        !description ||
        price === undefined ||
        !image ||
        !category ||
        stock === undefined
      ) {
        return res.status(400).json({
          message: "Please provide all required product details",
        });
      }

      const product = await Product.create({
        name,
        description,
        price,
        image,
        category,
        stock,
        rating,
      });

      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      console.error("Create product error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== UPDATE PRODUCT ====================

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        image,
        category,
        stock,
        rating,
      } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (name !== undefined) {
        product.name = name;
      }

      if (description !== undefined) {
        product.description = description;
      }

      if (price !== undefined) {
        product.price = price;
      }

      if (image !== undefined) {
        product.image = image;
      }

      if (category !== undefined) {
        product.category = category;
      }

      if (stock !== undefined) {
        product.stock = stock;
      }

      if (rating !== undefined) {
        product.rating = rating;
      }

      await product.save();

      res.json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      console.error("Update product error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== DELETE PRODUCT ====================

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(
        req.params.id
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Delete product error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

export default router;