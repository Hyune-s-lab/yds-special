export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        YDS Special
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#666' }}>
        Welcome to YDS Special Project
      </p>
    </main>
  )
}
