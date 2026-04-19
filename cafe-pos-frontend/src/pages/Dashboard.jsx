import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import AdminLayout from "../components/AdminLayout";
import CountUp from "react-countup";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const dashboardRef = useRef();
  const summaryRef = useRef();
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filteredSummary, setFilteredSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStats, setPaymentStats] = useState([]);
  const [weeklyComparison, setWeeklyComparison] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [hourlyStats, setHourlyStats] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadFullDashboard();
  }, [selectedMonth, selectedDate]);

  const exportToPDF = async () => {
    const element = dashboardRef.current;

    const canvas = await html2canvas(element, {
      scale: 2
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while ( heightLeft >=0 ) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight;
    }

    pdf.save("Cafe_POS_Dashboard.pdf");
  };

  const exportSummaryPDF = async() => {
    const element = summaryRef.current;

    const canvas = await html2canvas(element, {
      scale: 2
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);

    const today = new Date().toISOString().split("T")[0];
    pdf.save(`Cafe_Summary_${today}.pdf`);
  };

  const exportDateRange = async() => {
    const res = await api.get("/dashboard/range", {
      params: { startDate, endDate }
    });

    const data = res.data;

    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Cafe POS Date Range Report", 20, 20);

    pdf.setFontSize(12);
    pdf.text(`From: ${startDate}`, 20, 40);
    pdf.text(`To: ${endDate}`, 20, 50);
    pdf.text(`Total Orders: ${data.totalOrders}`, 20, 70);
    pdf.text(`Total Revenue: ${data.totalRevenue.toFixed(3)}OMR`, 20, 80);
    pdf.save(`Cafe_Report_${startDate}_to_${endDate}.pdf`);
  };

  const loadFullDashboard = async () => {
    try {
      setLoading(true);
      const params = { month: selectedMonth };
      if (selectedDate) params.date = selectedDate;

      const res = await api.get("/dashboard/full", { params });

      setSummary(res.data.summary);
      setMonthly(res.data.monthly);
      setTopItems(res.data.topItems);
      setPaymentStats(res.data.paymentStats);
      setCategoryStats(res.data.categoryStats);
      setHourlyStats(res.data.hourlyStats);
      setWeeklyComparison(res.data.weeklyComparison || null);
      setDailyRevenue(res.data.dailyRevenue || (selectedDate ? [{ date: selectedDate, revenue: res.data.summary.totalRevenue }] : []));
      setFilteredSummary(selectedDate ? res.data.summary : null);

    } catch (err) {
      console.error("Failed to load full dashboard:", err);
    }
   finally {
    setLoading(false);
  }

}
if(loading) {
  return (
    <div className="dashboard-loading">
      <div className="spinner"></div>
      <p><center>Loading Dashboard...</center></p>
    </div>
  );
};

 const displaySummary = filteredSummary || summary;
  const todayRevenue = summary?.totalRevenue || 0;
  const selectedRevenue = filteredSummary?.totalRevenue || todayRevenue;
  const revenueDifference = selectedRevenue - todayRevenue;
  const revenuePercent = todayRevenue > 0 ? ((revenueDifference / todayRevenue) * 100).toFixed(1) : 0;

  // ------------------- CHART DATA ------------------- //
  const topItemsPieData = {
    labels: topItems.map(item => item.name),
    datasets: [{
      data: topItems.map(item => item.qty),
      backgroundColor: ["#ff9800", "#4caf50", "#2196f3", "#9c27b0", "#f44336"],
      borderColor: "#fff",
      borderWidth: 1
    }]
  };

  const paymentChartData = {
    labels: paymentStats.map(p => p.paymentMethod),
    datasets: [{
      data: paymentStats.map(p => p.total),
      backgroundColor: ["#4caf50", "#ff9800"]
    }]
  };

  const categoryChartData = {
    labels: categoryStats.map(c => c.category),
    datasets: [{
      label: "Category Revenue",
      data: categoryStats.map(c => c.totalRevenue),
      backgroundColor: "#03a9f4"
    }]
  };

  const hourlyChartData = {
    labels: hourlyStats.map(h => h.hour),
    datasets: [{
      label: "Orders by Hour",
      data: hourlyStats.map(h => h.orders),
      borderColor: "#ff5722",
      fill: false
    }]
  };

  const dailyRevenueChartData = {
    labels: dailyRevenue.map(d => d.date),
    datasets: [{
      label: "Revenue (OMR)",
      data: dailyRevenue.map(d => d.revenue),
      borderColor: "#4caf50",
      backgroundColor: "rgba(76,175,80,0.2)",
      fill: true,
      tension: 0.3,
      pointRadius: dailyRevenue.map(d => selectedDate && d.date === selectedDate ? 8 : 4),
      pointBackgroundColor: dailyRevenue.map(d => selectedDate && d.date === selectedDate ? "#f44336" : "#4caf50")
    }]
  };

  return (
    <AdminLayout>
      <div ref={dashboardRef} style={{ padding: 30, fontFamily: "'Segoe UI', sans-serif" }}>
        <h2>📊 Cafe POS Dashboard</h2>

        <div style={{ display:"flex", gap: 20}}>
        <button
        onClick={exportToPDF}
        style = {
          {
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 20
          }
        }
        >
          📥 Export to PDF
        </button> 
        
        <button
        onClick={exportSummaryPDF}
        style = {
          {
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 20
          }
        }
        >
          📄 Export Summary
        </button>
        </div>
        
        <div style={{ marginBottom: 30 }}>
        <h3> 📅 Export by Date Range </h3>

        <div style={{ display:"flex", gap:5}}>
        <input 
        type = "date"
        value = { startDate }
        onChange = { e => setStartDate(e.target.value)}
        />

        <input
        type = "date"
        value = { endDate }
        onChange = { e => setEndDate(e.target.value)}
        />
        </div>

        <div style={{display: "flex"}}>
        <button
        onClick={exportDateRange}
        style = {
          {
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 20
          }
        }
        >
          📄 Export By Date
        </button>
        

        </div>
        </div>

        

        {/* Summary Cards */}
        <div ref = { summaryRef }
        style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 30 }}>
        
          <div style={cardStyle("#2196f3")}>
            <h4>Total Orders {selectedDate ? `on ${selectedDate}` : "Today"}</h4>
            <p>{displaySummary.totalOrders}</p>
          </div>
          <div style={cardStyle("#4caf50")}>
            <h4>Total Revenue {selectedDate ? `on ${selectedDate}` : "Today"}</h4>
            <p>
              <CountUp 
              end = {displaySummary.totalRevenue || 0 }
              duration = {1.5}
              decimals = {3}
              />{" "} OMR</p>
          </div>
          <div style={cardStyle("#ff5722")}>
            <h4>Total VAT {selectedDate ? `on ${selectedDate}` : "Today"}</h4>
            <p>
              <CountUp 
              end = {displaySummary.totalVat || 0 }
              duration = {1.5}
              decimals = {3}
              />{" "} OMR</p>
          </div>
          <div style={cardStyle("#9c27b0")}>
            <h4>Total Discount {selectedDate ? `on ${selectedDate}` : "Today"}</h4>
            <p>
              <CountUp 
              end = {displaySummary.totalDiscount || 0 }
              duration = {1.5}
              decimals = {3}
              />{" "} OMR</p>
          </div>
        </div>

              {/* Revenue Comparison */}
        {selectedDate && (
          <div style={{ marginTop: 20, padding: 20, backgroundColor: revenueDifference >= 0 ? "#e8f5e9" : "#ffebee", borderRadius: 8, textAlign: "center" }}>
            <h4>📊 Comparison with Today</h4>
            <p>{revenueDifference >= 0 ? "📈 Increase" : "📉 Decrease"} of {Math.abs(revenueDifference).toFixed(3)} OMR</p>
            <p>{revenuePercent}% compared to today</p>
          </div>
        )}

        {weeklyComparison && (
          <div style={{ marginTop: 20 }}>
            <h4>📈 7-Day Growth: {weeklyComparison.growthPercent}%</h4>
          </div>
        )}

        {/* Monthly Summary */}
        <h3>📅 Monthly Summary</h3>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 30 }}>
          <div style={cardStyle("#03a9f4")}>
            <h4>Total Orders</h4>
            <p>{monthly?.totalOrders}</p>
          </div>
          <div style={cardStyle("#8bc34a")}>
            <h4>Total Revenue</h4>
            <p>{monthly?.totalRevenue?.toFixed(3)} OMR</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 30 }}>
          <h3>🔎 Filter By Date</h3>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
        </div>

        <div style={{ marginBottom: 30 }}>
          <h3>🔥 Month Selector</h3>
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} min="2020-01" max={new Date().toISOString().slice(0,7)} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
        </div>

        {/* Charts */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <Pie data={topItemsPieData} />
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <h3>📈 Daily Revenue</h3>
          <Line data={dailyRevenueChartData} />
        </div>

        <div style={{ marginTop: 40 }}>
          <h3>💳 Payment Method Breakdown</h3>
          <Pie data={paymentChartData} />
        </div>

        {categoryStats?.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h3>🥇 Category Performance</h3>
            <Bar data={categoryChartData} />
          </div>
        )}

        <div style={{ marginTop: 40 }}>
          <h3>⏱ Peak Selling Hours</h3>
          <Line data={hourlyChartData} />
        </div>
      </div>
    </AdminLayout>
  );
}

const cardStyle = (bgColor) => ({
  flex: "1 1 200px",
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(10px)",
  borderRadius: 16,
  padding: 25,
  color: "#fff",
  backgroundColor: bgColor,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  transition: "transform 0.3s ease"
});

export default Dashboard;