import { Modal, Avatar } from 'antd';
import { SearchOutlined, UserAddOutlined, CheckOutlined, LoadingOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { Search } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';


const UserRow = ({ student, onSendRequest, cid }) => {
    const [status, setStatus] = useState('idle');

    const handleSend = async () => {
        try {
            setStatus('loading');
            await api.post('/class/joinrequests', { cid, sid: student._id });
            setStatus('sent');
            onSendRequest?.(student._id);
        } catch (err) {
            console.error('Error sending join request:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-surface-alt group"
            style={{ borderBottom: '1px solid var(--color-border)' }}
        >
            <div className="relative shrink-0">
                <Avatar
                    src={student.pfpUrl}
                    size={46}
                    icon={<UserOutlined />}
                    className="border-2"
                    style={{ borderColor: 'var(--color-border)' }}
                />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-sm" style={{ color: 'var(--color-text)' }}>
                    {student.username}
                </p>
            </div>

            <button
                onClick={handleSend}
                disabled={status === 'loading' || status === 'sent'}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-default"
                style={
                    status === 'sent'
                        ? { background: 'var(--color-success)', color: '#fff', opacity: 0.85 }
                        : status === 'loading'
                        ? { background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }
                        : status === 'error'
                        ? { background: 'var(--color-error)', color: '#fff' }
                        : { background: 'var(--color-primary)', color: '#fff' }
                }
            >
                {status === 'idle'    && <><UserAddOutlined style={{ fontSize: 12 }} /> Invite</>}
                {status === 'loading' && <><LoadingOutlined style={{ fontSize: 12 }} /> Sending</>}
                {status === 'sent'    && <><CheckOutlined   style={{ fontSize: 12 }} /> Sent</>}
                {status === 'error'   && <><CloseOutlined   style={{ fontSize: 12 }} /> Failed</>}
            </button>
        </div>
    );
};

const SendRequestModal = ({ open, onClose, classData }) => {
    const [query, setQuery]               = useState('');
    const [results, setResults]           = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    const [searching, setSearching]       = useState(false);
    const [searched, setSearched]         = useState(false);
    const [activeTab, setActiveTab]       = useState('studentsList');

    const [tabLoading, setTabLoading] = useState({ sentRequest: false, studentsList: false });
    const [tabError,   setTabError  ] = useState({ sentRequest: false, studentsList: false });

    const debounceRef = useRef(null);


    const fetchSearchResults = async (q) => {
        if (!classData?._id) return;
        try {
            const res = await api.get(`/class/search/students?query=${q}&cid=${classData._id}`);
            setResults(
                res.data.map(student => ({
                    _id:      student._id,
                    username: student.user.username,
                    pfpUrl:   student.user.pfpUrl,
                }))
            );
        } catch (err) {
            console.error('Error fetching search results:', err);
        }
    };

    const fetchSentRequests = useCallback(async () => {
        if (!classData?._id) return;
        setTabLoading(prev => ({ ...prev, sentRequest: true }));
        setTabError(prev  => ({ ...prev, sentRequest: false }));
        try {
            const res = await api.get(`/class/joinrequests/${classData._id}`);
            setSentRequests(
                res.data.map(r => ({
                    requestId: r._id,           
                    _id:       r.student?._id ?? r._id,
                    username:  r.user.username,
                    pfpUrl:    r.user.pfpUrl,
                }))
            );
        } catch (err) {
            console.error('Error fetching sent requests:', err);
            setTabError(prev => ({ ...prev, sentRequest: true }));
        } finally {
            setTabLoading(prev => ({ ...prev, sentRequest: false }));
        }
    }, [classData?._id]);

    const fetchStudentsList = useCallback(async () => {
        if (!classData?._id) return;
        setTabLoading(prev => ({ ...prev, studentsList: true }));
        setTabError(prev  => ({ ...prev, studentsList: false }));
        try {
            const res = await api.get(`/student/students/${classData._id}`);
            setStudentsList(
                res.data.map(student => ({
                    _id:      student._id,
                    username: student.username,
                    pfpUrl:   student.pfpUrl,
                }))
            );
        } catch (err) {
            console.error('Error fetching students list:', err);
            setTabError(prev => ({ ...prev, studentsList: true }));
        } finally {
            setTabLoading(prev => ({ ...prev, studentsList: false }));
        }
    }, [classData?._id]);


    const handleSentRequest = (studentId) => {
        setTimeout(() => {
            setResults(prev => prev.filter(s => s._id !== studentId));
        }, 2000);
    };

    const handleDenyRequest = async (requestId) => {
        if (!classData?._id) return;
        try {
            await api.post(`/class/joinrequests/deny`, { cid: classData._id, requestId });
            setSentRequests(prev => prev.filter(r => r.requestId !== requestId));
        } catch (err) {
            console.error('Error cancelling join request:', err);
        }
    };

    const handleKickStudent = async (studentId) => {
        if (!classData?._id) return;
        try {
            await api.post(`/student/kick`, { classId: classData._id, studentId });
            setStudentsList(prev => prev.filter(s => s._id !== studentId));
        } catch (err) {
            console.error('Error kicking student:', err);
        }
    };

    useEffect(() => {
        if (open) {
            setActiveTab('studentsList');
            setQuery('');
            setResults([]);
            setSearched(false);
            setSentRequests([]);
            setStudentsList([]);
        }
    }, [open]);
    useEffect(() => {
        if (!open) return;
        if (activeTab === 'sentRequest')  fetchSentRequests();
        if (activeTab === 'studentsList') fetchStudentsList();
    }, [activeTab, open, fetchSentRequests, fetchStudentsList]);
    useEffect(() => {
        if (activeTab !== 'search') {
            setQuery('');
            setResults([]);
            setSearched(false);
        }
    }, [activeTab]);

    // Debounced search
    useEffect(() => {
        clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setResults([]);
            setSearched(false);
            setSearching(false);
            return;
        }

        setSearching(true);
        debounceRef.current = setTimeout(() => {
            fetchSearchResults(query.trim()).then(() => {
                setSearching(false);
                setSearched(true);
            });
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [query]);


    const EmptyState = ({ message }) => (
        <div className="flex flex-col items-center py-12 gap-2">
            <p className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                {message}
            </p>
        </div>
    );

    const LoadingState = () => (
        <div className="flex items-center justify-center py-12">
            <LoadingOutlined style={{ fontSize: 22, color: 'var(--color-primary)' }} />
        </div>
    );

    const ErrorState = ({ onRetry }) => (
        <div className="flex flex-col items-center py-12 gap-3">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-error)' }}>
                Failed to load. 
            </p>
            <button
                onClick={onRetry}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
            >
                Retry
            </button>
        </div>
    );

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={480}
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
                        Add to Class
                    </h3>
                    <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        Search and invite a student to join{' '}
                        <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                            {classData?.title || 'your class'}
                        </span>
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
                >
                    <CloseOutlined style={{ fontSize: 13 }} />
                </button>
            </div>
            {activeTab === 'search' && (
                <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'var(--color-surface-alt)', border: '1.5px solid var(--color-border)' }}
                    >
                        {searching
                            ? <LoadingOutlined style={{ color: 'var(--color-primary)', fontSize: 15 }} />
                            : <SearchOutlined  style={{ color: 'var(--color-text-muted)', fontSize: 15 }} />
                        }
                        <input
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search by name or username..."
                            className="flex-1 bg-transparent outline-none border-none text-sm"
                            style={{ color: 'var(--color-text)' }}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="cursor-pointer"
                                style={{ color: 'var(--color-text-muted)' }}
                            >
                                <CloseOutlined style={{ fontSize: 12 }} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-0 px-5 pt-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                {[
                    { key: 'studentsList', label: 'Student List' },
                    { key: 'search',       label: 'Search'       },
                    { key: 'sentRequest',  label: 'Sent Requests'},
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="px-4 py-2 text-xs font-semibold rounded-t-lg transition-all"
                        style={{
                            color:        activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : 'none',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>


            {/* ── Student List Tab ── */}
            {activeTab === 'studentsList' && (
                tabLoading.studentsList ? <LoadingState /> :
                tabError.studentsList   ? <ErrorState onRetry={fetchStudentsList} /> :
                studentsList.length > 0 ? (
                    <div style={{ maxHeight: 380, overflowY: 'auto' }} className="px-2 pb-3">
                        {studentsList.map(student => (
                            <div
                                key={student._id}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                                style={{ borderBottom: '1px solid var(--color-border)' }}
                            >
                                <Avatar
                                    src={student.pfpUrl}
                                    size={46}
                                    icon={<UserOutlined />}
                                    className="border-2"
                                    style={{ borderColor: 'var(--color-border)' }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate text-sm" style={{ color: 'var(--color-text)' }}>
                                        {student.username}
                                    </p>
                                </div>
                                {/* FIX #2/#14: proper button with handler and correct styling */}
                                <button
                                    onClick={() => handleKickStudent(student._id)}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                                    style={{ background: 'var(--color-error)', color: '#fff' }}
                                >
                                    <CloseOutlined style={{ fontSize: 12 }} /> Kick
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState message="No students in this class" />
                )
            )}


            {/* ── Search Tab ── */}
            {activeTab === 'search' && (
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                    {results.length > 0 ? (
                        <div className="px-2 pb-3">
                            {results.map(student => (
                                <UserRow
                                    key={student._id}
                                    student={student}
                                    cid={classData._id}
                                    onSendRequest={handleSentRequest}
                                />
                            ))}
                        </div>
                    ) : searched ? (
                        <div className="flex flex-col items-center py-12 gap-2">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-1"
                                style={{ background: 'var(--color-surface-alt)' }}
                            >
                                <Search />
                            </div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>No users found</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Try a different name or username</p>
                        </div>
                    ) : (
                        <EmptyState message="Start typing to search" />
                    )}
                </div>
            )}


            {/* ── Sent Requests Tab ── */}
            {activeTab === 'sentRequest' && (
                tabLoading.sentRequest ? <LoadingState /> :
                tabError.sentRequest   ? <ErrorState onRetry={fetchSentRequests} /> :
                sentRequests.length > 0 ? (
                    <div style={{ maxHeight: 380, overflowY: 'auto' }} className="px-2 pb-3">
                        {sentRequests.map(request => (
                            <div
                                key={request.requestId}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                                style={{ borderBottom: '1px solid var(--color-border)' }}
                            >
                                <Avatar
                                    src={request.pfpUrl}
                                    size={46}
                                    icon={<UserOutlined />}
                                    className="border-2"
                                    style={{ borderColor: 'var(--color-border)' }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate text-sm" style={{ color: 'var(--color-text)' }}>
                                        {request.username}
                                    </p>
                                </div>
                                <div
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style={{ background: 'var(--color-success)', color: '#fff', opacity: 0.85 }}
                                >
                                    <CheckOutlined style={{ fontSize: 12 }} /> Sent
                                </div>
                                {/* FIX #1/#3: pass requestId, not student _id */}
                                <button
                                    onClick={() => handleDenyRequest(request.requestId)}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                                    style={{ background: 'var(--color-error)', color: '#fff' }}
                                >
                                    <CloseOutlined style={{ fontSize: 12 }} /> Cancel
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState message="No sent requests yet" />
                )
            )}
        </Modal>
    );
};


export default SendRequestModal;