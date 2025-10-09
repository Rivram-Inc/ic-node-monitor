import Link from "next/link";
import Button from "@/app/app/componenets/Button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-8">
            <Link href="/"> {/* Wrap the logo with Link to home */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                IC Node Monitoring
              </h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/app/node_providers"
                className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Public Dashboard
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                About
              </Link>
            </nav>
          </div>

          {/* Right side */}
          <Button variant="primary" size="sm">
            Join Waitlist
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
