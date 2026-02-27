import { useState, useRef, useEffect } from "react";
import { Modal, Upload, Input, Button, Progress, message, Form, notification } from "antd";
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
import api from '../lib/api.js';
import { uploadToCloudinary } from "../lib/cloudinary.js";


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
    } finally {
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

  // FIX 4: Stringify initialUser to avoid infinite loop from object reference instability
  const initialUserStr = JSON.stringify(initialUser);
  useEffect(() => {
    setUser({
      username: username || '',
      email: email || '',
      pfpUrl: pfpUrl || '',
      numTel: numTel || '',
      address: address || '',
      googleId: googleId || '',
      _emailVerified: status === "active",
      ...JSON.parse(initialUserStr),
    });
  }, [username, email, pfpUrl, numTel, address, googleId, status, initialUserStr]);

  const [otpOpen, setOtpOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  // FIX 1: Declare missing imageUrl state
  const [imageUrl, setImageUrl] = useState('');

  const completion = computeCompletion(user);
  const color = progressColor(completion);

  const uploadImage = async (file) => {
    try {
      if (!file) throw new Error('No file selected');

      const url = await uploadToCloudinary(
        file,
        'profile_pictures',
        `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      );
      setImageUrl(url);
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      notification.error({
        message: 'Upload Failed',
        description: 'An error occurred while uploading the image. Please try again.',
      });
      throw error;
    }
  };

  const handleImageChange = async (info) => {
    const { file } = info;

    console.log(file);
    if (file.status === 'removed') {
      setImageUrl('');
      setFile(null);
      return;
    }

    if (file.originFileObj) {
      try {
        const previewUrl = URL.createObjectURL(file.originFileObj);
        setImageUrl(previewUrl);
        setFile(file.originFileObj);
      } catch (error) {
        console.error('Image processing error:', error);
        notification.error({
          message: 'Image Error',
          description: 'Failed to process the selected image. Please try again.',
        });
      }
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((u) => ({ ...u, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      let finalUrl = imageUrl;
      if (file) {
        finalUrl = await uploadImage(file);
      }
      await api.put('/user/edit-profile', {
        username: user.username,
        numTel: user.numTel,
        address: user.address,
        pfpUrl: finalUrl.secure_url || user.pfpUrl,
      });
      setImageUrl(finalUrl.secure_url || user.pfpUrl);
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

  const handleSignInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await api.post(`/user/linkgoogle/${tokenResponse.access_token}`);
        const { googleId } = res.data;
        setUser((u) => ({ ...u, googleId }));
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

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const beforeUpload = (file) => {
    // Check if it's an image
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    // Check file size (10MB limit)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Image must be smaller than 10MB!');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

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
          <div className="grow p-5 overflow-hidden" style={{ color: "var(--color-text)" }}>

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

            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ background: "var(--color-surface-alt)", border: "2px solid var(--color-border)" }}
                >
                  {/* Use imageUrl for live preview, fall back to stored pfpUrl */}
                  {imageUrl || user.pfpUrl ? (
                    <img src={imageUrl || user.pfpUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserOutlined style={{ fontSize: 26, color: "var(--color-text-muted)" }} />
                  )}
                </div>
                <ImgCrop
                  showGrid
                  rotationSlider
                  aspectSlider
                  showReset
                  quality={1}
                  aspect={1}
                  minZoom={0.1}
                  maxZoom={3}
                  cropShape="round">
                  <Upload
                    showUploadList={false}
                    onChange={handleImageChange}
                    accept="image/*"
                    customRequest={dummyRequest}
                    beforeUpload={beforeUpload}
                    maxCount={1}>
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

            {/* FIX 2: Added name="username" */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <UserOutlined /> Username
              </label>
              <Input
                name="username"
                value={user.username}
                placeholder="your_username"
                onChange={handleChange}
                style={{ background: "var(--color-surface-alt)", borderColor: "var(--color-border)", color: "var(--color-text)", borderRadius: 6 }}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <MailOutlined /> Email
              </label>
              <Input
                value={user.email}
                disabled
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

            {/* FIX 2: Added name="numTel" */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <PhoneOutlined /> Phone
              </label>
              <Input
                name="numTel"
                value={user.numTel}
                placeholder="+1234567890"
                onChange={handleChange}
                style={{ background: "var(--color-surface-alt)", borderColor: "var(--color-border)", color: "var(--color-text)", borderRadius: 6 }}
              />
            </div>

            {/* FIX 2: Added name="address" */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <HomeOutlined /> Address
              </label>
              <Input
                name="address"
                value={user.address}
                placeholder="123 Main St"
                onChange={handleChange}
                style={{ background: "var(--color-surface-alt)", borderColor: "var(--color-border)", color: "var(--color-text)", borderRadius: 6 }}
              />
            </div>

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
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)", borderRadius: 6 }}
              >
                Change Password
              </Button>
              <Button
                type="primary"
                loading={saving}
                onClick={handleSubmit}
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
          await fetchUserData();
        }}
      />
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
};

export default ProfileModal;