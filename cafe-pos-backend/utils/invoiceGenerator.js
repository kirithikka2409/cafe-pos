const PDFDocument = require("pdfkit");

const generateInvoice = (res, order) => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream PDF to response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=invoice-order-${order.id}.pdf`
  );

  doc.pipe(res);

  // ===== HEADER =====
  doc
    .fontSize(20)
    .text("Restaurant POS Invoice", { align: "center" })
    .moveDown();

  doc.fontSize(12);
  doc.text(`Order ID: ${order.id}`);
  doc.text(`Table: ${order.tableId ?? "N/A"}`);
  doc.text(`Status: ${order.status}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.moveDown();

  // ===== ITEMS =====
  doc.fontSize(14).text("Items");
  doc.moveDown(0.5);

  order.items.forEach((item, index) => {
    doc
      .fontSize(12)
      .text(
        `${index + 1}. ${item.menuItem.name} | Qty: ${
          item.quantity
        } | Price: ${item.price} | Total: ${
          item.quantity * item.price
        }`
      );
  });

  doc.moveDown();

  // ===== TOTAL =====
  doc
    .fontSize(14)
    .text(`Total Amount: ₹${order.totalAmount}`, { align: "right" });

  doc.moveDown(2);

  // ===== FOOTER =====
  doc
    .fontSize(10)
    .text("Thank you for dining with us!", { align: "center" });

  doc.end();
};

//Export the function
module.exports = generateInvoice;