import Link from "next/link";

const helpLinks = [
  { href: "/dashboard/orders", label: "Track Order" },
  { href: "/cart", label: "My Cart" },
  { href: "/dashboard", label: "My Account" },
  { href: "/register", label: "Create Account" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-amer-orange/40 bg-amer-ink text-white">
      <div className="mx-auto w-full px-2.5 pt-10 pb-6 lg:px-2.5">
        {/* Mobile / tablet: stacked brand + 2-col links */}
        <div className="lg:hidden">
          <div className="mb-8 text-center">
            <p className="w-full text-center font-display text-2xl font-extrabold tracking-tight">
              <span className="text-amer-orange">IoT</span> programmers
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/65">
              Shop electronics, fashion, home and beauty with flash deals —
              built for a bright Daraz-style experience.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                Secure Checkout
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                Fast Delivery
              </span>
              <span className="rounded-md bg-amer-orange/20 px-2.5 py-1 text-[11px] font-semibold text-amer-orange">
                Flash Sale
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            <div>
              <h3 className="font-display text-sm font-bold tracking-wide text-amer-orange uppercase">
                Customer Care
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-white/75">
                {helpLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-amer-orange">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold tracking-wide text-amer-orange uppercase">
                Contact
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-white/75">
                <li>Hotline: 16263</li>
                <li>Email: support@iotprogrammers.com</li>
                <li>Dhaka, Bangladesh</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Desktop: 3 columns side by side */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-10">
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight">
              <span className="text-amer-orange">IoT</span> programmers
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
              Shop electronics, fashion, home and beauty with flash deals —
              built for a bright Daraz-style experience.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                Secure Checkout
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                Fast Delivery
              </span>
              <span className="rounded-md bg-amer-orange/20 px-2.5 py-1 text-[11px] font-semibold text-amer-orange">
                Flash Sale
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold tracking-wide text-amer-orange uppercase">
              Customer Care
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-amer-orange">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold tracking-wide text-amer-orange uppercase">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>Hotline: 16263</li>
              <li>Email: support@iotprogrammers.com</li>
              <li>Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-center">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} IoT programmers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
