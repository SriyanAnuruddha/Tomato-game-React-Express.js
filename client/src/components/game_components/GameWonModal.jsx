import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Link } from "react-router-dom";
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { useEffect, useState } from 'react';
import { API_Request } from '../../utils/APIRequest';

export default function GameWonModal(props) {
    const [quoteObj, setQuoteObj] = useState({})

    // request a quote from back-end server
    useEffect(() => {
        (async () => {
            try{
                const response = await API_Request.get("/game/quote",
                {
                    headers:{
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                    }
                })
                const quote = response.data;
                setQuoteObj(quote)
            }catch(error){
                console.log("can't get quote")
            }
        })()
    }, [props.gameInfo.finishedLevel])

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >

            <Modal.Body className='text-center'>
                <h1 className='p-4'>You Win!</h1>
                <div className='px-5'>
                    <ListGroup as="ol" >
                        <ListGroup.Item as="li" className='bg-warning'>Completed Level {props.gameInfo.finishedLevel}</ListGroup.Item>
                        <ListGroup.Item as="li" className='bg-warning'>Completed Time {Math.floor(props.gameInfo.finishTime / 60)}:{props.gameInfo.finishTime % 60}</ListGroup.Item>
                        <ListGroup.Item as="li" className='bg-warning'>Current Score {props.gameInfo.score}</ListGroup.Item>
                    </ListGroup>
                    <Card >
                        <Card.Body>
                            <Card.Title>" {quoteObj.quote} "</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted my-auto">- {quoteObj.person}</Card.Subtitle>
                        </Card.Body>
                    </Card>
                </div>
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center'>
                <Button onClick={props.newLevel}>Next Level  <i className="bi bi-fast-forward-circle  p-1"></i></Button>
                <Button className='btn-danger' onClick={props.onHide}><Link className='remove_link_default' to='/'>Quit Game</Link><i className="bi bi-house p-1"></i></Button>
            </Modal.Footer>
        </Modal>
    );
}