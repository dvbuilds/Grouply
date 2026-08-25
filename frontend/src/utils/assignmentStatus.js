import { getMyGroupsApi } from '../api/groups.js';
import { getGroupProgressApi } from '../api/submissions.js';

// GET /assignments/mine returns bare assignment rows (id, title, description,
// due_date, onedrive_link, target_scope, created_by, created_at) — it does
// NOT include submission status or which group the submission belongs to,
// since a submission is tracked per (assignment, group), not per student.
//
// To show submission status on the student's assignment list/detail views,
// we fetch the student's groups and each group's progress
// (GET /submissions/groups/:groupId/progress), then attach the matching
// submission's status/group to each assignment.
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
