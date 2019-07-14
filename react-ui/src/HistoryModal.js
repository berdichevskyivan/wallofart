import React from 'react';
import { Modal , Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HistoryModal.css';

class HistoryModal extends React.Component {

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
        <Modal.Body>
        <h1 className="historyModalTitle">Download previous Walls</h1>
        <ul className="historyList">
          {this.props.wallsHistory.map((obj,index)=>{
            console.log(obj);
            return <li><a href={obj['wall_of_art_image']} download={`wallofart${obj['wall_of_art_version']}`}>Wall of Art {obj['wall_of_art_version']}</a></li>;
          })}
        </ul>
        </Modal.Body>
      </Modal>
    );

  }
}

export default HistoryModal;
