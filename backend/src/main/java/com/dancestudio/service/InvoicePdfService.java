package com.dancestudio.service;

import com.dancestudio.entity.Invoice;
import com.dancestudio.entity.StudioSettings;
import com.dancestudio.repository.InvoiceRepository;
import com.dancestudio.repository.StudioSettingsRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private StudioSettingsRepository studioSettingsRepository;

    public byte[] generateInvoicePdf(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        StudioSettings settings = studioSettingsRepository.findById("default")
                .orElse(new StudioSettings());

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");

            // Brand Header Table
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{3f, 2f});

            // Studio Info Cell
            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(255, 119, 0));
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            Font invoiceTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(30, 41, 59));

            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.addElement(new Paragraph(settings.getStudioName(), brandFont));
            leftCell.addElement(new Paragraph(settings.getTagline(), subFont));
            leftCell.addElement(new Paragraph(settings.getAddress(), subFont));
            leftCell.addElement(new Paragraph("Phone: " + settings.getPhone() + " | Email: " + settings.getEmail(), subFont));
            headerTable.addCell(leftCell);

            // Invoice Title & Meta Cell
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph invTitle = new Paragraph("TAX INVOICE", invoiceTitleFont);
            invTitle.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(invTitle);

            Paragraph invNumber = new Paragraph("Invoice #: " + invoice.getInvoiceNumber(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK));
            invNumber.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(invNumber);

            Paragraph invDate = new Paragraph("Date: " + invoice.getIssueDate().format(formatter), subFont);
            invDate.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(invDate);

            Paragraph invStatus = new Paragraph("Status: " + invoice.getPaymentStatus(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(16, 185, 129)));
            invStatus.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(invStatus);

            headerTable.addCell(rightCell);
            document.add(headerTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("----------------------------------------------------------------------------------------------------------------------------------", FontFactory.getFont(FontFactory.HELVETICA, 8, Color.LIGHT_GRAY)));
            document.add(new Paragraph(" "));

            // Billed To Table
            PdfPTable billTable = new PdfPTable(2);
            billTable.setWidthPercentage(100);

            PdfPCell billedToCell = new PdfPCell();
            billedToCell.setBorder(Rectangle.NO_BORDER);
            billedToCell.addElement(new Paragraph("BILLED TO:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.GRAY)));
            billedToCell.addElement(new Paragraph(invoice.getUser().getFullName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.BLACK)));
            billedToCell.addElement(new Paragraph("Email: " + invoice.getUser().getEmail(), subFont));
            if (invoice.getUser().getPhone() != null) {
                billedToCell.addElement(new Paragraph("Phone: " + invoice.getUser().getPhone(), subFont));
            }
            billTable.addCell(billedToCell);

            PdfPCell planDetailsCell = new PdfPCell();
            planDetailsCell.setBorder(Rectangle.NO_BORDER);
            planDetailsCell.addElement(new Paragraph("MEMBERSHIP DETAILS:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.GRAY)));
            planDetailsCell.addElement(new Paragraph("Plan: " + invoice.getPlanName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK)));
            planDetailsCell.addElement(new Paragraph("Payment Method: " + invoice.getPaymentMethod(), subFont));
            if (invoice.getStartDate() != null && invoice.getEndDate() != null) {
                planDetailsCell.addElement(new Paragraph("Validity: " + invoice.getStartDate().format(formatter) + " - " + invoice.getEndDate().format(formatter), subFont));
            }
            billTable.addCell(planDetailsCell);

            document.add(billTable);
            document.add(new Paragraph(" "));

            // Items Table
            PdfPTable itemTable = new PdfPTable(4);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{4f, 2f, 2f, 2f});

            // Table Header
            String[] headers = {"Description", "Duration", "Method", "Amount (INR)"};
            for (String h : headers) {
                PdfPCell c = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
                c.setBackgroundColor(new Color(30, 41, 59));
                c.setPadding(8);
                c.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemTable.addCell(c);
            }

            // Table Row
            PdfPCell descCell = new PdfPCell(new Phrase(invoice.getPlanName() + " Dance Membership", subFont));
            descCell.setPadding(8);
            itemTable.addCell(descCell);

            PdfPCell durCell = new PdfPCell(new Phrase("Full Term", subFont));
            durCell.setPadding(8);
            durCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            itemTable.addCell(durCell);

            PdfPCell methodCell = new PdfPCell(new Phrase(invoice.getPaymentMethod(), subFont));
            methodCell.setPadding(8);
            methodCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            itemTable.addCell(methodCell);

            PdfPCell amtCell = new PdfPCell(new Phrase("Rs. " + String.format("%,.2f", invoice.getAmount()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK)));
            amtCell.setPadding(8);
            amtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemTable.addCell(amtCell);

            // Total Row
            PdfPCell emptyCell = new PdfPCell(new Phrase(""));
            emptyCell.setColspan(2);
            emptyCell.setBorder(Rectangle.NO_BORDER);
            itemTable.addCell(emptyCell);

            PdfPCell totalLabel = new PdfPCell(new Phrase("Total Paid:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK)));
            totalLabel.setPadding(8);
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemTable.addCell(totalLabel);

            PdfPCell totalVal = new PdfPCell(new Phrase("Rs. " + String.format("%,.2f", invoice.getAmount()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(255, 119, 0))));
            totalVal.setPadding(8);
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemTable.addCell(totalVal);

            document.add(itemTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // Footer / Terms
            Paragraph termsTitle = new Paragraph("Terms & Instructions:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.DARK_GRAY));
            document.add(termsTitle);

            Paragraph terms = new Paragraph("1. This is a computer-generated invoice and does not require a physical signature.\n" +
                    "2. Membership fees are non-refundable and non-transferable.\n" +
                    "3. Please arrive 10 minutes prior to your scheduled dance batch time.\n" +
                    "4. For support, contact " + settings.getEmail() + " or WhatsApp " + settings.getPhone() + ".", FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY));
            document.add(terms);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF invoice", e);
        }
    }
}
