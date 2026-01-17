// if new details page is working fine, then delete this file
// before deleting once compair with new version of LeadDetails.jsx
// client\src\pages\Leads\LeadDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Badge,
  Spinner,
  Tooltip,
  Modal,
  Alert,
} from "../../components";
import StatusBadge from "../../components/ui/StatusBadge";
import OutreachEditor from "./components/OutreachEditor";
import { FaArrowLeft } from "react-icons/fa";
import { getLeadById } from "../../services/leads.service";

function Row({ label, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: 12,
        alignItems: "start",
      }}
    >
      <div className="pv-dim" style={{ fontWeight: 600 }}>
        {label}
      </div>
      <div>{children ?? <span className="pv-dim">—</span>}</div>
    </div>
  );
}

export default function LeadDetails() {
  const { id } = useParams(); // expects route like /leads/:id
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "");
  const shortId = (v) => (v ? String(v).slice(-6) : "");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await getLeadById(id);
      console.log("Loaded lead:", data);

      setLead(data);
    } catch (e) {
      setErr(e || "Failed to load lead. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [id]);

  const headerTitle = useMemo(() => {
    if (!lead) return "Lead Details";
    return lead.name || "Lead Details";
  }, [lead]);

  return (
    <div className="pv-col" style={{ gap: 16 }}>
      {/* Sticky header with actions */}
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
        <div style={{ fontWeight: 800, fontSize: 18, flex: 1 }}>
          {headerTitle}
        </div>
        {lead ? (
          <div className="pv-row" style={{ gap: 8 }}>
            <Badge>{lead.source || "—"}</Badge>
            <StatusBadge status={lead.outreach?.status || "New"} />
            {lead.consent ? (
              <Badge>Consent: Yes</Badge>
            ) : (
              <Badge variant="danger">Consent: No</Badge>
            )}
            <Button onClick={() => setEditOpen(true)}>Update</Button>
          </div>
        ) : null}
      </div>

      {/* Loading / Error */}
      {loading && (
        <Card>
          <div
            className="pv-row"
            style={{ justifyContent: "center", padding: 24 }}
          >
            <Spinner size={28} />
          </div>
        </Card>
      )}
      {!!err && (
        <Alert type="danger" title="Error">
          {err}
        </Alert>
      )}

      {/* Content */}
      {lead && !loading && !err && (
        <div className="pv-col" style={{ gap: 16 }}>
          {/* Overview */}
          <Card title="Overview">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Name">{lead.name}</Row>
              <Row label="Email">{lead.email}</Row>
              <Row label="Phone">{lead.phone}</Row>
              <Row label="Message">
                {lead.message ? (
                  <div className="pv-dim" style={{ whiteSpace: "pre-wrap" }}>
                    {lead.message}
                  </div>
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Lead ID">{lead._id}</Row>
              <Row label="Status">
                <StatusBadge status={lead.outreach?.status || "New"} />
              </Row>
              <Row label="Source">
                <Badge>{lead.source || "—"}</Badge>
              </Row>
              <Row label="Assigned To">
                {lead.outreach?.assignedTo ? (
                  <Tooltip content={String(lead.outreach.assignedTo)}>
                    <Badge>{lead.outreach.assignedTo.name}</Badge>
                  </Tooltip>
                ) : (
                  "Unassigned"
                )}
              </Row>
            </div>
          </Card>

          {/* Scheduling */}
          <Card title="Scheduling">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Follow-up At">
                {fmtDate(lead.outreach?.followUpAt)}
              </Row>
              <Row label="Preferred Time Type">
                {lead.preferredTimeType || "ASAP"}
              </Row>
              {lead.preferredTimeType === "SCHEDULED" && (
                <Row label="Preferred Time At">
                  {fmtDate(lead.preferredTimeAt)}
                </Row>
              )}
              <Row label="Last Activity">
                {fmtDate(lead.outreach?.lastActivityAt)}
              </Row>
            </div>
          </Card>

          {/* Segmentation */}
          <Card title="Segmentation">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Tags">
                {lead.tags?.length ? lead.tags.join(", ") : "—"}
              </Row>
              <Row label="Interests">
                {lead.interests?.length ? lead.interests.join(", ") : "—"}
              </Row>
              <Row label="Consent">{lead.consent ? "Yes" : "No"}</Row>
            </div>
          </Card>

          {/* Attribution */}
          <Card title="Attribution">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="UTM Source">{lead.context?.utm?.source}</Row>
              <Row label="UTM Medium">{lead.context?.utm?.medium}</Row>
              <Row label="UTM Campaign">{lead.context?.utm?.campaign}</Row>
              <Row label="UTM Content">{lead.context?.utm?.content}</Row>
              <Row label="Page URL">{lead.context?.page?.url}</Row>
              <Row label="Referrer">{lead.context?.page?.referrer}</Row>
            </div>
          </Card>

          {/* Outreach Note (single summary) */}
          {lead.outreach?.note ? (
            <Card title="Outreach Note">
              <div className="pv-col" style={{ gap: 8 }}>
                <div className="pv-dim" style={{ whiteSpace: "pre-wrap" }}>
                  {lead.outreach.note}
                </div>
              </div>
            </Card>
          ) : null}

          {/* Notes History */}
          <Card title="Notes History">
            <div className="pv-col" style={{ gap: 10 }}>
              {lead.notes?.length ? (
                lead.notes.map((n) => (
                  <div key={n._id} className="pv-col" style={{ gap: 4 }}>
                    <div>{n.body}</div>
                    <div className="pv-dim" style={{ fontSize: 12 }}>
                      {fmtDate(n.at)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="pv-dim">No notes yet</div>
              )}
            </div>
          </Card>

          {/* System */}
          <Card title="System">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Created At">{fmtDate(lead.createdAt)}</Row>
              <Row label="Updated At">{fmtDate(lead.updatedAt)}</Row>

              {/* Archived info shown only if archived */}
              {lead.archivedAt && (
                <>
                  <Row label="Archived At">{fmtDate(lead.archivedAt)}</Row>
                  <Row label="Archived By">
                    {lead.archivedBy ? (
                      <Tooltip content={String(lead.archivedBy)}>
                        <Badge>…{shortId(lead.archivedBy)}</Badge>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </Row>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Update Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Update Outreach – ${lead?.name || ""}`}
        footer={null}
      >
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
