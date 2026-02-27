import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Form,
    Input,
    Space,
    notification,
    Popconfirm,
    Spin,
    Row,
    Col,
    Card,
    Tag,
    Avatar,
    Tooltip,
} from 'antd';
import {
    Trash2,
    Search,
    Phone,
    MapPin,
    User,
    GraduationCap,
    Users,
    Filter,
    RefreshCw,
} from 'lucide-react';
import { StopFilled, MinusCircleFilled } from '@ant-design/icons';
import api from '../lib/api';

const AdminUserList = () => {
    // State
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [form] = Form.useForm();


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user/all');
            setUsers(res.data);
        } catch (error) {
            showNotification('error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Load mock users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Update filtered users when users or filters change
    useEffect(() => {
        let filtered = [...users];

        if (searchText) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        setFilteredUsers(filtered);
    }, [users, searchText, roleFilter, statusFilter]);

    // Show notification
    const showNotification = (type, message) => {
        notification[type]({
            message: type === 'success' ? 'Success' : 'Error',
            description: message,
            duration: 20,
            placement: 'topRight',
            className: 'custom-notification'
        });
    };


    // Handle delete user
    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await api.delete(`/user/${id}`);
            setUsers(prev => prev.filter(user => user._id !== id));
            showNotification('success', 'User deleted successfully');
        } catch (error) {
            showNotification('error', 'Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchText('');
    };

    // Handle refresh
    const handleRefresh = () => {
        loadMockUsers();
    };

    const handleBlock = async (record) => {
        try {
            await api.put(`/user/toggle-block/${record._id}`);
            setUsers(prev => prev.map(user => {
                if (user._id === record._id) {
                    return { ...user, status: user.status === 'active' ? 'suspended' : 'active' };
                }
                return user;
            }));
        }
        catch (error) {
            console.log(error);
        }
    };

    // Get role color
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'teacher':
                return 'bg-ai/10 text-ai border-ai/20';
            case 'student':
                return 'bg-accent/10 text-accent border-accent/20';
            default:
                return 'bg-surface-alt text-text-secondary border-border';
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'active':
                return { textClass: 'text-green-500', label: 'Active', dot: 'bg-green-500' };
            case 'inactive':
                return { textClass: 'text-yellow-500', label: 'Inactive', dot: 'bg-yellow-500' };
            case 'suspended':
                return { textClass: 'text-red-500', label: 'Suspended', dot: 'bg-red-500' };
            default:
                return { textClass: 'text-gray-400', label: status, dot: 'bg-gray-400' };
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Table columns
    const columns = [
        {
            title: 'User',
            key: 'user',
            width: '25%',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        size={40}
                        src={record.pfpUrl}
                        icon={<User className="w-5 h-5" />}
                        // FIX 1: bg-linear-to-br → bg-gradient-to-br (correct Tailwind utility)
                        className="bg-linear-to-br from-primary to-primary-hover"
                    />
                    <div>
                        <p className="font-medium text-text">{record.username}</p>
                        <p className="text-xs text-text-muted">{record.email}</p>
                    </div>
                </div>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: '12%',
            render: (role) => (
                <Tag className={`${getRoleColor(role)} border rounded-full px-3 py-1 capitalize`}>
                    {role}
                </Tag>
            ),
            sorter: (a, b) => new Date(a.lastLogin) - new Date(b.lastLogin),
        },
        {
            title: 'Contact',
            key: 'contact',
            width: '25%',
            render: (_, record) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3.5 h-3.5 text-text-muted" />
                        {record.numTel ? <span className="text-text-secondary">{record.numTel}</span> : <span className="text-gray-500 italic">No information</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-text-muted" />
                        {/* FIX 2: max-w-37.5 → max-w-[150px] (non-standard fractional scale value) */}
                        {record.address ? <span className="text-text-secondary">{record.address}</span> : <span className="text-gray-500 italic">No information</span>}
                    </div>
                </div>
            ),
            sorter: (a, b) => new Date(a.lastLogin) - new Date(b.lastLogin),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '12%',
            render: (status) => {
                const config = getStatusConfig(status);
                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
                        {/* FIX 5: Use pre-defined textClass instead of dynamic `text-${color}` */}
                        <span className={`${config.textClass} capitalize`}>{config.label}</span>
                    </div>
                );
            },
            sorter: (a, b) => new Date(a.lastLogin) - new Date(b.lastLogin),
        },
        {
            title: 'Last Login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            width: '15%',
            render: (date) => (
                <Tooltip title={new Date(date).toLocaleString()}>
                    <span className="text-text-secondary text-sm">{formatDate(date)}</span>
                </Tooltip>
            ),
            sorter: (a, b) => new Date(a.lastLogin) - new Date(b.lastLogin),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '16%',
            render: (_, record) => (
                record.role == "user" ? (<Space size="small">
                    <Tooltip title={record.status == 'suspended' ? "Unblock User" : "Block User"}>
                        <Button
                            type="text"
                            icon={record.status == 'suspended' ? <MinusCircleFilled className="w-6 h-6" /> : <StopFilled className="w-6 h-6" />}
                            onClick={() => handleBlock(record)}      
                            className="w-8! h-8! p-0! hover:bg-primary!/10 hover:text-primary!"
                        />
                    </Tooltip>

                    <Tooltip title="Delete User">
                        <Popconfirm
                            title="Delete User"
                            description="Are you sure you want to delete this user?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Yes"
                            cancelText="No"
                            placement="top"
                        >
                            <Button
                                type="text"
                                icon={<Trash2 className="w-4 h-4" />}
                                className="w-8 h-8 p-0 hover:bg-error/10"
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>) : <span className="text-text-muted italic">No actions available</span>
            ),
            sorter: (a, b) => new Date(a.lastLogin) - new Date(b.lastLogin),
        },
    ];

    return (
        <div className="relative bg-bg p-6 w-[90%] overflow-hidden mt-1">
            {/* Background decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-130 h-130 rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute -bottom-40 left-1/4 w-100 h-100 rounded-full bg-ai/5 blur-[100px]" />
                <div className="absolute top-1/3 -left-24 w-90 h-90 rounded-full bg-accent/5 blur-[100px]" />
            </div>

            {/* Subtle dot pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text">User Management</h1>
                            <p className="text-text-secondary mt-1">
                                Manage system users, roles, and permissions
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={8}>
                            <Card className="bg-surface/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-text">{users.length}</p>
                                        <p className="text-text-muted text-sm">Total Users</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className="bg-surface/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-text">
                                            {users.filter(u => u.status === 'active').length}
                                        </p>
                                        <p className="text-text-muted text-sm">Active Users</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className="bg-surface/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-ai/10 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-ai" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-text">
                                            {users.filter(u => u.role === 'teacher').length}
                                        </p>
                                        <p className="text-text-muted text-sm">Teachers</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Search and Filters */}
                    <Card className="bg-surface/80 backdrop-blur-sm border-border mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search by name, email, phone, or address..."
                                    prefix={<Search className="w-5 h-5 text-text-muted" />}
                                    value={searchText}
                                    onChange={handleSearch}
                                    className="w-full bg-surface-alt border-border hover:border-primary focus:border-primary"
                                    size="large"
                                    allowClear
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    icon={<Filter className="w-4 h-4" />}
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="border-border hover:border-primary hover:text-primary"
                                    size="large"
                                >
                                    Filters
                                </Button>
                                <Button
                                    icon={<RefreshCw className="w-4 h-4" />}
                                    onClick={handleRefresh}
                                    className="border-border hover:border-primary hover:text-primary"
                                    size="large"
                                />
                            </div>
                        </div>

                        {/* Expanded Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-text-secondary">Role:</span>
                                            <div className="flex gap-2">
                                                {['all', 'admin', 'teacher', 'student'].map(role => (
                                                    <Button
                                                        key={role}
                                                        type={roleFilter === role ? 'primary' : 'default'}
                                                        onClick={() => setRoleFilter(role)}
                                                        className={roleFilter === role ? 'bg-primary' : 'border-border hover:border-primary'}
                                                        size="small"
                                                    >
                                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-text-secondary">Status:</span>
                                            <div className="flex gap-2">
                                                {['all', 'active', 'inactive', 'suspended'].map(status => (
                                                    <Button
                                                        key={status}
                                                        type={statusFilter === status ? 'primary' : 'default'}
                                                        onClick={() => setStatusFilter(status)}
                                                        className={statusFilter === status ? 'bg-primary' : 'border-border hover:border-primary'}
                                                        size="small"
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Users Table */}
                <Card className="bg-surface/80 backdrop-blur-sm border-border shadow-xl overflow-hidden">
                    <Spin spinning={loading} tip="Loading users...">
                        <Table
                            columns={columns}
                            dataSource={filteredUsers}
                            rowKey="_id"
                            scroll={{ x: 1200 }}
                            className="custom-table"
                            pagination={{ pageSize: 5, showTotal: (total) => `${total} users` }}
                            locale={{
                                emptyText: (
                                    <div className="py-12 text-center">
                                        <Users className="w-12 h-12 mx-auto text-text-muted mb-3" />
                                        <p className="text-text-secondary">
                                            {searchText ? 'No users found matching your search' : 'No users available'}
                                        </p>
                                        {searchText && (
                                            <Button
                                                type="link"
                                                onClick={handleClearSearch}
                                                className="mt-2 text-primary"
                                            >
                                                Clear search
                                            </Button>
                                        )}
                                    </div>
                                )
                            }}
                        />
                    </Spin>
                </Card>
            </div>
        </div>
    );
};

export default AdminUserList;