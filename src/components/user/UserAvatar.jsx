/**
 * UserAvatar – shows photo, initials, or a solid circle depending on available data.
 * Props: user (base44 user object), size (number, px), className
 */
export default function UserAvatar({ user, size = 32, className = "" }) {
  const style = { width: size, height: size, fontSize: size * 0.38 };

  if (!user) {
    return (
      <div
        className={`rounded-full bg-primary flex-shrink-0 ${className}`}
        style={style}
      />
    );
  }

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name || "User"}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={style}
      />
    );
  }

  const name = user.full_name?.trim();
  if (name) {
    const parts = name.split(" ").filter(Boolean);
    const initials = parts.length >= 2
      ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
      : parts[0][0].toUpperCase();

    return (
      <div
        className={`rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center flex-shrink-0 ${className}`}
        style={style}
      >
        {initials}
      </div>
    );
  }

  // No name — solid colored circle
  return (
    <div
      className={`rounded-full bg-foreground flex-shrink-0 ${className}`}
      style={style}
    />
  );
}