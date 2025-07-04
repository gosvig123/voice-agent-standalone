interface FeatureCardProps {
  title: string;
  description: string;
  color: 'indigo' | 'purple' | 'pink';
  features: readonly string[];
  metadata: string;
}

const colorClasses = {
  indigo: {
    title: 'text-indigo-600',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
  },
  purple: {
    title: 'text-purple-600',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
  pink: {
    title: 'text-pink-600',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
  },
};

export const FeatureCard = ({ title, description, color, features, metadata }: FeatureCardProps) => {
  const colorClass = colorClasses[color];

  return (
    <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      <h3 className={`text-xl font-semibold mb-3 ${colorClass.title}`}>
        {title}
      </h3>
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      <ul className="space-y-2 text-sm text-gray-700">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <div className={`mt-4 p-3 ${colorClass.bg} rounded-lg`}>
        <small className={`${colorClass.text} font-medium`}>
          {metadata}
        </small>
      </div>
    </div>
  );
};