import React from 'react';
import { Modal , Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DrawedCanvasModal.css';

class DrawedCanvasModal extends React.Component {

  constructor(...args){
    super(...args);
    this.state = {
      username: null,
      upvotes:null,
      downvotes:null
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
        <Modal.Footer>
           <div className="arrowContainer">
             <div className="arrow-up"></div>
             <p className="votes">{this.props.imgUpvotes}</p>
             <div className="arrow-down"></div>
             <p className="votes">{this.props.imgDownvotes}</p>
           </div>
           <p style={{marginBottom:'0'}}>Made by {this.props.imgUsername}</p>
        </Modal.Footer>
      </Modal>
    );

  }
}

export default DrawedCanvasModal;
