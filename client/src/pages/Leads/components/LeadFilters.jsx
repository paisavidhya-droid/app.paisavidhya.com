// client\src\pages\Leads\components\LeadFilters.jsx
import { FaEraser } from "react-icons/fa";
import {
  Card,
  Input,
  Select,
  Button,
  SearchNSelect,
  ActiveFilterPill,
} from "../../../components";

const LEAD_INTERESTS = ["MutualFunds", "Insurance", "FinancialPlanning"];

const INTEREST_LABELS = {
  MutualFunds: "Mutual Funds",
  Insurance: "Insurance",
  FinancialPlanning: "Financial Planning",
};

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

export default function LeadFilters({
  filters,
  setFilter, // (key, value) => void
  assignable = [],
  onClear,
}) {
  const assignedOptions = assignable.map((u) => ({
    value: u._id,
    label: u.name,
    subLabel: u.email || "",
  }));

  return (
    <Card title="Apply Filters">
      <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
        <Input
          type="search"
          label="Search"
          placeholder="Name / Email"
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
        />

        <Input
          type="search"
          label="Phone"
          value={filters.phone}
          onChange={(e) => setFilter("phone", e.target.value)}
          placeholder="9999999999"
        />

        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value)}
        >
          {STATUS.map((s) => (
            <option key={s || "all"} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </Select>

        <SearchNSelect
          label="Assigned To"
          value={filters.assignedTo}
          onChange={(val) => setFilter("assignedTo", val)}
          options={assignedOptions}
          placeholder="All users"
          clearable
        />

        <Select
          label="Request For"
          value={filters.interests}
          onChange={(e) => setFilter("interests", e.target.value)}
        >
          <option value="">All</option>
          {LEAD_INTERESTS.map((k) => (
            <option key={k} value={k}>
              {INTEREST_LABELS[k] || k}
            </option>
          ))}
        </Select>

        <Select
          label="Source"
          value={filters.source}
          onChange={(e) => setFilter("source", e.target.value)}
        >
          {SOURCES.map((s) => (
            <option key={s || "all"} value={s}>
              {s || "All Sources"}
            </option>
          ))}
        </Select>

        <Select
          label="Follow-up"
          value={filters.followUp}
          onChange={(e) => setFilter("followUp", e.target.value)}
        >
          <option value="">Any</option>
          <option value="overdue">Overdue</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
        </Select>

        <Select
          label="Archive"
          value={filters.archiveMode}
          onChange={(e) => setFilter("archiveMode", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </Select>

        <Select
          label="Sort"
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value)}
        >
          <option value="recent">Newest</option>
          <option value="followup">Follow-up due</option>
          <option value="activity">Recent activity</option>
        </Select>

        {/* {(filters.status ||
          filters.assignedTo ||
          filters.interests ||
          filters.source ||
          filters.followUp ||
          filters.archiveMode !== "active") && (
          <div
            className="pv-row"
            style={{ gap: 8, flexWrap: "wrap", marginBottom: 8 }}
          >
            {filters.status && (
              <ActiveFilterPill
                label={`Status: ${filters.status}`}
                onClear={() => setFilter("status", "")}
              />
            )}

            {filters.assignedTo && (
              <ActiveFilterPill
                label={`Assigned: ${
                  assignable.find((u) => u._id === filters.assignedTo)?.name ||
                  "User"
                }`}
                onClear={() => setFilter("assignedTo", "")}
              />
            )}

            {filters.interests && (
              <ActiveFilterPill
                label={`Request: ${INTEREST_LABELS[filters.interests]}`}
                onClear={() => setFilter("interests", "")}
              />
            )}

            {filters.source && (
              <ActiveFilterPill
                label={`Source: ${filters.source}`}
                onClear={() => setFilter("source", "")}
              />
            )}

            {filters.followUp && (
              <ActiveFilterPill
                label={`Follow-up: ${filters.followUp}`}
                onClear={() => setFilter("followUp", "")}
              />
            )}

            {filters.archiveMode !== "active" && (
              <ActiveFilterPill
                label={`Archive: ${filters.archiveMode}`}
                onClear={() => setFilter("archiveMode", "active")}
              />
            )}

            <ActiveFilterPill
              label="Clear all"
              variant="danger"
              onClear={onClear}
            />
          </div>
        )} */}

        <div className="pv-col">
          {" "}
          <div style={{ opacity: "0" }}>.</div>
          <Button
            className=" btn-clear-filters"
            variant="ghost"
            onClick={onClear}
          >
            <FaEraser /> Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}
