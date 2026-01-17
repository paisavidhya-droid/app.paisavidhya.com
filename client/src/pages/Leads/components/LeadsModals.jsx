// src/pages/leads/components/LeadsModals.jsx
import React from "react";
import { Badge, Button, Modal } from "../../../components";
import OutreachEditor from "./OutreachEditor";
import LeadLogsModal from "./LeadLogsModal";
import LeadDetailsEditor from "./LeadDetailsEditor";
import TransferLeadModal from "../LeadTransferModal";
import CallbackForm from "../../../components/CallbackForm";

export default function LeadsModals({
  goToLead,
  load,

  // modal states
  editLead,
  setEditLead,
  noteLead,
  setNoteLead,
  logsLead,
  setLogsLead,
  editDetailsLead,
  setEditDetailsLead,
  createLeadOpen,
  setCreateLeadOpen,
  transferIds,
  setTransferIds,

  // helpers
  fmtDate,
}) {
  return (
    <>
      {/* Update outreach */}
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

      {/* Note view */}
      <Modal
        isOpen={!!noteLead}
        onClose={() => setNoteLead(null)}
        title={`Note – ${noteLead?.name || ""}`}
        footer={
          <div className="pv-row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <Button
              onClick={() => {
                setEditLead(noteLead);
                setNoteLead(null);
              }}
            >
              Update Outreach
            </Button>
            <Button variant="ghost" onClick={() => goToLead(noteLead?._id)}>
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
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                maxHeight: 280,
                overflowY: "auto",
                lineHeight: 1.5,
              }}
            >
              {noteLead.outreach?.note}
            </div>

            <div className="pv-row" style={{ gap: 12, marginTop: 6, flexWrap: "wrap" }}>
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
                  <b>Last activity:</b>&nbsp;{fmtDate(noteLead.outreach.lastActivityAt)}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Transfer modal */}
      <TransferLeadModal
        isOpen={transferIds.length > 0}
        onClose={() => setTransferIds([])}
        leadIds={transferIds}
        title={
          transferIds.length > 1 ? `Transfer ${transferIds.length} Leads` : "Transfer Lead"
        }
        onTransferred={() => {
          setTransferIds([]);
          load();
        }}
      />

      {/* Logs */}
      <LeadLogsModal
        isOpen={!!logsLead}
        onClose={() => setLogsLead(null)}
        lead={logsLead}
      />

      {/* Edit details */}
      <Modal
        isOpen={!!editDetailsLead}
        onClose={() => setEditDetailsLead(null)}
        title={`Edit Lead – ${editDetailsLead?.name || ""}`}
        footer={null}
      >
        {editDetailsLead && (
          <LeadDetailsEditor
            lead={editDetailsLead}
            onClose={() => setEditDetailsLead(null)}
            onSaved={() => {
              setEditDetailsLead(null);
              load();
            }}
          />
        )}
      </Modal>

      {/* Create lead */}
      <Modal
        isOpen={createLeadOpen}
        onClose={() => setCreateLeadOpen(false)}
        title="Add Callback Request"
        footer={null}
      >
        <CallbackForm
          mode="ops"
          inModal
          onDone={() => {
            setCreateLeadOpen(false);
            load();
          }}
        />
      </Modal>
    </>
  );
}
