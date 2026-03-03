import { Modal,  Avatar, } from 'antd';
import { SearchOutlined, UserAddOutlined, CheckOutlined, LoadingOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';


const UserRow = ({ student, onSendRequest , cid }) => {
    const [status, setStatus] = useState('idle');

    const handleSend = async () => {
        try{
            setStatus('loading');
            await api.post('/class/joinrequests', { cid , sid: student._id });
            setStatus('sent');
            onSendRequest?.(student._id);
        }catch(err){
            console.error('Error sending join request:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    }

    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-surface-alt group"
            style={{ borderBottom: '1px solid var(--color-border)' }}
        >
            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
                <Avatar
                    src={student.pfpUrl}
                    size={46}
                    icon={<UserOutlined />}
                    className="border-2"
                    style={{ borderColor: 'var(--color-border)' }}
                />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-sm" style={{ color: 'var(--color-text)' }}>
                    {student.username}
                </p>
            </div>

            {/* Action button */}
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
                {status === 'idle' && <><UserAddOutlined style={{ fontSize: 12 }} /> Invite</>}
                {status === 'loading' && <><LoadingOutlined style={{ fontSize: 12 }} /> Sending</>}
                {status === 'sent' && <><CheckOutlined style={{ fontSize: 12 }} /> Sent</>}
                {status === 'error' && <><CloseOutlined style={{ fontSize: 12 }} /> Failed</>}
            </button>
        </div>
    );
};

const SendRequestModal = ({ open, onClose , classData }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [activeTab, setActiveTab] = useState('search');
    const debounceRef = useRef(null);

    const fetchSearchResults = async (q) => {
        try {
            const res = await api.get(`/class/search/students?query=${q}&cid=${classData._id}`);
            const restructuredResults = res.data.map(student => ({
                _id : student._id,
                username: student.user.username,
                pfpUrl: student.user.pfpUrl,
            }));
            setResults(restructuredResults);
        } catch (err) {
            console.error('Error fetching search results:', err);
        }
    };


    const fetchSentRequests = async () => {
        try{
            const res = await api.get(`/class/joinrequests/${classData._id}`);
            console.log(res.data);
            const restructuredResults = res.data.map(_ => ({
                _id: _._id,
                username: _.user.username,
                pfpUrl: _.user.pfpUrl,
            }));
            console.log(restructuredResults);
            setSentRequests(restructuredResults);
        }catch(err){
            console.error('Error fetching sent requests:', err);
        }
    };


    const handleSentRequest = (studentId) => {
        setTimeout(() => {
            setResults(prev => prev.filter(s => s._id !== studentId));
        }, 2000);
    }

    const handleDenyRequest = async (studentId) => {
        try{
            await api.post(`/class/joinrequests/deny`, { cid: classData._id, sid: studentId } );
            setSentRequests(prev => prev.filter(r => r._id !== studentId));
        }catch(err){
            console.error('Error denying join request:', err);
        }
    }

    useEffect(() => {
        if(activeTab === 'sentRequest'){
            fetchSentRequests();
        }
    }, [activeTab]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setResults([]);
            setSearched(false);
        }
    }, [open]);

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
                        Search and invite a student to join <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{classData?.title || 'your class'}</span>
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

            {/* Search Bar */}
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'var(--color-surface-alt)', border: '1.5px solid var(--color-border)' }}
                >
                    {searching
                        ? <LoadingOutlined style={{ color: 'var(--color-primary)', fontSize: 15 }} />
                        : <SearchOutlined style={{ color: 'var(--color-text-muted)', fontSize: 15 }} />
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
                        <button onClick={() => setQuery('')} className="cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                            <CloseOutlined style={{ fontSize: 12 }} />
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 px-5 pt-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <button
                    onClick={() => setActiveTab('search')}
                    className="px-4 py-2 text-xs font-semibold rounded-t-lg transition-all"
                    style={{
                        color: activeTab === 'search' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        borderBottom: activeTab === 'search' ? '2px solid var(--color-primary)' : 'none',
                    }}
                >
                    Search
                </button>

                <button
                    onClick={() => setActiveTab('sentRequest')}
                    className="px-4 py-2 text-xs font-semibold rounded-t-lg transition-all"
                    style={{
                        color: activeTab === 'sentRequest' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        borderBottom: activeTab === 'sentRequest' ? '2px solid var(--color-primary)' : 'none',
                    }}
                >
                    Sent Requests
                </button>
            </div>

            {/* List */}
            {activeTab === "search" && 
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {results.length > 0 ? (
                    <div className="px-2 pb-3">
                        {results.map(student => (
                            <UserRow key={student._id} student={student} cid={classData._id} onSendRequest={handleSentRequest} />
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
                ) : 
                    <div className="flex flex-col items-center py-12 gap-2">
                        <p className="text-xs uppercase font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>No search</p>
                    </div>
                }
            </div>}

            {activeTab === "sentRequest" && 
                (sentRequests.length > 0 ? (
                    <div style={{ maxHeight: 380, overflowY: 'auto' }} className="px-2 pb-3">
                        {sentRequests.map(request => (
                            <div
                                key={request._id}
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
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                                    style={{ background: 'var(--color-success)', color: '#fff', opacity: 0.85 }}
                                >
                                    <CheckOutlined style={{ fontSize: 12 }} /> Sent
                                </div>
                                <button
                                    onClick={() => handleDenyRequest(request._id)}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                                    style={{ background: 'var(--color-error)', color: '#fff' }}
                                >
                                    <CloseOutlined style={{ fontSize: 12 }} /> Cancel
                                </button>
                            </div>
                        ))}
                    </div>
                ) :
                (
                    <div className="flex flex-col items-center py-12 gap-2">
                        <p className="text-xs uppercase font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>No sent requests yet</p>
                    </div>
                ))
            }
        </Modal>
    );
};


export default SendRequestModal;