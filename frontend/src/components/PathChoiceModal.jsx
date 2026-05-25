import React from 'react';
import Modal from './Modal';
import Button from './Button';

const PathChoiceModal = ({ isOpen, onChoice }) => {
  return (
    <Modal isOpen={isOpen}>
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 1rem 0', color: 'var(--neon-orange)', textShadow: '0 0 15px var(--neon-orange)', fontSize: '2.5rem' }}>DECISION POINT!</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#ccc' }}>Choose your path for the next phase:</p>
        
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <button className="btn-highway" onClick={() => onChoice('HIGHWAY')} style={{ flex: 1, padding: '2rem 1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)' }}>HIGHWAY</span>
            <span style={{ color: '#aaa', fontSize: '1rem', marginTop: '1rem' }}>High Risk, Massive Reward!</span>
            <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold', marginTop: '0.5rem' }}>2 Hard Qs</span>
            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>3x Points | 8x Progress</span>
          </button>
          
          <button className="btn-dirtroad" onClick={() => onChoice('DIRT_ROAD')} style={{ flex: 1, padding: '2rem 1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--neon-orange)', textShadow: '0 0 10px var(--neon-orange)' }}>DIRT ROAD</span>
            <span style={{ color: '#aaa', fontSize: '1rem', marginTop: '1rem' }}>Steady and Safe!</span>
            <span style={{ color: 'var(--neon-orange)', fontWeight: 'bold', marginTop: '0.5rem' }}>3 Easy Qs</span>
            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Standard Points</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PathChoiceModal;
