type Props = { username: string; avatarUrl?: string | null; size?: number };

export default function Avatar({ username, avatarUrl, size = 64 }: Props) {
  const style = { width: size, height: size };
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={username} width={size} height={size}
        className="rounded-full object-cover bg-surface-2"
        style={style} />
    );
  }
  const initial = (username || '?').charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold tracking-tight"
      style={{
        ...style,
        fontSize: size * 0.42,
        background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
        color: '#0a0a0a',
        boxShadow: '0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 20px -8px rgba(16,185,129,0.5)'
      }}>
      {initial}
    </div>
  );
}
