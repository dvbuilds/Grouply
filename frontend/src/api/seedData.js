// Seed data representing initial PostgreSQL database state from README.md

export const INITIAL_USERS = [
  {
    id: 1,
    name: 'Prof. Alexander Smith',
    email: 'prof@joineazy.dev',
    role: 'admin',
    student_id: null,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Divya Sharma',
    email: 'divya@joineazy.dev',
    role: 'student',
    student_id: 'STU-1001',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Aarav Patel',
    email: 'aarav@joineazy.dev',
    role: 'student',
    student_id: 'STU-1002',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Riya Sen',
    email: 'riya@joineazy.dev',
    role: 'student',
    student_id: 'STU-1003',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: 'Andrea Brown',
    email: 'andrea@joineazy.dev',
    role: 'student',
    student_id: 'STU-1004',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_GROUPS = [
  {
    id: 1,
    name: 'Alpha Cohort',
    leader_id: 2,
    leader_name: 'Divya Sharma',
    leader_email: 'divya@joineazy.dev',
    member_count: 3,
    completion_percentage: 82,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Beta Innovators',
    leader_id: 4,
    leader_name: 'Riya Sen',
    leader_email: 'riya@joineazy.dev',
    member_count: 2,
    completion_percentage: 50,
    created_at: '2026-08-05T12:00:00Z',
  },
  {
    id: 3,
    name: 'Gamma Researchers',
    leader_id: 3,
    leader_name: 'Aarav Patel',
    leader_email: 'aarav@joineazy.dev',
    member_count: 1,
    completion_percentage: 91,
    created_at: '2026-08-10T14:30:00Z',
  },
  {
    id: 4,
    name: 'Delta Force',
    leader_id: 5,
    leader_name: 'Andrea Brown',
    leader_email: 'andrea@joineazy.dev',
    member_count: 1,
    completion_percentage: 25,
    created_at: '2026-08-15T09:15:00Z',
  },
];

export const INITIAL_GROUP_MEMBERS = [
  { id: 1, group_id: 1, user_id: 2 }, // Divya (leader)
  { id: 2, group_id: 1, user_id: 3 }, // Aarav
  { id: 3, group_id: 1, user_id: 5 }, // Andrea
  { id: 4, group_id: 2, user_id: 4 }, // Riya (leader)
  { id: 5, group_id: 2, user_id: 5 }, // Andrea
  { id: 6, group_id: 3, user_id: 3 }, // Aarav (leader)
  { id: 7, group_id: 4, user_id: 5 }, // Andrea (leader)
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: 1,
    title: 'JavaScript Basics',
    description: 'This module shows how to apply JavaScript in real-world tasks: setting up the environment, organising project structure, syntax, data types, DOM manipulation, and functions. Includes AI review.',
    due_date: '2026-09-24T23:59:59Z',
    onedrive_link: 'https://onedrive.live.com/view/js-basics-module1',
    target_scope: 'all',
    created_by: 1,
    created_at: '2026-08-15T08:00:00Z',
    targets: [1, 2, 3, 4],
  },
  {
    id: 2,
    title: 'HTML & CSS Fundamentals',
    description: 'Build semantic HTML structures and responsive CSS layouts. Master CSS Grid, Flexbox, accessible markup, and clean responsive patterns across devices.',
    due_date: '2026-09-28T23:59:59Z',
    onedrive_link: 'https://onedrive.live.com/view/html-css-starter',
    target_scope: 'all',
    created_by: 1,
    created_at: '2026-08-18T10:00:00Z',
    targets: [1, 2, 3, 4],
  },
  {
    id: 3,
    title: 'UI/UX Design Systems & Microinteractions',
    description: 'Study modern design tokens, color theory, typography hierarchy, and implement state transitions using responsive Figma specifications.',
    due_date: '2026-10-15T23:59:59Z',
    onedrive_link: 'https://onedrive.live.com/view/design-tokens-joineazy',
    target_scope: 'specific',
    created_by: 1,
    created_at: '2026-08-20T11:00:00Z',
    targets: [1, 2],
  },
  {
    id: 4,
    title: 'React State Management & Full-Stack Integration',
    description: 'Architect modular components, custom React hooks, context providers, and connect with REST API backends securely.',
    due_date: '2026-10-30T23:59:59Z',
    onedrive_link: 'https://onedrive.live.com/view/react-state-architecture',
    target_scope: 'specific',
    created_by: 1,
    created_at: '2026-08-22T14:00:00Z',
    targets: [1, 3],
  },
];

export const INITIAL_SUBMISSIONS = [
  // (assignment_id, group_id)
  {
    id: 1,
    assignment_id: 1,
    group_id: 1,
    status: 'confirmed',
    confirmed_by: 2,
    confirmed_at: '2026-08-23T14:20:00Z',
  },
  {
    id: 2,
    assignment_id: 1,
    group_id: 2,
    status: 'pending',
    confirmed_by: null,
    confirmed_at: null,
  },
  {
    id: 3,
    assignment_id: 1,
    group_id: 3,
    status: 'confirmed',
    confirmed_by: 3,
    confirmed_at: '2026-08-22T09:10:00Z',
  },
  {
    id: 4,
    assignment_id: 1,
    group_id: 4,
    status: 'pending',
    confirmed_by: null,
    confirmed_at: null,
  },
  {
    id: 5,
    assignment_id: 2,
    group_id: 1,
    status: 'confirmed',
    confirmed_by: 2,
    confirmed_at: '2026-08-24T08:00:00Z',
  },
  {
    id: 6,
    assignment_id: 2,
    group_id: 2,
    status: 'pending',
    confirmed_by: null,
    confirmed_at: null,
  },
  {
    id: 7,
    assignment_id: 2,
    group_id: 3,
    status: 'confirmed',
    confirmed_by: 3,
    confirmed_at: '2026-08-23T16:45:00Z',
  },
  {
    id: 8,
    assignment_id: 2,
    group_id: 4,
    status: 'pending',
    confirmed_by: null,
    confirmed_at: null,
  },
  {
    id: 9,
    assignment_id: 3,
    group_id: 1,
    status: 'pending',
    confirmed_by: null,
    confirmed_at: null,
  },
  {
    id: 10,
    assignment_id: 3,
    group_id: 2,
    status: 'pending',
    confirmed_by: null,
    confirmed_at: null,
  },
  {
    id: 11,
    assignment_id: 4,
    group_id: 1,
    status: 'pending',
    confirmed_by: null,
    confirmed_at: null,
  },
  {
    id: 12,
    assignment_id: 4,
    group_id: 3,
    status: 'confirmed',
    confirmed_by: 3,
    confirmed_at: '2026-08-24T09:30:00Z',
  },
];
