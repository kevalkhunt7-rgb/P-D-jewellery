import Order from '../model/orderModel.js';
import User from '../model/userModel.js';
import Product from '../model/productModel.js';

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
    // VALID ORDER STATUSES
    // ======================================================

    // IMPORTANT:
    // Must match exact database values

    const validStatuses = ["DELIVERED", "delivered"];



    // ======================================================
    // TOTAL ORDERS
    // ======================================================

    const totalOrders = await Order.countDocuments({
      orderStatus: { $in: validStatuses }
    });



    // ======================================================
    // TOTAL REVENUE + PRODUCTS SOLD
    // ======================================================

    const revenueStats = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: validStatuses }
        }
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
    // RECENT ORDERS
    // ======================================================

    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");



    // ======================================================
    // TOP PRODUCTS
    // ======================================================

    const topProductsAggregation = await Order.aggregate([

      {
        $match: {
          orderStatus: { $in: validStatuses }
        }
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

      image:
        item.productInfo?.images?.[0]?.url || item.productInfo?.images?.[0] || "",

      price:
        item.productInfo?.price || 0,

      sold: item.totalSold,

      revenue: item.totalRevenue,
    }));



    // ======================================================
    // LOW STOCK PRODUCTS
    // ======================================================

    const lowStockItemsRaw = await Product.find({
      stock: { $lte: 5 }
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
    // RECENT CUSTOMERS
    // ======================================================

    const recentCustomersList = await User.find({
      role: "user"
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");


    const recentCustomers = await Promise.all(

      recentCustomersList.map(async (customer) => {

        const customerOrders = await Order.find({
          user: customer._id,
          orderStatus: { $in: validStatuses }
        });

        const totalSpent = customerOrders.reduce(
          (sum, order) =>
            sum + order.totalPrice,
          0
        );

        return {
          id: customer._id,

          name: customer.name,

          email: customer.email,

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

    sixMonthsAgo.setMonth(
      sixMonthsAgo.getMonth() - 5
    );

    sixMonthsAgo.setDate(1);

    sixMonthsAgo.setHours(
      0,
      0,
      0,
      0
    );


    const revenueTrend = await Order.aggregate([

      {
        $match: {
          createdAt: {
            $gte: sixMonthsAgo
          },

          orderStatus: {
            $in: validStatuses
          }
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


    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];


    const revenueData = revenueTrend.map((item) => ({
      month:
        monthNames[item._id.month - 1],

      revenue: item.revenue,
    }));



    // ======================================================
    // CATEGORY REVENUE
    // ======================================================

    const categoryRevenueAggregation =
      await Order.aggregate([

        {
          $match: {
            orderStatus: {
              $in: validStatuses
            }
          }
        },

        {
          $unwind: "$orderItems"
        },

        {
          $lookup: {
            from: "products",

            localField:
              "orderItems.product",

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
      


    const categoryRevenue =
      categoryRevenueAggregation.map(
        (item) => ({
          category:
            item.categoryInfo?.name ||
            "Uncategorized",

          revenue: item.revenue
        })
      );



    // ======================================================
    // REVENUE GROWTH
    // ======================================================

    const currentMonthRevenue =
      await Order.aggregate([

        {
          $match: {
            orderStatus: {
              $in: validStatuses
            },

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


    const previousMonthRevenue =
      await Order.aggregate([

        {
          $match: {
            orderStatus: {
              $in: validStatuses
            },

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


    const currentRevenue =
      currentMonthRevenue[0]?.total || 0;

    const previousRevenue =
      previousMonthRevenue[0]?.total || 0;


    const revenueGrowth =
      previousRevenue === 0
        ? 100
        : Number(
            (
              ((currentRevenue -
                previousRevenue) /
                previousRevenue) *
              100
            ).toFixed(1)
          );



    // ======================================================
    // RESPONSE
    // ======================================================

    res.status(200).json({
      success: true,

      totalRevenue: stats.totalRevenue,

      totalOrders,

      newCustomers,

      productsSold:
        stats.totalProductsSold,

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

    console.error(
      "Error in getDashboardStats:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server Error fetching dashboard stats",
    });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .select('-password');

    const customerStats = await Promise.all(customers.map(async (customer) => {
      const orders = await Order.find({ user: customer._id });
      const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || 'N/A',
        orders: orders.length,
        totalSpent,
        status: customer.status || 'active',
        joinDate: customer.createdAt
      };
    }));

    res.json({
      success: true,
      customers: customerStats
    });
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    res.status(500).json({ success: false, message: 'Server Error fetching customers' });
  }
};

export const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      success: true,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || 'N/A',
        status: customer.status || 'active',
        joinDate: customer.createdAt,
        totalOrders: orders.length,
        totalSpent,
        averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
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
    res.status(500).json({ success: false, message: 'Server Error fetching customer details' });
  }
};
