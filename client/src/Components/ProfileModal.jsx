import { useState, useRef, useEffect, useCallback } from "react";
import { Modal, Upload, Input, Button, Progress, message, Form ,notification  } from "antd";
import ImgCrop from "antd-img-crop";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  GoogleOutlined,
  CheckCircleFilled,
  CameraOutlined,
} from "@ant-design/icons";
import { ShieldCheck, Lock, Eye, EyeOff, Info } from "lucide-react";
import { useUserStore } from "../store/userStore.js";
import { useGoogleLogin } from '@react-oauth/google';
import  api  from '../lib/api.js';


const computeCompletion = (user) => {
  const fields = [
    { key: "username", weight: 10 },
    { key: "email", weight: 15 },
    { key: "pfpUrl", weight: 20 },
    { key: "numTel", weight: 15 },
    { key: "address", weight: 15 },
    { key: "googleId", weight: 15 },
    { key: "_emailVerified", weight: 10 },
  ];
  return fields.reduce(
    (acc, f) => acc + (user[f.key] ? f.weight : 0),
    0
  );
};

const progressColor = (pct) => {
  if (pct >= 80) return "var(--color-success)";
  if (pct >= 50) return "var(--color-warning)";
  return "var(--color-error)";
};


const OtpModal = ({ open, onClose, email, onVerified }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const [isFirstsend, setFirstSend] = useState(true);



  const sendOTPCode = async () => {
    try {
        setFirstSend(false);
        setLoading(true);
        const res = await api.post('/user/send-otp', { email });
        notification.success({
            message: 'OTP Sent',
            description: 'An OTP code has been sent to your email. Please check your inbox.',
        });
    } catch (err) {
      notification.error({
          message: 'Failed to Send OTP',
          description: err.response?.data?.message || 'An error occurred while sending the OTP code. Please try again.',
      });
    }finally {
        setLoading(false);
    }
  };

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return message.warning("Enter the full 6-digit code");
    setLoading(true);
    try {
      await api.post('/user/verify-otp', { email, OTPCode: code });
      notification.success({
        message: 'Verification Successful',
        description: 'Your email has been verified successfully.',
      });
      onVerified();
      onClose();
    } catch (err) {
      notification.error({
        message: 'Verification Failed',
        description: err.response?.data?.message || 'An error occurred during OTP verification. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          <MailOutlined style={{ color: "var(--color-accent)" }} />
          Verify your email
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={360}
      centered
    >
      <div className="flex flex-col items-center gap-4 py-4">
        <p className="text-xs text-center" style={{ color: "var(--color-text-secondary)" }}>
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        <div className="flex gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={digit}
              maxLength={1}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-10 h-12 text-center text-lg font-bold rounded-md outline-none transition-all"
              style={{
                background: "var(--color-surface-alt)",
                border: "1.5px solid var(--color-border)",
                color: "var(--color-text)",
                caretColor: "var(--color-accent)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-accent)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          ))}
        </div>

        <Button
          type="primary"
          loading={loading}
          onClick={handleVerify}
          style={{ background: "var(--color-primary)", border: "none", width: "100%" }}
          icon={<ShieldCheck size={14} />}
        >
          Verify
        </Button>

        <button
          className="text-xs underline"
          style={{ color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => sendOTPCode()}
        >
          {loading ? "Sending..." : isFirstsend ? "Send OTP" : "Send OTP again"}
        </button>
      </div>
    </Modal>
  );
};

const ChangePasswordModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);


  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'No password', color: 'text-text-muted' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;

    const strengths = [
      { label: 'Weak', color: 'text-error' },
      { label: 'Fair', color: 'text-warning' },
      { label: 'Good', color: 'text-info' },
      { label: 'Strong', color: 'text-success' }
    ];

    return { score, ...strengths[score - 1] || { label: 'Very Weak', color: 'text-error' } };
  };

  const newPassword = Form.useWatch("newPassword", form);
  const currentPassword = Form.useWatch("currentPassword", form);


  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await api.put('/user/change-password', { 
        currentPassword: values.currentPassword, 
        newPassword: values.newPassword 
      });
      notification.success({
          message: 'Password Changed',
          description: 'Your password has been changed successfully.',
      });
      form.resetFields();
      onClose();
    } catch (validationErr) {
      if (validationErr.errorFields) {
        // Form validation failed
        return;
      }
      // API error
      notification.error({
          message: 'Password Change Failed',
          description: validationErr.response?.data?.message || 'An error occurred while changing the password. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  const strength = getPasswordStrength(newPassword);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-alt">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <span className="text-text font-semibold text-base">
            Change Password
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary bg-surface-alt border border-border hover:border-primary hover:text-primary transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-all duration-150 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>}
            Update Password
          </button>
        </div>
      }
      width={420}
      styles={{
        content: {
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "24px",
        },
        header: {
          backgroundColor: "transparent",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "16px",
          marginBottom: "0",
        },
        body: {
          paddingTop: "20px",
        },
        footer: {
          borderTop: "1px solid var(--color-border)",
          marginTop: "0",
          paddingTop: "16px",
          backgroundColor: "transparent",
        },
        mask: {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0,0,0,0.4)",
        },
      }}
    >
      <Form form={form} layout="vertical" className="flex flex-col gap-1">
        {/* Current Password */}
        <Form.Item
          name="currentPassword"
          label={
            <span className="text-sm font-medium text-text">
              Current Password
            </span>
          }
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}
          className="mb-4"
        >
          <Input.Password
            size="large"
            prefix={<Lock className="w-4 h-4 text-text-muted" />}
            placeholder="Enter current password"
            iconRender={(visible) =>
              visible ? (
                <Eye className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
              ) : (
                <EyeOff className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
              )
            }
            style={{
              backgroundColor: "var(--color-surface-alt)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              borderRadius: "8px",
            }}
          />
        </Form.Item>
        {/* New Password */}
        <Form.Item
          name="newPassword"
          label={
            <span className="text-sm font-medium text-text">
              New Password
            </span>
          }
          rules={[
            { required: true, message: "Please enter your new password" },
            { min: 8, message: "Password must be at least 8 characters" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            }
          ]}
          className="mb-4"
        >
          <Input.Password
            size="large"
            prefix={<Lock className="w-4 h-4 text-text-muted" />}
            placeholder="Enter new password"
            iconRender={(visible) =>
              visible ? (
                <Eye className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
              ) : (
                <EyeOff className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
              )
            }
            style={{
              backgroundColor: "var(--color-surface-alt)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              borderRadius: "8px",
            }}
          />
        </Form.Item>

        {newPassword && (
          <div className="mb-5 -mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.score === 1 ? 'w-1/4 bg-error' :
                    strength.score === 2 ? 'w-2/4 bg-warning' :
                      strength.score === 3 ? 'w-3/4 bg-info' :
                        strength.score === 4 ? 'w-full bg-success' : 'w-0'
                    }`}
                />
              </div>
              <span className={`text-xs font-medium ${strength.color}`}>
                {strength.label}
              </span>
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <Form.Item
          name="confirmPassword"
          label={
            <span className="text-sm font-medium text-text">
              Confirm Password
            </span>
          }
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
          className="mb-4"
        >
          <Input.Password
            size="large"
            prefix={<Lock className="w-4 h-4 text-text-muted" />}
            placeholder="Confirm new password"
            iconRender={(visible) =>
              visible ? (
                <Eye className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
              ) : (
                <EyeOff className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
              )
            }
            style={{
              backgroundColor: "var(--color-surface-alt)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              borderRadius: "8px",
            }}
          />
        </Form.Item>

        {/* Info Alert */}
        <div className="flex items-start gap-3 px-3 py-3 rounded-lg bg-surface-alt border border-border">
          <Info className="w-4 h-4 text-info mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-text mb-0.5">
              Password requirements
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Minimum 8 characters, at least one uppercase letter, one
              lowercase letter, and one number.
            </p>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

const ProfileModal = ({ open, setOpen, user: initialUser = {} }) => {
  const { 
    fetchUserData,
    username,
    status,
    pfpUrl,
    numTel,
    address,
    email,
    googleId,
    updateUser
  } = useUserStore();

  useEffect(() => {
    if (open) fetchUserData();
  }, [open, fetchUserData]);

  const [user, setUser] = useState({
    username: '',
    email: '',
    pfpUrl: '',
    numTel: '',
    address: '',
    googleId: '',
    _emailVerified: false,
  });

  // Sync local state with store state
  useEffect(() => {
    setUser({
      username: username || '',
      email: email || '',
      pfpUrl: pfpUrl || '',
      numTel: numTel || '',
      address: address || '',
      googleId: googleId || '',
      _emailVerified: status === "active",
      ...initialUser,
    });
  }, [username, email, pfpUrl, numTel, address, googleId, status, initialUser]);

  const [otpOpen, setOtpOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const completion = computeCompletion(user);
  const color = progressColor(completion);

  const handleAvatarUpload = ({ file }) => {
    // Clean up previous URL to avoid memory leaks
    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl);
    }
    
    const url = URL.createObjectURL(file.originFileObj ?? file);
    setAvatarUrl(url);
    setUser((u) => ({ ...u, pfpUrl: url }));
  };

  // Cleanup avatar URL when component unmounts or modal closes
  useEffect(() => {
    if (!open && avatarUrl) {
      URL.revokeObjectURL(avatarUrl);
      setAvatarUrl(null);
    }
  }, [open, avatarUrl]);

    const handleSignInWithGoogle = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
          try {
              const res = await api.post(`/user/linkgoogle/${tokenResponse.access_token}`);
              const { googleId } = res.data;
              setUser((u) => ({ ...u, googleId }));
              // Update the store as well
              await fetchUserData();
              notification.success({
                  message: 'Google Sign-In Successful',
                  description: 'Your Google account has been linked successfully.',
              });
          } catch (err) {
              notification.error({
                  message: 'Google Sign-In Failed',
                  description: err.response?.data?.message || 'An error occurred during Google sign-in. Please try again.',
              });
          }
      },
      onError: () => {
            notification.error({
                  message: 'Google Sign-In Failed',
                  description: "Google sign-in was unsuccessful. Please try again.",
          });
      },
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!user.username?.trim()) {
        message.error('Username is required');
        return;
      }
      
      // Prepare data for API call
      const profileData = {
        username: user.username.trim(),
        numTel: user.numTel?.trim() || '',
        address: user.address?.trim() || '',
        pfpUrl: user.pfpUrl || ''
      };
      
      // Call API to update profile
      await api.put('/user/edit-profile', profileData);
      
      // Update the store with fresh data
      await fetchUserData();
      
      notification.success({
        message: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      
    } catch (err) {
      notification.error({
        message: 'Profile Update Failed',
        description: err.response?.data?.message || 'An error occurred while updating your profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const field = (label, icon, key, placeholder, extra) => (
    <div className="mb-4">
      <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
        {icon} {label}
      </label>
      <Input
        value={user[key]}
        placeholder={placeholder}
        onChange={(e) => setUser((u) => ({ ...u, [key]: e.target.value }))}
        style={{
          background: "var(--color-surface-alt)",
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
          borderRadius: 6,
        }}
        suffix={extra}
      />
    </div>
  );

  return (
    <>
      <Modal
        title="Profile"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={700}
        styles={{
          content: { background: "var(--color-surface)", borderRadius: 12, padding: 0, overflow: "hidden" },
        }}
      >
        <div className="flex" style={{ minHeight: 460 }}>
          {/* Content */}
          <div className="grow p-5 overflow-hidden" style={{ color: "var(--color-text)" }}>

            {/* Progress */}
            <div className="mb-5 p-3 rounded-lg" style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  Profile completion
                </span>
                <span className="text-xs font-bold" style={{ color }}>
                  {completion}%
                </span>
              </div>
              <Progress
                percent={completion}
                showInfo={false}
                strokeColor={color}
                trailColor="var(--color-border)"
                size={["100%", 6]}
              />
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ background: "var(--color-surface-alt)", border: "2px solid var(--color-border)" }}
                >
                  {user.pfpUrl ? (
                    <img src={user.pfpUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserOutlined style={{ fontSize: 26, color: "var(--color-text-muted)" }} />
                  )}
                </div>
                <ImgCrop rotationSlider>
                  <Upload showUploadList={false} beforeUpload={() => false} onChange={handleAvatarUpload}>
                    <button
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "var(--color-primary)", border: "2px solid var(--color-surface)", color: "#fff", cursor: "pointer" }}
                    >
                      <CameraOutlined style={{ fontSize: 11 }} />
                    </button>
                  </Upload>
                </ImgCrop>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{user.username}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{user.email}</p>
              </div>
            </div>

            {/* Fields */}
            {field("Username", <UserOutlined />, "username", "your_username")}

            {/* Email with verify */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <MailOutlined /> Email
              </label>
              <Input
                value={user.email}
                disabled
                onChange={(e) => setUser((u) => ({ ...u, email: e.target.value, _emailVerified: false }))}
                style={{ background: "var(--color-surface-alt)", borderColor: "var(--color-border)", color: "var(--color-text)", borderRadius: 6 }}
                suffix={
                  user._emailVerified ? (
                    <CheckCircleFilled style={{ color: "var(--color-success)", fontSize: 14 }} />
                  ) : (
                    <button
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{ background: "var(--color-accent)", color: "#fff", border: "none", cursor: "pointer" }}
                      onClick={() => setOtpOpen(true)}
                    >
                      Verify
                    </button>
                  )
                }
              />
            </div>

            {field("Phone", <PhoneOutlined />, "numTel", "+1234567890")}
            {field("Address", <HomeOutlined />, "address", "123 Main St")}

            {/* Google Link */}
            <div className="flex justify-between gap-5 mb-5">
              <Button
                icon={<GoogleOutlined />}
                onClick={handleSignInWithGoogle}
                style={{
                  background: user.googleId ? "var(--color-surface-alt)" : "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: user.googleId ? "var(--color-success)" : "var(--color-text-secondary)",
                  borderRadius: 6,
                }}
                disabled={!!user.googleId}
              >
                {user.googleId ? "Google account linked" : "Link with Google"}
                {user.googleId && <CheckCircleFilled style={{ color: "var(--color-success)" }} />}
              </Button>
              <Button
                onClick={() => setPasswordOpen(true)}
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  borderRadius: 6,
                }}
              >
                Change Password
              </Button>
              <Button
                type="primary"
                loading={saving}
                onClick={handleSave}
                style={{ background: "var(--color-primary)", border: "none", width: "100%", borderRadius: 6 }}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        email={user.email}
        onVerified={async () => {
          setUser((u) => ({ ...u, _emailVerified: true }));
          // Refresh user data from server to get updated status
          await fetchUserData();
        }}
      />
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
};

export default ProfileModal;