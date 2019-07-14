import React, { Component } from 'react';
import axios from 'axios';
import GridItemModal from './GridItemModal';
import HistoryModal from './HistoryModal';
import { Button } from 'react-bootstrap';
import domtoimage from 'dom-to-image';
import download from 'downloadjs';
import './App.css';
import 'literallycanvas/lib/css/literallycanvas.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {

  constructor(props){
    console.log("Executing constructor()");
    super(props);
    this.state = {
      modalShow: false,
      historyModalShow:false,
      canvasesJson: {},
      wallOfArtHistory:[],
      allCanvasesLoaded: false,
      openedCanvasIndex:null,
      intervalId:null,
      showParagraphs:true,
      wallOfArtVersion:null,
      imageWasSaved:false
    }
    this.showModalAndUpdateModalIndex = this.showModalAndUpdateModalIndex.bind(this);
    this.showHistoryModal = this.showHistoryModal.bind(this);
    this.setImmediateInterval = this.setImmediateInterval.bind(this);
    this.downloadWallAsImg = this.downloadWallAsImg.bind(this);
    this.toggleParagraphs = this.toggleParagraphs.bind(this);
    this.saveWallOfArt = this.saveWallOfArt.bind(this);
  }

  saveWallOfArt(){
    console.log('Saving wall of art...');
    var node = document.getElementsByClassName('App')[0];

    this.toggleParagraphs();
    document.getElementsByClassName('wallWrapper')[0].style.border = "none";
    document.getElementsByClassName('wallWrapper')[0].style.boxShadow = "none";

    let wallOfArtVersion = this.state.wallOfArtVersion;

    domtoimage.toPng(node,{ style:{ "marginTop":"10px" } })
               .then(function(dataUrl){
                 console.log(dataUrl);
                 let wall_of_art_version = wallOfArtVersion;
                 axios.post('http://localhost:5000/saveWallOfArt',{ wall_of_art_version:wall_of_art_version, base64img:dataUrl })
                      .then(res=>{
                        console.log(res.data);
                        if(res.data.status==='OK'){
                          console.log('Wall of Art was saved correctly');
                        }else{
                          console.log('An Error has ocurred');
                        }
                      }).catch(err=>{
                        console.log(err);
                        //console.log(err.response.status);
                      })
               }).then(()=>{this.toggleParagraphs();
                            document.getElementsByClassName('wallWrapper')[0].style.border = "3px solid black";
                            document.getElementsByClassName('wallWrapper')[0].style.boxShadow = "8px 8px #dee2e6";});
  }

  downloadWallAsImg(){
    var node = document.getElementsByClassName('App')[0];

    this.toggleParagraphs();
    document.getElementsByClassName('wallWrapper')[0].style.border = "none";
    document.getElementsByClassName('wallWrapper')[0].style.boxShadow = "none";

    domtoimage.toPng(node,{ style:{ "marginTop":"10px" } })
               .then(function(dataUrl){
                 download(dataUrl, 'wallofart.png');
               }).then(()=>{this.toggleParagraphs();
                            document.getElementsByClassName('wallWrapper')[0].style.border = "3px solid black";
                            document.getElementsByClassName('wallWrapper')[0].style.boxShadow = "8px 8px #dee2e6";
                          });
  }

  showModalAndUpdateModalIndex(modalIndex){
    this.setState({
      modalShow:true,
      openedCanvasIndex:modalIndex
    },()=>console.log(this.state.openedCanvasIndex));
  }

  showHistoryModal(){
    this.setState({
      historyModalShow:true
    });
  }

  createGridItems(rowIndex){
    let gridItems = [];
    for(let i = 0 ; i < 10 ; i++){
      let gridIndex = i+1+(rowIndex*10);
      let gridImgSrc = this.state.canvasesJson['canvas_number_'+gridIndex];
      if(gridImgSrc!==null){
        gridItems.push(<div className="grid-item"
                            key={gridIndex}>
                       <img className="drawing-from-user"
                            src={this.state.canvasesJson['canvas_number_'+gridIndex]} /></div>);
      }else{
        if(this.state.imageWasSaved){
          gridItems.push(<div className="grid-item-disabled"
                              key={gridIndex}
                              ></div>);
        }else{
          gridItems.push(<div className="grid-item"
                              key={gridIndex}
                              onClick={()=>this.showModalAndUpdateModalIndex(gridIndex)}></div>);
        }
      }

    }
    return gridItems;
  }

  createGrid(){
    let grid = [];
    for(let i = 0 ; i < 10 ; i++){
      grid.push(<div className="grid-row" key={i}>{this.createGridItems(i)}</div>);
    }
    return grid;
  }

  setImmediateInterval = (fn,interval) => {
    fn();
    return setInterval(fn,interval);
  }

  componentDidMount(){
    console.log('Executing componentDidMount()');

    axios.get('http://localhost:5000/getWallsHistory')
         .then(res=>{
           console.log(res.data);
           this.setState({
             wallOfArtHistory:res.data
           });
         });

    let intervalId = this.setImmediateInterval(()=>{
      axios.get('http://localhost:5000/getCanvases')
           .then(res=>{
             let resJson = {};
             let wallOfArtVersion = null;
             resJson = res.data[0];
             wallOfArtVersion = resJson['wall_of_art_version'];
             delete resJson['wall_of_art_version'];
             this.setState({
               canvasesJson: resJson,
               allCanvasesLoaded: true,
               wallOfArtVersion:wallOfArtVersion
             });
           });
    },3000);

    this.setState({
      intervalId:intervalId
    });

    setTimeout(()=>{
      let isRequiredAmount = document.getElementsByTagName('img').length === 100 ? true : false ;

      if(isRequiredAmount){
        this.saveWallOfArt();
      }
    },5000)

  }

  toggleParagraphs(){
    this.setState((prevState)=>{
      return {
        showParagraphs:!prevState.showParagraphs
      }
    });
  }

  componentWillUnmount(){
    clearInterval(this.state.intervalId);
  }

  render(){

    let modalClose = () => this.setState({modalShow:false});
    let historyModalClose = () => this.setState({historyModalShow:false});
    let handleSave = () => this.setState({imageWasSaved:true},()=>{console.log('handleSave() was called!')});

    let paragraphs = this.state.showParagraphs ?
                     <div><p className="paragraph" id="wallTitle">Earth's Wall of Art</p>
                     <p className="paragraph" style={{"fontSize":"20px"}}>Select an empty cell from the grid and leave your mark on the wall</p></div> :
                     null;

    let buttons = this.state.showParagraphs ?
                  <div className="myFavoriteButton"><Button
                          onClick={this.downloadWallAsImg}>Download the Wall of Art</Button>
                        <Button onClick={this.showHistoryModal}>Wall of Art History</Button></div> :
                     null;

    let grid = this.state.allCanvasesLoaded ?
               this.createGrid() :
               null ;

    console.log("Executing render()");

    return (
      <div className="App">
        { paragraphs }
        { buttons }
        <div className="wallWrapper">
          <div className="wallOfArt grid-container">
            {grid}
          </div>
        </div>

        <GridItemModal
         show={this.state.modalShow}
         onHide={modalClose}
         openedcanvasindex={this.state.openedCanvasIndex} handleSave={handleSave}
         />
        <HistoryModal
         show={this.state.historyModalShow}
         onHide={historyModalClose}
         wallsHistory={this.state.wallOfArtHistory} />
      </div>
    );
  }

}

export default App;
