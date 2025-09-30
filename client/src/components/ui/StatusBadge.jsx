const colors = {
  New: { backgroundColor: '#bfdbfe', color: '#1d4ed8' },            // bg-blue-100 text-blue-700
  Contacted: { backgroundColor: '#d1fae5', color: '#047857' },      // bg-emerald-100 text-emerald-700
  'Follow-Up': { backgroundColor: '#fef3c7', color: '#78350f' },    // bg-amber-100 text-amber-800
  Converted: { backgroundColor: '#e9d5ff', color: '#6b21a8' },     // bg-purple-100 text-purple-700
  'Not Interested': { backgroundColor: '#e5e7eb', color: '#374151' }, // bg-gray-200 text-gray-700
  
  Active: { backgroundColor: '#d1fae5', color: '#065f46' },          // emerald
  Invited: { backgroundColor: '#dbf4ff', color: '#0369a1' },         // sky
  Suspended: { backgroundColor: '#fee2e2', color: '#b91c1c' },       // red
  Locked: { backgroundColor: '#fef3c7', color: '#92400e' },          // amber
  Deactivated: { backgroundColor: '#f3f4f6', color: '#374151' },     // neutral gray
};

export default function StatusBadge({ status }) {

  // const key = (status || '').toString().trim().toLowerCase();

  const style = colors[status] || { backgroundColor: '#f3f4f6', color: '#374151' }; // fallback: bg-gray-100 text-gray-700

  return (
    <span style={{ 
      backgroundColor: style.backgroundColor, 
      color: style.color, 
      padding: '0.25rem 0.5rem', 
      borderRadius: '0.375rem', 
      fontWeight: '500', 
      fontSize: '0.875rem', 
      display: 'inline-block'
    }}>
      {status}
    </span>
  );
}


// export default function StatusBadge({ status }) {
// return <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
// }