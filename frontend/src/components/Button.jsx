export default function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
}) {
  const base =
    "px-5 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300",
    secondary: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-300",
    outline:
      "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-300",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
