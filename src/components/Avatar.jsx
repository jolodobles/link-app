export default function Avatar({ name, color, size = 36 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color || '#534AB7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: size * 0.38,
        fontWeight: 700,
        fontFamily: 'Syne, sans-serif',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
