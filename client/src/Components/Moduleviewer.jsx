import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Circle, CheckCircle2 } from "lucide-react";
import { Tooltip, Progress, Badge, Divider } from "antd";
import { MenuOutlined, CloseOutlined, BookOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";


// Sample data for demo
const sampleModules = [
  {
    id: "1",
    title: "Introduction to React",
    content: `# Introduction to React

React is a **JavaScript library** for building user interfaces. It was developed by Facebook and is now maintained by Meta and the open-source community.

## Core Concepts

React uses a **component-based architecture**, which means you break your UI into small, reusable pieces called components.

### Why React?

- **Declarative**: React makes it painless to create interactive UIs
- **Component-Based**: Build encapsulated components that manage their own state
- **Learn Once, Write Anywhere**: React can also render on the server using Node.js

\`\`\`jsx
function HelloWorld() {
  return <h1>Hello, World!</h1>;
}
\`\`\`

> React is not a framework — it's a library focused specifically on the view layer of your application.
    `,
  },
  {
    id: "2",
    title: "State & Props",
    content: `# State & Props

Understanding **state** and **props** is fundamental to React development.

## Props

Props (short for properties) are how components communicate with each other.

\`\`\`jsx
function Greeting({ name }) {
  return <p>Hello, {name}!</p>;
}
\`\`\`

## State

State is data that changes over time within a component.

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

### Key Differences

- Props are **read-only** and passed from parent to child
- State is **mutable** and managed within the component
    `,
  },
  {
    id: "3",
    title: "Hooks Deep Dive",
    content: `# Hooks Deep Dive

React Hooks allow you to use state and other React features in functional components.

## useEffect

\`useEffect\` lets you perform side effects in function components.

\`\`\`jsx
useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]);
\`\`\`

## useMemo & useCallback

Optimize performance by memoizing expensive calculations and stable callbacks.

\`\`\`jsx
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
\`\`\`

> Always follow the **Rules of Hooks**: only call hooks at the top level and only inside React functions.
    `,
  },
  {
    id: "4",
    title: "Context API",
    content: `# Context API

Context provides a way to pass data through the component tree without having to pass props down manually at every level.

## Creating Context

\`\`\`jsx
const ThemeContext = React.createContext('light');
\`\`\`

## Using Context

\`\`\`jsx
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Themed Button</button>;
}
\`\`\`

Context is designed to share data that can be considered **global** for a tree of React components.
    `,
  },
];

const ModuleViewer = ({ modules = sampleModules }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visited, setVisited] = useState(new Set([0]));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { cid } = useParams();

  const currentModule = modules[currentIndex];
  const progress = Math.round(((visited.size) / modules.length) * 100);

  const goTo = (index) => {
    setCurrentIndex(index);
    setVisited((prev) => new Set([...prev, index]));
  };

  const handlePrevious = () => goTo(currentIndex > 0 ? currentIndex - 1 : modules.length - 1);
  const handleNext = () => goTo(currentIndex < modules.length - 1 ? currentIndex + 1 : 0);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrevious();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex]);

  return (
    <div
      className="flex overflow-hidden"
      style={{
        height: "calc(100vh - 5rem)",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "'Crimson Pro', Georgia, serif",
      }}
    >
      {/* Sidebar */}
      <aside
        className="flex h-full flex-col transition-all duration-300 border-r"
        style={{
          width: sidebarOpen ? "300px" : "0px",
          minWidth: sidebarOpen ? "300px" : "0px",
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          overflow: "hidden",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center gap-3 px-6 py-5 border-b shrink-0 sticky top-0 z-10"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <BookOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
          <span
            className="font-bold text-base tracking-wide uppercase"
            style={{ color: "var(--color-primary)", letterSpacing: "0.1em", fontFamily: "system-ui" }}
          >
            Sections
          </span>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
              Progress
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
              {progress}%
            </span>
          </div>
          <Progress
            percent={progress}
            showInfo={false}
            size="small"
            strokeColor="var(--color-primary)"
            trailColor="var(--color-border)"
          />
        </div>

        {/* Module List */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-3">
          {modules.map((module, index) => {
            const isActive = currentIndex === index;
            const isVisited = visited.has(index);
            return (
              <button
                key={module.id}
                onClick={() => goTo(index)}
                className="w-full text-left mb-1 rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-200 group"
                style={{
                  background: isActive ? "var(--color-primary)" : "transparent",
                  color: isActive ? "#fff" : isVisited ? "var(--color-text)" : "var(--color-text-muted)",
                  border: isActive ? "none" : `1px solid transparent`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--color-surface-alt)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}
              >
                <span className="shrink-0">
                  {isVisited ? (
                    <CheckCircle2
                      size={16}
                      style={{ color: isActive ? "rgba(255,255,255,0.8)" : "var(--color-success)" }}
                    />
                  ) : (
                    <Circle
                      size={16}
                      style={{ color: isActive ? "rgba(255,255,255,0.6)" : "var(--color-text-muted)" }}
                    />
                  )}
                </span>
                <span
                  className="text-sm font-medium leading-snug"
                  style={{ fontFamily: "system-ui", lineHeight: 1.4 }}
                >
                  <span
                    className="text-xs mr-2"
                    style={{ opacity: isActive ? 0.7 : 0.5 }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {module.title}
                </span>
              </button>
            );
          })}
        </nav>

        <Divider style={{ margin: 0, borderColor: "var(--color-border)" }} />

        {/* Footer */}
        <div className="px-6 py-4 text-center shrink-0">
          <span className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "system-ui" }}>
            {visited.size} of {modules.length} viewed
          </span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <Tooltip title={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
                style={{
                  color: "var(--color-text-secondary)",
                  background: "var(--color-surface-alt)",
                  border: `1px solid var(--color-border)`,
                }}
              >
                {sidebarOpen ? <CloseOutlined style={{ fontSize: 14 }} /> : <MenuOutlined style={{ fontSize: 14 }} />}
              </button>
            </Tooltip>
            {currentModule && (
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-widest" style={{ color: "var(--color-text-muted)", fontFamily: "system-ui" }}>
                  Section {currentIndex + 1} / {modules.length}
                </p>
                <h1
                  className="text-base font-semibold leading-tight"
                  style={{ color: "var(--color-text)", fontFamily: "'Crimson Pro', Georgia, serif" }}
                >
                  {currentModule.title}
                </h1>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "var(--color-surface-alt)",
                  color: "var(--color-text-secondary)",
                  border: `1px solid var(--color-border)`,
                  fontFamily: "system-ui",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-border)";
                  e.currentTarget.style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-alt)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  fontFamily: "system-ui",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-primary-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-primary)";
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
          </div>
        </header>

        {/* Markdown Content */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ background: "var(--color-bg)" }}
        >
          <div className="max-w-3xl mx-auto px-8 py-12">
            {currentModule && (
              <div
                style={{
                  "--md-h1-color": "var(--color-text)",
                  "--md-h2-color": "var(--color-text)",
                  "--md-h3-color": "var(--color-text-secondary)",
                  "--md-p-color": "var(--color-text-secondary)",
                  "--md-code-bg": "var(--color-surface-alt)",
                  "--md-border": "var(--color-primary)",
                  "--md-link": "var(--color-accent)",
                }}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          marginTop: "0",
                          color: "var(--color-text)",
                          fontFamily: "'Crimson Pro', Georgia, serif",
                          lineHeight: 1.15,
                          letterSpacing: "-0.02em",
                          borderBottom: `3px solid var(--color-primary)`,
                          paddingBottom: "0.75rem",
                        }}
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        style={{
                          fontSize: "1.6rem",
                          fontWeight: 600,
                          marginTop: "2.5rem",
                          marginBottom: "0.75rem",
                          color: "var(--color-text)",
                          fontFamily: "'Crimson Pro', Georgia, serif",
                          lineHeight: 1.25,
                        }}
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 600,
                          marginTop: "2rem",
                          marginBottom: "0.5rem",
                          color: "var(--color-text-secondary)",
                          fontFamily: "system-ui",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        style={{
                          color: "var(--color-text-secondary)",
                          marginBottom: "1.25rem",
                          lineHeight: 1.85,
                          fontSize: "1.05rem",
                          fontFamily: "'Crimson Pro', Georgia, serif",
                        }}
                        {...props}
                      />
                    ),
                    code: ({ node, inline, ...props }) =>
                      inline ? (
                        <code
                          style={{
                            background: "var(--color-surface-alt)",
                            color: "var(--color-ai)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.875em",
                            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                            border: `1px solid var(--color-border)`,
                          }}
                          {...props}
                        />
                      ) : (
                        <code
                          style={{
                            display: "block",
                            background: "var(--color-surface)",
                            color: "var(--color-text)",
                            padding: "1.25rem",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                            overflowX: "auto",
                            border: `1px solid var(--color-border)`,
                            borderLeft: `3px solid var(--color-ai)`,
                          }}
                          {...props}
                        />
                      ),
                    pre: ({ node, ...props }) => (
                      <pre
                        style={{
                          background: "var(--color-surface)",
                          padding: "0",
                          borderRadius: "8px",
                          overflowX: "auto",
                          margin: "1.5rem 0",
                          border: `1px solid var(--color-border)`,
                        }}
                        {...props}
                      />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        style={{
                          borderLeft: `4px solid var(--color-primary)`,
                          paddingLeft: "1.25rem",
                          margin: "1.5rem 0",
                          color: "var(--color-text-muted)",
                          fontStyle: "italic",
                          background: "var(--color-surface-alt)",
                          padding: "1rem 1.25rem",
                          borderRadius: "0 8px 8px 0",
                        }}
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        style={{
                          paddingLeft: "1.5rem",
                          margin: "1rem 0",
                          color: "var(--color-text-secondary)",
                          lineHeight: 1.85,
                        }}
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        style={{
                          paddingLeft: "1.5rem",
                          margin: "1rem 0",
                          color: "var(--color-text-secondary)",
                          lineHeight: 1.85,
                        }}
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li
                        style={{
                          marginBottom: "0.4rem",
                          color: "var(--color-text-secondary)",
                          fontFamily: "'Crimson Pro', Georgia, serif",
                          fontSize: "1.05rem",
                        }}
                        {...props}
                      />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        style={{
                          color: "var(--color-accent)",
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                        {...props}
                      />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong
                        style={{
                          color: "var(--color-text)",
                          fontWeight: 700,
                        }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {currentModule.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ModuleViewer;