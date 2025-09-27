export default function PaymentOptionsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Payment Options</h1>
      <p className="text-muted-foreground">Add or manage your saved payment methods.</p>
      <div className="mt-6 p-6 border rounded-lg bg-card text-card-foreground">
        <p className="text-muted-foreground">No saved payment methods.</p>
      </div>
    </div>
  )
}
