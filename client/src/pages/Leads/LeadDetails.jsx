import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Badge, Spinner, Tooltip, Modal, Alert, CopyButton } from "../../components";
import StatusBadge from "../../components/ui/StatusBadge";
import OutreachEditor from "./components/OutreachEditor";
import { FaArrowLeft, FaPhoneAlt, FaEnvelope, FaRegCopy } from "react-icons/fa";
import { getLeadById } from "../../services/leads.service";

function Row({ label, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        gap: 12,
        alignItems: "start",
      }}
    >
      <div className="pv-dim" style={{ fontWeight: 700 }}>
        {label}
      </div>
      <div>{children ?? <span className="pv-dim">—</span>}</div>
    </div>
  );
}

function RelTime({ date }) {
  if (!date) return <span className="pv-dim">—</span>;
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  const label =
    days === 0 ? "Today" : days === 1 ? "Tomorrow" : days === -1 ? "Yesterday" : days > 1 ? `In ${days} days` : `${Math.abs(days)} days ago`;

  const dim = diff < 0 ? "var(--pv-danger, #d33)" : "var(--pv-dim)";
  return (
    <span style={{ color: diff < 0 ? dim : "inherit" }}>
      {d.toLocaleString()} <span className="pv-dim">({label})</span>
    </span>
  );
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await getLeadById(id);
      setLead(data);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load lead.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const headerTitle = useMemo(() => lead?.name || "Lead Details", [lead]);

  const assigned = lead?.outreach?.assignedTo;
  const assignedName = assigned?.name || "";
  const assignedEmail = assigned?.email || "";

  return (
    <div className="pv-col" style={{ gap: 16 }}>
      {/* Sticky header */}
      <div
        className="pv-row pv-card"
        style={{
          position: "sticky",
          top: 76,
          zIndex: 5,
          padding: 12,
          alignItems: "center",
          gap: 12,
        }}
      >
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </Button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }} className="pv-ellipsis">
            {headerTitle}
          </div>

          <div className="pv-row" style={{ gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            <Badge>{lead?.source || "—"}</Badge>
            <StatusBadge status={lead?.outreach?.status || "New"} />
            {lead?.consent ? <Badge>Consent: Yes</Badge> : <Badge variant="danger">Consent: No</Badge>}

            {assignedName ? (
              <Tooltip content={assignedEmail || assignedName}>
                <Badge>
                  Assigned: <b>{assignedName}</b>
                </Badge>
              </Tooltip>
            ) : (
              <Badge>Assigned: Unassigned</Badge>
            )}
          </div>
        </div>

        {lead ? (
          <div className="pv-row" style={{ gap: 8 }}>
            {lead.phone ? (
              <Button variant="ghost" onClick={() => window.open(`tel:${lead.phone}`)}>
                <FaPhoneAlt /> Call
              </Button>
            ) : null}

            {lead.email ? (
              <Button variant="ghost" onClick={() => window.open(`mailto:${lead.email}`)}>
                <FaEnvelope /> Email
              </Button>
            ) : null}

            <Button onClick={() => setEditOpen(true)}>Update</Button>
          </div>
        ) : null}
      </div>

      {loading && (
        <Card>
          <div className="pv-row" style={{ justifyContent: "center", padding: 24 }}>
            <Spinner size={28} />
          </div>
        </Card>
      )}

      {!!err && (
        <Alert type="danger" title="Error">
          {err}
        </Alert>
      )}

      {lead && !loading && !err && (
        <div className="pv-col" style={{ gap: 16 }}>
          {/* Overview */}
          <Card title="Overview">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Name">{lead.name}</Row>

              <Row label="Phone">
                {lead.phone ? (
                  <div className="pv-row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="pv-mono">{lead.phone}</span>
                    <CopyButton value={lead.phone} label="phone" size={14} successMessage="Phone copied" />
                  </div>
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Email">
                {lead.email ? (
                  <div className="pv-row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span>{lead.email}</span>
                    <CopyButton value={lead.email} label="email" size={14} successMessage="Email copied" />
                  </div>
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Message">
                {lead.message ? (
                  <div className="pv-dim" style={{ whiteSpace: "pre-wrap" }}>
                    {lead.message}
                  </div>
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Lead ID">
                <div className="pv-row" style={{ gap: 8, alignItems: "center" }}>
                  <span className="pv-mono">{lead._id}</span>
                  <CopyButton value={lead._id} label="lead id" size={14} successMessage="Lead ID copied" />
                </div>
              </Row>
            </div>
          </Card>

          {/* Scheduling */}
          <Card title="Scheduling">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Follow-up At">
                <RelTime date={lead.outreach?.followUpAt} />
              </Row>

              <Row label="Preferred Time">
                {lead.preferredTimeType === "SCHEDULED" ? (
                  <RelTime date={lead.preferredTimeAt} />
                ) : (
                  <Badge>{lead.preferredTimeType || "ASAP"}</Badge>
                )}
              </Row>

              <Row label="Last Activity">
                <RelTime date={lead.outreach?.lastActivityAt} />
              </Row>
            </div>
          </Card>

          {/* Segmentation */}
          <Card title="Segmentation">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Interests">
                {lead.interests?.length ? (
                  <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {lead.interests.map((x) => (
                      <Badge key={x}>{x}</Badge>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Tags">
                {lead.tags?.length ? (
                  <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {lead.tags.map((x) => (
                      <Badge key={x}>{x}</Badge>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </Row>
            </div>
          </Card>

          {/* Outreach Note */}
          {lead.outreach?.note ? (
            <Card title="Latest Outreach Note">
              <div className="pv-dim" style={{ whiteSpace: "pre-wrap" }}>
                {lead.outreach.note}
              </div>
            </Card>
          ) : null}

          {/* Notes History */}
          <Card title={`Notes History (${lead.notes?.length || 0})`}>
            <div className="pv-col" style={{ gap: 10 }}>
              {lead.notes?.length ? (
                lead.notes.map((n) => (
                  <div key={n._id} className="pv-col" style={{ gap: 4, padding: 10, border: "1px solid var(--pv-border)", borderRadius: 10 }}>
                    <div style={{ whiteSpace: "pre-wrap" }}>{n.body}</div>
                    <div className="pv-dim" style={{ fontSize: 12 }}>
                      {n.at ? new Date(n.at).toLocaleString() : ""}
                    </div>
                  </div>
                ))
              ) : (
                <div className="pv-dim">No notes yet</div>
              )}
            </div>
          </Card>

          {/* Attribution (keep it, but it’s already low priority) */}
          <Card title="Attribution">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="UTM Source">{lead.context?.utm?.source || "—"}</Row>
              <Row label="UTM Medium">{lead.context?.utm?.medium || "—"}</Row>
              <Row label="UTM Campaign">{lead.context?.utm?.campaign || "—"}</Row>
              <Row label="Page URL">{lead.context?.page?.url || "—"}</Row>
              <Row label="Referrer">{lead.context?.page?.referrer || "—"}</Row>
            </div>
          </Card>

          {/* System */}
          <Card title="System">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Created At">{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "—"}</Row>
              <Row label="Updated At">{lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : "—"}</Row>

              {lead.archivedAt && (
                <>
                  <Row label="Archived At">{new Date(lead.archivedAt).toLocaleString()}</Row>
                  <Row label="Archived By">
                    {lead.archivedBy?.name ? (
                      <Tooltip content={lead.archivedBy?.email || lead.archivedBy?.name}>
                        <Badge>{lead.archivedBy.name}</Badge>
                      </Tooltip>
                    ) : (
                      <span className="pv-dim">—</span>
                    )}
                  </Row>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Update Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={`Update Outreach – ${lead?.name || ""}`} footer={null}>
        {lead && (
          <OutreachEditor
            lead={lead}
            onClose={() => setEditOpen(false)}
            onSaved={() => {
              setEditOpen(false);
              load();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
