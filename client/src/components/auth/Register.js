import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';

const Register = ({ setAlert, register, isAuthenticated }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
    });

    const { name, email, password, password2 } = formData;

    const onChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            setAlert('password do not match', 'danger');
        } else {
            console.log(formData);

            //TODO: do in redux
            // const newUser = {
            //     name,
            //     email,
            //     password,
            // };

            // try {
            //     const config = {
            //         headers: { 'Content-type': 'application/json' },
            //     };

            //     const body = JSON.stringify(newUser);

            //     const res = await axios.post('/api/users', body, config);
            //     console.log('res.data', res.data);
            // } catch (err) {
            //     console.error(err.response.data);
            // }

            register({ name, email, password });
        }
    };

    //redirect if logged in

    if (isAuthenticated) {
        return <Redirect to='/dashboard' />;
    }

    return (
        <>
            <h1 className='large text-primary'>Sign Up</h1>
            <p className='lead'>
                <i className='fas fa-user'></i> Create Your Account
            </p>
            <form className='form' onSubmit={handleSubmit}>
                <div className='form-group'>
                    <input
                        type='text'
                        placeholder='Name'
                        name='name'
                        value={name}
                        onChange={onChange}
                        // required
                    />
                </div>
                <div className='form-group'>
                    <input
                        type='email'
                        placeholder='Email Address'
                        name='email'
                        value={email}
                        onChange={onChange}
                        // required
                    />
                    <small className='form-text'>
                        This site uses Gravatar so if you want a profile image,
                        use a Gravatar email
                    </small>
                </div>
                <div className='form-group'>
                    <input
                        type='password'
                        placeholder='Password'
                        name='password'
                        value={password}
                        onChange={onChange}
                        minLength='6'
                        // required
                    />
                </div>
                <div className='form-group'>
                    <input
                        type='password'
                        placeholder='Confirm Password'
                        name='password2'
                        value={password2}
                        onChange={onChange}
                        minLength='6'
                        // required
                    />
                </div>
                <input
                    type='submit'
                    className='btn btn-primary'
                    value='Register'
                />
            </form>
            <p className='my-1'>
                Already have an account? <Link to='/login'>Sign In</Link>
            </p>
        </>
    );
};

const mapStateProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
}); //TODO: put interface in redux

Register.propTypes = {
    setAlert: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool,
};

export default connect(mapStateProps, { setAlert, register })(Register);
