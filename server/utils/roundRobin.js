// Simple round-robin assignment helper. Stores state in-memory (reset on restart).
let index = 0;
export function pickAssignee(users = []) {
    const active = users.filter(u => u.active);
    if (!active.length) return null;
    const assignee = active[index % active.length];
    index++;
    return assignee;
}