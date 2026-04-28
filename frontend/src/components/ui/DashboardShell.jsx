import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import Layout from '../Layout';

/**
 * DashboardShell wraps the main content of any role dashboard.
 * It provides the standard padding, standard header animations, and max-width bounds.
 */
const DashboardShell = ({ 
  children, 
  userRole, 
  title, 
  subtitle, 
  headerActions,
  className 
}) => {
  return (
    <Layout userRole={userRole}>
      <div className={cn("max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 font-sans", className)}>
        
        {/* Header Region */}
        {(title || subtitle || headerActions) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10"
          >
            <div className="flex-1">
              {title && (
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-3">
                  {title}
                </h1>
              )}
              {subtitle && (
                <div className="text-slate-500 text-[15px] font-medium">
                  {subtitle}
                </div>
              )}
            </div>
            
            {headerActions && (
              <div className="flex flex-wrap items-center gap-5">
                {headerActions}
              </div>
            )}
          </motion.div>
        )}

        {/* Dashboard Content */}
        {children}
        
      </div>
    </Layout>
  );
};

export default DashboardShell;
