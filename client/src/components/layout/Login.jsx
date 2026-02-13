import { useMemo, useState } from "react";
import { http } from "../../services/http";

const ROLES = [
  { key: "CLINICIAN", label: "Clinician" },
  { key: "SPECIALIST", label: "Specialist" },
  { key: "ADMIN", label: "Administrator" },
];

export default function Login() {
  const [role, setRole] = useState("CLINICIAN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length >= 6 && !loading;
  }, [email, password, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await http.post("/api/auth/login", { role, email, password });

      // store token (basic approach for now)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // TODO next: navigate to dashboard based on role
      alert(`Logged in as ${res.data.user.role}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.center}>
        <div style={styles.header}>
          <div style={styles.logo} aria-hidden="true">♥</div>
          <h1 style={styles.title}>CareLink+</h1>
          <p style={styles.subTitle}>Post-Referral Continuity Platform</p>
        </div>

        <div style={styles.card}>
          <p style={styles.signInAs}>Sign in as</p>

          <div style={styles.roleRow}>
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                style={{
                  ...styles.roleBtn,
                  ...(role === r.key ? styles.roleBtnActive : null),
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
            />

            <label style={{ ...styles.label, marginTop: 12 }}>Password</label>
            <input
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              type="password"
              autoComplete="current-password"
            />

            {error ? <div style={styles.error}>{error}</div> : null}

            <button type="submit" disabled={!canSubmit} style={styles.submitBtn}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #2d4b6d, #0f2233)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "Arial, sans-serif",
  },
  center: { width: "100%", maxWidth: 520 },
  header: { textAlign: "center", color: "white", marginBottom: 20 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    margin: "0 auto 10px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    fontSize: 22,
  },
  title: { margin: 0, fontSize: 34 },
  subTitle: { margin: "6px 0 0", opacity: 0.85 },

  card: {
    background: "white",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
  },
  signInAs: { margin: 0, color: "#3a3a3a", fontWeight: 600 },

  roleRow: { display: "flex", gap: 10, marginTop: 12, marginBottom: 18 },
  roleBtn: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d7dbe0",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  roleBtnActive: { background: "#132f4c", color: "white", borderColor: "#132f4c" },

  label: { display: "block", fontSize: 13, fontWeight: 700, color: "#25313b" },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
    border: "1px solid #d7dbe0",
    marginTop: 6,
    outline: "none",
  },
  error: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    background: "#ffecec",
    border: "1px solid #ffb4b4",
    color: "#7a1b1b",
    fontSize: 13,
  },
  submitBtn: {
    width: "100%",
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 10,
    border: 0,
    background: "#132f4c",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
};
