const multer = require('multer');

// Store the file in memory (as a Buffer) since we only need to parse it once with xlsx,
// not persist the raw file anywhere on disk.
const storage = multer.memoryStorage();

const allowedExtensions = ['.xlsx', '.xls', '.csv'];
const allowedMimeTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
  'application/csv',
  'text/plain', // some browsers report csv as text/plain
];

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
  const extOk = allowedExtensions.includes(ext);
  const mimeOk = allowedMimeTypes.includes(file.mimetype);

  if (extOk || mimeOk) {
    return cb(null, true);
  }
  cb(new Error('Unsupported file type. Please upload a .xlsx, .xls, or .csv file.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;
