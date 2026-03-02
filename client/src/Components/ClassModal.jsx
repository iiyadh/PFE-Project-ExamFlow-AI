import { Modal, Form, Input, Select, Button, Avatar, Typography } from 'antd';
import { ExclamationCircleOutlined, BookOutlined, UserOutlined, InfoCircleOutlined , DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const colorOptions = [
    { label: 'Emerald', value: 'bg-emerald-500', hex: '#10B981' },
    { label: 'Blue', value: 'bg-blue-600', hex: '#2563EB' },
    { label: 'Teal', value: 'bg-teal-500', hex: '#14B8A6' },
    { label: 'Orange', value: 'bg-orange-500', hex: '#F97316' },
    { label: 'Purple', value: 'bg-purple-600', hex: '#9333EA' },
    { label: 'Slate', value: 'bg-slate-600', hex: '#475569' },
    { label: 'Red', value: 'bg-red-500', hex: '#EF4444' },
    { label: 'Indigo', value: 'bg-indigo-500', hex: '#6366F1' },
];

const ClassModal = ({ mode, open, onClose, classData, onSubmit, onDelete }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedColor, setSelectedColor] = useState('bg-emerald-500');

    useEffect(() => {
        if (open && mode === 'edit' && classData) {
            form.setFieldsValue({
                title: classData.title,
                subtitle: classData.subtitle,
                description: classData.description || '',
                color: classData.color,
            });
            setSelectedColor(classData.color);
        } else if (open && mode === 'create') {
            form.resetFields();
            setSelectedColor('bg-emerald-500');
        }
    }, [open, mode, classData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await onSubmit?.({ ...values, color: selectedColor, id: classData?.id });
            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            console.error('Validation failed:', error);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        await onDelete?.(classData?._id);
        setLoading(false);
        onClose();
    };

    // Delete Confirmation Modal
    if (mode === 'delete') {
        return (
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                centered
                width={450}
                closable={false}
                className="class-modal"
            >
                <div className="flex flex-col items-center text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <ExclamationCircleOutlined className="text-3xl text-error" />
                    </div>
                    <Title level={4} className="text-text! mb-2!">Delete Class</Title>
                    <Text className="text-text-secondary! mb-6 block">
                        Are you sure you want to delete <span className="font-semibold text-text">"{classData?.title}"</span>? 
                        This action cannot be undone and all associated data will be permanently removed.
                    </Text>
                    
                    <div className="flex gap-3 w-full mt-2">
                        <Button 
                            size="large" 
                            className="flex-1 bg-surface! border-border! text-text! hover:bg-surface-alt!"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="primary" 
                            size="large"
                            className="flex-1"
                            loading={loading}
                            onClick={handleDelete}
                            icon={<DeleteOutlined />}
                        >
                            Delete Class
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    // Create / Edit Modal
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={560}
            closable={true}
            className="class-modal"
        >
            <div className="py-2">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div>
                        <Title level={4} className="text-text! mb-0!">
                            {mode === 'create' ? 'Create New Class' : 'Edit Class'}
                        </Title>
                        <Text className="text-text-muted! text-sm">
                            {mode === 'create' 
                                ? 'Fill in the details to create a new class' 
                                : 'Update the class information'}
                        </Text>
                    </div>
                </div>

                {/* Preview Card */}
                <div className="mb-6">
                    <Text className="text-text-secondary! text-xs uppercase font-semibold tracking-wider mb-2 block">
                        Preview
                    </Text>
                    <div className="bg-surface-alt rounded-xl p-4 border border-border">
                        <div className={`${selectedColor} rounded-lg p-4 relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <h3 className="text-white font-semibold text-lg truncate pr-16">
                                {form.getFieldValue('title') || 'Class Title'}
                            </h3>
                            <p className="text-white/80 text-sm truncate">
                                {form.getFieldValue('subtitle') || 'Subtitle'}
                            </p>
                            <div className="absolute top-3 right-3">
                                <Avatar 
                                    size={40} 
                                    icon={<UserOutlined />} 
                                    className="bg-white/20! border-2 border-white/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Form
                    form={form}
                    layout="vertical"
                    className="class-form"
                    requiredMark={false}
                >
                    <Form.Item
                        name="title"
                        label={<span className="text-text font-medium">Class Title</span>}
                        rules={[{ required: true, message: 'Please enter a class title' }]}
                    >
                        <Input 
                            placeholder="Enter class title ..."
                            size="large"
                            prefix={<BookOutlined className="text-text-muted mr-2" />}
                            className="bg-surface! border-border! text-text! placeholder:text-text-muted! hover:border-primary! focus:border-primary!"
                        />
                    </Form.Item>

                    <Form.Item
                        name="subtitle"
                        label={<span className="text-text font-medium">Subtitle</span>}
                        rules={[{ required: true, message: 'Please enter a subtitle' }]}
                    >
                        <Input 
                            placeholder="Enter a subtitle ..."
                            size="large"
                            prefix={<InfoCircleOutlined className="text-text-muted mr-2" />}
                            className="bg-surface! border-border! text-text! placeholder:text-text-muted! hover:border-primary! focus:border-primary!"
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={<span className="text-text font-medium">Description <span className="text-text-muted font-normal">(optional)</span></span>}
                    >
                        <TextArea 
                            placeholder="Enter a brief description of the class..."
                            rows={3}
                            className="bg-surface! border-border! text-text! placeholder:text-text-muted! hover:border-primary! focus:border-primary! resize-none!"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-text font-medium">Theme Color</span>}
                    >
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-10 h-10 rounded-lg ${color.value} transition-all duration-200 hover:scale-110 flex items-center justify-center ${
                                        selectedColor === color.value 
                                            ? 'ring-2 ring-offset-2 ring-primary ring-offset-surface' 
                                            : ''
                                    }`}
                                    title={color.label}
                                >
                                    {selectedColor === color.value && (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </Form.Item>
                </Form>

                {/* Footer Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                    <Button 
                        size="large" 
                        className="flex-1 bg-surface! border-border! text-text! hover:bg-surface-alt!"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        size="large"
                        className="flex-1 bg-primary! hover:bg-primary-hover!"
                        loading={loading}
                        onClick={handleSubmit}
                    >
                        {mode === 'create' ? 'Create Class' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ClassModal;