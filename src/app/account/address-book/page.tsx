export default function AddressBookPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Address Book</h1>
      <p className="text-muted-foreground">Manage your saved shipping and billing addresses here.</p>
      <div className="mt-6 p-6 border rounded-lg bg-card text-card-foreground">
        <p className="text-muted-foreground">No addresses yet. Add one during checkout.</p>
      </div>
    </div>
  )
}
