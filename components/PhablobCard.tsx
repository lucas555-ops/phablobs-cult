// Phablob Card Component
const PhablobCard: React.FC<{ id: number; onClick?: () => void }> = ({ id, onClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const getGradient = (id: number) => {
    const hue = (id * 137) % 360;
    return {
      from: `hsl(${hue}, 70%, 50%)`,
      to: `hsl(${(hue + 60) % 360}, 80%, 40%)`
    };
  };

  const gradient = getGradient(id);

  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-square rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 hover:scale-105"
    >
      <div 
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
          opacity: 0.3
        }}
      />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <div 
          className="w-3/4 h-3/4 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            filter: 'blur(2px)'
          }}
          onLoad={() => setIsLoading(false)}
        />
      </div>
      
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 40px ${gradient.from}`
        }}
      />
    </button>
  );
};
