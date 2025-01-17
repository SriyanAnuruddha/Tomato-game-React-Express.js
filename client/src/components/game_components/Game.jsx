import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Confetti from 'react-confetti'
import { useEffect, useState } from "react";
import GameWonModal from './GameWonModal';
import GameOverModal from './GameOverModal'
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Cube from './Cube';
import { nanoid } from "nanoid";
import axios from 'axios';

export default function Game() {
    const [level, setLevel] = useState(1)
    const [timeRemaining, setTimeRemaining] = useState(180);
    const [isTimeOver, setIsTimeOver] = useState(false)
    const [isGameWon, setIsGameWon] = useState(false)
    const [currentScore, setCurrentScore] = useState(0)
    const [finishedTime, setFinishedTime] = useState(0)
    const [errorObj, setErrorObj] = useState({ show: false, msg: "" })
    const [lives, setLives] = useState(3)

    // Stores the object returned from the Tomato API
    const [gameObj, setGameObj] = useState({
        question: '',
        solution: ''
    })

    // Send a request to retrieve a new game when the game is first launched or when a new level is reached
    useEffect(() => {
    
        (async ()=>{
            setGameObj({
                question: '',
                solution: ''
            })

            try {
                const response = await axios.get('/api/game/newgame',{
                     headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                }})

                if(response.status ===200){
                    console.log(response.data)
                    setGameObj(response.data)
                    refreshCubes()
                }
            }catch(error){
                console.log(error.message)
                console.log("can't load game data")
            }
        })()


    }, [level])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeRemaining(prevTime => {
                // If time remaining is already 0, clear the interval
                if (prevTime === 0) {
                    clearInterval(intervalId);
                    setIsTimeOver(true)
                    return 0;
                }
                // Otherwise, decrement the time remaining
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [level]); // Start or restart the countdown when level changes

    // Convert timeRemaining to minutes and seconds
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    // Send a POST request to the backend server to store the current score whenever the score changes
    useEffect(() => {
        (async () => {
            try {
                const response = await axios.post('/api/users/store-score',{ 
                    score: currentScore 
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                    }
                }
                )
            } catch (e) {
                console.log(e.message)
            }
        })()
    }, [currentScore]);

    // determines the score based on the finishing time
    useEffect(() => {
        if (isGameWon) {
            if (finishedTime > 120 && finishedTime <= 180) {
                setCurrentScore(prevScore => prevScore + 100)
            } else if (finishedTime > 60 && finishedTime <= 120) {
                setCurrentScore(prevScore => prevScore + 50)
            } else if (finishedTime > 0 && finishedTime <= 60) {
                setCurrentScore(prevScore => prevScore + 25)
            }
        }
    }, [finishedTime, level])

    // create a new level
    function newlevel() {
        setLevel(prevLevel => prevLevel + 1)
        setIsGameWon(false)
        setTimeRemaining(180)
        setLives(3)
    }

    // check if player won the game
    function checkAnswerHandler() {
        if (allCubesHeld) { // check if all the cubes are selected
            if (areAllSame) { // check if all the cubes have the same value
                if (firstCubeValue == gameObj.solution) { // check all first cube value is equal to the real answer
                    setIsGameWon(true)
                    setFinishedTime(timeRemaining)
                } else {
                    setErrorObj({ show: true, msg: "Your Answer is Wrong!" })
                    setLives(prevLives => prevLives - 1) // deduct one life from lives if answer is wrong
                }
            } else {
                setErrorObj({ show: true, msg: "Select the same value for all cubes!" })
            }
        } else {
            setErrorObj({ show: true, msg: "Click on the cube(s) to lock their values!" })
        }
    }


    // Cube Code
    const [cubeNumbers, setCubeNumbers] = useState(generateAllNewCubes())
    const [firstCubeValue, setFirstCubeValue] = useState(null)
    const [areAllSame, setAreAllSame] = useState(false)
    const [allCubesHeld, setAllCubesHeld] = useState(false)

    // Check if all cubes have the same value when the cubeNumbers array changes
    useEffect(() => {
        setAllCubesHeld(cubeNumbers.every(cube => cube.isHeld))
        setFirstCubeValue(cubeNumbers[0].value)
        setAreAllSame(cubeNumbers.every(cube => cube.value === firstCubeValue))
    }, [cubeNumbers])

    // Create new cubes according to the level
    function generateAllNewCubes() {
        let numbers = [];
        for (let i = 1; i <= level; i++) {
            numbers.push(createNewCube());
        }
        return numbers;
    }

    // Generate a new cube object 
    function createNewCube() {
        return {
            id: nanoid(),
            value: Math.floor(Math.random() * 10), // generate number between 0 - 9
            isHeld: false
        }
    }

    // Hold or release a cube
    function holdCube(id) {
        setCubeNumbers(prevCubeNumbers => {
            return prevCubeNumbers.map((cube) => {
                return cube.id === id ? { ...cube, isHeld: !cube.isHeld } : cube
            })
        })

        setErrorObj({ show: false, msg: "" }) // hide error when cube is clicked!
    }

    const cubeElements = cubeNumbers.map((cube) => <Cube key={cube.id} value={cube.value} isHeld={cube.isHeld} holdCube={holdCube} id={cube.id} />)


    // Roll the cubes that are not held
    function rollCubes() {
        setCubeNumbers(prevCubeNumbers => {
            return prevCubeNumbers.map(cube => {
                return cube.isHeld ? cube : createNewCube()
            })
        })
    }

    // Generate new set of cubes
    function refreshCubes() {
        setCubeNumbers(generateAllNewCubes())
    }


    return (
        <div id='custom-bg' className="container my-4">

            {isGameWon && <Confetti />}
            <GameOverModal show={isTimeOver || lives == 0} onHide={() => setIsTimeOver(false)} />
            <GameWonModal gameInfo={{ finishTime: finishedTime, score: currentScore, finishedLevel: level }} newLevel={newlevel} show={isGameWon} onHide={() => setIsGameWon(false)} />

            <div className="row text-center">
                <div className="col border text-dark">
                    <h3 className='py-1'>Level: {level}</h3>
                </div>
                <div className="col border text-dark">
                    <h3 className='py-1'>Score: {currentScore}</h3>
                </div>
                <div className="col border">
                    <h3 className='py-1'>Attempts: {lives}</h3>
                </div>
                <div className="col border text-dark">
                    <h3 className='py-1'>{(!isGameWon && lives > 0) && <span>Time: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>}</h3>
                </div>
            </div>

            <div className="row border">
                <div className="col  d-flex flex-column justify-content-center align-items-center">

                    {errorObj.show && <Alert variant="danger" className='my-1  w-50'>{errorObj.msg}</Alert >}
                    <h3 className='text-white'>Find the value of tomato</h3>
                    {
                        (gameObj.question) ?
                            <Image width="500" className="rounded  d-block mb-4" src={gameObj.question && gameObj.question} rounded />
                            : <Spinner className='text-light' animation="border" />
                    }

                </div>
            </div>

            <div className="row border">
                <div className="col input-group  d-flex  justify-content-center">
                    <main >
                        <h5 className='text-white'>Set the same value for all the cubes based on the number you think is the answer</h5>
                        <div className='dice-container'>
                            {cubeElements}
                        </div>
                        <div className="input-group-prepend ">
                            <button className='btn btn-primary m-2' onClick={isGameWon ? refreshCubes : rollCubes}>Roll Cubes</button>
                            <button onClick={checkAnswerHandler} className="btn btn-success m-2" type="button">Check Answer</button>
                        </div>
                    </main>

                </div>
            </div>
        </div >
    )
}