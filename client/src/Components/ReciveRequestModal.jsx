import { Modal, Avatar } from 'antd';
import { CheckOutlined, LoadingOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { Inbox } from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock incoming request data
const MOCK_REQUESTS = [
    { _id: '1',className:"Ai Intro", teacherName: 'Sarah Johnson', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', requestedAt: '2 hours ago' },
    { _id: '2',className:"Ai Intro", teacherName: 'Mike Chen', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', requestedAt: '5 hours ago' },
    { _id: '3',className:"Ai Intro", teacherName: 'Alex Rivera', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', requestedAt: '1 day ago' },
    { _id: '4',className:"Ai Intro", teacherName: 'Emma Watson', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', requestedAt: '2 days ago' },
    { _id: '5',className:"Ai Intro", teacherName: 'James Okonkwo', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', requestedAt: '3 days ago' },
];

const RequestRow = ({ request, onAccept, onDecline }) => {
    const [status, setStatus] = useState('pending'); // pending | accepting | declining | accepted | declined

    const handleAccept = async () => {
        setStatus('accepting');
        await new Promise(res => setTimeout(res, 900));
        setStatus('accepted');
        onAccept?.(request._id);
    };

    const handleDecline = async () => {
        setStatus('declining');
        await new Promise(res => setTimeout(res, 900));
        setStatus('declined');
        onDecline?.(request._id);
    };

    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-surface-alt group"
            style={{ borderBottom: '1px solid var(--color-border)' }}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <Avatar
                    src={request.pfpUrl}
                    size={46}
                    icon={<UserOutlined />}
                    className="border-2"
                    style={{ borderColor: 'var(--color-border)' }}
                />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-sm" style={{ color: 'var(--color-text)' }}>
                    {request.className}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {request.teacherName} . {request.requestedAt}
                </p>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 flex items-center gap-2">
                {status === 'pending' && (
                    <>
                        <button
                            onClick={handleDecline}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                            style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                        >
                            <CloseOutlined style={{ fontSize: 11 }} /> Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                            style={{ background: 'var(--color-primary)', color: '#fff' }}
                        >
                            <CheckOutlined style={{ fontSize: 11 }} /> Accept
                        </button>
                    </>
                )}
                {status === 'accepting' && (
                    <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                    >
                        <LoadingOutlined style={{ fontSize: 12 }} /> Accepting...
                    </span>
                )}
                {status === 'declining' && (
                    <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                    >
                        <LoadingOutlined style={{ fontSize: 12 }} /> Declining...
                    </span>
                )}
                {status === 'accepted' && (
                    <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--color-success)', color: '#fff', opacity: 0.85 }}
                    >
                        <CheckOutlined style={{ fontSize: 12 }} /> Accepted
                    </span>
                )}
                {status === 'declined' && (
                    <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--color-error)', color: '#fff', opacity: 0.85 }}
                    >
                        <CloseOutlined style={{ fontSize: 12 }} /> Declined
                    </span>
                )}
            </div>
        </div>
    );
};

const ReciveRequestModal = ({ open, onClose }) => {
    const [requests, setRequests] = useState(MOCK_REQUESTS);

    useEffect(() => {
        if (!open) {
            setRequests(MOCK_REQUESTS);
        }
    }, [open]);

    const pendingCount = requests.length;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={600}
            closable={false}
            styles={{
                content: {
                    padding: 0,
                    borderRadius: 20,
                    overflow: 'hidden',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
                },
                mask: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)' },
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--color-border)' }}
            >
                <div>
                    <h3 className="text-base font-bold m-0" style={{ color: 'var(--color-text)' }}>
                        Join Requests
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
                >
                    <CloseOutlined style={{ fontSize: 13 }} />
                </button>
            </div>

            {/* List */}
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                    {requests.length > 0 ? (
                        <div className="px-2 pb-3">
                            {requests.map(request => (
                                <RequestRow key={request._id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-12 gap-2">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-1"
                                style={{ background: 'var(--color-surface-alt)' }}
                            >
                                <Inbox />
                            </div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>No pending requests</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>New join requests will appear here</p>
                        </div>
                    )}
                </div>
        </Modal>
    );
};

export default ReciveRequestModal;
