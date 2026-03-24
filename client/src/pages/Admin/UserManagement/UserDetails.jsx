// client/src/pages/Admin/UserManagement/UserDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Badge,
  Spinner,
  Tooltip,
  Modal,
  Alert,
  CopyButton,
} from "../../../components";
import StatusBadge from "../../../components/ui/StatusBadge";
import { FaArrowLeft, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { getUserById, updateUserById } from "../../../services/userService";
import {
  adminGetProfileByUserId,
  adminUpdateProfileByUserId,
} from "../../../services/profileService";
import toast from "react-hot-toast";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

/* ---------- small helpers (same vibe as LeadDetails) ---------- */

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
    days === 0
      ? "Today"
      : days === 1
        ? "Tomorrow"
        : days === -1
          ? "Yesterday"
          : days > 1
            ? `In ${days} days`
            : `${Math.abs(days)} days ago`;

  const color = diff < 0 ? "var(--pv-danger, #d33)" : "inherit";

  return (
    <span style={{ color }}>
      {d.toLocaleString()} <span className="pv-dim">({label})</span>
    </span>
  );
}

function KVBadge({ label, value }) {
  if (!value) return <span className="pv-dim">—</span>;
  return (
    <Badge>
      {label}: <b>{String(value)}</b>
    </Badge>
  );
}

