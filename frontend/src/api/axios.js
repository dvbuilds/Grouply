import axios from 'axios';
import { getStoredToken, clearStoredAuth } from '../utils/storage.js';
import {
  INITIAL_USERS,
  INITIAL_GROUPS,
  INITIAL_GROUP_MEMBERS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
} from './seedData.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Attach JWT token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiry and unified error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if real backend answered with 401
    if (error.response && error.response.status === 401) {
      clearStoredAuth();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // In browser preview environments, if the backend server is unreachable
    // (Network error / Connection Refused / Timeout), handle seamlessly via the local store
    if (
      (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) &&
      error.config
    ) {
      try {
        const simulated = handleSimulatedRequest(error.config);
        if (simulated) {
          return { data: simulated, status: 200, statusText: 'OK', config: error.config, headers: {} };
        }
      } catch (simError) {
        return Promise.reject(simError);
      }
    }

    return Promise.reject(error);
  }
);

// In-Memory/LocalStorage Synchronized Store for Instant Sandboxed Interactivity
const STORE_KEY = 'joineazy_mock_db_v1';

function getStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const initial = {
    users: [...INITIAL_USERS],
    groups: [...INITIAL_GROUPS],
    groupMembers: [...INITIAL_GROUP_MEMBERS],
    assignments: [...INITIAL_ASSIGNMENTS],
    submissions: [...INITIAL_SUBMISSIONS],
    recentActivities: [
      { id: 1, text: 'Group Alpha confirmed Assignment 1', time: '2 hours ago', icon: 'check_circle', color: 'success' },
      { id: 2, text: 'Beta Squad started UX Basics', time: '5 hours ago', icon: 'assignment', color: 'tertiary' },
      { id: 3, text: 'Missed deadline for Gamma Team', time: 'Yesterday', icon: 'error', color: 'warning' },
      { id: 4, text: '3 new students joined Delta Force', time: 'Yesterday', icon: 'group_add', color: 'info' },
    ],
  };
  saveStore(initial);
  return initial;
}

function saveStore(store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error(e);
  }
}

function getCurrentUserFromToken(config) {
  const authHeader = config.headers?.Authorization || config.headers?.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    // Token can be jwt or simple json string
    const decoded = JSON.parse(atob(token));
    const store = getStore();
    return store.users.find((u) => u.id === decoded.id) || decoded;
  } catch {
    const store = getStore();
    return store.users[1]; // default Divya
  }
}

