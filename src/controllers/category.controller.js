const Category = require("../models/Category");

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parent", "name");
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parent",
      "name",
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, description, image, parent } = req.body;

    // Calculate level based on parent
    let level = 0;
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (parentCategory) {
        level = parentCategory.level + 1;
      }
    }

    const category = await Category.create({
      name,
      description,
      image,
      parent,
      level,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update category
// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, description, image, parent } = req.body;
    
    console.log('Update request received:', { id: req.params.id, name, description, image, parent });

    // Calculate level based on parent
    let level = 0;
    
    if (parent && parent !== '') {
      // If parent is provided and not empty, find parent category
      const parentCategory = await Category.findById(parent);
      if (parentCategory) {
        level = parentCategory.level + 1;
      } else {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }
    // If parent is null, undefined, or empty string, level stays 0 (top-level)

    // Prepare update data
    const updateData = {
      name,
      description,
      image,
      level
    };

    // Handle parent field properly
    if (parent === null || parent === '') {
      updateData.parent = null; // Remove parent for top-level categories
    } else if (parent) {
      updateData.parent = parent; // Set new parent
    }

    console.log('Updating with data:', updateData);

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parent', 'name');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    console.log('Updated category:', category);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    // Check if category has subcategories
    const hasChildren = await Category.findOne({ parent: req.params.id });

    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with subcategories",
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get subcategories of a category
const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Category.find({ parent: req.params.id });

    res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
};
