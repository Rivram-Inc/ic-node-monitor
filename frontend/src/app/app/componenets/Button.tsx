import { ArrowRight } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  withArrow?: boolean;
}

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  withArrow = false,
  className = "",
  ...props 
}: ButtonProps) => {
  const baseStyles = "font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 group";
  
  const variants = {
    primary: "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105",
    secondary: "text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-lg hover:shadow-xl",
    outline: "text-white border-2 border-white hover:bg-white hover:text-gray-900 hover:scale-105"
  };

  const sizes = {
    sm: "px-5 py-2.5 text-base",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
      {withArrow && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
    </button>
  );
};

export default Button;
