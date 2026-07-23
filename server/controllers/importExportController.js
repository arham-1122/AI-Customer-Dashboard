const Customer = require('../models/Customer');
const ImportHistory = require('../models/ImportHistory');
const { parseAndValidate } = require('../services/importService');
const { buildCustomerWorkbook } = require('../services/exportService');

// @desc    Parse an uploaded file and return a validated preview (no DB writes)
// @route   POST /api/customers/import/preview
// @access  Private
const previewImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file (.xlsx, .xls, or .csv)' });
    }

    const { rows, summary } = await parseAndValidate(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'No rows could be read from this file. Make sure it has headers: Full Name, Email, Phone, Company, Status, Notes.',
      });
    }

    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        rows,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Commit a previously-previewed import: bulk insert valid rows + log history
// @route   POST /api/customers/import
// @access  Private
const commitImport = async (req, res, next) => {
  try {
    const { fileName, rows } = req.body;

    if (!Array.isArray(rows)) {
      return res.status(400).json({ success: false, message: 'No valid rows were provided to import' });
    }

    // Re-validate on the server rather than trusting the client blindly.
    // Only rows the client marked valid (post-preview) are considered, and we
    // re-check duplicates against the DB at commit time in case data changed since preview.
    const existingEmails = new Set(
      (await Customer.find({}).select('email')).map((c) => c.email.toLowerCase())
    );
    const seenInBatch = new Set();

    const toInsert = [];
    let duplicateRecords = 0;
    let failedRecords = 0;

    rows.forEach((row) => {
      const data = row.data || row; // tolerate either shape
      const emailLower = (data.email || '').toLowerCase();

      if (!data.fullName || !data.email || !data.company) {
        failedRecords++;
        return;
      }
      if (!emailLower || existingEmails.has(emailLower) || seenInBatch.has(emailLower)) {
        duplicateRecords++;
        return;
      }

      seenInBatch.add(emailLower);
      toInsert.push({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        company: data.company,
        status: data.status === 'Inactive' ? 'Inactive' : 'Active',
        notes: data.notes ? [{ text: data.notes }] : [],
        createdBy: req.user._id,
      });
    });

    let inserted = [];
    if (toInsert.length > 0) {
      inserted = await Customer.insertMany(toInsert, { ordered: false });
    }

    const historyEntry = await ImportHistory.create({
      fileName: fileName || 'import.xlsx',
      importedBy: req.user._id,
      totalRecords: rows.length,
      successfulRecords: inserted.length,
      failedRecords,
      duplicateRecords,
    });

    res.status(201).json({
      success: true,
      data: {
        summary: {
          totalRecords: rows.length,
          successfulRecords: inserted.length,
          failedRecords,
          duplicateRecords,
        },
        historyId: historyEntry._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export customers to an .xlsx file (all / active / inactive / current search results)
// @route   GET /api/customers/export
// @access  Private
const exportCustomers = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && ['Active', 'Inactive'].includes(status)) {
      query.status = status;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ fullName: regex }, { email: regex }, { company: regex }];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    const buffer = buildCustomerWorkbook(customers);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// @desc    List import history (most recent first)
// @route   GET /api/import-history
// @access  Private
const getImportHistory = async (req, res, next) => {
  try {
    const history = await ImportHistory.find()
      .populate('importedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = { previewImport, commitImport, exportCustomers, getImportHistory };
