import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t mt-16">
  <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
        {/* Brand/Subscribe */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-bold">Exclusive</span>
          </div>
          <p className="text-muted-foreground mb-3">Get 10% off your first order</p>
          <form className="flex gap-2">
            <input type="email" placeholder="Enter your email" className="flex-1 h-10 px-3 form-input-base form-input-placeholder form-input-focus" />
            <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground">Subscribe</button>
          </form>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>111 Bijoy sarani, Dhaka, DH 1515, Bangladesh.</li>
            <li>exclusive@gmail.com</li>
            <li>+88015-88888-9999</li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-semibold mb-4">Account</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/orders">My Account</Link></li>
            <li><Link href="/auth/login">Login / Register</Link></li>
            <li><Link href="/cart">Cart</Link></li>
            <li><Link href="/">Wishlist</Link></li>
            <li><Link href="/products">Shop</Link></li>
          </ul>
        </div>

  {/* (Download App section removed) */}
      </div>
      <div className="border-t py-4 text-xs text-muted-foreground text-center">© {new Date().getFullYear()} Exclusive. All rights reserved.</div>
    </footer>
  )
}
