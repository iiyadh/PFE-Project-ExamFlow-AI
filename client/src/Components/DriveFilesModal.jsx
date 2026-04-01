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
  FolderOpenOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  SyncOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import api from '../lib/api';


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
  const [uploading, setUploading] = useState(false);

  // Simulate fetching from GET /drive/files?classId=xxx
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/file/${classData._id}`);
      setFiles(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
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

  const handleConvert = async (file) => {
    setConverting(file._id);
    const updateStatus = (status) => {
      setFiles((prev) => prev.map((f) => (f._id === file._id ? { ...f, status } : f)));
      setFiltered((prev) => prev.map((f) => (f._id === file._id ? { ...f, status } : f)));
    };
    updateStatus('processing');
    try {
      await api.post(`/file/convert/${file._id}`, { classId: classData._id });
      updateStatus('converted');
    } catch {
      updateStatus('failed');
    } finally {
      setConverting(null);
    }
  };



  const handleUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('mimeType', file.type);
      formData.append('modifiedTime', new Date().toISOString());
      formData.append('size', `${(file.size / (1024 * 1024)).toFixed(2)} MB`);

      const saveRes = await api.post(`/file/${classData._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const savedFile = saveRes.data;
      setFiles((prev) => [...prev, savedFile]);
      setFiltered((prev) => [...prev, savedFile]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };



  const handleDelete = async (file) => {
    try{
      await api.delete(`/file/${file._id}`);
      setFiles((prev) => prev.filter((f) => f._id !== file._id));
      setFiltered((prev) => prev.filter((f) => f._id !== file._id));
    }catch(err){
      console.error('Delete failed:', err);
    }
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
      <>
      {/* ── Header ── */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-bg/20 dark:bg-primary/30 rounded-lg p-2">
              <FolderOpenOutlined  className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-text font-semibold text-lg leading-tight">
                Drive Files
              </h2>
              <p className="text-text/80 dark:text-text-secondary text-sm">
                {classData?.title || 'Course Files'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
              <Upload
                name="file"
                multiple
                showUploadList={false}
                customRequest={({ file }) => handleUpload(file)}
                loading={uploading}
              >
                <Button
                  className="border-border text-text hover:text-primary hover:border-primary"
                  loading={uploading}
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
                        onClick={() => handleDelete(file)}
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
      </>
    </Modal>
  );
};

export default DriveFilesModal;