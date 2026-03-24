// src/pages/admin/users/components/UserFilters.jsx
import { Card, Input, Select, Button } from "../../../../components";
import { FaEraser } from "react-icons/fa";
import DateRangeField from "../../../../components/ui/filters/DateRangeField";

const ROLES = ["", "ADMIN", "STAFF", "CUSTOMER"];
const STATUS = ["", "ACTIVE", "SUSPENDED"];

export default function UserFilters({ filters, setFilter, onClear }) {
  return (
    <Card title="Apply Filters">
      <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
        <Input
          type="search"
          label="Search"
          placeholder="Search name/email…"
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
        />

        <Select label="Role" value={filters.role} onChange={(e) => setFilter("role", e.target.value)}>
          {ROLES.map((r) => (
            <option key={r || "all"} value={r}>
              {r ? r.toLowerCase() : "All roles"}
            </option>
          ))}
        </Select>

        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value)}
        >
          {STATUS.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? s.toLowerCase() : "All status"}
            </option>
          ))}
        </Select>

        <DateRangeField
          label="Registration Date"
          from={filters.from}
          to={filters.to}
          onChange={({ from, to }) => {
            setFilter("from", from);
            setFilter("to", to);
          }}
        />

        <div className="pv-col">
          <div style={{ opacity: "0" }}>.</div>
          <Button className="btn-clear-filters" variant="ghost" onClick={onClear}>
            <FaEraser /> Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}