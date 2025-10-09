import { motion } from "framer-motion";
import Button from "./Button";

const CTA = () => {
  return (
    <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[size:20px_20px] animate-shimmer"></div>
          </div>
          
          <div className="relative px-12 py-16 text-center">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Simplify Your Node Operations?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join leading node providers who trust our platform to monitor their infrastructure
              and stay ahead of issues.
            </p>
            <Button variant="secondary" size="lg" withArrow className="mx-auto">
              Join Waitlist Today
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
