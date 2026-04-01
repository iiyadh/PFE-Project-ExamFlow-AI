import { Modal, Avatar } from 'antd';
import { CheckOutlined, LoadingOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { Inbox } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/api';

const RequestRow = ({ request, onAccept, onDecline }) => {
    const [status, setStatus] = useState('pending'); // pending | accepting | declining | accepted | declined

    const handleAccept = async () => {
        try{
            setStatus('accepting');
            await api.post(`/student/request`,{studentId: request.studentId, classId: request.classId, action: 'accept'});
            setStatus('accepted');
            onAccept?.(request._id);
            window.location.reload();
        }catch(err){
            console.error('Failed to accept request:', err);
        }
    };

    const handleDecline = async () => {
        try{
            setStatus('declining');
            await api.post(`/student/request`,{studentId: request.studentId, classId: request.classId, action: 'reject'});
            setStatus('declined');
            onDecline?.(request._id);
        }catch(err){
            console.error('Failed to decline request:', err);
        }
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
                    {request.teacherName} wants you to join their class
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

const ReciveRequestModal = ({ open, onClose , onRefresh }) => {
    const [requests, setRequests] = useState([]);
    
    const fetchRequests = async () => {
        try {
            const res = await api.get('/student/requests');
            setRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [open]);

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
                                <RequestRow key={request._id} request={request} onAccept={()=>onRefresh} />
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
