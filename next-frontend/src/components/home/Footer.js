// app/components/Footer.js
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white mt-24">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <Image
                src="/logo.jpg"
                alt="Aroglin Spice Farms Logo"
                width={80}
                height={80}
                className="rounded-full"
              />
              <h3 className="text-2xl font-bold">Aroglin Spice Farms</h3>
            </div>
            <div className="space-y-2">
              <p>First Mile, Kumily PO</p>
              <p>Kerala – 685509</p>
              <p>Phone: +91 88484 19596</p>
              <p>Email: contact@aroglinspices.com</p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-bold mb-4">Products</h4>
            <ul className="space-y-2">
              {['Cardamom', 'Black Pepper', 'Clove', 'Cinnamon', 'Star Anise'].map((product) => (
                <li key={product}>
                  <Link href="#" className="hover:text-amber-300">
                    {product}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About Us', 'Blog', 'Shipping Policy', 'FAQ'].map((link) => (
                <li key={link}>
                  <Link href="#" className="hover:text-amber-300">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-bold mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              {['Facebook', 'Instagram', 'Twitter'].map((social) => (
                <a key={social} href="#" className="hover:text-amber-300">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-green-800 mt-8 pt-8 text-center">
          <p className="text-amber-300">© 2024 Aroglin Spice Farms | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}