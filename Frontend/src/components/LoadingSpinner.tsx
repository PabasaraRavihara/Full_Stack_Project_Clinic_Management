import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '300px', 
      width: '100%' 
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          width: 60,
          height: 60,
          border: '6px solid #f3f3f3',
          borderTop: '6px solid #2E7D32', 
          borderRadius: '50%',
        }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        style={{ marginTop: '15px', color: '#2E7D32', fontWeight: 'bold' }}
      >
        Loading Data...
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;