function MoneySafe({ value }) {
  if (value === 0) return "0";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

/* ---------- Edit modal (simple + safe) ---------- */

function EditUserAdminModal({ isOpen, onClose, user, profile, onSaved }) {
  // Keep minimal editing: role/status on user; and profile patch if needed
  const [role, setRole] = useState(user?.role?.toLowerCase() || "staff");
  const [status, setStatus] = useState(user?.status || "ACTIVE");
  const [timezone, setTimezone] = useState(
    profile?.prefs?.timezone || "Asia/Kolkata",
  );
  const [locale, setLocale] = useState(profile?.prefs?.locale || "en-IN");

  useEffect(() => {
    setRole(user?.role?.toLowerCase() || "staff");
    setStatus(user?.status || "ACTIVE");
    setTimezone(profile?.prefs?.timezone || "Asia/Kolkata");
    setLocale(profile?.prefs?.locale || "en-IN");
  }, [user, profile]);

  const handleSave = async () => {
    try {
      if (user?._id) {
        await updateUserById(user._id, {
          role: role ? role.toUpperCase() : undefined,
          status: status ? status.toUpperCase() : undefined,
        });
      }
      if (user?._id) {
        await adminUpdateProfileByUserId(user._id, {
          prefs: {
            ...(profile?.prefs || {}),
            timezone,
            locale,
            comms: profile?.prefs?.comms || {},
          },
        });
      }
      toast.success("Saved");
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast.error(String(e?.response?.data?.message || e?.message || e));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update User – ${user?.name || user?.email || ""}`}
      footer={null}
    >
      <div className="pv-col" style={{ gap: 12 }}>
        <Card title="Access">
          <div className="pv-col" style={{ gap: 10 }}>
            <Row label="Email">{user?.email || "—"}</Row>

            <Row label="Role">
              <select
                className="pv-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">admin</option>
                <option value="staff">staff</option>
                <option value="customer">customer</option>
              </select>
            </Row>

            <Row label="Status">
              <select
                className="pv-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">active</option>
                <option value="SUSPENDED">suspended</option>
              </select>
            </Row>
          </div>
        </Card>

        <Card title="Preferences">
          <div className="pv-col" style={{ gap: 10 }}>
            <Row label="Timezone">
              <input
                className="pv-input"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Kolkata"
              />
            </Row>

            <Row label="Locale">
              <input
                className="pv-input"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                placeholder="en-IN"
              />
            </Row>
          </div>
        </Card>

        <div className="pv-row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- MAIN PAGE ---------- */

export default function UserDetails() {
  const { id } = useParams(); // userId
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const headerTitle = useMemo(
    () => user?.name || user?.email || "User Details",
    [user],
  );

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [u, p] = await Promise.all([
        getUserById(id),
        adminGetProfileByUserId(id).catch(() => null), // profile may not exist
      ]);
      setUser(u);
      setProfile(p);
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || "Failed to load user.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const consentLike = (v) =>
    v ? <Badge>Yes</Badge> : <Badge variant="danger">No</Badge>;

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
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          style={{ padding: "12px" }}
        >
          <FaArrowLeft /> Back
        </Button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ fontWeight: 900, fontSize: 18 }}
            className="pv-ellipsis"
          >
            {headerTitle}
          </div>

          <div
            className="pv-row"
            style={{ gap: 8, flexWrap: "wrap", marginTop: 6 }}
          >
            <KVBadge
              label="Role"
              value={user?.role ? String(user.role).toLowerCase() : ""}
            />
            <StatusBadge
              status={user?.status === "SUSPENDED" ? "Suspended" : "Active"}
            />
            <KVBadge
              label="Phone Verified"
              value={user?.phoneVerified ? "Yes" : "No"}
            />
            <KVBadge
              label="Email Verified"
              value={user?.emailVerified ? "Yes" : "No"}
            />
          </div>
        </div>

        {user ? (
          <div className="pv-row" style={{ gap: 8 }}>
            {user.phoneNumber ? (
              <Button
                variant="ghost"
                onClick={() => window.open(`tel:${user.phoneNumber}`)}
              >
                <FaPhoneAlt /> Call
              </Button>
            ) : null}

            {user.email ? (
              <Button
                variant="ghost"
                onClick={() => window.open(`mailto:${user.email}`)}
              >
                <FaEnvelope /> Email
              </Button>
            ) : null}

            <Button onClick={() => setEditOpen(true)}>Update</Button>
          </div>
        ) : null}
      </div>

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

      {!loading && !err && user && (
        <div className="pv-col" style={{ gap: 16 }}>
          {/* USER: Overview */}
          <Card title="User Overview">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Name">{user.name || "—"}</Row>

              <Row label="Email">
                {user.email ? (
                  <div
                    className="pv-row"
                    style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <span>{user.email}</span>
                    <CopyButton
                      value={user.email}
                      label="email"
                      size={14}
                      successMessage="Email copied"
                    />
                  </div>
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Phone">
                {user.phoneNumber ? (
                  <div
                    className="pv-row"
                    style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <span className="pv-mono">{user.phoneNumber}</span>
                    <CopyButton
                      value={user.phoneNumber}
                      label="phone"
                      size={14}
                      successMessage="Phone copied"
                    />
                  </div>
                ) : (
                  "—"
                )}
              </Row>

              <Row label="User ID">
                <div
                  className="pv-row"
                  style={{ gap: 8, alignItems: "center" }}
                >
                  <span className="pv-mono">{user._id}</span>
                  <CopyButton
                    value={user._id}
                    label="user id"
                    size={14}
                    successMessage="User ID copied"
                  />
                </div>
              </Row>

              <Row label="Role">
                {user.role ? (
                  <Badge>{String(user.role).toLowerCase()}</Badge>
                ) : (
                  <span className="pv-dim">—</span>
                )}
              </Row>

              <Row label="Status">
                <StatusBadge
                  status={user.status === "SUSPENDED" ? "Suspended" : "Active"}
                />
              </Row>

              <Row label="Phone Verified">
                {consentLike(user.phoneVerified)}
              </Row>
              <Row label="Email Verified">
                {consentLike(user.emailVerified)}
              </Row>
            </div>
          </Card>

          {/* USER: Pledge */}
          <Card title="Pledge">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Taken">{consentLike(user?.pledge?.taken)}</Row>
              <Row label="Date">
                {user?.pledge?.date ? (
                  <RelTime date={user.pledge.date} />
                ) : (
                  <span className="pv-dim">—</span>
                )}
              </Row>
              {/* <Row label="Certificate ID">
                {user?.pledge?.certificateId || "—"}
              </Row> */}
              <Row label="Certificate ID">
                {user?.pledge?.certificateId ? (
                  <div
                    className="pv-row"
                    style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <span>{user.pledge.certificateId}</span>

                    <CopyButton
                      value={user.pledge.certificateId}
                      label="certificate id"
                      size={14}
                      successMessage="Certificate ID copied"
                    />

                    <Button
                      variant="ghost"
                      onClick={() =>
                        window.open(
                          `https://paisavidhya-server.el.r.appspot.com/api/certificates/${encodeURIComponent(
                            user.pledge.certificateId,
                          )}/pdf`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      View <FaArrowUpRightFromSquare />
                    </Button>
                  </div>
                ) : (
                  "—"
                )}
              </Row>
              <Row label="Org (ref)">{user?.pledge?.org || "—"}</Row>
            </div>
          </Card>

          {/* USER: OTP / Security fields */}
          <Card title="Security & OTP">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="OTP">
                {user?.otp || <span className="pv-dim">—</span>}
              </Row>
              <Row label="OTP Expires">
                {user?.otpExpires ? (
                  <RelTime date={user.otpExpires} />
                ) : (
                  <span className="pv-dim">—</span>
                )}
              </Row>

              <Row label="Phone OTP Hash">{user?.phoneOtpHash || "—"}</Row>
              <Row label="Phone OTP Expires">
                {user?.phoneOtpExpires ? (
                  <RelTime date={user.phoneOtpExpires} />
                ) : (
                  "—"
                )}
              </Row>
              <Row label="Phone OTP Attempts">
                {typeof user?.phoneOtpAttempts === "number"
                  ? String(user.phoneOtpAttempts)
                  : "—"}
              </Row>

              <Row label="Email Verify Version">
                {typeof user?.emailVerifyVersion === "number"
                  ? String(user.emailVerifyVersion)
                  : "—"}
              </Row>
            </div>
          </Card>

          {/* PROFILE */}
          <Card title="Profile (Extended Details)">
            {!profile ? (
              <div className="pv-dim">No profile found for this user.</div>
            ) : (
              <div className="pv-col" style={{ gap: 14 }}>
                {/* Identity */}
                <Card title="Identity">
                  <div className="pv-col" style={{ gap: 10 }}>
                    <Row label="Profile ID">
                      {profile._id ? (
                        <span className="pv-mono">{profile._id}</span>
                      ) : (
                        "—"
                      )}
                    </Row>

                    <Row label="Name (Full)">{profile?.name?.full || "—"}</Row>
                    <Row label="First">{profile?.name?.first || "—"}</Row>
                    <Row label="Middle">{profile?.name?.middle || "—"}</Row>
                    <Row label="Last">{profile?.name?.last || "—"}</Row>

                    <Row label="DOB">
                      {profile?.dob ? <RelTime date={profile.dob} /> : "—"}
                    </Row>
                    <Row label="Gender">
                      {profile?.gender ? (
                        <Badge>{String(profile.gender).toLowerCase()}</Badge>
                      ) : (
                        "—"
                      )}
                    </Row>

                    <Row label="Photo URL">
                      {profile?.photoUrl ? (
                        <div className="pv-col" style={{ gap: 6 }}>
                          <a
                            className="pv-link"
                            href={profile.photoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {profile.photoUrl}
                          </a>
                        </div>
                      ) : (
                        "—"
                      )}
                    </Row>

                    <Row label="Primary Phone">
                      {profile?.primaryPhone?.number ? (
                        <div
                          className="pv-row"
                          style={{
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span className="pv-mono">
                            {profile.primaryPhone.number}
                          </span>
                          <CopyButton
                            value={profile.primaryPhone.number}
                            label="primary phone"
                            size={14}
                            successMessage="Primary phone copied"
                          />
                          <Badge>
                            {profile?.primaryPhone?.verified
                              ? "verified"
                              : "not verified"}
                          </Badge>
                        </div>
                      ) : (
                        "—"
                      )}
                    </Row>
                  </div>
                </Card>

                {/* Preferences */}
                <Card title="Preferences">
                  <div className="pv-col" style={{ gap: 10 }}>
                    <Row label="Timezone">
                      {profile?.prefs?.timezone || "—"}
                    </Row>
                    <Row label="Locale">{profile?.prefs?.locale || "—"}</Row>

                    <Row label="Comms">
                      <div
                        className="pv-row"
                        style={{ gap: 8, flexWrap: "wrap" }}
                      >
                        <KVBadge
                          label="Email"
                          value={profile?.prefs?.comms?.email ? "On" : "Off"}
                        />
                        <KVBadge
                          label="SMS"
                          value={profile?.prefs?.comms?.sms ? "On" : "Off"}
                        />
                        <KVBadge
                          label="WhatsApp"
                          value={profile?.prefs?.comms?.whatsapp ? "On" : "Off"}
                        />
                      </div>
                    </Row>
                  </div>
                </Card>

                {/* KYC */}
                <Card title="KYC">
                  <div className="pv-col" style={{ gap: 10 }}>
                    <Row label="PAN">{profile?.kyc?.pan || "—"}</Row>
                    <Row label="KYC Status">
                      {profile?.kyc?.kycStatus ? (
                        <Badge>
                          {String(profile.kyc.kycStatus).toLowerCase()}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </Row>
                    <Row label="Residency Status">
                      {profile?.kyc?.residencyStatus ? (
                        <Badge>
                          {String(profile.kyc.residencyStatus).toLowerCase()}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </Row>
                    <Row label="Occupation">
                      {profile?.kyc?.occupation || "—"}
                    </Row>
                    <Row label="Annual Income Slab">
                      {profile?.kyc?.annualIncomeSlab || "—"}
                    </Row>
                    <Row label="PEP Status">
                      {profile?.kyc?.pepStatus ? (
                        <Badge>
                          {String(profile.kyc.pepStatus).toLowerCase()}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </Row>
                  </div>
                </Card>

                {/* Address */}
                <Card title="Address">
                  <div className="pv-col" style={{ gap: 10 }}>
                    <Row label="Line 1">{profile?.address?.line1 || "—"}</Row>
                    <Row label="Line 2">{profile?.address?.line2 || "—"}</Row>
                    <Row label="City">{profile?.address?.city || "—"}</Row>
                    <Row label="State">{profile?.address?.state || "—"}</Row>
                    <Row label="Pincode">
                      {profile?.address?.pincode || "—"}
                    </Row>
                    <Row label="Country">
                      {profile?.address?.country || "—"}
                    </Row>
                  </div>
                </Card>

                {/* Bank */}
                <Card title="Bank">
                  <div className="pv-col" style={{ gap: 10 }}>
                    <Row label="Account Holder">
                      {profile?.bank?.accountHolderName || "—"}
                    </Row>
                    <Row label="Account Number">
                      {profile?.bank?.accountNumber || "—"}
                    </Row>
                    <Row label="IFSC">{profile?.bank?.ifsc || "—"}</Row>
                    <Row label="Bank Name">
                      {profile?.bank?.bankName || "—"}
                    </Row>
                    <Row label="Branch">{profile?.bank?.branchName || "—"}</Row>
                    <Row label="Account Type">
                      {profile?.bank?.accountType ? (
                        <Badge>
                          {String(profile.bank.accountType).toLowerCase()}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </Row>
                  </div>
                </Card>

                {/* Nominee */}
                <Card title="Nominee">
                  <div className="pv-col" style={{ gap: 10 }}>
                    <Row label="Name">{profile?.nominee?.name || "—"}</Row>
                    <Row label="Relation">
                      {profile?.nominee?.relation || "—"}
                    </Row>
                    <Row label="DOB">
                      {profile?.nominee?.dob ? (
                        <RelTime date={profile.nominee.dob} />
                      ) : (
                        "—"
                      )}
                    </Row>
                    <Row label="Share %">
                      <MoneySafe value={profile?.nominee?.sharePercent} />
                    </Row>
                  </div>
                </Card>

                {/* BSE */}
                <Card title="BSE">
                  <div className="pv-col" style={{ gap: 10 }}>
                    <Row label="UCC">{profile?.bse?.ucc || "—"}</Row>
                    <Row label="Environment">
                      {profile?.bse?.env ? (
                        <Badge>{String(profile.bse.env)}</Badge>
                      ) : (
                        "—"
                      )}
                    </Row>
                  </div>
                </Card>

                {/* Profile System */}
                <Card title="Profile System">
                  <div className="pv-col" style={{ gap: 10 }}>
                    <Row label="Created At">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleString()
                        : "—"}
                    </Row>
                    <Row label="Updated At">
                      {profile?.updatedAt
                        ? new Date(profile.updatedAt).toLocaleString()
                        : "—"}
                    </Row>
                  </div>
                </Card>
              </div>
            )}
          </Card>

          {/* USER System */}
          <Card title="User System">
            <div className="pv-col" style={{ gap: 10 }}>
              <Row label="Created At">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "—"}
              </Row>
              <Row label="Updated At">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleString()
                  : "—"}
              </Row>
            </div>
          </Card>
        </div>
      )}

      {/* Update Modal */}
      <EditUserAdminModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        profile={profile}
        onSaved={load}
      />
    </div>
  );
}
