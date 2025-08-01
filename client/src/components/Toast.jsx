import React, { useEffect } from 'react';
import { useState } from 'react';
import { FiX, FiCheck, FiClock, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';





const DepositTaskPopup = ({ task, onClose, onComplete }) => {
  useEffect(() => {
    // Create visual effects
    const createEffects = () => {
      // Sparkles
      const sparklesContainer = document.querySelector('.sparkles');
      if (sparklesContainer) {
        sparklesContainer.innerHTML = '';
        const sparkleCount = 15;
        
        for (let i = 0; i < sparkleCount; i++) {
          const sparkle = document.createElement('div');
          sparkle.className = 'sparkle';
          sparkle.style.left = Math.random() * 100 + '%';
          sparkle.style.top = Math.random() * 100 + '%';
          sparkle.style.animationDelay = Math.random() * 2.5 + 's';
          sparkle.style.animationDuration = (Math.random() * 1.5 + 2) + 's';
          sparklesContainer.appendChild(sparkle);
        }
      }

      // Floating icons
      const iconsContainer = document.querySelector('.floating-icons');
      if (iconsContainer) {
        iconsContainer.innerHTML = '';
        const iconCount = 8;
        
        for (let i = 0; i < iconCount; i++) {
          const icon = document.createElement('div');
          icon.className = 'icon';
          icon.style.left = Math.random() * 85 + '%';
          icon.style.top = Math.random() * 85 + '%';
          icon.style.animationDelay = Math.random() * 4 + 's';
          icon.style.animationDuration = (Math.random() * 2 + 3) + 's';
          iconsContainer.appendChild(icon);
        }
      }
    };

    createEffects();

    // Auto-close after 30 seconds with warning
    const warningTimer = setTimeout(() => {
      document.querySelector('.auto-close-warning').classList.add('show');
    }, 25000);

   

    return () => {
      clearTimeout(warningTimer);
    };
  }, [onClose]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="popup-container relative">
        <button 
          className="close-btn" 
          onClick={onClose}
          aria-label="Close popup"
        >
          <FiX size={20} />
        </button>
        
        <div className="popup">
          <div className="sparkles"></div>
          <div className="floating-icons"></div>
          
          <div className="balance">Balance in transaction: {formatCurrency(task.depositAmount)}</div>
          
          <div className="banner">
            <span>LUCKY COMBO</span>
          </div>
          
          <div className="main-title">LUCKY!</div>
          
          <div className="win-messages">
            <div className="win-text">You hit a Lucky Combo!</div>
            <div className="win-text">You have WON</div>
          </div>
          
          <div className="prize-amount">{formatCurrency(task.profitAmount)}</div>
          
          <div className="congratulations">Congratulations!</div>
          
          
          <div className="action-buttons">
           <Link to="/deposit">
           <button 
              className="claim-btn" 
              autoFocus
            >
             Deposit {task.depositAmount} To Claim Your Prize
            </button>
           
           </Link>
            
          </div>
          
          <div className="confetti">
            {[...Array(10)].map((_, i) => (
              <span key={i}></span>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .popup-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 420px;
          width: 95%;
        }

        .popup {
          background: linear-gradient(145deg, #facc15 0%, #f59e0b 50%, #84cc16 100%);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          border-radius: 16px;
          padding: 28px 24px;
          width: 100%;
          text-align: center;
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
              0 20px 40px rgba(0, 0, 0, 0.3),
              0 8px 30px rgba(132, 204, 22, 0.2),
              inset 0 2px 0 rgba(255, 255, 255, 0.15);
          transform: scale(0.9);
          opacity: 0;
          animation: popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          color: #1f1a44;
          overflow: hidden;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes popIn {
          0% { 
              transform: scale(0.9) translateY(20px); 
              opacity: 0; 
          }
          100% { 
              transform: scale(1) translateY(0); 
              opacity: 1; 
          }
        }

        .sparkles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          border-radius: 16px;
          z-index: 1;
        }

        .sparkle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          animation: sparkleFloat 3s ease-in-out infinite;
        }

        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-15px) scale(1.4); opacity: 1; }
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.3);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.4);
          transform: rotate(90deg) scale(1.1);
        }

        .balance {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 18px;
          color: rgba(31, 26, 68, 0.9);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          position: relative;
          z-index: 2;
        }

        .banner {
          background: linear-gradient(135deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%);
          color: white;
          padding: 14px;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 
              0 4px 20px rgba(132, 204, 22, 0.4),
              inset 0 2px 0 rgba(255, 255, 255, 0.25);
          animation: pulseGlow 2s ease-in-out infinite alternate;
          z-index: 2;
        }

        .banner span {
          position: relative;
          z-index: 2;
        }

        .auto-close-warning {
          position: absolute;
          bottom: -25px;
          left: 0;
          right: 0;
          font-size: 12px;
          font-weight: 500;
          color: white;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .auto-close-warning.show {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes pulseGlow {
          from { box-shadow: 0 4px 20px rgba(132, 204, 22, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.25); }
          to { box-shadow: 0 6px 25px rgba(132, 204, 22, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.35); }
        }

        .banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmerBanner 3s infinite;
          z-index: 1;
        }

        @keyframes shimmerBanner {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .win-messages {
          margin-bottom: 8px;
          position: relative;
          z-index: 2;
        }

        .win-text {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #1f1a44;
          line-height: 1.4;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }

        .main-title {
          font-family: 'Fredoka One', cursive;
          font-size: 2.8rem;
          color: #1f1a44;
          text-shadow: 
              3px 3px 0px #f59e0b,
              6px 6px 0px #d97706,
              9px 9px 20px rgba(0, 0, 0, 0.1);
          margin: 10px 0 20px;
          animation: titlePulse 1.5s ease-in-out infinite alternate;
          position: relative;
          z-index: 2;
        }

        @keyframes titlePulse {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }

      .prize-amount {
        /* Gold text color with gradient */
        background: linear-gradient(135deg, #fff8b0 0%, #ffd700 50%, #ffaa00 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 42px;
        font-weight: 800;
        margin: 20px 0;
        position: relative;
        z-index: 2;
        letter-spacing: -1px;
        
        /* Glow effect with gold tint */
        text-shadow: 
          0 1px 2px rgba(0, 0, 0, 0.5), /* Subtle dark outline for contrast */
          0 0 10px rgba(255, 215, 0, 0.6),
          0 0 20px rgba(255, 195, 0, 0.4),
          0 0 30px rgba(255, 175, 0, 0.2);
        
        /* Refined glow animation */
        animation: goldGlow 2.5s ease-in-out infinite alternate;
      }

      @keyframes goldGlow {
        0% {
          text-shadow:
            0 1px 2px rgba(0, 0, 0, 0.5),
            0 0 8px rgba(255, 215, 0, 0.5),
            0 0 15px rgba(255, 195, 0, 0.3);
        }
        100% {
          text-shadow:
            0 1px 2px rgba(0, 0, 0, 0.5),
            0 0 15px rgba(255, 215, 0, 0.8),
            0 0 25px rgba(255, 195, 0, 0.5),
            0 0 35px rgba(255, 175, 0, 0.3);
        }
      }
        .congratulations {
          color: #1f1a44;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 24px;
          text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 2;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          position: relative;
          z-index: 2;
        }

        .claim-btn {
          background: linear-gradient(135deg, #fefcbf 0%, #facc15 50%, #f59e0b 100%);
          color: #1f1a44;
          border: none;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 
              0 4px 20px rgba(250, 204, 21, 0.4),
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 2px 0 rgba(255, 255, 255, 0.3);
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .claim-btn:hover {
          transform: translateY(-2px);
          box-shadow: 
              0 6px 25px rgba(250, 204, 21, 0.5),
              0 3px 6px rgba(0, 0, 0, 0.15),
              inset 0 2px 0 rgba(255, 255, 255, 0.4);
        }

        .claim-btn:active {
          transform: translateY(0);
        }

        .claim-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: 0.5s;
        }

        .claim-btn:hover::before {
          left: 100%;
        }

        .secondary-btn {
          background: rgba(31, 26, 68, 0.2);
          color: #1f1a44;
          border: none;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .secondary-btn:hover {
          background: rgba(31, 26, 68, 0.3);
          transform: translateY(-2px);
        }

        .secondary-btn:active {
          transform: translateY(0);
        }

        .confetti {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          border-radius: 16px;
          z-index: 1;
        }

        .confetti span {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: confettiFall 3s linear infinite;
          opacity: 0;
        }

        @keyframes confettiFall {
          0% { 
              transform: translateY(-20vh) rotate(0deg); 
              opacity: 1; 
          }
          100% { 
              transform: translateY(120vh) rotate(720deg); 
              opacity: 0; 
          }
        }

        .floating-icons {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          border-radius: 16px;
          z-index: 1;
        }

        .icon {
          position: absolute;
          width: 24px;
          height: 24px;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231f1a44"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.36 1.17 4.44 2.92 5.72.17.13.34.26.51.38.22.16.45.31.68.46C10.29 16.71 11.13 18.25 12 20c.87-1.75 1.71-3.29 2.89-4.44.23-.15.46-.3.68-.46.17-.12.34-.25.51-.38C17.83 13.44 19 11.36 19 9c0-3.87-3.13-7-7-7zm0 10c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>') no-repeat center;
          background-size: contain;
          animation: floatIcon 5s ease-in-out infinite;
          opacity: 0.15;
        }

        @keyframes floatIcon {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.15; }
          25% { transform: translate(20px, -20px) rotate(90deg); opacity: 0.25; }
          50% { transform: translate(-10px, -30px) rotate(180deg); opacity: 0.2; }
          75% { transform: translate(15px, -15px) rotate(270deg); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default DepositTaskPopup;

export const NormalTaskPopup = ({ task, onClose, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete();
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="popup-container relative">
        <button 
          className="close-btn" 
          onClick={onClose}
          aria-label="Close popup"
          disabled={isCompleting}
        >
          <FiX size={20} />
        </button>
        
        <div className="popup">
          <div className="header">
            <div className="badge">Normal Task</div>
            <h3 className="title">{task.product.name}</h3>
          </div>
          
          <div className="image-container">
            <img 
              src={task.product.image || 'https://via.placeholder.com/300x200?text=Task+Image'} 
              alt={task.product.name}
              className="task-image"
              loading="lazy"
            />
            <div className="image-overlay"></div>
          </div>
          
          <div className="details">
            <div className="detail-row">
              <span className="label">Reward:</span>
              <span className="value reward">{formatCurrency(task.profitAmount)}</span>
            </div>
            
          
            
            <div className="review">
              <p className="review-label">Review:</p>
              <p className="review-text">"{task.product.reviewText || 'No review provided'}"</p>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="complete-btn" 
              onClick={handleComplete}
              autoFocus
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <FiLoader className="icon animate-spin" /> Completing Task...
                </>
              ) : (
                <>
                  <FiCheck className="icon" /> Complete Task
                </>
              )}
            </button>
          </div>
          
          <div className="confetti">
            {[...Array(10)].map((_, i) => (
              <span key={i}></span>
            ))}
          </div>
        </div>
      </div>
 

      <style jsx global>{`
        .popup-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 420px;
          width: 95%;
        }

        .popup {
          background: white;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          text-align: center;
          position: relative;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 
              0 20px 40px rgba(0, 0, 0, 0.15),
              0 8px 30px rgba(0, 0, 0, 0.1);
          transform: scale(0.9);
          opacity: 0;
          animation: popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          color: #1f2937;
          overflow: hidden;
        }

        @keyframes popIn {
          0% { 
              transform: scale(0.9) translateY(20px); 
              opacity: 0; 
          }
          100% { 
              transform: scale(1) translateY(0); 
              opacity: 1; 
          }
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.1);
          color: #6b7280;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.15);
          color: #4b5563;
          transform: rotate(90deg) scale(1.1);
        }

        .header {
          margin-bottom: 20px;
          position: relative;
        }

        .badge {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          line-height: 1.3;
        }

        .auto-close-warning {
          position: absolute;
          bottom: -22px;
          left: 0;
          right: 0;
          font-size: 12px;
          font-weight: 500;
          color: #ef4444;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .auto-close-warning.show {
          opacity: 1;
          transform: translateY(0);
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .task-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.5s ease;
        }

        .image-container:hover .task-image {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 40%);
          pointer-events: none;
        }

        .details {
          margin-bottom: 24px;
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding-bottom: 14px;
          border-bottom: 1px dashed #e5e7eb;
        }

        .label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .value {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }

        .reward {
          color: #10b981;
          font-weight: 700;
          font-size: 16px;
        }

        .time {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
        }

        .time .icon {
          color: #f59e0b;
        }

        .review {
          margin-top: 20px;
        }

        .review-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .review-text {
          font-size: 14px;
          color: #4b5563;
          font-style: italic;
          line-height: 1.5;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 3px solid #3b82f6;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .complete-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          position: relative;
          overflow: hidden;
        }

        .complete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .complete-btn:active {
          transform: translateY(0);
        }

        .complete-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: 0.5s;
        }

        .complete-btn:hover::before {
          left: 100%;
        }

        .complete-btn .icon {
          font-size: 18px;
        }

        .secondary-btn {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: none;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .secondary-btn:hover {
          background: rgba(107, 114, 128, 0.2);
          transform: translateY(-2px);
        }

        .secondary-btn:active {
          transform: translateY(0);
        }

        .confetti {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          border-radius: 16px;
        }

        .confetti span {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #3b82f6;
          opacity: 0;
          animation: confettiDrop 3s linear infinite;
        }

        @keyframes confettiDrop {
          0% {
            transform: translateY(-100%) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg) scale(0.5);
            opacity: 0;
          }
        }

        /* Confetti colors */
        .confetti span:nth-child(1) { left: 10%; animation-delay: 0s; background-color: #3b82f6; }
        .confetti span:nth-child(2) { left: 20%; animation-delay: 0.5s; background-color: #10b981; }
        .confetti span:nth-child(3) { left: 30%; animation-delay: 1s; background-color: #f59e0b; }
        .confetti span:nth-child(4) { left: 40%; animation-delay: 1.5s; background-color: #ef4444; }
        .confetti span:nth-child(5) { left: 50%; animation-delay: 2s; background-color: #8b5cf6; }
        .confetti span:nth-child(6) { left: 60%; animation-delay: 2.5s; background-color: #3b82f6; }
        .confetti span:nth-child(7) { left: 70%; animation-delay: 0.5s; background-color: #10b981; }
        .confetti span:nth-child(8) { left: 80%; animation-delay: 1s; background-color: #f59e0b; }
        .confetti span:nth-child(9) { left: 90%; animation-delay: 1.5s; background-color: #ef4444; }
        .confetti span:nth-child(10) { left: 15%; animation-delay: 2s; background-color: #8b5cf6; }
      `}</style>
    </div>
  );
};

