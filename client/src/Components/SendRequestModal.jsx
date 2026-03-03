import { Modal,  Avatar, } from 'antd';
import { SearchOutlined, UserAddOutlined, CheckOutlined, LoadingOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';


// Mock user data
const MOCK_USERS = [
    { _id: '1', username: 'sarah_johnson', username: 'Sarah Johnson', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',  },
    { _id: '2', username: 'mike_chen', username: 'Mike Chen', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',  },
    { _id: '3', username: 'alex_rivera', username: 'Alex Rivera', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',  },
    { _id: '4', username: 'emma_watson_dev', username: 'Emma Watson', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',  },
    { _id: '5', username: 'james_okonkwo', username: 'James Okonkwo', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',  },
    { _id: '6', username: 'priya_sharma', username: 'Priya Sharma', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',  },
    { _id: '7', username: 'lucas_martin', username: 'Lucas Martin', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',  },
    { _id: '8', username: 'sofia_delgado', username: 'Sofia Delgado', pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',  },
];

const UserRow = ({ user, onSendRequest }) => {
    const [status, setStatus] = useState('idle'); // idle | loading | sent

    const handleSend = async () => {
        setStatus('loading');
        await new Promise(res => setTimeout(res, 900));
        setStatus('sent');
        onSendRequest?.(user._id);
    };

    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-surface-alt group"
            style={{ borderBottom: '1px solid var(--color-border)' }}
        >
            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
                <Avatar
                    src={user.pfpUrl}
                    size={46}
                    icon={<UserOutlined />}
                    className="border-2"
                    style={{ borderColor: 'var(--color-border)' }}
                />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-sm" style={{ color: 'var(--color-text)' }}>
                    {user.username}
                </p>
            </div>

            {/* Action button */}
            <button
                onClick={handleSend}
                disabled={status !== 'idle'}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-default"
                style={
                    status === 'sent'
                        ? { background: 'var(--color-success)', color: '#fff', opacity: 0.85 }
                        : status === 'loading'
                        ? { background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }
                        : { background: 'var(--color-primary)', color: '#fff' }
                }
            >
                {status === 'idle' && <><UserAddOutlined style={{ fontSize: 12 }} /> Invite</>}
                {status === 'loading' && <><LoadingOutlined style={{ fontSize: 12 }} /> Sending</>}
                {status === 'sent' && <><CheckOutlined style={{ fontSize: 12 }} /> Sent</>}
            </button>
        </div>
    );
};

const SendRequestModal = ({ open, onClose , classData }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [activeTab, setActiveTab] = useState('search'); // sentRequest | search
    const debounceRef = useRef(null);


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
            const q = query.toLowerCase();
            const matches = MOCK_USERS.filter(
                u => u.username.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
            );
            setResults(matches);
            setSearching(false);
            setSearched(true);
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
                        Search and invite a student to join <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{classData?.name || 'your class'}</span>
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
                        {results.map(user => (
                            <UserRow key={user._id} user={user} />
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
                <div className="flex flex-col items-center py-12 gap-2">
                    <p className="text-xs uppercase font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>No sent requests yet</p>
                </div>
            }
        </Modal>
    );
};


export default SendRequestModal;