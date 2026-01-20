// client\src\pages\Admin\PartnerOrgs.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  Skeleton,
  Alert,
  Pagination,
} from "../../components";
import StatusBadge from "../../components/ui/StatusBadge";
import toast from "react-hot-toast";

import {
  getAllOrgs,
  createOrg,
  updateOrgById,
  deactivateOrgById,
} from "../../services/orgService";
import { useNavigate } from "react-router-dom";
import OrgFormModal from "./OrgFormModal";
import ModuleHeader from "../../components/ui/moduleHeader/ModuleHeader";

const PAGE_SIZE = 12;

export default function PartnerOrgs() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // active | inactive | all

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      name: "",
      type: "other",
      tagline: "",
      logoUrl: "",
      website: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    };
  }

  const statusToQuery = (v) =>
    v === "all" ? "all" : v === "inactive" ? "false" : "true";

  const load = async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const currentPage = opts.page || page;
      const skip = (currentPage - 1) * PAGE_SIZE;

      const { items, total } = await getAllOrgs({
        search,
        type: typeFilter,
        isActive: statusToQuery(statusFilter),
        limit: PAGE_SIZE,
        skip,
      });
      setItems(items || []);
      setTotal(total || 0);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load({ page: 1 });
  };

  const handlePageChange = (p) => {
    setPage(p);
    load({ page: p });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(getEmptyForm());
    setModalOpen(true);
  };

  // const openEdit = (org) => {
  //   setEditing(org);
  //   setForm({
  //     ...getEmptyForm(),
  //     ...org,
  //   });
  //   setModalOpen(true);
  // };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.name.trim()) {
        toast.error("Name is required");
        setSaving(false);
        return;
      }

      if (editing) {
        await updateOrgById(editing._id, form);
        toast.success("Partner updated");
      } else {
        await createOrg(form);
      }
      setModalOpen(false);
      await load({ page: 1 });
      setPage(1);
      if (!editing) toast.success("Partner created");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to save partner");
    } finally {
      setSaving(false);
    }
  };

  // const handleDeactivate = async (org) => {
  //   const ok = window.confirm(
  //     `Deactivate ${org.name}? Their link will stop working.`
  //   );
  //   if (!ok) return;

  //   try {
  //     await deactivateOrgById(org._id);
  //     toast.success("Partner deactivated");
  //     await load();
  //   } catch (e) {
  //     console.error(e);
  //     toast.error("Failed to deactivate partner");
  //   }
  // };

  // const handleCopyLink = (org) => {
  //   const url = `${window.location.origin}/pledge/${org.shortCode}`;
  //   navigator.clipboard
  //     .writeText(url)
  //     .then(() => toast.success("Link copied"))
  //     .catch(() => toast.error("Failed to copy link"));
  // };

  const totalPages = useMemo(
    () => (total ? Math.ceil(total / PAGE_SIZE) : 1),
    [total],
  );

  return (
    <div
      className="pv-container"
      style={{ padding: 16, maxWidth: 1220, margin: "0 auto" }}
    >
      <ModuleHeader
        title="Partner Organizations"
        subtitle="Schools, colleges, businesses and institutes where Paisavidhya sessions are conducted."
        backTo="/admin"
        actions={<Button onClick={openCreate}>Add New Partner</Button>}
      />

      <div style={{ height: 12 }} />

      <Card>
        <form
          className="pv-row"
          style={{ gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}
          onSubmit={handleSearchSubmit}
        >
          <div style={{ minWidth: 200, flex: "1 1 260px" }}>
            <Input
              label="Search"
              placeholder="Search by name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 160 }}>
            <Select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="business">Business</option>
              <option value="ngo">NGO</option>
              <option value="institute">Institute</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div style={{ minWidth: 160 }}>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
              <option value="all">All</option>
            </Select>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button type="submit">Apply</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch("");
                setTypeFilter("");
                setStatusFilter("active");
                setPage(1);
                load({ page: 1 });
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <Alert type="danger" style={{ marginTop: 12 }}>
          {error}
        </Alert>
      )}

      <div style={{ height: 12 }} />

      {loading ? (
        <Card>
          <div
            className="pv-row"
            style={{ gap: 16, flexWrap: "wrap", alignItems: "stretch" }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={120} style={{ flex: "1 1 260px" }} />
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          {items.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--pv-dim)",
              }}
            >
              No partners found. Create the first one using{" "}
              <strong>“Add New Partner”</strong>.
            </div>
          ) : (
            <>
              <div
                className="pv-row"
                style={{
                  gap: 16,
                  flexWrap: "wrap",
                  alignItems: "stretch",
                }}
              >
                {items.map((org) => (
                  <div
                    key={org._id}
                    className="pv-card"
                    style={{
                      padding: 14,
                      flex: "1 1 260px",
                      minWidth: 260,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/admin/partners/${org._id}`)}
                  >
                    <div
                      className="pv-row"
                      style={{ justifyContent: "space-between", gap: 8 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        {org.logoUrl && (
                          <img
                            src={org.logoUrl}
                            alt={org.name}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 999,
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 700 }}>{org.name}</div>
                          {org.tagline && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--pv-dim)",
                                maxWidth: 220,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {org.tagline}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge>{org.type || "other"}</Badge>
                    </div>

                    <div
                      className="pv-row"
                      style={{
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "var(--pv-dim)",
                      }}
                    >
                      <div>
                        <div>
                          Code: <strong>{org.shortCode}</strong>
                        </div>
                        <div>
                          Pledges:{" "}
                          <strong>{org.stats?.totalPledges ?? 0}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <StatusBadge
                          status={org.isActive ? "Active" : "Inactive"}
                        />
                        {org.city && (
                          <div>
                            {org.city}
                            {org.state ? `, ${org.state}` : ""}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* <div
                      className="pv-row"
                      style={{
                        justifyContent: "space-between",
                        marginTop: "auto",
                        gap: 8,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(org)}
                      >
                        Copy link
                      </Button>
                      <div className="pv-row" style={{ gap: 4 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(org)}
                        >
                          Edit
                        </Button>
                        {org.isActive && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeactivate(org)}
                          >
                            Deactivate
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/partners/${org._id}`)}
                        >
                          View
                        </Button>
                      </div> 
                    </div>*/}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--pv-dim)",
                    }}
                  >
                    Showing {items.length} of {total} partners
                  </div>
                  <Pagination
                    page={page}
                    total={totalPages}
                    onChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      )}

      <OrgFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        onChange={handleFormChange}
        onSubmit={handleSave}
        saving={saving}
        editing={!!editing}
      />
    </div>
  );
}
