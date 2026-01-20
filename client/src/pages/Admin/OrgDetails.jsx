// client/src/pages/Admin/OrgDetails.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Alert,
  Skeleton,
  Drawer,
  Tabs,
} from "../../components";
import StatusBadge from "../../components/ui/StatusBadge";
import Placeholder from "../../components/ui/Placeholder";
import toast from "react-hot-toast";

import {
  getOrgById,
  updateOrgById,
  deactivateOrgById,
  generateOrgPledgeLink,
} from "../../services/orgService";
import OrgFormModal from "./OrgFormModal";
import { FaCopy, FaLink, FaShareAlt } from "react-icons/fa";
import ModuleHeader from "../../components/ui/moduleHeader/ModuleHeader";

export default function OrgDetails() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleGeneratePledgeLink = async () => {
    try {
      const updated = await generateOrgPledgeLink(org._id);
      setOrg(updated);
      toast.success("Pledge link generated");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to generate link");
    }
  };

  const handleCopyPledgeUrl = () => {
    if (!org?.shortCode) return;
    const url = `${window.location.origin}/pledge/${org.shortCode}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Pledge link copied"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const [editForm, setEditForm] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState(getEmptySessionForm());

  function getEmptySessionForm() {
    return {
      title: "",
      module: "pfc",
      mode: "offline",
      date: "",
      time: "",
      expectedCount: "",
      notes: "",
    };
  }

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOrgById(orgId);
      setOrg(data);
      setEditForm({
        name: data.name || "",
        type: data.type || "other",
        tagline: data.tagline || "",
        logoUrl: data.logoUrl || "",
        website: data.website || "",
        contactPerson: data.contactPerson || "",
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      });
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load partner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const pledgeStats = useMemo(() => {
    if (!org?.stats) return null;
    return {
      totalPledges: org.stats.totalPledges ?? 0,
      lastPledgeAt: org.stats.lastPledgeAt
        ? new Date(org.stats.lastPledgeAt)
        : null,
    };
  }, [org]);

  const handleCopyLink = () => {
    if (!org) return;
    const url = `${window.location.origin}/pledge/${org.slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Partner link copied"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const handleDeactivate = async () => {
    if (!org) return;
    const ok = window.confirm(
      `Deactivate ${org.name}? Their public pledge link will stop working.`,
    );
    if (!ok) return;

    try {
      await deactivateOrgById(org._id);
      toast.success("Partner deactivated");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to deactivate partner");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateOrgById(org._id, editForm);
      setOrg(updated);
      toast.success("Partner updated");
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update partner");
    } finally {
      setSaving(false);
    }
  };

  const handleSessionChange = (e) => {
    const { name, value } = e.target;
    setSessionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    // For now, this is only UI; plug into backend later
    if (!sessionForm.title.trim()) {
      toast.error("Session title is required");
      return;
    }
    if (!sessionForm.date) {
      toast.error("Session date is required");
      return;
    }
    toast.success("Session scheduled (UI only – wire to API later)");
    setSessionForm(getEmptySessionForm());
    setSessionDrawerOpen(false);
  };

  if (loading) {
    return (
      <div
        className="pv-container"
        style={{ padding: 16, maxWidth: 1220, margin: "0 auto" }}
      >
        <ModuleHeader
          title="Partner Details"
          subtitle="Loading organization…"
          backTo="/admin/partners"
          sticky={false}
        />

        <div style={{ marginTop: 16 }}>
          <Card>
            <Skeleton height={24} width="60%" />
            <Skeleton height={16} width="40%" />
            <div style={{ height: 12 }} />
            <Skeleton height={80} />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="pv-container"
        style={{ padding: 16, maxWidth: 1220, margin: "0 auto" }}
      >
        <ModuleHeader
          title="Partner Details"
          subtitle="Something went wrong"
          brdcrumbs={[
            { label: "Home", to: "/" },
            { label: "Admin", to: "/admin" },
            { label: "Partners", to: "/admin/partners" },
          ]}
          sticky={false}
          compact
        />
        <Alert type="danger" style={{ marginTop: 16 }}>
          {error}
        </Alert>
        <div style={{ marginTop: 12 }}>
          <Button variant="ghost" onClick={() => navigate("/admin/partners")}>
            ← Back to partners list
          </Button>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div
        className="pv-container"
        style={{ padding: 16, maxWidth: 1220, margin: "0 auto" }}
      >
        <ModuleHeader
          title="Partner not found"
          subtitle="The requested organization does not exist."
          brdcrumbs={[
            { label: "Home", to: "/" },
            { label: "Admin", to: "/admin" },
            { label: "Partners", to: "/admin/partners" },
          ]}
          sticky={false}
          compact
        />
        <div style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={() => navigate("/admin/partners")}>
            ← Back to partners list
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      label: "Overview",
      content: <OverviewTab org={org} pledgeStats={pledgeStats} />,
    },
    {
      label: "Sessions",
      content: (
        <SessionsTab
          org={org}
          onScheduleClick={() => setSessionDrawerOpen(true)}
        />
      ),
    },
    {
      label: "Notes",
      content: (
        <Card>
          <Placeholder label="Partner Notes / History (coming soon)" />
        </Card>
      ),
    },
  ];

  return (
    <div
      className="pv-container"
      style={{ padding: 16, maxWidth: 1220, margin: "0 auto" }}
    >
      <ModuleHeader
        title={org.name}
        subtitle={org.tagline || "Partner organization"}
        brdcrumbs={[
          { label: "Home", to: "/" },
          { label: "Admin", to: "/admin" },
          { label: "Partners", to: "/admin/partners" },
          { label: org.name },
        ]}
        actions={
          <>
            <Button variant="ghost" onClick={handleCopyLink}>
              Copy Partner Link
            </Button>
            <Button variant="ghost" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            {org.isActive ? (
              <Button variant="danger" onClick={handleDeactivate}>
                Deactivate
              </Button>
            ) : (
              <Badge>Inactive</Badge>
            )}
          </>
        }
        sticky={false}
        compact
      />

      <div
        className="pv-row"
        style={{
          gap: 16,
          alignItems: "flex-start",
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ flex: "2 1 400px", minWidth: 320 }}>
          <Card>
            <div
              className="pv-row"
              style={{ justifyContent: "space-between", gap: 16 }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                {org.logoUrl && (
                  <img
                    src={org.logoUrl}
                    alt={org.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 999,
                      objectFit: "cover",
                    }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    {org.name}
                  </div>
                  {org.tagline && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--pv-dim)",
                        marginTop: 2,
                      }}
                    >
                      {org.tagline}
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "var(--pv-dim)",
                    }}
                  >
                    Code: <strong>{org.shortCode}</strong> &nbsp;•&nbsp; Slug:{" "}
                    <code>{org.slug}</code>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusBadge status={org.isActive ? "Active" : "Inactive"} />
                <div style={{ marginTop: 4 }}>
                  <Badge>{org.type || "other"}</Badge>
                </div>
                {org.city && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: "var(--pv-dim)",
                    }}
                  >
                    {org.city}
                    {org.state ? `, ${org.state}` : ""}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div style={{ height: 12 }} />

          <Tabs tabs={tabs} />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: "1 1 260px", minWidth: 260 }}>
          <Card title="Contact">
            {org.contactPerson || org.contactEmail || org.contactPhone ? (
              <div className="pv-col" style={{ gap: 4, fontSize: 14 }}>
                {org.contactPerson && (
                  <div>
                    <strong>Person:</strong> {org.contactPerson}
                  </div>
                )}
                {org.contactEmail && (
                  <div>
                    <strong>Email:</strong> {org.contactEmail}
                  </div>
                )}
                {org.contactPhone && (
                  <div>
                    <strong>Phone:</strong> {org.contactPhone}
                  </div>
                )}
                {org.website && (
                  <div>
                    <strong>Website:</strong>{" "}
                    <a href={org.website} target="_blank" rel="noreferrer">
                      {org.website}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--pv-dim)" }}>
                No contact details added yet.
              </div>
            )}
          </Card>

          <div style={{ height: 12 }} />

          <Card title="Address">
            {org.address || org.city || org.state || org.pincode ? (
              <div style={{ fontSize: 14, whiteSpace: "pre-line" }}>
                {org.address && <div>{org.address}</div>}
                {(org.city || org.state || org.pincode) && (
                  <div style={{ marginTop: 4 }}>
                    {[org.city, org.state, org.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--pv-dim)" }}>
                No address added yet.
              </div>
            )}
          </Card>

          <div style={{ height: 12 }} />

          <Card title="Pledge Stats">
            {pledgeStats ? (
              <div className="pv-col" style={{ fontSize: 14, gap: 4 }}>
                <div>
                  Total pledges: <strong>{pledgeStats.totalPledges}</strong>
                </div>
                <div>
                  Last pledge:{" "}
                  <strong>
                    {pledgeStats.lastPledgeAt
                      ? pledgeStats.lastPledgeAt.toLocaleString()
                      : "No pledges yet"}
                  </strong>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--pv-dim)" }}>
                No pledge stats available yet.
              </div>
            )}
          </Card>
          <Card title="Financial Safety Pledge Link">
            {!org.shortCode ? (
              <div className="pv-col" style={{ gap: 8, fontSize: 13 }}>
                <div style={{ color: "var(--pv-dim)" }}>
                  No pledge link generated for this partner yet.
                </div>
                <Button onClick={handleGeneratePledgeLink}>
                  Generate pledge link
                </Button>
              </div>
            ) : (
              <div className="pv-col" style={{ gap: 8 }}>
                <div
                  style={{
                    padding: 10,
                    border: "1px solid var(--pv-border)",
                    borderRadius: 8,
                    background: "var(--pv-bg)",
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                        Partner pledge URL
                      </div>
                      <div style={{ fontFamily: "monospace", fontWeight: 700 }}>
                        {`${window.location.origin}/pledge/${org.shortCode}`}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button variant="ghost" onClick={handleCopyPledgeUrl}>
                        <FaCopy /> Copy Link
                      </Button>
                      {/* Simple share: open window with URL – you can customize */}
                      <Button
                        variant="ghost"
                        as="a"
                        href={`${window.location.origin}/pledge/${org.shortCode}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FaShareAlt />
                        Open Link
                      </Button>
                    </div>
                  </div>
                </div>

                {org.pledgeLinkGeneratedAt && (
                  <div style={{ fontSize: 11, color: "var(--pv-dim)" }}>
                    Generated on:{" "}
                    {new Date(org.pledgeLinkGeneratedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <OrgFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        form={editForm}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
        saving={saving}
        editing
      />

      {/* SCHEDULE SESSION DRAWER */}
      <Drawer
        isOpen={sessionDrawerOpen}
        onClose={() => setSessionDrawerOpen(false)}
      >
        <div style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Schedule Session</h3>
          <p style={{ fontSize: 13, color: "var(--pv-dim)" }}>
            Plan a PFC / FFC / awareness session for <strong>{org.name}</strong>
            .
          </p>
          <form
            className="pv-col"
            style={{ gap: 10, marginTop: 8 }}
            onSubmit={handleCreateSession}
          >
            <Input
              label="Session title *"
              name="title"
              value={sessionForm.title}
              onChange={handleSessionChange}
              placeholder="e.g., PFC Awareness Session"
              required
            />
            <div className="pv-row" style={{ gap: 10, flexWrap: "wrap" }}>
              <Select
                label="Module"
                name="module"
                value={sessionForm.module}
                onChange={handleSessionChange}
              >
                <option value="pfc">PFC</option>
                <option value="ffc">FFC</option>
                <option value="bfc">BFC</option>
              </Select>
              <Select
                label="Mode"
                name="mode"
                value={sessionForm.mode}
                onChange={handleSessionChange}
              >
                <option value="offline">On-campus / Offline</option>
                <option value="online">Online</option>
              </Select>
            </div>

            <div className="pv-row" style={{ gap: 10, flexWrap: "wrap" }}>
              <Input
                label="Date"
                name="date"
                type="date"
                value={sessionForm.date}
                onChange={handleSessionChange}
              />
              <Input
                label="Time"
                name="time"
                type="time"
                value={sessionForm.time}
                onChange={handleSessionChange}
              />
            </div>

            <Input
              label="Expected participants"
              name="expectedCount"
              type="number"
              value={sessionForm.expectedCount}
              onChange={handleSessionChange}
              placeholder="e.g., 75"
            />

            <Textarea
              label="Notes"
              name="notes"
              value={sessionForm.notes}
              onChange={handleSessionChange}
              rows={3}
              placeholder="Any special instructions, batch details, etc."
            />

            <div
              className="pv-row"
              style={{ marginTop: 12, justifyContent: "flex-end", gap: 8 }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSessionDrawerOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create session</Button>
            </div>
          </form>
        </div>
      </Drawer>
    </div>
  );
}

// --- TABS CONTENT COMPONENTS ---

function OverviewTab({ org, pledgeStats }) {
  return (
    <div className="pv-col" style={{ gap: 12 }}>
      <Card title="Organization Overview">
        <div className="pv-col" style={{ gap: 6, fontSize: 14 }}>
          <div>
            <strong>Type:</strong> {org.type}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <StatusBadge status={org.isActive ? "Active" : "Inactive"} />
          </div>
          <div>
            <strong>Code:</strong> {org.shortCode}
          </div>
          <div>
            <strong>Created:</strong> {new Date(org.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Last updated:</strong>{" "}
            {new Date(org.updatedAt).toLocaleString()}
          </div>
        </div>
      </Card>

      <Card title="Engagement Snapshot">
        {pledgeStats ? (
          <div className="pv-col" style={{ gap: 4, fontSize: 14 }}>
            <div>
              Total pledges: <strong>{pledgeStats.totalPledges}</strong>
            </div>
            <div>
              Last pledge:{" "}
              <strong>
                {pledgeStats.lastPledgeAt
                  ? pledgeStats.lastPledgeAt.toLocaleString()
                  : "No pledges yet"}
              </strong>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--pv-dim)" }}>
            No engagement stats yet.
          </div>
        )}
      </Card>
    </div>
  );
}

function SessionsTab({ org, onScheduleClick }) {
  return (
    <div className="pv-col" style={{ gap: 12 }}>
      <Card
        title="Sessions"
        extra={
          <Button size="sm" onClick={onScheduleClick}>
            + Schedule session
          </Button>
        }
      >
        {/* You can replace this Placeholder with actual sessions table later */}
        <Placeholder label={`No sessions linked to ${org.name} yet.`} />
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--pv-dim)" }}>
          Later you can show upcoming / past sessions, attendance, feedback,
          etc.
        </div>
      </Card>
    </div>
  );
}
