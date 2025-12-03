// Stats Component
const Stats = () => {
  const stats = [
    { label: 'AI Faces', value: '17M+', icon: Eye },
    { label: 'Phantom Users', value: '17M', icon: Users },
    { label: 'Cult Members', value: 'Growing', icon: Zap }
  ];

  return (
    <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
      {stats.map((stat, i) => (
        <div key={i} className="bg-gradient-to-br from-gray-900 to-black border border-purple-600/20 rounded-2xl p-6 text-center">
          <stat.icon className="w-8 h-8 mx-auto mb-3 text-cyan-400" />
          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            {stat.value}
          </div>
          <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
