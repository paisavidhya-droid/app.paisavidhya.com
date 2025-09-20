import { useMemo, useState } from "react";
import "../styles/ui.css";

import {
  Card,
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
  Badge,
  Tooltip,
  Modal,
  Drawer,
  Tabs,
  Accordion,
  Alert,
  Progress,
  Spinner,
  Skeleton,
  Pagination,
} from "../components";
import OtpPin from "../components/ui/OtpPin";
import toast from "react-hot-toast";
import FloatField from "../components/ui/FancyInput/FloatField";

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ scrollMarginTop: 80 }}>
      <Card title={title}>{children}</Card>
    </section>
  );
}

export default function UIComponents() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [radio, setRadio] = useState("pfc");
  const [page, setPage] = useState(1);
  const [progress, setProgress] = useState(40);
  const [tabsIndex] = useState(0);

  // filter
  const [q, setQ] = useState("");
  const items = useMemo(
    () =>
      [
        { id: "buttons", label: "Buttons & IconButton" },
        { id: "inputs", label: "Input / Textarea / Select" },
        { id: "checks", label: "Checkbox / RadioGroup / Switch" },
        { id: "badge-tooltip", label: "Badge / Tooltip" },
        { id: "modal", label: "Modal" },
        { id: "drawer", label: "Drawer" },
        { id: "tabs", label: "Tabs" },
        { id: "accordion", label: "Accordion" },
        { id: "alert", label: "Alert" },
        { id: "progress", label: "Progress" },
        { id: "spinner", label: "Spinner" },
        { id: "skeleton", label: "Skeleton" },
        { id: "pagination", label: "Pagination" },
      ].filter((it) => it.label.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  const tabsData = [
    {
      label: "Overview",
      content: (
        <p style={{ color: "var(--pv-dim)" }}>
          Use tabs to split content—perfect for PFC / FFC / BFC info.
        </p>
      ),
    },
    {
      label: "Pricing",
      content: (
        <p style={{ color: "var(--pv-dim)" }}>Starter, Growth, Enterprise…</p>
      ),
    },
    {
      label: "FAQ",
      content: (
        <p style={{ color: "var(--pv-dim)" }}>
          Ask anything about Paisavidhya modules.
        </p>
      ),
    },
  ];

  const accItems = [
    {
      title: "What is PFC?",
      content: "Personal Financial Checkup—your money health summary.",
    },
    {
      title: "What is FFC?",
      content: "Family Financial Checkup—household cashflows, risks & goals.",
    },
    {
      title: "What is BFC?",
      content: "Business Financial Checkup—cash cycle, liabilities & planning.",
    },
  ];

  return (
    <div
      className="pv-container"
      style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18 }}
    >
      {/* Sidebar */}
      <aside
        className="pv-card"
        style={{
          padding: 16,
          position: "sticky",
          top: 76,
          alignSelf: "start",
          height: "calc(100vh - 92px)",
          overflow: "auto",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          Components Gallery
        </div>
        <Input
          placeholder="Search components…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="pv-col" style={{ marginTop: 10 }}>
          {items.map((it) => (
            <a
              key={it.id}
              href={`#${it.id}`}
              className="pv-btn ghost"
              style={{ justifyContent: "flex-start" }}
            >
              {it.label}
            </a>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="pv-col" style={{ gap: 18 }}>
        <Section id="buttons" title="Buttons & IconButton">
          <div className="pv-row">
            <Button onClick={() => toast.success("Primary clicked!")}>
              Primary
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <IconButton title="Info">ℹ️</IconButton>
            <IconButton title="Close" variant="ghost">
              ✖
            </IconButton>
          </div>
        </Section>

        <Section id="inputs" title="Input / Textarea / Select">
          <div className="pv-row" style={{ alignItems: "stretch" }}>
            <Input label="Full Name" placeholder="e.g., Ekambaram G" />
            <Input label="Mobile" placeholder="+91…" />
            <Select label="Module">
              <option value="pfc">PFC</option>
              <option value="ffc">FFC</option>
              <option value="bfc">BFC</option>
            </Select>
          </div>
          <div style={{ marginTop: 12 }}>
            <Textarea label="Notes" placeholder="Any remarks…" rows={4} />
          </div>
          <FloatField label="Email" type="email" />

          <FloatField label="Password" type="password" showToggle />
        </Section>

        <Section id="pin" title="PIN / OTP Input (6-digit)">
          <div className="pv-col">
            <OtpPin onComplete={(code) => toast.success?.(`Code: ${code}`)} />

            <OtpPin size="sm" />
            <OtpPin size="lg" mask success="Authentication successful!" />
            <OtpPin error="That code didn’t match. Try again." />
            <OtpPin disabled />
          </div>
        </Section>

        <Section id="checks" title="Checkbox / RadioGroup / Switch">
          <div className="pv-row">
            <Checkbox
              label="I agree to the transparent policy"
              defaultChecked
            />
            <RadioGroup
              name="module"
              label="Select Checkup"
              options={[
                { label: "PFC", value: "pfc" },
                { label: "FFC", value: "ffc" },
                { label: "BFC", value: "bfc" },
              ]}
              value={radio}
              onChange={setRadio}
            />
            <Switch
              checked={switchOn}
              onChange={setSwitchOn}
              label={switchOn ? "Notifications On" : "Notifications Off"}
            />
          </div>
        </Section>

        <Section id="badge-tooltip" title="Badge / Tooltip">
          <div className="pv-row">
            <Badge>New</Badge>
            <Badge>Verified</Badge>
            <Tooltip content="Family’s Financial Doctor">
              <Badge>Hover me</Badge>
            </Tooltip>
          </div>
        </Section>

        <Section id="modal" title="Modal">
          <div className="pv-row">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          </div>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Universal Modal"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success("Saved!");
                    setModalOpen(false);
                  }}
                >
                  Save
                </Button>
              </>
            }
          >
            <div className="pv-col">
              <Input label="Name" placeholder="Enter…" />
              <Select label="Service">
                <option>PFC</option>
                <option>FFC</option>
                <option>BFC</option>
              </Select>
              <Textarea label="Message" placeholder="Type your message…" />
            </div>
          </Modal>
        </Section>

        <Section id="drawer" title="Drawer">
          <div className="pv-row">
            <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
              Open Drawer
            </Button>
          </div>
          <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <div style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
              <div className="pv-col">
                <Button onClick={() => toast.success("Booked a Checkup!")}>
                  Book Checkup
                </Button>
                <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Drawer>
        </Section>

        <Section id="tabs" title="Tabs">
          <Tabs tabs={tabsData} defaultIndex={tabsIndex} />
        </Section>

        <Section id="accordion" title="Accordion">
          <Accordion items={accItems} />
        </Section>

        <Section id="alert" title="Alert">
          <div className="pv-col">
            <Alert type="info" title="Heads up">
              We’ll be upgrading MFU integration soon.
            </Alert>
            <Alert type="success" title="All good">
              Your session is secure.
            </Alert>
            <Alert type="warning" title="Careful">
              Double-check KYC details.
            </Alert>
            <Alert type="danger" title="Action needed">
              PAN mismatch detected.
            </Alert>
          </div>
        </Section>

        <Section id="progress" title="Progress">
          <div className="pv-col">
            <Progress value={progress} />
            <div className="pv-row" style={{ marginTop: 10 }}>
              <Button
                variant="ghost"
                onClick={() => setProgress((p) => Math.max(0, p - 10))}
              >
                -10%
              </Button>
              <Badge>{progress}%</Badge>
              <Button
                variant="ghost"
                onClick={() => setProgress((p) => Math.min(100, p + 10))}
              >
                +10%
              </Button>
            </div>
          </div>
        </Section>

        <Section id="spinner" title="Spinner">
          <div className="pv-row">
            <Spinner size={16} />
            <Spinner size={28} />
            <Spinner size={40} />
          </div>
        </Section>

        <Section id="skeleton" title="Skeleton (Loading placeholders)">
          <div className="pv-col">
            <Skeleton height={18} width="40%" />
            <Skeleton height={14} width="80%" />
            <Skeleton height={14} width="70%" />
            <Skeleton height={120} />
          </div>
        </Section>

        <Section id="pagination" title="Pagination">
          <Pagination page={page} total={9} onChange={setPage} />
        </Section>
      </main>
    </div>
  );
}
