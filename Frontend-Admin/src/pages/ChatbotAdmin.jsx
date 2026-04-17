import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Row, Col, Card, Table, Button, Upload, Tag, Space, Typography,
  Popconfirm, message, Tooltip, Badge, Input, Spin, Divider, Alert,
} from 'antd';
import {
  UploadOutlined, ReloadOutlined, DeleteOutlined, DownloadOutlined,
  SendOutlined, RobotOutlined, FileTextOutlined,
} from '@ant-design/icons';
import {
  listFiles, uploadFile, reindexFile, deleteFile, getDownloadUrl,
  createSession, streamAnswer, checkReady,
} from '../services/chatbotAdminApi';

const { Text, Title } = Typography;
const { TextArea } = Input;

// ─── File status tag ─────────────────────────────────────────────────────────

const StatusTag = ({ indexed }) =>
  indexed
    ? <Tag color="success">Đã index</Tag>
    : <Tag color="default">Chưa index</Tag>;

// ─── File Manager Panel ───────────────────────────────────────────────────────

const FileManager = ({ onFileChange }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionKey, setActionKey] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFiles();
      setFiles(data.items ?? []);
    } catch (err) {
      message.error(`Không thể tải danh sách file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async ({ file }) => {
    setUploading(true);
    try {
      await uploadFile(file);
      message.success(`Tải lên thành công: ${file.name}`);
      await fetchFiles();
      onFileChange?.();
    } catch (err) {
      message.error(`Tải lên thất bại: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleReindex = async (filename) => {
    setActionKey(filename + '-reindex');
    try {
      await reindexFile(filename);
      message.success(`Đã reindex: ${filename}`);
      await fetchFiles();
      onFileChange?.();
    } catch (err) {
      message.error(`Reindex thất bại: ${err.message}`);
    } finally {
      setActionKey(null);
    }
  };

  const handleDelete = async (filename) => {
    setActionKey(filename + '-delete');
    try {
      await deleteFile(filename);
      message.success(`Đã xóa: ${filename}`);
      await fetchFiles();
      onFileChange?.();
    } catch (err) {
      message.error(`Xóa thất bại: ${err.message}`);
    } finally {
      setActionKey(null);
    }
  };

  const columns = [
    {
      title: 'Tên file',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
      render: (name) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <Tooltip title={name}>
            <Text style={{ maxWidth: 180, display: 'inline-block' }} ellipsis>{name}</Text>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Kích thước',
      dataIndex: 'size_bytes',
      key: 'size_bytes',
      width: 90,
      render: (v) => v != null ? `${(v / 1024).toFixed(1)} KB` : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'indexed',
      key: 'indexed',
      width: 110,
      render: (v) => <StatusTag indexed={v} />,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Reindex">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              loading={actionKey === record.name + '-reindex'}
              onClick={() => handleReindex(record.name)}
            />
          </Tooltip>
          <Tooltip title="Tải xuống">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              href={getDownloadUrl(record.name)}
              target="_blank"
            />
          </Tooltip>
          <Popconfirm
            title={`Xóa "${record.name}"?`}
            onConfirm={() => handleDelete(record.name)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={actionKey === record.name + '-delete'}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined />
          <span>Quản lý file index</span>
          <Badge count={files.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} size="small" onClick={fetchFiles} loading={loading}>
            Làm mới
          </Button>
          <Upload
            customRequest={handleUpload}
            accept=".pdf,.docx,.doc,.txt,.md"
            showUploadList={false}
            multiple={false}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              size="small"
              loading={uploading}
            >
              Tải lên
            </Button>
          </Upload>
        </Space>
      }
      bodyStyle={{ padding: '0' }}
    >
      <Table
        dataSource={files}
        columns={columns}
        rowKey="name"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: false, size: 'small' }}
        locale={{ emptyText: 'Chưa có file nào. Hãy tải lên tài liệu hướng dẫn.' }}
      />
    </Card>
  );
};

// ─── Chat Preview Panel ───────────────────────────────────────────────────────

const BOT_WELCOME = {
  id: 'welcome',
  role: 'bot',
  content: 'Xin chào! Đây là khu vực thử nghiệm chatbot. Hãy đặt câu hỏi về hệ thống SXXK.',
};

