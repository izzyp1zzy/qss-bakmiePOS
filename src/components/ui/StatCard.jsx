import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass = "bg-white", textClass = "text-red-800" }) => (
  <div className={`${colorClass} p-6 rounded-2xl border shadow-sm`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-bold uppercase">{title}</p>
        <h3 className={`text-3xl font-bold ${textClass}`}>{value}</h3>
      </div>
      <div className="p-3 bg-opacity-10 rounded-xl">
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default StatCard;
