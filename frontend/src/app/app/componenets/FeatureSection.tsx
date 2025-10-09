import { motion } from "framer-motion";
import Button from "@/app/app/componenets/Button";

interface FeatureSectionProps {
  title: string;
  description: string;
  buttonText: string;
  svgContent: React.ReactNode;
  reverse?: boolean;
  theme?: "blue" | "orange" | "purple";
}

const FeatureSection = ({
  title,
  description,
  buttonText,
  svgContent,
  reverse = false,
  theme = "blue"
}: FeatureSectionProps) => {
  const themeClasses = {
    blue: "from-blue-500/10 to-indigo-500/10 border-blue-200/20",
    orange: "from-orange-500/10 to-red-500/10 border-orange-200/20", 
    purple: "from-purple-500/10 to-pink-500/10 border-purple-200/20"
  };

  const buttonThemes = {
    blue: "bg-blue-600 hover:bg-blue-700",
    orange: "bg-indigo-600 hover:bg-indigo-700",
    purple: "bg-purple-600 hover:bg-purple-700"
  };

  return (
    <section className={`py-16 px-6 ${reverse ? 'bg-white' : 'bg-gray-50/50'}`}>
      <div className="max-w-7xl mx-auto"> {/* Added max-width container */}
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:grid-flow-dense' : ''}`}>
          {/* Image/Animation */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`flex justify-center ${reverse ? 'lg:col-start-2' : ''}`}
          >
            <div className="relative w-full max-w-md">
              <div className={`aspect-square rounded-3xl bg-gradient-to-br ${themeClasses[theme]} backdrop-blur-sm border p-8`}>
                {svgContent}
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`space-y-6 ${reverse ? 'lg:col-start-1' : ''}`}
          >
            <h3 className="text-4xl font-bold text-gray-900">
              {title}
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              {description}
            </p>
            <Button variant="primary" className={buttonThemes[theme]} withArrow>
              {buttonText}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
