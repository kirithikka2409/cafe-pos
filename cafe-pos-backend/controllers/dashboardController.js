const { Op } = require("sequelize");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// ---------- Helpers ----------
const parseMonth = (month) => {
  if (!month) return null;
  const [year, mon] = month.split("-");
  if (!year || !mon || isNaN(year) || isNaN(mon)) return null;
  return { year: Number(year), month: Number(mon) };
};

const round3 = (num) => Math.round(num * 1000) / 1000;

// ---------- Full Dashboard ----------
const getFullDashboard = async (month, date) => {
  const summary = date ? await getSummaryByDate(date) : await getSummaryToday();
  const monthly = await getMonthlySummary(month);
  const topItems = await getTopItems(month, date);
  const paymentStats = await getPaymentStats(month);
  const categoryStats = await getCategoryStats(month);
  const hourlyStats = await getHourlyStats(month);
  const weeklyComparison = await getWeeklyComparison();
  const dailyRevenue = await getDailyRevenue(month);

  return {
    summary,
    monthly,
    topItems,
    paymentStats,
    categoryStats,
    hourlyStats,
    weeklyComparison,
    dailyRevenue
  };
};

// ---------- Summary ----------
const getSummaryToday = async () => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const orders = await Order.findAll({ where: { createdAt: { [Op.gte]: today } } });

  const totalRevenue = orders.reduce((sum,o) => sum + Number(o.total||0), 0);
  const totalVat = orders.reduce((sum,o) => sum + Number(o.vat||0), 0);
  const totalDiscount = orders.reduce((sum,o) => sum + Number(o.discount||0), 0);

  return {
    totalOrders: orders.length,
    totalRevenue: round3(totalRevenue),
    totalVat: round3(totalVat),
    totalDiscount: round3(totalDiscount)
  };
};

const getSummaryByDate = async (date) => {
  if (!date) return getSummaryToday();
  const start = new Date(date); start.setHours(0,0,0,0);
  const end = new Date(date); end.setHours(23,59,59,999);
  const orders = await Order.findAll({ where: { createdAt: { [Op.between]: [start, end] } } });

  const totalRevenue = orders.reduce((sum,o) => sum + Number(o.total||0), 0);
  const totalVat = orders.reduce((sum,o) => sum + Number(o.vat||0), 0);
  const totalDiscount = orders.reduce((sum,o) => sum + Number(o.discount||0), 0);

  return {
    totalOrders: orders.length,
    totalRevenue: round3(totalRevenue),
    totalVat: round3(totalVat),
    totalDiscount: round3(totalDiscount)
  };
};

// ---------- Monthly Summary ----------
const getMonthlySummary = async (month) => {
  const parsed = parseMonth(month);
  if (!parsed) return { totalOrders: 0, totalRevenue: 0 };

  const firstDay = new Date(parsed.year, parsed.month-1,1);
  const lastDay = new Date(parsed.year, parsed.month,0,23,59,59,999);
  const orders = await Order.findAll({ where: { createdAt: { [Op.between]: [firstDay, lastDay] } } });

  const totalRevenue = orders.reduce((sum,o) => sum + Number(o.total||0), 0);

  return {
    totalOrders: orders.length,
    totalRevenue: round3(totalRevenue)
  };
};

// ---------- Top Items ----------
const getTopItems = async (month, date) => {
  let orders = [];

  if (date) {
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    orders = await Order.findAll({ where: { createdAt: { [Op.between]: [start, end] } } });
  } else if (month) {
    const parsed = parseMonth(month);
    if (parsed) {
      const firstDay = new Date(parsed.year, parsed.month-1,1);
      const lastDay = new Date(parsed.year, parsed.month,0,23,59,59,999);
      orders = await Order.findAll({ where: { createdAt: { [Op.between]: [firstDay, lastDay] } } });
    }
  } else {
    orders = await Order.findAll();
  }

  const itemMap = {};
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      if (!itemMap[item.name]) itemMap[item.name] = 0;
      itemMap[item.name] += Number(item.qty||0);
    });
  });

  return Object.entries(itemMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a,b) => b.qty - a.qty)
    .slice(0,5);
};

