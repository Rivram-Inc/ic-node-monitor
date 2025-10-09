import Link from "next/link";
import Button from "@/app/app/componenets/Button";

const Footer = () => {
  return (
    <footer className="bg-gray-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            IC Node Monitor
          </h2>
          <p className="text-gray-400 mb-6">
            Powered by Rivram INC
          </p>
          <div className="flex justify-center mb-8"> {/* Added wrapper div with flex justify-center */}
            <Link href="/app/node_providers">
              <Button variant="outline" size="md">
                Explore Dashboard
              </Button>
            </Link>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <p className="text-gray-400">
              All rights reserved | <Link href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
