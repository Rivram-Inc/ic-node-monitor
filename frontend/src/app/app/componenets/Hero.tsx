import { motion } from "framer-motion";
import Button from "./Button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.6, 0.4, 0.6],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Tools to Manage Your Nodes,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  All in One Place
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join node providers using Node Monitor to simplify operations, stay informed, 
                and keep their nodes running smoothly—no setup required.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" withArrow>
                Join Waitlist
              </Button>
              <Button variant="secondary" size="lg">
                View Demo
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Product Images */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] flex items-center justify-center"
          >
            {/* Background Image - Dashboard 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute bottom-8 left-4 w-[85%] rounded-2xl shadow-2xl overflow-hidden border-4 border-white/20 backdrop-blur-sm"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 h-64 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="text-sm opacity-60">Advanced Analytics Dashboard</p>
                </div>
              </div>
            </motion.div>

            {/* Foreground Image - Dashboard 1 */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute top-8 right-4 w-[85%] rounded-2xl shadow-2xl overflow-hidden border-4 border-white/20 backdrop-blur-sm z-10"
            >
              <div className="bg-gradient-to-br from-blue-900 to-indigo-800 h-64 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="text-sm opacity-60">Real-time Monitoring</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
