import React from 'react';

interface FormSectionProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
    title,
    subtitle,
    children,
    className = ''
}) => {
    return (
        <section className={`bg-white rounded-xl shadow-lg p-5 mb-4 border border-gray-200 ${className}`}>
            <h2 className="text-2xl font-bold mb-4 text-primary-700">{title}</h2>
            {subtitle && (
                <p className="text-base text-gray-600 mb-6">{subtitle}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </section>
    );
};

export default FormSection;
