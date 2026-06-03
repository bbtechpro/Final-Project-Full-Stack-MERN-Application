// src/components/Badge.tsx
import React from 'react';
import type { TaskStatus } from '../interfaces';

interface BadgeProps {
  status: TaskStatus;
}

const statusClassMap: Record<TaskStatus, string> = {
  'To Do': 'badge-todo',
  'In Progress': 'badge-progress',
  'Done': 'badge-done',
};

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  return (
    <span className={`badge ${statusClassMap[status]}`}>
      {status}
    </span>
  );
};
