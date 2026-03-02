import { Modal, Input, Button, Tag, Tooltip, Spin, Empty , Upload } from 'antd';
import {
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  SearchOutlined,
  ReloadOutlined,
  ImportOutlined,
  GoogleOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  SyncOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';

// ── Mock data (replace with real API call to GET /drive/files) ──────────────
const mockDriveFiles = [
  {
    id: 'f1',
    name: 'Cours_Développement_Mobile_S1.pdf',
    mimeType: 'application/pdf',
    modifiedTime: '2025-01-15T10:30:00Z',
    size: '2.4 MB',
    status: 'converted',      // converted | pending | processing
    webViewLink: '#',
  },
  {
    id: 'f2',
    name: 'TP1_BigData_Hadoop.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    modifiedTime: '2025-01-20T14:00:00Z',
    size: '845 KB',
    status: 'pending',
    webViewLink: '#',
  },
  {
    id: 'f3',
    name: 'Architecture_SOA_Slides.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    modifiedTime: '2025-01-22T09:15:00Z',
    size: '5.1 MB',
    status: 'processing',
    webViewLink: '#',
  },
  {
    id: 'f4',
    name: 'Python_Avancé_Chap3.pdf',
    mimeType: 'application/pdf',
    modifiedTime: '2025-01-25T16:45:00Z',
    size: '1.8 MB',
    status: 'converted',
    webViewLink: '#',
  },
  {
    id: 'f5',
    name: 'JEE_Atelier_Spring_Boot.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    modifiedTime: '2025-01-28T11:20:00Z',
    size: '620 KB',
    status: 'pending',
    webViewLink: '#',
  },
  {
    id: 'f6',
    name: 'Competitive_Programming_Notes.pdf',
    mimeType: 'application/pdf',
    modifiedTime: '2025-02-01T08:00:00Z',
    size: '3.2 MB',
    status: 'converted',
    webViewLink: '#',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const getFileIcon = (mimeType) => {
  // Using theme-appropriate colors instead of hardcoded ones
  if (mimeType?.includes('pdf'))
    return <FilePdfOutlined className="text-error text-xl" />;
  if (mimeType?.includes('wordprocessingml') || mimeType?.includes('msword'))
    return <FileWordOutlined className="text-primary text-xl" />;
  if (mimeType?.includes('presentationml') || mimeType?.includes('powerpoint'))
    return <FilePptOutlined className="text-warning text-xl" />;
  if (mimeType?.includes('image'))
    return <FileImageOutlined className="text-success text-xl" />;
  if (mimeType?.includes('text'))
    return <FileTextOutlined className="text-text-secondary text-xl" />;
  return <FileUnknownOutlined className="text-text-muted text-xl" />;
};

const getFileExtension = (mimeType) => {
  if (mimeType?.includes('pdf')) return 'PDF';
  if (mimeType?.includes('wordprocessingml')) return 'DOCX';
  if (mimeType?.includes('presentationml')) return 'PPTX';
  if (mimeType?.includes('image')) return 'IMG';
  return 'FILE';
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const StatusBadge = ({ status }) => {
  const map = {
    converted: {
      icon: <CheckCircleFilled />,
      label: 'Converted',
      color: 'success',
    },
    pending: {
      icon: <ClockCircleOutlined />,
      label: 'Pending',
      color: 'default',
    },
    processing: {
      icon: <SyncOutlined spin />,
      label: 'Processing',
      color: 'processing',
    },
  };
  const cfg = map[status] || map.pending;
  
  // Keep Ant Design tag as is - it has its own styling system
  return (
    <Tag icon={cfg.icon} color={cfg.color} className="text-xs">
      {cfg.label}
    </Tag>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const DriveFilesModal = ({ open, onClose, classData }) => {
  const [files, setFiles] = useState([]); // Existing backend/fetched files
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(null);

  const [openPicker] = useDrivePicker();

  // Simulate fetching from GET /drive/files?classId=xxx
  const fetchFiles = () => {
    setLoading(true);
    setSearch('');
    setTimeout(() => {
      setFiles(mockDriveFiles);
      setFiltered(mockDriveFiles);
      setLoading(false);
    }, 900);
  };

  useEffect(() => {
    if (open) fetchFiles();
  }, [open]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    if (!term.trim()) return setFiltered(files);
    setFiltered(
      files.filter((f) => f.name.toLowerCase().includes(term.toLowerCase()))
    );
  };

  // Simulate POST /drive/import  →  triggers FastAPI conversion
  const handleConvert = (file) => {
    setConverting(file.id);
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: 'processing' } : f))
      );
      setFiltered((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: 'processing' } : f))
      );
      setConverting(null);

      // Simulate conversion completing after 3s
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: 'converted' } : f))
        );
        setFiltered((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: 'converted' } : f))
        );
      }, 3000);
    }, 1200);
  };

    const handleGoogleImport = () => {
    openPicker({
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      developerKey: import.meta.env.VITE_GOOGLE_DEV_SECRET,
      viewId: 'DOCS', // or 'FOLDERS'
      showUploadView: false,
      supportDrives: true,
      multiselect: true,
      callbackFunction: (data) => {
        if (data.action === 'picked') {
          const newFiles = data.docs.map((file) => ({
            id: file.id,
            name: file.name,
            webViewLink: file.url,
            mimeType: file.mimeType,
            status: 'pending',
            modifiedTime: new Date(file.lastEditedUtc).toISOString(),
            size: file.sizeBytes ? `${(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : 'Unknown',
          }));
          // Prevent duplicates
          setFiles((prev) => {
            const existingIds = new Set(prev.map((f) => f.id));
            const uniqueNewFiles = newFiles.filter((f) => !existingIds.has(f.id));
            return [...prev, ...uniqueNewFiles];
          });
          setFiltered((prev) => {
            const existingIds = new Set(prev.map((f) => f.id));
            const uniqueNewFiles = newFiles.filter((f) => !existingIds.has(f.id));
            return [...prev, ...uniqueNewFiles];
          });
        }
      },
    });
  };



  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      title={null}
      className="drive-modal"
      styles={{
        content: { 
          padding: 0, 
          borderRadius: '12px', 
          overflow: 'hidden',
          backgroundColor: 'var(--color-surface)',
        },
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      {/* ── Header ── */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-bg/20 dark:bg-primary/30 rounded-lg p-2">
              <GoogleOutlined className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-text font-semibold text-lg leading-tight">
                Google Drive Files
              </h2>
              <p className="text-text/80 dark:text-text-secondary text-sm">
                {classData?.title || 'Course Files'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
              <Button
                icon={<GoogleOutlined />}
                className='border-border text-text hover:text-primary hover:border-primary'
                onClick={handleGoogleImport}
              >
                Import from Google Drive
              </Button>
              <Upload
                name="file"
                multiple
                showUploadList={false}
              >
                <Button
                  className="border-border text-text hover:text-primary hover:border-primary"
                >
                  <UploadOutlined className="text-lg" />
                  Upload File
                </Button>
              </Upload>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-6 py-4 border-b border-border bg-surface flex items-center gap-3">
        <Input
          prefix={<SearchOutlined className="text-text-muted" />}
          placeholder="Search files..."
          value={search}
          onChange={handleSearch}
          allowClear
          className="flex-1 bg-surface border-border text-text"
        />
        <Tooltip title="Refresh files">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchFiles}
            loading={loading}
            className="shrink-0 border-border text-text hover:text-primary"
          />
        </Tooltip>
      </div>

      {/* ── File List ── */}
      <div className="bg-bg" style={{ minHeight: 320, maxHeight: 420, overflowY: 'auto' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Spin size="large" />
            <p className="text-text-secondary text-sm">
              Fetching files from Google Drive...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Empty
              description={
                <span className="text-text-secondary">No files found</span>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-surface-alt transition-colors duration-150 group"
              >
                {/* Icon + extension badge */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-surface-alt text-text-muted text-[9px] font-bold px-1 rounded leading-tight border border-border">
                    {getFileExtension(file.mimeType)}
                  </span>
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-text font-medium text-sm truncate">
                    {file.name}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">
                    {formatDate(file.modifiedTime)} · {file.size}
                  </p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  <StatusBadge status={file.status} />
                </div>

                {/* Action */}
                <div className="shrink-0">
                  {file.status === 'converted' ? (
                    <>
                    <Tooltip title="View converted course">
                      <Button 
                        size="small" 
                        type="link" 
                        className="text-primary p-0 hover:text-primary-hover"
                      >
                        View
                      </Button>
                    </Tooltip>
                    <Tooltip title="Delete converted course">
                      <Button
                        size="small"
                        type="text"
                        danger
                        className="p-0 hover:bg-red-50"
                        icon={<DeleteOutlined />}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                    </>
                  ) : file.status === 'processing' ? (
                    <></>
                  ) : (
                    <Tooltip title="Convert to Markdown course">
                      <Button
                        size="small"
                        type="primary"
                        icon={<ImportOutlined />}
                        loading={converting === file.id}
                        onClick={() => handleConvert(file)}
                        className="text-primary p-0 hover:text-primary-hover"
                      >
                        Convert
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between">
        <p className="text-text-muted text-xs">
          Files are converted to Markdown via the AI microservice
        </p>
        <Button 
          onClick={onClose}
          className="border-border text-text hover:text-primary hover:border-primary"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default DriveFilesModal;