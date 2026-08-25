import { getMyGroupsApi } from '../api/groups.js';
import { getGroupProgressApi } from '../api/submissions.js';

export async function attachSubmissionStatus(assignments) {
  const groups = await getMyGroupsApi();

  const progressEntries = await Promise.all(
    groups.map((group) =>
      getGroupProgressApi(group.id)
        .then((data) => ({ group, submissions: data?.submissions || [] }))
        .catch(() => null)
    )
  );

  return assignments.map((assignment) => {
    for (const entry of progressEntries) {
      if (!entry) continue;
      const match = entry.submissions.find((s) => s.assignment_id === assignment.id);
      if (match) {
        return {
          ...assignment,
          group_id: entry.group.id,
          group_name: entry.group.name,
          submission_status: match.status,
          is_submitted: match.status === 'confirmed',
          confirmed_at: match.confirmed_at,
        };
      }
    }
    return { ...assignment, is_submitted: false };
  });
}
