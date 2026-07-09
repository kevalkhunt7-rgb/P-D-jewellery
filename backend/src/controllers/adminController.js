import Order from '../model/orderModel.js';
import User from '../model/userModel.js';
import Product from '../model/productModel.js';
import AdminRequest from '../model/adminRequestModel.js';
import bcrypt from "bcryptjs";
import Settings from '../model/settingsModel.js';

export const getDashboardStats = async (req, res) => {
  try {

    // ======================================================
    // DATE HELPERS
    // ======================================================
    const now = new Date();

    const firstDayCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const firstDayPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const lastDayPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    // ======================================================
    // EXCLUDED ORDER STATUSES
    // ======================================================
    // Revenue counts immediately upon placement, and drops when cancelled.
    const excludedStatuses = ["CANCELLED", "cancelled"];
    const activeOrderFilter = { orderStatus: { $nin: excludedStatuses } };

    // ======================================================
    // TOTAL ACTIVE ORDERS
    // ======================================================
    const totalOrders = await Order.countDocuments(activeOrderFilter);

    // ======================================================
    // TOTAL REVENUE + PRODUCTS SOLD (Excluding Cancelled)
    // ======================================================
    const revenueStats = await Order.aggregate([
      {
        $match: activeOrderFilter
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalPrice"
          },
          totalProductsSold: {
            $sum: {
              $sum: "$orderItems.quantity"
            }
          }
        }
      }
    ]);

    const stats = revenueStats[0] || {
      totalRevenue: 0,
      totalProductsSold: 0,
    };

    // ======================================================
    // NEW CUSTOMERS THIS MONTH
    // ======================================================
    const newCustomers = await User.countDocuments({
      role: "user",
      createdAt: {
        $gte: firstDayCurrentMonth
      }
    });

    // ======================================================
    // AVERAGE ORDER VALUE
    // ======================================================
    const averageOrderValue =
      totalOrders > 0
        ? Math.round(stats.totalRevenue / totalOrders)
        : 0;

    // ======================================================
    // RECENT ORDERS (Keep showing all, including cancellations for transparency)
    // ======================================================
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    // ======================================================
    // TOP PRODUCTS (Based on non-cancelled orders)
    // ======================================================
    const topProductsAggregation = await Order.aggregate([
      {
        $match: activeOrderFilter
      },
      {
        $unwind: "$orderItems"
      },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: {
            $sum: "$orderItems.quantity"
          },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$orderItems.price",
                "$orderItems.quantity"
              ]
            }
          }
        }
      },
      {
        $sort: {
          totalSold: -1
        }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: "$productInfo"
      }
    ]);

    const topProducts = topProductsAggregation.map((item) => ({
      id: item._id,
      name: item.productInfo?.name || "Unknown Product",
      image: item.productInfo?.images?.[0]?.url || item.productInfo?.images?.[0] || "",
      price: item.productInfo?.price || 0,
      sold: item.totalSold,
      revenue: item.totalRevenue,
    }));

    // ======================================================
    // LOW STOCK PRODUCTS
    // ======================================================
    const settings = await Settings.findOne() || await Settings.create({});
    const lowStockLimit = settings.inventory?.lowStockLimit ?? 5;

    const lowStockItemsRaw = await Product.find({
      stock: { $lte: lowStockLimit }
    })
      .limit(5)
      .select("name stock images price");

    const lowStockItems = lowStockItemsRaw.map(item => ({
      _id: item._id,
      name: item.name,
      stock: item.stock,
      price: item.price,
      image: item.images?.[0]?.url || item.images?.[0] || ""
    }));

    // ======================================================
    // RECENT CUSTOMERS WITH THEIR ACTIVE METRICS
    // ======================================================
    const recentCustomersList = await User.find({
      role: "user"
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt avatar");

    const recentCustomers = await Promise.all(
      recentCustomersList.map(async (customer) => {
        const customerOrders = await Order.find({
          user: customer._id,
          ...activeOrderFilter
        });

        const totalSpent = customerOrders.reduce(
          (sum, order) => sum + order.totalPrice,
          0
        );

        return {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          avatar: customer.avatar,
          spent: totalSpent,
          orders: customerOrders.length,
          joinDate: customer.createdAt,
        };
      })
    );

    // ======================================================
    // REVENUE TREND (LAST 6 MONTHS)
    // ======================================================
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const revenueTrend = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sixMonthsAgo
          },
          ...activeOrderFilter
        }
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt"
            },
            year: {
              $year: "$createdAt"
            }
          },
          revenue: {
            $sum: "$totalPrice"
          }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const revenueData = revenueTrend.map((item) => ({
      month: monthNames[item._id.month - 1],
      revenue: item.revenue,
    }));

    // ======================================================
    // CATEGORY REVENUE
    // ======================================================
    const categoryRevenueAggregation = await Order.aggregate([
      {
        $match: activeOrderFilter
      },
      {
        $unwind: "$orderItems"
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $group: {
          _id: "$product.category",
          revenue: {
            $sum: {
              $multiply: [
                "$orderItems.price",
                "$orderItems.quantity"
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $unwind: {
          path: "$categoryInfo",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    const categoryRevenue = categoryRevenueAggregation.map((item) => ({
      category: item.categoryInfo?.name || "Uncategorized",
      revenue: item.revenue
    }));

    // ======================================================
    // REVENUE GROWTH (Current Month vs Previous Month)
    // ======================================================
    const currentMonthRevenue = await Order.aggregate([
      {
        $match: {
          ...activeOrderFilter,
          createdAt: {
            $gte: firstDayCurrentMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalPrice"
          }
        }
      }
    ]);

    const previousMonthRevenue = await Order.aggregate([
      {
        $match: {
          ...activeOrderFilter,
          createdAt: {
            $gte: firstDayPreviousMonth,
            $lte: lastDayPreviousMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalPrice"
          }
        }
      }
    ]);

    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const previousRevenue = previousMonthRevenue[0]?.total || 0;

    const revenueGrowth = previousRevenue === 0
      ? 100
      : Number((((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1));

    // ======================================================
    // RESPONSE
    // ======================================================
    res.status(200).json({
      success: true,
      totalRevenue: stats.totalRevenue,
      totalOrders,
      newCustomers,
      productsSold: stats.totalProductsSold,
      averageOrderValue,
      revenueGrowth,
      ordersGrowth: 0,
      customersGrowth: 0,
      productsGrowth: 0,
      recentOrders,
      topProducts,
      lowStockItems,
      recentCustomers,
      revenueData,
      categoryRevenue,
    });

  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .select('-password');

    const customerStats = await Promise.all(customers.map(async (customer) => {
      // Excludes cancelled orders from customer lifetime logs
      const orders = await Order.find({ user: customer._id, orderStatus: { $nin: ["CANCELLED", "cancelled"] } });
      const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || 'N/A',
        orders: orders.length,
        totalSpent,
        status: customer.status || 'active',
        joinDate: customer.createdAt,
        avatar: customer.avatar
      };
    }));

    res.json({
      success: true,
      customers: customerStats
    });
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    res.status(500).json({ success: false, message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)) });
  }
};

export const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Pull down order logs
    const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });
    const activeOrders = orders.filter(o => !["CANCELLED", "cancelled"].includes(o.orderStatus));
    
    const totalSpent = activeOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      success: true,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || 'N/A',
        status: customer.status || 'active',
        joinDate: customer.createdAt,
        totalOrders: activeOrders.length,
        totalSpent,
        averageOrderValue: activeOrders.length > 0 ? totalSpent / activeOrders.length : 0,
        lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
        orders: orders.map(order => ({
          _id: order._id,
          date: order.createdAt,
          products: order.orderItems.length,
          amount: order.totalPrice,
          status: order.orderStatus
        }))
      }
    });
  } catch (error) {
    console.error("Error in getCustomerDetails:", error);
    res.status(500).json({ success: false, message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)) });
  }
};