const ChatPreview = ({ refreshKey }) => {
  const [msgs, setMsgs] = useState([BOT_WELCOME]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);

  const endRef = useRef(null);
  const abortRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Check service on mount and when files change
  useEffect(() => {
    checkReady().then(setServiceStatus);
  }, [refreshKey]);

  // Reset session when files are updated so next question re-indexes
  useEffect(() => {
    if (refreshKey > 0) setSessionId(null);
  }, [refreshKey]);

  const ensureSession = useCallback(async (question) => {
    if (sessionId) return sessionId;
    const s = await createSession(`Admin preview: ${question.slice(0, 40)}`);
    setSessionId(s.id);
    return s.id;
  }, [sessionId]);

  const appendBotStreaming = (id) =>
    setMsgs((prev) => [...prev, { id, role: 'bot', content: '', streaming: true }]);

  const appendChunk = (id, chunk) =>
    setMsgs((prev) =>
      prev.map((m) => m.id === id ? { ...m, content: m.content + chunk } : m)
    );

  const finalizeBot = (id) =>
    setMsgs((prev) =>
      prev.map((m) => m.id === id ? { ...m, streaming: false } : m)
    );

  const appendError = (id, errText) =>
    setMsgs((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, content: errText || 'Đã xảy ra lỗi.', streaming: false, isError: true }
          : m
      )
    );

  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q || streaming) return;
    setInput('');

    setMsgs((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: q },
    ]);
    setStreaming(true);

    const botId = `b-${Date.now()}`;
    appendBotStreaming(botId);

    try {
      const sid = await ensureSession(q);
      abortRef.current?.();
      abortRef.current = streamAnswer(sid, q, {
        onChunk: (c) => appendChunk(botId, c),
        onDone: () => { finalizeBot(botId); setStreaming(false); },
        onError: (e) => { appendError(botId, e); setStreaming(false); },
      });
    } catch (err) {
      appendError(botId, `Lỗi kết nối: ${err.message}`);
      setStreaming(false);
    }
  }, [input, streaming, ensureSession]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>Thử nghiệm chatbot</span>
          {serviceStatus && (
            <Tag color={serviceStatus.ok ? 'success' : 'error'}>
              {serviceStatus.ok ? 'Online' : 'Offline'}
            </Tag>
          )}
        </Space>
      }
      extra={
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={() => {
            abortRef.current?.();
            setMsgs([BOT_WELCOME]);
            setSessionId(null);
            setStreaming(false);
          }}
        >
          Cuộc hội thoại mới
        </Button>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minHeight: 0 } }}
    >
      {serviceStatus && !serviceStatus.ok && (
        <Alert
          type="warning"
          message="Chatbot service chưa sẵn sàng. Hãy khởi động service và tải lên ít nhất một tài liệu."
          banner
          style={{ flexShrink: 0 }}
        />
      )}

      {/* Message list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 13,
                lineHeight: 1.6,
                background:
                  m.role === 'user'
                    ? 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)'
                    : m.isError ? '#fff2f0' : '#f5f5f5',
                color: m.role === 'user' ? '#fff' : m.isError ? '#cf1322' : '#333',
              }}
            >
              {m.role === 'user' ? (
                <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
              ) : (
                <div className="md-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  {m.streaming && <Spin size="small" style={{ marginLeft: 4 }} />}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Input */}
      <div style={{ padding: '10px 12px', display: 'flex', gap: 8, flexShrink: 0 }}>
        <Input
          ref={inputRef}
          placeholder="Nhập câu hỏi thử nghiệm..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKey}
          disabled={streaming}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          loading={streaming}
        />
      </div>
    </Card>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ChatbotAdmin = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ padding: '0 0 24px' }}>
      <Title level={4} style={{ marginBottom: 16 }}>Quản lý Chatbot</Title>
      <Row gutter={16} style={{ alignItems: 'stretch' }}>
        <Col xs={24} lg={14}>
          <FileManager onFileChange={() => setRefreshKey((k) => k + 1)} />
        </Col>
        <Col xs={24} lg={10} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 'calc(100vh - 210px)', minHeight: 500 }}>
            <ChatPreview refreshKey={refreshKey} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ChatbotAdmin;
