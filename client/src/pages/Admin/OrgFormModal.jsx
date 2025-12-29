// client/src/components/admin/OrgFormModal.jsx
import { Modal, Button, Input, Select } from "../../components";

export default function OrgFormModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  saving,
  editing,
}) {
  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={editing ? "Edit Partner" : "New Partner"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={onSubmit}>
            {saving ? "Saving…" : editing ? "Save changes" : "Create partner"}
          </Button>
        </>
      }
    >
      <div className="pv-col" style={{ gap: 10 }}>
        <div className="pv-row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Input
            label="Org. Name *"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="e.g., ABC International School"
            required
          />
          <Select
            label="Type"
            name="type"
            value={form.type}
            onChange={onChange}
          >
            <option value="school">School</option>
            <option value="college">College</option>
            <option value="business">Business</option>
            <option value="ngo">NGO</option>
            <option value="institute">Institute</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <Input
          label="Tagline"
          name="tagline"
          value={form.tagline}
          onChange={onChange}
          placeholder="e.g., Financial Literacy Partner (if any)"
        />

        <div className="pv-row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Input
            label="Logo URL"
            name="logoUrl"
            value={form.logoUrl}
            onChange={onChange}
            placeholder="https://…"
          />
          <Input
            label="Website"
            name="website"
            value={form.website}
            onChange={onChange}
            placeholder="https://…"
          />
        </div>

        <div className="pv-row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Input
            label="Contact person"
            name="contactPerson"
            value={form.contactPerson}
            onChange={onChange}
          />
          <Input
            label="Contact email"
            name="contactEmail"
            value={form.contactEmail}
            onChange={onChange}
            type="email"
          />
          <Input
            label="Contact phone"
            name="contactPhone"
            value={form.contactPhone}
            onChange={onChange}
          />
        </div>

        <Input
          label="Address"
          name="address"
          value={form.address}
          onChange={onChange}
        />

        <div className="pv-row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={onChange}
          />
          <Input
            label="State"
            name="state"
            value={form.state}
            onChange={onChange}
          />
          <Input
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={onChange}
          />
        </div>
        
        {/* <Alert type="info">
          Once created, a unique <strong>short code</strong> and{" "}
          <strong>partner link</strong> will be generated automatically.
        </Alert> */}
      </div>
    </Modal>
  );
}
