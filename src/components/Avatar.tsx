type Props = { username: string; avatarUrl?: string | null; size?: number };

export default function Avatar({ username, avatarUrl, size = 64 }: Props) {
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={username} width={size} height={size}
        className="rounded-full object-cover bg-neutral-800"
        style={{ width: size, height: size }} />
    );
  }
  const initial = (username || '?').charAt(0).toUpperCase();
  return (
    <div className="rounded-full bg-brand text-black flex items-center justify-center font-bold"
      style={{ width: size, height: size, fontSize: size * 0.45 }}>
      {initial}
    </div>
  );
}
