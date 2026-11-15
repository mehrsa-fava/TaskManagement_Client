export function getInitial(name?: string | null): string {
  if (!name) return 'U';
  return name.trim().charAt(0).toUpperCase();
}

export function getAvatarColor(id: string): string {
  const colors = ['bg-indigo-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
