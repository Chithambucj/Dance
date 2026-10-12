export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10;
}

export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
}

export interface PendingInvoiceDetail {
  id?: string;
  amount: number;
  status?: string;
  dueDate?: string | Date | null;
  planName?: string;
  description?: string | null;
}

export function formatIndianCurrency(amount: number): string {
  return amount.toLocaleString("en-IN");
}

export function buildWhatsAppReminderMessage({
  memberName,
  totalOutstanding,
  invoices = [],
  studioName = "StepUp Dance Studio",
}: {
  memberName: string;
  totalOutstanding: number;
  invoices?: PendingInvoiceDetail[];
  studioName?: string;
}): string {
  const cleanName = memberName.trim() || "there";

  if (!invoices || invoices.length <= 1) {
    const inv = invoices?.[0];
    const planDetail = inv?.planName || inv?.description || "Dance Class Membership";
    const formattedDate = inv?.dueDate
      ? new Date(inv.dueDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Immediate";

    return (
      `Hello ${cleanName},\n\n` +
      `This is a gentle payment reminder from ${studioName}.\n\n` +
      `📋 Pending Fee Details:\n` +
      `• Plan: ${planDetail}\n` +
      `• Outstanding Amount: ₹${formatIndianCurrency(totalOutstanding)}\n` +
      `• Due Date: ${formattedDate}\n\n` +
      `Please complete the payment at your earliest convenience to continue your dance classes without interruption.\n\n` +
      `Thank you! 🙏`
    );
  }

  // Multiple pending invoices
  const invoiceLines = invoices
    .map((inv, idx) => {
      const title = inv.planName || inv.description || `Invoice #${idx + 1}`;
      const date = inv.dueDate
        ? new Date(inv.dueDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Due Now";
      return `• ${title}: ₹${formatIndianCurrency(inv.amount)} (Due: ${date})`;
    })
    .join("\n");

  return (
    `Hello ${cleanName},\n\n` +
    `This is a gentle payment reminder from ${studioName}.\n\n` +
    `You have multiple pending fee payments totaling ₹${formatIndianCurrency(totalOutstanding)}:\n\n` +
    `${invoiceLines}\n\n` +
    `Total Outstanding Amount: ₹${formatIndianCurrency(totalOutstanding)}\n\n` +
    `Please complete the payment at your earliest convenience to continue your dance classes without interruption.\n\n` +
    `Thank you! 🙏`
  );
}

export function buildExpiredTrialReminderMessage({
  memberName,
  studioName = "StepUp Dance Studio",
}: {
  memberName: string;
  studioName?: string;
}): string {
  const cleanName = memberName.trim() || "there";
  return `Hi ${cleanName}! 😊 Hope you enjoyed your free trial at ${studioName}! 💃 We'd love to welcome you to our regular dance classes. Let us know if you'd like to explore our membership plans. Hope to see you dancing with us again! 🎶`;
}

export function getWhatsAppUrl({
  phone,
  message,
}: {
  phone: string;
  message: string;
}): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
