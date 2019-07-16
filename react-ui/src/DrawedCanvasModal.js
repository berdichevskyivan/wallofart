import React from 'react';
import { Modal , Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DrawedCanvasModal.css';

class DrawedCanvasModal extends React.Component {

  constructor(...args){
    super(...args);
    this.state = {

    }
  }

  render() {

    return (

      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body className="bodyOfModal">
        <div className="imgWrapper">
          <img src={this.props.imgDataURL} />
        </div>
        </Modal.Body>
      </Modal>
    );

  }
}

export default DrawedCanvasModal;
