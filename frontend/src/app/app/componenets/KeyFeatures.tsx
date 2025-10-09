import { BarChart3, Bell, FileEdit } from "lucide-react";
import AnimatedCard from "./AnimatedCard";
import SectionHeader from "./SectionHeader";

const KeyFeatures = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Tailored Dashboard",
      description: "Get instant insights with charts on failure rates, key ID information, and real-time node status in a beautifully designed interface.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Receive instant notifications for penalties and daily failure reports to proactively address issues before they impact your operations.",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      icon: FileEdit,
      title: "Proposal Editor",
      description: "Submit proposals effortlessly with our intuitive interface—no command line required. Automatic validation reduces rejection risks.",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Key Features"
          subtitle="Everything you need to monitor and manage your nodes effectively"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedCard key={feature.title} delay={index * 0.1}>
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
