export const DateTab = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 16px',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      backgroundColor: active ? '#007bff' : '#f0f0f0',
      color: active ? 'white' : '#333',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s'
    }}
  >
    {label}
  </button>
);
