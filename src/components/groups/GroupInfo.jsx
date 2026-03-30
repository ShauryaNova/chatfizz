import React from 'react';

export default function GroupInfo({ group }) {
  return (
    <div>
      <h4>{group?.name || 'Group Name'}</h4>
    </div>
  );
}
