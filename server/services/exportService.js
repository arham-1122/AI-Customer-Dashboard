const XLSX = require('xlsx');

/**
 * Converts an array of Customer documents into an .xlsx buffer ready to send as a download.
 */
const buildCustomerWorkbook = (customers) => {
  const rows = customers.map((c) => ({
    'Full Name': c.fullName,
    Email: c.email,
    Phone: c.phone,
    Company: c.company,
    Status: c.status,
    Notes: (c.notes || []).map((n) => n.text).join(' | '),
    'Created Date': c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  // Reasonable column widths so the export is readable without manual resizing
  worksheet['!cols'] = [
    { wch: 22 }, // Full Name
    { wch: 28 }, // Email
    { wch: 16 }, // Phone
    { wch: 22 }, // Company
    { wch: 10 }, // Status
    { wch: 40 }, // Notes
    { wch: 14 }, // Created Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = { buildCustomerWorkbook };
