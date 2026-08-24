// Utility formatters for dates, percentages, badges, and avatars

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now - d;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
};

export const getStatusVariant = (percentage) => {
  const p = Number(percentage) || 0;
  if (p >= 100) return { label: 'Completed', color: 'success', bg: 'bg-[#2D6A4F]', text: 'text-white' };
  if (p > 0) return { label: 'In Progress', color: 'warning', bg: 'bg-[#ffb702]', text: 'text-[#6b4b00]' };
  return { label: 'Not Started', color: 'tertiary', bg: 'bg-[#ebdcff]', text: 'text-[#2e1b50]' };
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
