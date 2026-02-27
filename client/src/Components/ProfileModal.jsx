import { useState, useRef } from "react";
import { Modal, Upload, Input, Button, Progress, message } from "antd";
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
import { ShieldCheck } from "lucide-react";


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
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    message.success("Email verified!");
    onVerified();
    onClose();
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
          onClick={() => message.info("Resent!")}
        >
          Resend code
        </button>
      </div>
    </Modal>
  );
};

const ProfileModal = ({ open, setOpen, user: initialUser = {} }) => {
  const [user, setUser] = useState({
    username: "john_doe",
    email: "john@example.com",
    pfpUrl: "",
    numTel: "",
    address: "",
    googleId: "",
    _emailVerified: false,
    ...initialUser,
  });

  const [otpOpen, setOtpOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const completion = computeCompletion(user);
  const color = progressColor(completion);

  const handleAvatarUpload = ({ file }) => {
    const url = URL.createObjectURL(file.originFileObj ?? file);
    setUser((u) => ({ ...u, pfpUrl: url }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    message.success("Profile saved");
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
        title= "Profile"
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
          <div className="grow p-5 overflow-y-auto" style={{ color: "var(--color-text)" }}>

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
            <div className="mb-5">
              <Button
                icon={<GoogleOutlined />}
                onClick={() => message.info("Redirecting to Google OAuth…")}
                style={{
                  width: "100%",
                  background: user.googleId ? "var(--color-surface-alt)" : "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: user.googleId ? "var(--color-success)" : "var(--color-text-secondary)",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
                disabled={!!user.googleId}
              >
                {user.googleId ? "Google account linked" : "Link with Google"}
                {user.googleId && <CheckCircleFilled style={{ color: "var(--color-success)" }} />}
              </Button>
            </div>

            {/* Save */}
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
      </Modal>

      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        email={user.email}
        onVerified={() => setUser((u) => ({ ...u, _emailVerified: true }))}
      />
    </>
  );
};

export default ProfileModal;