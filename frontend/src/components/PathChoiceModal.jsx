import React from 'react';
import Modal from './Modal';
import Button from './Button';

const PathChoiceModal = ({ isOpen, onChoice }) => {
  return (
    <Modal isOpen={isOpen}>
      <h3 style={{marginTop: 0}}>Decision Point!</h3>
      <p>Your decision meter is full. Choose your path:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Button onClick={() => onChoice('HIGHWAY')} style={{ background: 'purple' }}>
          Highway (1 Hard Q, 8x Progress, 3x Points)
        </Button>
        <Button onClick={() => onChoice('DIRT_ROAD')} style={{ background: 'brown' }}>
          Dirt Road (Short Safe Qs)
        </Button>
      </div>
    </Modal>
  );
};

export default PathChoiceModal;
