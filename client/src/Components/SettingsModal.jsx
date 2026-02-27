import { Modal } from "antd";
import { useState } from "react";
import { Languages, SunMoon, Check } from "lucide-react";
import { useThemeStore } from "../store/themeStore.js";


const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
];

const themes = [
  {
    key: "light",
    label: "Light",
    description: "Clean and bright interface",
    preview: { bg: "#F8FAFC", surface: "#FFFFFF", accent: "#0EA5E9", text: "#0F172A" },
  },
  {
    key: "dark",
    label: "Dark",
    description: "Easy on the eyes at night",
    preview: { bg: "#0B1120", surface: "#111827", accent: "#22D3EE", text: "#F1F5F9" },
  },
];

const ThemeCard = ({ theme, selected, onSelect }) => {
    const { toggleDarkMode } = useThemeStore();

return (
  <div
    onClick={() =>{onSelect(theme.key);
      if(!selected) toggleDarkMode();
    }}
    className="relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden"
    style={{
      borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
      backgroundColor: "var(--color-surface-alt)",
    }}
  >
    {/* Mini Preview */}
    <div
      className="h-20 w-full relative"
      style={{ background: theme.preview.bg }}
    >
      <div
        className="absolute top-3 left-3 right-3 rounded-md h-4"
        style={{ backgroundColor: theme.preview.surface, opacity: 0.9 }}
      />
      <div
        className="absolute top-9 left-3 w-8 h-2 rounded-full"
        style={{ backgroundColor: theme.preview.accent }}
      />
      <div
        className="absolute top-9 left-14 right-3 h-2 rounded-full"
        style={{ backgroundColor: theme.preview.text, opacity: 0.15 }}
      />
      <div
        className="absolute top-13 left-3 right-8 h-2 rounded-full"
        style={{ backgroundColor: theme.preview.text, opacity: 0.1 }}
      />
    </div>

    {/* Label */}
    <div className="p-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {theme.label}
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {theme.description}
        </p>
      </div>
      {selected && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  </div>
  )
};

const LanguagePanel = () => {
  const [selected, setSelected] = useState("en");
  

  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--color-text)" }}>
        Language
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        Choose your preferred display language.
      </p>

      <div className="space-y-2">
        {languages.map((lang) => (
          <div
            key={lang.code}
            onClick={() => setSelected(lang.code)}
            className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150"
            style={{
              backgroundColor:
                selected === lang.code
                  ? "var(--color-surface-alt)"
                  : "transparent",
              border: `1px solid ${
                selected === lang.code
                  ? "var(--color-primary)"
                  : "var(--color-border)"
              }`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {lang.label}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {lang.native}
              </span>
            </div>
            {selected === lang.code && (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ThemePanel = () => {
    const { darkMode } = useThemeStore();
    const [selectedTheme, setSelectedTheme] = useState(darkMode ? "dark" : "light");

  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--color-text)" }}>
        Theme
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        Customize the appearance of the interface.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.key}
            theme={theme}
            selected={selectedTheme === theme.key}
            onSelect={setSelectedTheme}
          />
        ))}
      </div>
    </div>
  );
};


const SidebarItem = () => {
    const [activeKey, setActiveKey] = useState("1");

    const menuItems = [
        {
            key: "1",
            icon: <Languages className="w-5 h-5" />,
            label: "Language",
        },
        {
            key: "2",
            icon: <SunMoon className="w-5 h-5" />,
            label: "Theme",
        },
    ];

    return (
        <div className="w-full flex" style={{ minHeight: 420 }}>
            {/* Sidebar */}
            <div
                className="w-44 p-3 rounded-lg shrink-0"
                style={{
                    backgroundColor: "var(--color-surface-alt)",
                    borderRight: "1px solid var(--color-border)",
                }}
            >
                {menuItems.map((item) => {
                    const isActive = activeKey === item.key;
                    return (
                        <div
                            key={item.key}
                            onClick={() => setActiveKey(item.key)}
                            className="flex items-center p-3 cursor-pointer rounded-lg transition-all duration-200 mb-1"
                            style={{
                                backgroundColor: isActive
                                    ? "var(--color-surface)"
                                    : "transparent",
                                color: isActive
                                    ? "var(--color-primary)"
                                    : "var(--color-text-secondary)",
                                boxShadow: isActive
                                    ? "0 1px 4px rgba(0,0,0,0.07)"
                                    : "none",
                                fontWeight: isActive ? 600 : 400,
                            }}
                        >
                            {item.icon}
                            <span className="ml-3 text-sm">{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Content Panel */}
            <div className="flex-1 overflow-y-auto">
                {activeKey === "1" && <LanguagePanel />}
                {activeKey === "2" && <ThemePanel />}
            </div>
        </div>
    );
};

const SettingsModal = ({ open, setOpen }) => {
    return(
        <Modal
            title="Settings"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            width={900}
        >
            <SidebarItem />
        </Modal>
    )
};


export default SettingsModal;