// ---------- Payment Stats ----------
const getPaymentStats = async (month) => {
  const parsed = parseMonth(month);
  if (!parsed) return [];

  const firstDay = new Date(parsed.year, parsed.month-1,1);
  const lastDay = new Date(parsed.year, parsed.month,0,23,59,59,999);
  const orders = await Order.findAll({ where: { createdAt: { [Op.between]: [firstDay, lastDay] } } });

  return ["Cash","Card"].map(method => ({
    paymentMethod: method,
    total: round3(
      orders.filter(o => (o.paymentMethod||"").toLowerCase() === method.toLowerCase())
            .reduce((sum,o) => sum + Number(o.total||0), 0)
    )
  }));
};

// ---------- Category Stats ----------
const getCategoryStats = async (month) => {
  const parsed = parseMonth(month);
  const firstDay = parsed ? new Date(parsed.year, parsed.month - 1, 1) : null;
  const lastDay = parsed ? new Date(parsed.year, parsed.month, 0, 23, 59, 59, 999) : null;

  const orders = parsed
    ? await Order.findAll({ where: { createdAt: { [Op.between]: [firstDay, lastDay] } } })
    : await Order.findAll();

  const categoryMap = {};

  orders.forEach(order => {
    (order.items || []).forEach(item => {
      const category = item.category || "Others";

      if (!categoryMap[category]) categoryMap[category] = 0;

      categoryMap[category] += Number(item.qty || 0) * Number(item.price || 0);
    });
  });

  return Object.entries(categoryMap).map(([category, totalRevenue]) => ({
    category,
    totalRevenue: round3(totalRevenue)
  }));
};
// ---------- Hourly Stats ----------
const getHourlyStats = async (month) => {
  const parsed = parseMonth(month);
  const firstDay = parsed ? new Date(parsed.year, parsed.month-1,1) : null;
  const lastDay = parsed ? new Date(parsed.year, parsed.month,0,23,59,59,999) : null;

  const orders = parsed
  ? await Order.findAll({ where: { createdAt: { [Op.between]: [firstDay, lastDay] } } })
  : await Order.findAll();

  return Array.from({ length: 24 }, (_, i) => {
    const count = orders.filter(o => new Date(o.createdAt).getHours() === i).length;
    return { hour: `${i}:00`, orders: count };
  });
};

// ---------- Weekly Comparison ----------
const getWeeklyComparison = async () => {
  const today = new Date();
  const lastWeek = new Date(); lastWeek.setDate(today.getDate() - 7);
  const previousWeekStart = new Date(lastWeek.getTime() - 7*24*60*60*1000);

  const currentWeekOrders = await Order.findAll({ where: { createdAt: { [Op.gte]: lastWeek } } });
  const lastWeekOrders = await Order.findAll({ where: { createdAt: { [Op.between]: [previousWeekStart, lastWeek] } } });

  const growthPercent = lastWeekOrders.length
    ? ((currentWeekOrders.length - lastWeekOrders.length)/lastWeekOrders.length)*100
    : 0;

  return { growthPercent: round3(growthPercent) };
};

// ---------- Daily Revenue ----------
const getDailyRevenue = async (month) => {
  const parsed = parseMonth(month);
  if (!parsed) return [];

  const firstDay = new Date(parsed.year, parsed.month-1,1);
  const lastDay = new Date(parsed.year, parsed.month,0,23,59,59,999);

  const orders = await Order.findAll({ where: { createdAt: { [Op.between]: [firstDay, lastDay] } } });

  const revenueMap = {};
  orders.forEach(order => {
    const day = new Date(order.createdAt).toISOString().slice(0,10);
    if (!revenueMap[day]) revenueMap[day] = 0;
    revenueMap[day] += Number(order.total||0);
  });

  return Object.entries(revenueMap)
    .map(([date, revenue]) => ({ date, revenue: round3(revenue) }))
    .sort((a,b) => new Date(a.date) - new Date(b.date));
};

module.exports = {
  getFullDashboard
};