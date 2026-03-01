import { useEffect, useState } from 'react';
import { Button, Modal , notification } from 'antd';
import { UserOutlined, TeamOutlined, CloseOutlined } from '@ant-design/icons';
import { GraduationCap, Users, Sparkles } from 'lucide-react';
import PricingComponent from './PricingComponent';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';


const UserOrientationComp = () => {
  const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { 
    fetchUserData,
    username,
    email,
    pfpUrl,
    numTel,
    address,
    googleId,
   } = useUserStore();

  const getPlanType = (planName) => {
    if (planName.toLowerCase().includes('basic')) return 'basic';
    if (planName.toLowerCase().includes('pro')) return 'pro';
    if (planName.toLowerCase().includes('institution')) return 'institution';
    return 'basic';
  };


  useEffect(() => {
    fetchUserData();
  },[fetchUserData]);

  const isCompleteProfile = username && email && pfpUrl && numTel && address && googleId;

  const handleSelect = async (plan) => {
    if (!isCompleteProfile) {
      notification.warning({
        message: 'Incomplete Profile',
        description: 'Please complete your profile information before selecting a teacher plan.',
      });
      return;
    }
    setLoading(true);
    try {
      const planType = getPlanType(plan.name);
      await api.put('/user/setrole', { role: 'teacher', plan: planType });
      notification.success({
        message: 'Successful Role Update',
        description: 'Please Relogin to log as teacher.',
      });
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error setting role:', err);
      notification.error({
        message: 'Error',
        description: 'Failed to set role. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTeacherClick = () => {
    setIsPricingModalVisible(true);
  };
  
  const handleStudentClick = async () => {
    if (!isCompleteProfile) {
      notification.warning({
        message: 'Incomplete Profile',
        description: 'Please complete your profile information before selecting a teacher plan.',
      });
      return;
    }
    setLoading(true);
    try{
      await api.put('/user/setrole', { role: 'student' });
      notification.success({
        message: 'Successful Role Update',
        description: 'Please Relogin to log as student.',
      });
      logout();
      navigate('/login');
    }catch(err){
      console.error('Error setting role:', err);
      notification.error({
        message: 'Error',
        description: 'Failed to set role. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsPricingModalVisible(false);
  };



  return (
    <>
      <div className="w-full flex items-center justify-center bg-bg py-16 px-4">
        <div className="max-w-4xl w-full px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text mb-3">
              Choose Your Path
            </h1>
            <p className="text-text-secondary text-lg">
              Select how you want to use our platform
            </p>
          </div>

          {/* Orientation Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Teacher Card */}
            <div className="bg-surface rounded-2xl border border-border p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-surface-alt rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <GraduationCap className="w-10 h-10 text-primary" />
                </div>
                
                {/* Content */}
                <h2 className="text-2xl font-bold text-text mb-3">
                  I'm a Teacher
                </h2>
                <p className="text-text-secondary mb-6">
                  Create courses, manage students, and share your knowledge with the world
                </p>
                
                {/* Features */}
                <ul className="text-left w-full mb-8 space-y-3">
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Create unlimited courses</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Priority support</span>
                  </li>
                </ul>
                
                {/* Action Button */}
                <Button
                  type="primary"
                  size="large"
                  onClick={handleTeacherClick}
                  className="w-full h-12 text-base font-medium bg-primary hover:bg-primary-hover border-none"
                  icon={<TeamOutlined />}
                >
                  Start Teaching
                </Button>
                
                {/* Price tag */}
                <div className="mt-4 text-sm text-text-muted">
                  Starting from <span className="font-bold text-primary">$29/month</span>
                </div>
              </div>
            </div>

            {/* Student Card */}
            <div className="bg-surface rounded-2xl border border-border p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-surface-alt rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <Users className="w-10 h-10 text-accent" />
                </div>
                
                {/* Content */}
                <h2 className="text-2xl font-bold text-text mb-3">
                  I'm a Student
                </h2>
                <p className="text-text-secondary mb-6">
                  Access thousands of courses, learn at your own pace, and track your progress
                </p>
                
                {/* Features */}
                <ul className="text-left w-full mb-8 space-y-3">
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Access to all courses</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Progress tracking</span>
                  </li>
                <li className="flex items-center gap-2 text-text-secondary">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Participate in contests </span>
                </li>
                </ul>
                {/* Action Button */}
                <Button
                    type="default"
                    size="large"
                    onClick={handleStudentClick}
                    className="w-full h-12 text-base font-medium border-2 border-accent text-accent hover:bg-accent hover:text-white transition-colors"
                    icon={<UserOutlined />}
                    loading={loading}
                >
                    Start Learning
                </Button>

                {/* Free tag */}
                <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                        Free forever
                    </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2">
                <TeamOutlined className="text-primary" />
                <span>Choose Your Teacher Plan</span>
            </div>
        }
        open={isPricingModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={1500}
        closeIcon={<CloseOutlined className="text-text-secondary hover:text-text" />}
        style={{ top: 20 }}
      >
        <PricingComponent OnSelect={handleSelect} />
      </Modal>
    </>
  );
};

export default UserOrientationComp;