// ================= CREATE ADMIN REQUEST =================
export const createAdminRequest = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if request already exists
    const existingRequest = await AdminRequest.findOne({ email });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Request with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminRequest = await AdminRequest.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Admin request submitted successfully",
      adminRequest,
    });
  } catch (error) {
    console.error("Create admin request error:", error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= GET ALL ADMIN REQUESTS =================
export const getAdminRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find()
      .sort({ createdAt: -1 })
      .populate("reviewedBy", "name email");

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get admin requests error:", error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= REVIEW ADMIN REQUEST =================
export const reviewAdminRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const request = await AdminRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already reviewed",
      });
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    // If approved, create admin user
    if (status === "approved") {
      await User.create({
        name: request.name,
        email: request.email,
        password: request.password,
        role: "admin",
        isVerified: true,
      });
    }

    await request.save();

    res.status(200).json({
      success: true,
      message: `Admin request ${status}`,
      request,
    });
  } catch (error) {
    console.error("Review admin request error:", error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= GET ALL ADMINS =================
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      $or: [{ role: 'admin' }, { role: 'superAdmin' }]
    }).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      admins,
      currentAdminId: req.user._id
    });
  } catch (error) {
    console.error("Error in getAllAdmins:", error);
    res.status(500).json({ success: false, message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)) });
  }
};

// ================= UPDATE ADMIN ROLE =================
export const updateAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Prevent changing current admin's own role
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role"
      });
    }
    
    // Validate role
    if (!['admin', 'superAdmin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }
    
    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    admin.role = role;
    await admin.save();
    
    res.json({
      success: true,
      message: "Admin role updated successfully",
      admin
    });
  } catch (error) {
    console.error("Error in updateAdminRole:", error);
    res.status(500).json({ success: false, message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)) });
  }
};

// ================= DELETE ADMIN =================
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting current admin
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }
    
    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    await User.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: "Admin deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteAdmin:", error);
    res.status(500).json({ success: false, message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)) });
  }
};

// ================= CREATE ADMIN DIRECTLY =================
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true
    });
    
    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error))
    });
  }
};
