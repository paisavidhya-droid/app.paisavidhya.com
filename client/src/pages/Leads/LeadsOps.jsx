import { useEffect, useState } from "react";
import "./leads.css";
import {
  Card,
  Input,
  Select,
  Button,
  Badge,
  Modal,
  Pagination,
  Spinner,
  Tooltip,
} from "../../components";
import toast from "react-hot-toast";
import OutreachEditor from "../../components/Leads/OutreachEditor";
import { LeadsAPI } from "../../api/leads";
import StatusBadge from "../../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import LeadActionsDropdown from "./LeadActionsDropdown";
import TransferLeadModal from "./LeadTransferModal";

const STATUS = [
  "",
  "New",
  "Contacted",
  "Follow-Up",
  "Meeting Scheduled",
  "Won",
  "Lost",
];
const SOURCES = [
  "",
  "Website",
  "WhatsApp",
  "Instagram",
  "LinkedIn",
  "Referral",
  "Seminar",
  "Campaign",
  "Other",
];

export default function LeadsOps() {
  const navigate = useNavigate();
  // filters
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [phone, setPhone] = useState("");

  // paging & data
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // edit & details
  const [editLead, setEditLead] = useState(null);
  const [noteLead, setNoteLead] = useState(null);

    const [transferLead, setTransferLead] = useState(null);

  // helpers
  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "");
  const shortId = (id) => (id ? String(id).slice(-6) : "");

  async function load() {
    setLoading(true);
    try {
      const limit = 10;
      const skip = (page - 1) * limit;
      // normalize phone so +91/space/dash don’t break matches
      const cleanedPhone = phone ? phone.replace(/\D/g, "") : "";
      const data = await LeadsAPI.list({
        status,
        source,
        phone: cleanedPhone,
        limit,
        skip,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [page]);
  const applyFilters = () => {
    setPage(1);
    load();
  };

  // table columns (important only)
  // Name&Email | Phone | Source | Status | Assigned | Follow/Preferred | Last Activity | Actions
  const minWidth = 1200;

  const truncate = (txt, n = 40) => {
    if (!txt) return "";
    const s = String(txt);
    return s.length > n ? s.slice(0, n).trim() + "…" : s;
  };

  // new: simplified next-action formatter
  const fmtNextAction = (lead) => {
    const fu = lead?.outreach?.followUpAt;
    const type = lead?.preferredTimeType;
    const pref = lead?.preferredTimeAt;

    if (fu) return `Follow-up • ${fmtDate(fu)}`;
    if (type === "SCHEDULED" && pref) return `Scheduled • ${fmtDate(pref)}`;
    return type && type !== "SCHEDULED" ? type : "ASAP";
  };

  const fmtNextActionNode = (lead) => {
    const t = fmtNextAction(lead);
    return t === "ASAP" ? <Badge>ASAP</Badge> : t;
  };

  return (
    <div className="pv-col" style={{ gap: 16 }}>
      {/* Filters */}
      <Card title="Lead Filters">
        <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All statuses"}
              </option>
            ))}
          </Select>
          <Select
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            {SOURCES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All sources"}
              </option>
            ))}
          </Select>
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91…"
          />
          <Button onClick={applyFilters}>Apply</Button>
        </div>
      </Card>

      {/* Table */}
      <Card title="Leads">
        {loading ? (
          <div
            className="pv-row"
            style={{ justifyContent: "center", padding: 20 }}
          >
            <Spinner size={28} />
          </div>
        ) : (
          <div className="pv-col" style={{ gap: 8, overflowX: "auto" }}>
            {/* Head */}
            <div
              className="pv-row pv-table-head"
              style={{ fontWeight: 600, minWidth }}
            >
              <div style={{ width: "20%" }}>Name / Email</div>
              <div style={{ width: "12%" }}>Phone</div>
              <div style={{ width: "12%" }}>Source</div>
              <div style={{ width: "12%" }}>Status</div>
              <div style={{ width: "12%" }}>Assigned</div>
              <div style={{ width: "25%" }}>
                Next Action(Follow-up / Scheduled)
              </div>
              <div style={{ width: "12%" }}>Note</div>
            </div>

            {/* Rows */}
            {items.map((lead) => (
              <div
                key={lead._id}
                className="pv-row pv-table-row"
                style={{ minWidth }}
              >
                {/* Name / Email */}
                <div style={{ width: "20%" }}>
                  <div>{lead.name}</div>
                  {lead.email ? (
                    <div
                      className="pv-dim"
                      style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {lead.email}
                    </div>
                  ) : null}
                </div>

                {/* Phone */}
                <div style={{ width: "12%" }}>
                  {lead.phone || "••• masked •••"}
                </div>

                {/* Source */}
                <div style={{ width: "12%" }}>
                  {lead.source || <span className="pv-dim">—</span>}
                </div>

                {/* Status */}
                <div style={{ width: "12%" }}>
                  <StatusBadge status={lead.outreach?.status || "New"} />
                </div>

                {/* Assigned */}
                <div style={{ width: "12%" }}>
                  {lead.outreach?.assignedTo ? (
                    <Tooltip content={String(lead.outreach.assignedTo)}>
                      <Badge>…{shortId(lead.outreach.assignedTo)}</Badge>
                    </Tooltip>
                  ) : (
                    <span className="pv-dim">—</span>
                  )}
                </div>

                {/* Follow-up / Preferred */}
                <div style={{ width: "18%" }}>{fmtNextActionNode(lead)}</div>

                {/* Note (truncated with optional modal) */}
                <div
                  style={{
                    width: "12%",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {lead.outreach?.note ? (
                    <>
                      {/* keep tooltip for short notes only */}
                      {String(lead.outreach.note).length <= 36 ? (
                        <Tooltip content={String(lead.outreach.note)}>
                          <span className="pv-dim">
                            {truncate(lead.outreach.note, 36)}
                          </span>
                        </Tooltip>
                      ) : (
                        <>
                          <span className="pv-dim">
                            {truncate(lead.outreach.note, 36)}
                          </span>
                          <button
                            className="view-note-btn"
                            onClick={() => setNoteLead(lead)}
                          >
                            View
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="pv-dim">—</span>
                  )}
                </div>

                {/* Actions */}
               
                  <div>
                    <LeadActionsDropdown
                      lead={lead}
                      onViewDetails={() => navigate(`/admin/leads/${lead._id}`)}
                      onUpdateOutreach={() => setEditLead(lead)}
                      // Optional: wire these if you have handlers
                    onTransfer={() => setTransferLead(lead)} 
                      onViewLogs={undefined /* () => openLogs(lead._id) */}
                      // Role rules (example): only assignee can update/transfer
                      canUpdate={
                        !lead.outreach?.assignedTo ||
                        String(lead.outreach.assignedTo) ===
                          String(/* currentUserId */ "")
                      }
                      canTransfer={
                        !lead.outreach?.assignedTo ||
                        String(lead.outreach.assignedTo) ===
                          String(/* currentUserId */ "")
                      }
                    />
                  </div>
                </div>
              
            ))}

            {/* Pagination */}
            <div
              className="pv-row"
              style={{ justifyContent: "center", marginTop: 8 }}
            >
              <Pagination
                page={page}
                total={Math.ceil(total / 10)}
                onChange={setPage}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Update modal (existing) */}
      <Modal
        isOpen={!!editLead}
        onClose={() => setEditLead(null)}
        title={`Update Outreach – ${editLead?.name || ""}`}
        footer={null}
      >
        {editLead && (
          <OutreachEditor
            lead={editLead}
            onClose={() => setEditLead(null)}
            onSaved={() => {
              setEditLead(null);
              load();
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!noteLead}
        onClose={() => setNoteLead(null)}
        title={`Note – ${noteLead?.name || ""}`}
        footer={
          <div
            className="pv-row"
            style={{ justifyContent: "flex-end", gap: 8 }}
          >
            <Button
              onClick={() => {
                setEditLead(noteLead);
                setNoteLead(null);
              }}
            >
              Update Outreach
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/admin/leads/${noteLead?._id}`)}
            >
              Open Details
            </Button>
          </div>
        }
      >
        {noteLead && (
          <div className="pv-col" style={{ gap: 10 }}>
            <div
              className="pv-dim"
              style={{
                whiteSpace: "pre-wrap",
                maxHeight: 280,
                overflow: "auto",
              }}
            >
              {noteLead.outreach?.note}
            </div>
            <div
              className="pv-row"
              style={{ gap: 12, marginTop: 6, flexWrap: "wrap" }}
            >
              <Badge>
                <b>Status:</b>&nbsp;{noteLead.outreach?.status || "New"}
              </Badge>
              {noteLead.outreach?.followUpAt && (
                <Badge>
                  <b>Follow-up:</b>&nbsp;{fmtDate(noteLead.outreach.followUpAt)}
                </Badge>
              )}
              {noteLead.outreach?.lastActivityAt && (
                <Badge>
                  <b>Last activity:</b>&nbsp;
                  {fmtDate(noteLead.outreach.lastActivityAt)}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Modal>

        {/* Transfer modal */}
      <TransferLeadModal
        isOpen={!!transferLead}
        onClose={() => setTransferLead(null)}
        lead={transferLead}
        onTransferred={() => { setTransferLead(null); load(); }}
        currentUserId={"" /* pass your auth user id if you want to block self-transfer */}
      />
    </div>
  );
}
