import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';

import setAuthToken from './utils/setAuthToken';
import Navbar from './components/layouts/Navbar';
import Landing from './components/layouts/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Alert from './components/layouts/Alert';

//redux
import { Provider } from 'react-redux'; //combine react and redux togather( make a bridge between react app and redux)
import store from './store';
import { loadUser } from './actions/auth';

if (localStorage.token) {
    setAuthToken(localStorage.token);
}

const App = () => {
    useEffect(() => {
        store.dispatch(loadUser());
    }, []);

    return (
        <Provider store={store}>
            <Router>
                <Navbar />
                <Route exact path='/' component={Landing} />
                <section className='container'>
                    <Alert />
                    <Switch>
                        <Route exact path='/register' component={Register} />
                        <Route exact path='/login' component={Login} />
                    </Switch>
                </section>
            </Router>
        </Provider>
    );
};

export default App;
