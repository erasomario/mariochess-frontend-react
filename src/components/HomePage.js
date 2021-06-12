import React, { useCallback, useState } from 'react'
import { useAuth } from '../providers/ProvideAuth';
import Button from 'react-bootstrap/Button';
import LeftTabs from './LeftTabs';
import { Col, Container, Row } from 'react-bootstrap';
import { Table } from './Table';
import {ProvideGame, useGame} from '../providers/ProvideGame'

import { apiRequest } from '../utils/ApiClient'

export default function HomePage() {
    const [user, , signout] = useAuth()
    console.log(useGame())
    const [game, setGame] = useGame()

    const gameSelected = useCallback((id) => {
        apiRequest(`/v1/games/${id}`, 'get', user.api_key, null, (error, data) => {
            setGame(data)
        })
    }, [user.api_key]);

    const logout = () => {
        signout(() => { })
    }

    return <>
        <h3>Bienvenido {user.username}</h3>
        <Button onClick={logout}>Salir</Button>
        <Container fluid>            
                <Row>
                    <Col xs={3} className='m-0 p-0'><LeftTabs onGameSelected={gameSelected} ></LeftTabs></Col>
                    <Col xs={6} className='m-0 p-0'><Table></Table></Col>
                </Row>            
        </Container>



    </>
}