package com.fixitnow.backend.controller;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.backend.service.AdminReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getRevenue() {
        return adminReportService.getRevenueLast30Days();
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getStatusDistribution() {
        return adminReportService.getStatusDistribution();
    }

    @GetMapping("/top-services")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getTopServices() {
        return adminReportService.getTopServices();
    }

    @GetMapping("/top-providers")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getTopProviders() {
        return adminReportService.getTopProviders();
    }

    @GetMapping("/top-customers")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getTopCustomers() {
        return adminReportService.getTopCustomers();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportSummaryPdf() {
        try {
            List<Map<String, Object>> revenue = adminReportService.getRevenueLast30Days();
            List<Map<String, Object>> status = adminReportService.getStatusDistribution();
            List<Map<String, Object>> topServices = adminReportService.getTopServices();
            List<Map<String, Object>> topProviders = adminReportService.getTopProviders();
            List<Map<String, Object>> topCustomers = adminReportService.getTopCustomers();

            java.awt.Color brandBlue = new java.awt.Color(25, 118, 210);
            java.awt.Color zebra = new java.awt.Color(245, 248, 255);

            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4, 36, 36, 54, 54);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            com.lowagie.text.pdf.PdfWriter writer = com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);

            // Footer with page numbers and timestamp
            writer.setPageEvent(new com.lowagie.text.pdf.PdfPageEventHelper() {
                final com.lowagie.text.Font footerFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9);
                @Override
                public void onEndPage(com.lowagie.text.pdf.PdfWriter writer, com.lowagie.text.Document document) {
                    com.lowagie.text.pdf.PdfContentByte cb = writer.getDirectContent();
                    String footer = "Page " + writer.getPageNumber() + "  •  Generated " + java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").format(java.time.LocalDateTime.now());
                    com.lowagie.text.Phrase p = new com.lowagie.text.Phrase(footer, footerFont);
                    com.lowagie.text.pdf.ColumnText.showTextAligned(cb, com.lowagie.text.Element.ALIGN_CENTER, p,
                            (document.right() - document.left()) / 2 + document.leftMargin(), document.bottom() - 10, 0);
                }
            });

            document.open();

            // Title page
            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 22, com.lowagie.text.Font.BOLD, brandBlue);
            com.lowagie.text.Font subFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("FixIt Now - Admin Reports", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingBefore(180);
            document.add(title);

            com.lowagie.text.Paragraph logoPh = new com.lowagie.text.Paragraph("[ Logo ]", new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 14, com.lowagie.text.Font.BOLD));
            logoPh.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            logoPh.setSpacingBefore(10);
            document.add(logoPh);

            com.lowagie.text.Paragraph datePh = new com.lowagie.text.Paragraph("Date: " + java.time.LocalDate.now(), subFont);
            datePh.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            datePh.setSpacingBefore(10);
            document.add(datePh);

            document.newPage();

            // Helper fonts
            com.lowagie.text.Font hFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 16, com.lowagie.text.Font.BOLD, brandBlue);
            com.lowagie.text.Font thFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 11, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font tdFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 11);

            // Section 1: Revenue Report
            addSectionHeader(document, "Revenue Report (Last 30 Days)", hFont);
            com.lowagie.text.pdf.PdfPTable revTable = new com.lowagie.text.pdf.PdfPTable(new float[] { 3f, 2f });
            revTable.setWidthPercentage(100);
            addHeaderCell(revTable, "Date", thFont, brandBlue);
            addHeaderCell(revTable, "Revenue", thFont, brandBlue);
            java.math.BigDecimal total = java.math.BigDecimal.ZERO;
            boolean zebraToggle = false;
            for (Map<String, Object> r : revenue) {
                java.math.BigDecimal val = new java.math.BigDecimal(String.valueOf(r.get("revenue")));
                total = total.add(val);
                addBodyCell(revTable, String.valueOf(r.get("date")), tdFont, zebraToggle ? zebra : java.awt.Color.WHITE);
                addBodyCell(revTable, val.toPlainString(), tdFont, zebraToggle ? zebra : java.awt.Color.WHITE);
                zebraToggle = !zebraToggle;
            }
            // Total row
            com.lowagie.text.pdf.PdfPCell totalCell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase("Total", thFont));
            totalCell.setColspan(1);
            totalCell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            totalCell.setBackgroundColor(new java.awt.Color(230, 240, 255));
            revTable.addCell(totalCell);
            com.lowagie.text.pdf.PdfPCell totalValCell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(total.toPlainString(), thFont));
            totalValCell.setBackgroundColor(new java.awt.Color(230, 240, 255));
            revTable.addCell(totalValCell);
            document.add(revTable);

            document.add(new com.lowagie.text.Paragraph(" "));

            // Section 2: Booking Status Distribution
            addSectionHeader(document, "Booking Status Distribution", hFont);
            com.lowagie.text.pdf.PdfPTable statTable = new com.lowagie.text.pdf.PdfPTable(new float[] { 3f, 1.5f });
            statTable.setWidthPercentage(100);
            addHeaderCell(statTable, "Status", thFont, brandBlue);
            addHeaderCell(statTable, "Count", thFont, brandBlue);
            zebraToggle = false;
            int colorIndex = 0;
            java.awt.Color[] rowColors = new java.awt.Color[] {
                new java.awt.Color(224, 242, 254), // light blue
                new java.awt.Color(220, 252, 231), // light green
                new java.awt.Color(254, 240, 138), // light yellow
                new java.awt.Color(204, 251, 241), // light cyan
                new java.awt.Color(254, 226, 226)  // light red
            };
            for (Map<String, Object> s : status) {
                java.awt.Color bg = rowColors[colorIndex % rowColors.length];
                addBodyCell(statTable, String.valueOf(s.get("status")), tdFont, bg);
                addBodyCell(statTable, String.valueOf(s.get("count")), tdFont, bg);
                colorIndex++;
            }
            document.add(statTable);

            document.add(new com.lowagie.text.Paragraph(" "));

            // Section 3: Top Services
            addSectionHeader(document, "Top Services", hFont);
            com.lowagie.text.pdf.PdfPTable svcTable = new com.lowagie.text.pdf.PdfPTable(new float[] { 4f, 1.5f });
            svcTable.setWidthPercentage(100);
            addHeaderCell(svcTable, "Service Name", thFont, brandBlue);
            addHeaderCell(svcTable, "Bookings", thFont, brandBlue);
            zebraToggle = false;
            boolean first = true;
            for (Map<String, Object> s : topServices) {
                java.awt.Color bg = zebraToggle ? zebra : java.awt.Color.WHITE;
                com.lowagie.text.Font cellFont = first ? new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 11, com.lowagie.text.Font.BOLD, new java.awt.Color(16, 185, 129)) : tdFont;
                addBodyCell(svcTable, String.valueOf(s.get("serviceName")), cellFont, bg);
                addBodyCell(svcTable, String.valueOf(s.get("count")), cellFont, bg);
                zebraToggle = !zebraToggle;
                first = false;
            }
            document.add(svcTable);

            document.add(new com.lowagie.text.Paragraph(" "));

            // Section 4: Provider Performance
            addSectionHeader(document, "Provider Performance", hFont);
            com.lowagie.text.pdf.PdfPTable provTable = new com.lowagie.text.pdf.PdfPTable(new float[] { 3f, 2f, 2f });
            provTable.setWidthPercentage(100);
            addHeaderCell(provTable, "Provider", thFont, brandBlue);
            addHeaderCell(provTable, "Completed", thFont, brandBlue);
            addHeaderCell(provTable, "Avg. Rating", thFont, brandBlue);
            zebraToggle = false;
            for (Map<String, Object> p : topProviders) {
                java.awt.Color bg = zebraToggle ? zebra : java.awt.Color.WHITE;
                addBodyCell(provTable, String.valueOf(p.get("providerName")), tdFont, bg);
                addBodyCell(provTable, String.valueOf(p.get("completedCount")), tdFont, bg);
                int stars = (int) Math.round(Double.parseDouble(String.valueOf(p.get("avgRating"))));
                String starStr = stars <= 0 ? "-" : "★".repeat(Math.max(1, Math.min(stars, 5)));
                addBodyCell(provTable, starStr, tdFont, bg);
                zebraToggle = !zebraToggle;
            }
            document.add(provTable);

            document.add(new com.lowagie.text.Paragraph(" "));

            // Section 5: Top Customers
            addSectionHeader(document, "Top Customers", hFont);
            com.lowagie.text.pdf.PdfPTable custTable = new com.lowagie.text.pdf.PdfPTable(new float[] { 3.5f, 1.5f });
            custTable.setWidthPercentage(100);
            addHeaderCell(custTable, "Customer", thFont, brandBlue);
            addHeaderCell(custTable, "Bookings", thFont, brandBlue);
            zebraToggle = false;
            for (Map<String, Object> c : topCustomers) {
                java.awt.Color bg = zebraToggle ? zebra : java.awt.Color.WHITE;
                addBodyCell(custTable, String.valueOf(c.get("customerName")), tdFont, bg);
                addBodyCell(custTable, String.valueOf(c.get("count")), tdFont, bg);
                zebraToggle = !zebraToggle;
            }
            document.add(custTable);

            document.close();

            byte[] pdfBytes = baos.toByteArray();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=admin-reports-summary.pdf");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    private void addSectionHeader(com.lowagie.text.Document doc, String text, com.lowagie.text.Font hFont) throws com.lowagie.text.DocumentException {
        com.lowagie.text.Paragraph h = new com.lowagie.text.Paragraph(text, hFont);
        h.setSpacingBefore(10);
        h.setSpacingAfter(6);
        doc.add(h);
    }

    private void addHeaderCell(com.lowagie.text.pdf.PdfPTable table, String text, com.lowagie.text.Font font, java.awt.Color bg) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(text, font));
        cell.setBackgroundColor(new java.awt.Color(bg.getRed(), bg.getGreen(), bg.getBlue()));
        cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_LEFT);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addBodyCell(com.lowagie.text.pdf.PdfPTable table, String text, com.lowagie.text.Font font, java.awt.Color bg) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(text, font));
        cell.setBackgroundColor(new java.awt.Color(bg.getRed(), bg.getGreen(), bg.getBlue()));
        cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_LEFT);
        cell.setPadding(6);
        table.addCell(cell);
    }
}