function handleSimulatedRequest(config) {
  const method = (config.method || 'get').toUpperCase();
  const url = config.url || '';
  const store = getStore();
  const currentUser = getCurrentUserFromToken(config);
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});

  // 1. Auth routes
  if (url.includes('/auth/login') && method === 'POST') {
    const user = store.users.find(
      (u) => u.email.toLowerCase() === data.email?.toLowerCase()
    );
    if (!user || data.password !== 'password123') {
      const err = new Error('Invalid email or password');
      err.response = { status: 401, data: { message: 'Invalid email or password' } };
      throw err;
    }
    const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
    return { token, user };
  }

  if (url.includes('/auth/register') && method === 'POST') {
    const exists = store.users.find((u) => u.email.toLowerCase() === data.email?.toLowerCase());
    if (exists) {
      const err = new Error('Email already registered');
      err.response = { status: 400, data: { details: [{ field: 'email', message: 'Email already registered' }] } };
      throw err;
    }
    const newUser = {
      id: store.users.length + 1,
      name: data.name,
      email: data.email,
      role: data.role || 'student',
      student_id: data.student_id || (data.role === 'student' ? `STU-${1000 + store.users.length + 1}` : null),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    store.users.push(newUser);
    saveStore(store);
    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role }));
    return { token, user: newUser };
  }

  if (url.includes('/auth/me') && method === 'GET') {
    return { user: currentUser || store.users[1] };
  }

  // 2. Groups routes
  if (url.includes('/groups/mine') && method === 'GET') {
    const userId = currentUser ? currentUser.id : 2;
    const myMemberships = store.groupMembers.filter((gm) => gm.user_id === userId);
    const myGroupIds = myMemberships.map((gm) => gm.group_id);
    const groups = store.groups.filter((g) => myGroupIds.includes(g.id));
    return groups.map((g) => {
      const isLeader = g.leader_id === userId;
      const members = store.groupMembers
        .filter((gm) => gm.group_id === g.id)
        .map((gm) => {
          const u = store.users.find((user) => user.id === gm.user_id);
          return {
            id: u?.id,
            name: u?.name,
            email: u?.email,
            student_id: u?.student_id,
            is_leader: g.leader_id === u?.id,
          };
        });
      return {
        ...g,
        is_leader: isLeader,
        member_count: members.length,
        members,
      };
    });
  }

  // Specific group members: /groups/:groupId/members
  const membersMatch = url.match(/\/groups\/(\d+)\/members$/);
  if (membersMatch) {
    const groupId = parseInt(membersMatch[1]);
    const g = store.groups.find((grp) => grp.id === groupId);
    if (method === 'GET') {
      const members = store.groupMembers
        .filter((gm) => gm.group_id === groupId)
        .map((gm) => {
          const u = store.users.find((user) => user.id === gm.user_id);
          return {
            id: u?.id,
            name: u?.name,
            email: u?.email,
            student_id: u?.student_id,
            is_leader: g?.leader_id === u?.id,
          };
        });
      return members;
    }
    if (method === 'POST') {
      // Add member by email or student ID
      const query = (data.email || data.student_id || '').toLowerCase().trim();
      const userToAdd = store.users.find(
        (u) =>
          u.email.toLowerCase() === query ||
          (u.student_id && u.student_id.toLowerCase() === query)
      );
      if (!userToAdd) {
        const err = new Error('Student not found with this email or student ID');
        err.response = { status: 404, data: { message: 'Student not found with this email or student ID' } };
        throw err;
      }
      const alreadyMember = store.groupMembers.some(
        (gm) => gm.group_id === groupId && gm.user_id === userToAdd.id
      );
      if (alreadyMember) {
        const err = new Error('Student is already a member of this group');
        err.response = { status: 400, data: { details: [{ field: 'email', message: 'Student is already a member of this group' }] } };
        throw err;
      }
      store.groupMembers.push({
        id: store.groupMembers.length + 1,
        group_id: groupId,
        user_id: userToAdd.id,
      });
      if (g) {
        g.member_count = store.groupMembers.filter((gm) => gm.group_id === groupId).length;
      }
      saveStore(store);
      return {
        message: 'Member added successfully',
        member: {
          id: userToAdd.id,
          name: userToAdd.name,
          email: userToAdd.email,
          student_id: userToAdd.student_id,
          is_leader: false,
        },
      };
    }
  }

  // Remove member: DELETE /groups/:groupId/members/:userId
  const removeMemberMatch = url.match(/\/groups\/(\d+)\/members\/(\d+)$/);
  if (removeMemberMatch && method === 'DELETE') {
    const groupId = parseInt(removeMemberMatch[1]);
    const removeUserId = parseInt(removeMemberMatch[2]);
    const g = store.groups.find((grp) => grp.id === groupId);
    if (g && g.leader_id === removeUserId) {
      const err = new Error('Cannot remove group leader');
      err.response = { status: 400, data: { message: 'Cannot remove group leader' } };
      throw err;
    }
    store.groupMembers = store.groupMembers.filter(
      (gm) => !(gm.group_id === groupId && gm.user_id === removeUserId)
    );
    if (g) {
      g.member_count = store.groupMembers.filter((gm) => gm.group_id === groupId).length;
    }
    saveStore(store);
    return { message: 'Member removed successfully' };
  }

  // Leave group: POST /groups/:groupId/leave
  const leaveMatch = url.match(/\/groups\/(\d+)\/leave$/);
  if (leaveMatch && method === 'POST') {
    const groupId = parseInt(leaveMatch[1]);
    const userId = currentUser ? currentUser.id : 2;
    const g = store.groups.find((grp) => grp.id === groupId);
    if (g && g.leader_id === userId) {
      const err = new Error('Leader cannot leave group. Must delete or transfer.');
      err.response = { status: 400, data: { message: 'Leader cannot leave group. You must delete the group instead.' } };
      throw err;
    }
    store.groupMembers = store.groupMembers.filter(
      (gm) => !(gm.group_id === groupId && gm.user_id === userId)
    );
    if (g) {
      g.member_count = store.groupMembers.filter((gm) => gm.group_id === groupId).length;
    }
    saveStore(store);
    return { message: 'Left group successfully' };
  }

  // Delete group: DELETE /groups/:groupId
  const deleteGroupMatch = url.match(/\/groups\/(\d+)$/);
  if (deleteGroupMatch && method === 'DELETE') {
    const groupId = parseInt(deleteGroupMatch[1]);
    store.groups = store.groups.filter((g) => g.id !== groupId);
    store.groupMembers = store.groupMembers.filter((gm) => gm.group_id !== groupId);
    store.submissions = store.submissions.filter((s) => s.group_id !== groupId);
    saveStore(store);
    return { message: 'Group deleted successfully' };
  }

  // All groups (Admin / Student create): /groups
  if (url.endsWith('/groups')) {
    if (method === 'GET') {
      return store.groups.map((g) => {
        const count = store.groupMembers.filter((gm) => gm.group_id === g.id).length;
        const groupSubs = store.submissions.filter((s) => s.group_id === g.id);
        const confirmed = groupSubs.filter((s) => s.status === 'confirmed').length;
        const total = groupSubs.length || 1;
        const completion = Math.round((confirmed / total) * 100);
        return {
          ...g,
          member_count: count,
          completion_percentage: completion,
        };
      });
    }
    if (method === 'POST') {
      // Create group
      const userId = currentUser ? currentUser.id : 2;
      const newGroup = {
        id: store.groups.length + 1,
        name: data.name,
        leader_id: userId,
        leader_name: currentUser ? currentUser.name : 'Divya Sharma',
        leader_email: currentUser ? currentUser.email : 'divya@joineazy.dev',
        member_count: 1,
        completion_percentage: 0,
        created_at: new Date().toISOString(),
      };
      store.groups.push(newGroup);
      store.groupMembers.push({
        id: store.groupMembers.length + 1,
        group_id: newGroup.id,
        user_id: userId,
      });

      // Pre-create submission rows for all current assignments
      store.assignments.forEach((assignment) => {
        if (assignment.target_scope === 'all' || (assignment.targets && assignment.targets.includes(newGroup.id))) {
          store.submissions.push({
            id: store.submissions.length + 1,
            assignment_id: assignment.id,
            group_id: newGroup.id,
            status: 'pending',
            confirmed_by: null,
            confirmed_at: null,
          });
        }
      });

      saveStore(store);
      return newGroup;
    }
  }

  // 3. Assignments routes
  if (url.includes('/assignments/mine') && method === 'GET') {
    const userId = currentUser ? currentUser.id : 2;
    const myMemberships = store.groupMembers.filter((gm) => gm.user_id === userId);
    const myGroupIds = myMemberships.map((gm) => gm.group_id);

    // Find assignments targeted to student's groups
    const studentAssignments = store.assignments.filter((a) => {
      if (a.target_scope === 'all') return true;
      return a.targets && a.targets.some((gid) => myGroupIds.includes(gid));
    });

    return studentAssignments.map((a) => {
      // Find submission status for student's group
      const targetGroupId = myGroupIds[0] || 1;
      const sub = store.submissions.find(
        (s) => s.assignment_id === a.id && myGroupIds.includes(s.group_id)
      );
      const isConfirmed = sub?.status === 'confirmed';
      return {
        ...a,
        group_id: sub?.group_id || targetGroupId,
        submission_status: isConfirmed ? 'confirmed' : 'pending',
        is_submitted: isConfirmed,
        confirmed_at: sub?.confirmed_at || null,
        confirmed_by: sub?.confirmed_by || null,
      };
    });
  }

  // Admin assignments CRUD
  if (url.endsWith('/assignments')) {
    if (method === 'GET') {
      return store.assignments.map((a) => {
        const subs = store.submissions.filter((s) => s.assignment_id === a.id);
        const confirmed = subs.filter((s) => s.status === 'confirmed').length;
        const total = subs.length || store.groups.length;
        const completion = total ? Math.round((confirmed / total) * 100) : 0;
        return {
          ...a,
          total_targeted_groups: total,
          confirmed_submissions: confirmed,
          completion_percentage: completion,
        };
      });
    }
    if (method === 'POST') {
      const newAssignment = {
        id: store.assignments.length + 1,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        onedrive_link: data.onedrive_link,
        target_scope: data.target_scope || 'all',
        targets: data.target_scope === 'specific' ? (data.target_group_ids || []) : store.groups.map((g) => g.id),
        created_by: currentUser?.id || 1,
        created_at: new Date().toISOString(),
      };
      store.assignments.push(newAssignment);

      // Pre-create pending submission rows
      const targetGroupIds = newAssignment.targets;
      targetGroupIds.forEach((gid) => {
        store.submissions.push({
          id: store.submissions.length + 1,
          assignment_id: newAssignment.id,
          group_id: gid,
          status: 'pending',
          confirmed_by: null,
          confirmed_at: null,
        });
      });

      saveStore(store);
      return newAssignment;
    }
  }

  const singleAssignmentMatch = url.match(/\/assignments\/(\d+)$/);
  if (singleAssignmentMatch) {
    const assignId = parseInt(singleAssignmentMatch[1]);
    if (method === 'PUT') {
      const index = store.assignments.findIndex((a) => a.id === assignId);
      if (index !== -1) {
        store.assignments[index] = {
          ...store.assignments[index],
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          onedrive_link: data.onedrive_link,
          target_scope: data.target_scope,
          targets: data.target_scope === 'specific' ? data.target_group_ids : store.groups.map((g) => g.id),
        };
        saveStore(store);
        return store.assignments[index];
      }
    }
    if (method === 'DELETE') {
      store.assignments = store.assignments.filter((a) => a.id !== assignId);
      store.submissions = store.submissions.filter((s) => s.assignment_id !== assignId);
      saveStore(store);
      return { message: 'Assignment deleted successfully' };
    }
  }

  // 4. Submissions routes
  // Confirm submission: POST /submissions/:assignmentId/groups/:groupId/confirm
  const confirmMatch = url.match(/\/submissions\/(\d+)\/groups\/(\d+)\/confirm$/);
  if (confirmMatch && method === 'POST') {
    const assignmentId = parseInt(confirmMatch[1]);
    const groupId = parseInt(confirmMatch[2]);
    const userId = currentUser ? currentUser.id : 2;

    let sub = store.submissions.find(
      (s) => s.assignment_id === assignmentId && s.group_id === groupId
    );
    if (!sub) {
      sub = {
        id: store.submissions.length + 1,
        assignment_id: assignmentId,
        group_id: groupId,
        status: 'confirmed',
        confirmed_by: userId,
        confirmed_at: new Date().toISOString(),
      };
      store.submissions.push(sub);
    } else {
      sub.status = 'confirmed';
      sub.confirmed_by = userId;
      sub.confirmed_at = new Date().toISOString();
    }

    const group = store.groups.find((g) => g.id === groupId);
    const assignment = store.assignments.find((a) => a.id === assignmentId);
    store.recentActivities.unshift({
      id: Date.now(),
      text: `${group ? group.name : 'Group'} confirmed ${assignment ? assignment.title : 'Assignment'}`,
      time: 'Just now',
      icon: 'check_circle',
      color: 'success',
    });

    saveStore(store);
    return {
      message: 'Submission confirmed successfully',
      submission: sub,
    };
  }

  // Group Progress: GET /submissions/groups/:groupId/progress
  const groupProgressMatch = url.match(/\/submissions\/groups\/(\d+)\/progress$/);
  if (groupProgressMatch && method === 'GET') {
    const groupId = parseInt(groupProgressMatch[1]);
    const groupSubs = store.submissions.filter((s) => s.group_id === groupId);
    const confirmed = groupSubs.filter((s) => s.status === 'confirmed').length;
    const total = groupSubs.length || 1;
    const percentage = Math.round((confirmed / total) * 100);
    return {
      group_id: groupId,
      total_assignments: total,
      confirmed_submissions: confirmed,
      pending_submissions: total - confirmed,
      percentage,
      assignments: groupSubs.map((s) => {
        const a = store.assignments.find((item) => item.id === s.assignment_id);
        return {
          assignment_id: s.assignment_id,
          title: a?.title,
          status: s.status,
          due_date: a?.due_date,
          confirmed_at: s.confirmed_at,
        };
      }),
    };
  }

  // Admin student-wise submission status: GET /submissions/:assignmentId/students
  const studentSubsMatch = url.match(/\/submissions\/(\d+)\/students$/);
  if (studentSubsMatch && method === 'GET') {
    const assignmentId = parseInt(studentSubsMatch[1]);
    const assignment = store.assignments.find((a) => a.id === assignmentId);
    const targetedGroups = store.groups.filter((g) => {
      if (assignment?.target_scope === 'all') return true;
      return assignment?.targets?.includes(g.id);
    });

    const result = [];
    targetedGroups.forEach((group) => {
      const sub = store.submissions.find(
        (s) => s.assignment_id === assignmentId && s.group_id === group.id
      );
      const isConfirmed = sub?.status === 'confirmed';
      const members = store.groupMembers.filter((gm) => gm.group_id === group.id);

      members.forEach((gm) => {
        const u = store.users.find((user) => user.id === gm.user_id);
        if (u) {
          result.push({
            student_id: u.student_id || `STU-${u.id}`,
            name: u.name,
            email: u.email,
            group_name: group.name,
            group_id: group.id,
            is_leader: group.leader_id === u.id,
            submission_status: isConfirmed ? 'confirmed' : 'pending',
            confirmed_at: sub?.confirmed_at || null,
          });
        }
      });
    });
    return result;
  }

  // Admin group-wise status: GET /submissions/:assignmentId
  const assignSubsMatch = url.match(/\/submissions\/(\d+)$/);
  if (assignSubsMatch && method === 'GET') {
    const assignmentId = parseInt(assignSubsMatch[1]);
    const subs = store.submissions.filter((s) => s.assignment_id === assignmentId);
    return subs.map((s) => {
      const g = store.groups.find((grp) => grp.id === s.group_id);
      const submitter = store.users.find((u) => u.id === s.confirmed_by);
      return {
        ...s,
        group_name: g?.name || `Group ${s.group_id}`,
        leader_name: g?.leader_name,
        confirmed_by_name: submitter?.name || null,
      };
    });
  }

  // 5. Analytics routes: GET /analytics/overview
  if (url.includes('/analytics/overview') && method === 'GET') {
    const totalStudents = store.users.filter((u) => u.role === 'student').length;
    const totalGroups = store.groups.length;
    const activeAssignments = store.assignments.length;

    const totalSubmissions = store.submissions.length;
    const confirmedCount = store.submissions.filter((s) => s.status === 'confirmed').length;
    const overallCompletion = totalSubmissions > 0 ? Math.round((confirmedCount / totalSubmissions) * 100) : 76;

    const completionByAssignment = store.assignments.map((a) => {
      const subs = store.submissions.filter((s) => s.assignment_id === a.id);
      const conf = subs.filter((s) => s.status === 'confirmed').length;
      const pct = subs.length > 0 ? Math.round((conf / subs.length) * 100) : 60;
      return {
        id: a.id,
        title: a.title,
        shortTitle: a.title.length > 10 ? a.title.substring(0, 8) + '...' : a.title,
        completion: pct,
      };
    });

    const groupPerformance = store.groups.map((g) => {
      const subs = store.submissions.filter((s) => s.group_id === g.id);
      const conf = subs.filter((s) => s.status === 'confirmed').length;
      const pct = subs.length > 0 ? Math.round((conf / subs.length) * 100) : g.completion_percentage;
      return {
        id: g.id,
        name: g.name,
        completion: pct,
      };
    });

    return {
      total_students: totalStudents,
      total_groups: totalGroups,
      active_assignments: activeAssignments,
      overall_completion_pct: overallCompletion,
      completion_by_assignment: completionByAssignment,
      group_performance: groupPerformance,
      recent_activity: store.recentActivities,
    };
  }

  return null;
}

export default api;
