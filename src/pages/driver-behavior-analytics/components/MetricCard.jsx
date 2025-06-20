import React from 'react';
import Icon from 'components/AppIcon';

const MetricCard = ({ title, value, unit, icon, trend, color }) => {
  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-success' : 'text-error';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          color === 'text-secondary' ? 'bg-secondary-100' :
          color === 'text-error' ? 'bg-error-100' :
          color === 'text-success'? 'bg-success-100' : 'bg-primary-100'
        }`}>
          <Icon name={icon} size={20} className={color} />
        </div>
        {trend && (
          <Icon 
            name={getTrendIcon(trend)} 
            size={16} 
            className={getTrendColor(trend)}
          />
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-text-primary">{value}</span>
          {unit && <span className="text-sm text-text-secondary">{unit}</span>}
        </div>
        <p className="text-sm text-text-secondary">{title}</p>
      </div>
    </div>
  );
};

export default MetricCard;