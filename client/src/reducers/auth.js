import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    AUTH_SUCCESS,
    AUTH_FAIL,
    LOGIN_SUCESS,
    LOGIN_FAIL,
    LOGOUT,
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
};

const auth = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case AUTH_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: payload,
            };

        case REGISTER_SUCCESS:
        case LOGIN_SUCESS:
            localStorage.setItem('token', payload.token);

            return {
                ...state,
                ...payload,
                isAuthenticated: true,
                loading: false,
            };

        case AUTH_FAIL:
        case REGISTER_FAIL:
        case LOGIN_FAIL:
        case LOGOUT:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
            };

        default:
            return state;
    }
};

export default auth;
