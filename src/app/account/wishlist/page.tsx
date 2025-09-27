export default function WishlistPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Wishlist</h1>
      <p className="text-muted-foreground">Items you’ve saved for later.</p>
      <div className="mt-6 p-6 border rounded-lg bg-card text-card-foreground">
        <p className="text-muted-foreground">Your wishlist is empty.</p>
      </div>
    </div>
  )
}
