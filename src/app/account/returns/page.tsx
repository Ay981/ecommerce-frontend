export default function ReturnsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Returns</h1>
      <p className="text-muted-foreground">Track and manage your return requests.</p>
      <div className="mt-6 p-6 border rounded-lg bg-card text-card-foreground">
        <p className="text-muted-foreground">No returns found.</p>
      </div>
    </div>
  )
}
