import React from 'react';
import Modal from './Modal';
import Button from './Button';

const HelpChoiceModal = ({ isOpen, onChoice, onSkip }) => {
  return (
    <Modal isOpen={isOpen}>
      <h3 style={{marginTop: 0}}>You're lagging behind!</h3>
      <p>Do you want to use help for this question?</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Button onClick={() => onChoice('HINT')} variant="secondary">Get a Hint</Button>
        <Button onClick={() => onChoice('REPLACE')} variant="danger">Replace Question</Button>
      </div>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Button onClick={onSkip} variant="primary" style={{ background: '#ccc', color: '#000' }}>Skip</Button>
      </div>
    </Modal>
  );
};

export default HelpChoiceModal;
