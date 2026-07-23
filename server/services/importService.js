const XLSX = require('xlsx');
const Customer = require('../models/Customer');

const VALID_STATUSES = ['Active', 'Inactive'];
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[0-9+\-()\s]{7,20}$/;

// Accepts a few common header spellings so real-world spreadsheets aren't overly strict
const HEADER_ALIASES = {
  fullname: 'fullName',
  'full name': 'fullName',
  name: 'fullName',
  email: 'email',
  'email address': 'email',
  phone: 'phone',
  'phone number': 'phone',
  mobile: 'phone',
  company: 'company',
  'company name': 'company',
  status: 'status',
  notes: 'notes',
  note: 'notes',
};

const normalizeHeader = (header) => {
  const key = String(header).trim().toLowerCase();
  return HEADER_ALIASES[key] || null;
};

/**
 * Parses an uploaded workbook buffer (xlsx/xls/csv) into an array of raw row objects,
 * keyed by our canonical field names (fullName, email, phone, company, status, notes).
 */
const parseWorkbook = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // header: 1 gives us raw arrays so we can map headers ourselves (handles aliasing/typos)
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });
  if (rows.length === 0) return [];

  const headerRow = rows[0];
  const fieldMap = headerRow.map((h) => normalizeHeader(h));

  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const record = { fullName: '', email: '', phone: '', company: '', status: '', notes: '' };
    fieldMap.forEach((field, idx) => {
      if (field) {
        record[field] = row[idx] !== undefined ? String(row[idx]).trim() : '';
      }
    });
    records.push(record);
  }
  return records;
};

/**
 * Validates a single parsed record against business rules.
 * Returns { errors: string[] } — empty array means the row is valid.
 */
const validateRecord = (record) => {
  const errors = [];

  if (!record.fullName) errors.push('Full Name is required');
  if (!record.email) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(record.email)) {
    errors.push('Invalid email format');
  }
  if (!record.company) errors.push('Company is required');

  if (record.phone && !PHONE_REGEX.test(record.phone)) {
    errors.push('Invalid phone number format');
  }

  // Default to Active if left blank, but reject anything else invalid
  if (record.status) {
    const normalizedStatus = VALID_STATUSES.find(
      (s) => s.toLowerCase() === record.status.toLowerCase()
    );
    if (!normalizedStatus) {
      errors.push('Status must be Active or Inactive');
    } else {
      record.status = normalizedStatus;
    }
  } else {
    record.status = 'Active';
  }

  return errors;
};

/**
 * Full pipeline: parse the file, validate every row, and flag duplicates
 * (both against the existing database and against other rows in the same file).
 *
 * Returns:
 * {
 *   rows: [{ rowNumber, data, errors, isDuplicate, valid }],
 *   summary: { totalRecords, validRecords, failedRecords, duplicateRecords }
 * }
 */
const parseAndValidate = async (buffer) => {
  const rawRecords = parseWorkbook(buffer);

  const existingEmails = new Set(
    (await Customer.find({}).select('email')).map((c) => c.email.toLowerCase())
  );
  const seenInFile = new Set();

  const rows = rawRecords.map((record, index) => {
    const errors = validateRecord(record);
    const emailLower = record.email ? record.email.toLowerCase() : '';

    let isDuplicate = false;
    if (emailLower && (existingEmails.has(emailLower) || seenInFile.has(emailLower))) {
      isDuplicate = true;
    }
    if (emailLower) seenInFile.add(emailLower);

    return {
      rowNumber: index + 2, // +2 accounts for header row + 1-indexing, matches spreadsheet row numbers
      data: record,
      errors,
      isDuplicate,
      valid: errors.length === 0 && !isDuplicate,
    };
  });

  const summary = {
    totalRecords: rows.length,
    validRecords: rows.filter((r) => r.valid).length,
    failedRecords: rows.filter((r) => !r.valid && !r.isDuplicate).length,
    duplicateRecords: rows.filter((r) => r.isDuplicate).length,
  };

  return { rows, summary };
};

module.exports = { parseWorkbook, validateRecord, parseAndValidate };
